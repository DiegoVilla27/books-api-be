import prisma from "@core/database/postgres";
import AppError from "@core/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { LoginRequestDTO, RefreshTokenRequestDTO, RegisterRequestDTO } from "../dtos/request";
import type { AuthResponseDTO } from "../dtos/response";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "mi_secreto_super_seguro_access";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "mi_secreto_super_seguro_refresh";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "900";

/**
 * Función auxiliar privada que genera un par de tokens JWT (access + refresh) para un usuario dado.
 * Centraliza la lógica de firma para evitar duplicación (DRY) entre `loginSvc` y `registerSvc`.
 *
 * - **Access Token**: Contiene `sub`, `email` y `role`. Expira en `JWT_EXPIRES_IN` segundos (por defecto 15 min).
 * - **Refresh Token**: Contiene únicamente `sub`. Expira en 7 días.
 *
 * @param user - Objeto con los datos mínimos del usuario necesarios para construir el payload del token.
 * @returns Un `AuthResponseDTO` con los dos tokens firmados y el tiempo de expiración del access token.
 */
const generateAuthTokens = (user: { id: number; email: string; role: string }): AuthResponseDTO => {
  const expiresInSeconds = Number(JWT_EXPIRES_IN);

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: expiresInSeconds }
  );

  const refreshToken = jwt.sign(
    { sub: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresInSeconds
  };
};

/**
 * Servicio para autenticar a un usuario mediante sus credenciales de correo y contraseña.
 * Comprueba que el usuario exista, esté activo y que la contraseña sea correcta mediante `bcrypt`.
 *
 * @param payload - DTO con las credenciales de inicio de sesión (`email` y `password`).
 * @returns Promesa que resuelve a un `AuthResponseDTO` con el par de tokens JWT.
 * @throws {AppError} Lanza un error `401` si el correo no existe, el usuario está inactivo o la contraseña es incorrecta.
 *   Se usa un mensaje genérico `"Credenciales inválidas"` para no dar pistas a posibles atacantes.
 */
const loginSvc = async (payload: LoginRequestDTO): Promise<AuthResponseDTO> => {

  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user || !user.isActive) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Credenciales inválidas", 401);
  }

  return generateAuthTokens(user);
}

/**
 * Servicio para registrar un nuevo usuario en el sistema.
 * Verifica que el correo no esté en uso, descarta el campo `passwordConfirmation`,
 * encripta la contraseña con `bcrypt` y persiste el registro en la base de datos.
 * Tras la creación exitosa, emite automáticamente un par de tokens JWT para que
 * el usuario quede autenticado de inmediato sin necesidad de un login adicional.
 *
 * @param user - DTO con los datos del nuevo usuario (`RegisterRequestDTO`).
 * @returns Promesa que resuelve a un `AuthResponseDTO` con el par de tokens JWT.
 * @throws {AppError} Lanza un error `400` si el correo electrónico ya está registrado.
 */
const registerSvc = async (user: RegisterRequestDTO): Promise<AuthResponseDTO> => {
  const emailExists = await prisma.user.findUnique({ where: { email: user.email } });
  if (emailExists) {
    throw new AppError("El correo electrónico ya está registrado", 400);
  }

  const { passwordConfirmation, ...userData } = user;

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const userCreated = await prisma.user.create({
    data: { ...userData, password: hashedPassword }
  });

  return generateAuthTokens(userCreated);
}

/**
 * Servicio para renovar el par de tokens JWT mediante un refresh token válido.
 * Implementa la estrategia de **Refresh Token Rotation**: cada invocación consume el
 * refresh token proporcionado y emite un par nuevo, lo que invalida implícitamente el anterior.
 *
 * El proceso es el siguiente:
 * 1. Verifica la firma y vigencia del `refresh_token` usando `JWT_REFRESH_SECRET`.
 * 2. Busca al usuario en la base de datos para confirmar que sigue existiendo y está activo.
 *    (Esto invalida tokens de usuarios inhabilitados después de su emisión).
 * 3. Emite un nuevo par de tokens frescos.
 *
 * @param payload - DTO con el `refresh_token` a verificar (`RefreshTokenRequestDTO`).
 * @returns Promesa que resuelve a un nuevo `AuthResponseDTO` con tokens renovados.
 * @throws {AppError} Lanza un error `401` si el refresh token es inválido o ha expirado.
 * @throws {AppError} Lanza un error `401` si el usuario asociado al token no existe o está inactivo.
 */
const refreshTokenSvc = async (payload: RefreshTokenRequestDTO): Promise<AuthResponseDTO> => {
  let decoded: { sub: number };

  try {
    // 1. Verificar que el refresh token sea válido y no haya expirado
    decoded = jwt.verify(payload.refresh_token, JWT_REFRESH_SECRET) as unknown as { sub: number };
  } catch {
    throw new AppError('Refresh token inválido o expirado. Por favor inicia sesión de nuevo.', 401);
  }

  // 2. Buscar al usuario en la base de datos (puede haber sido eliminado o inhabilitado)
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

  if (!user || !user.isActive) {
    throw new AppError('El usuario asociado a este token ya no existe o está inactivo.', 401);
  }

  // 3. Emitir un nuevo par de tokens frescos
  return generateAuthTokens(user);
}

export { loginSvc, refreshTokenSvc, registerSvc };
