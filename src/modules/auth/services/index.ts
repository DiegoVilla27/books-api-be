import prisma from "@core/database/postgres";
import ENVS from "@core/environments";
import AppError from "@core/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { LoginRequestDTO, MeRequestDTO, RefreshTokenRequestDTO, RegisterRequestDTO } from "../dtos/request";
import type { AuthResponseDTO, MeResponseDTO } from "../dtos/response";

/**
 * Resolves full entity identity verification bounds against active state definitions in the database.
 * Validates active record integrity keys passed downstream by core auth middlewares.
 * 
 * @remarks
 * This business logic layer performs a transactional fetch operation through the Prisma engine layers, 
 * evaluating structural parameters such as account suspension metrics (`isActive`) before serializing
 * sanitized domain payloads over the transport network.
 *
 * @param payload - Struct containing verified core identity request properties injected from active tokens.
 * @returns A micro-optimized profile response object carrying safe identity parameters.
 * @throws {AppError} Retorna `401 Unauthorized` si el payload está corrupto, la cuenta fue borrada o está inactiva.
 */
const getMetSvc = async (payload: MeRequestDTO | undefined): Promise<MeResponseDTO> => {
  if (!payload) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });

  if (!user || !user.isActive) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  return {
    id: user.id,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    role: user.role
  };
}

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
    decoded = jwt.verify(payload.refresh_token, ENVS.JWT_REFRESH_SECRET) as unknown as { sub: number };
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

/**
 * Función auxiliar privada que genera un par de tokens JWT (access + refresh) para un usuario dado.
 * Centraliza la lógica de firma para evitar duplicación (DRY) entre `loginSvc` y `registerSvc`.
 *
 * - **Access Token**: Contiene `sub`, `email` y `role`. Expira en `JWT_EXPIRES_IN` segundos 
 * - **Refresh Token**: Contiene únicamente `sub`. Expira en `JWT_REFRESH_EXPIRES_IN` días.
 *
 * @param user - Objeto con los datos mínimos del usuario necesarios para construir el payload del token.
 * @returns Un `AuthResponseDTO` con los dos tokens firmados y el tiempo de expiración del access token.
 */
const generateAuthTokens = ({
  id,
  name,
  lastname,
  email,
  role
}: { id: number, name: string, lastname: string, email: string, role: string }): AuthResponseDTO => {

  const accessToken = jwt.sign(
    { sub: id, name, lastname, email, role },
    ENVS.JWT_ACCESS_SECRET,
    { expiresIn: ENVS.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { sub: id },
    ENVS.JWT_REFRESH_SECRET,
    { expiresIn: ENVS.JWT_REFRESH_EXPIRES_IN }
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: typeof ENVS.JWT_EXPIRES_IN === 'number'
      ? ENVS.JWT_EXPIRES_IN
      : parseInt(ENVS.JWT_EXPIRES_IN, 10)
  };
};

export { getMetSvc, loginSvc, refreshTokenSvc, registerSvc };
