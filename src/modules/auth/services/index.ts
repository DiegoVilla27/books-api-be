import prisma from "@core/databases/postgres";
import ENVS from "@core/environments";
import AppError from "@core/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { LoginRequestDTO, RefreshTokenRequestDTO, RegisterRequestDTO } from "../dtos/request";
import type { AuthResponseDTO } from "../dtos/response";

/**
 * Servicio para autenticar a un usuario mediante sus credenciales de correo y contraseña.
 * Comprueba que el usuario exista, esté activo y que la contraseña coincida usando `bcrypt`.
 *
 * @param payload - DTO con las credenciales de inicio de sesión (`email` y `password`).
 * @returns Promesa que resuelve a un {@link AuthResponseDTO} con el par de tokens JWT.
 *
 * @throws {AppError} Retorna un error `401 Unauthorized` si el correo no existe, la cuenta está inactiva o la contraseña es incorrecta.
 *
 * @remarks
 * Por razones de seguridad y prevención de ataques de enumeración de usuarios,
 * se utiliza una respuesta genérica `"Credenciales inválidas"` para cualquier tipo de fallo de credencial.
 *
 * @example
 * ```typescript
 * const auth = await loginSvc({ email: 'user@example.com', password: 'SecretPassword123' });
 * console.log(auth.access_token);
 * ```
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
 * Verifica que el correo no esté en uso, descarta `passwordConfirmation`,
 * encripta la contraseña con `bcrypt` (factor de costo 10) y persiste el registro.
 * Tras la creación exitosa, emite automáticamente un par de tokens JWT.
 *
 * @param user - DTO con los datos del nuevo usuario ({@link RegisterRequestDTO}).
 * @returns Promesa que resuelve a un {@link AuthResponseDTO} con el par de tokens JWT generados.
 *
 * @throws {AppError} Retorna un error `400 Bad Request` si el correo electrónico ya está registrado.
 *
 * @example
 * ```typescript
 * const auth = await registerSvc({
 *   name: 'John',
 *   lastname: 'Doe',
 *   email: 'john@example.com',
 *   password: 'password123',
 *   passwordConfirmation: 'password123',
 *   age: 25
 * });
 * ```
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
 * @param payload - DTO con el `refresh_token` a verificar ({@link RefreshTokenRequestDTO}).
 * @returns Promesa que resuelve a un nuevo {@link AuthResponseDTO} con tokens renovados.
 *
 * @throws {AppError} Retorna un error `401 Unauthorized` si el refresh token es inválido o ha expirado.
 * @throws {AppError} Retorna un error `401 Unauthorized` si el usuario asociado al token no existe o está inactivo.
 *
 * @remarks
 * El flujo consta de 3 etapas:
 * 1. Verifica la firma y vigencia del token mediante `jwt.verify`.
 * 2. Consulta el estado del usuario en PostgreSQL a través de Prisma (`isActive`).
 * 3. Firma y devuelve una nueva dupla de tokens.
 *
 * @example
 * ```typescript
 * const newTokens = await refreshTokenSvc({ refresh_token: 'eyJhbGciOiJIUzI1Ni...' });
 * ```
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
 * Centraliza la firma para mantener coherencia en payloads y vigencias.
 *
 * @internal
 * @param user - Objeto con las propiedades básicas del usuario necesarias para construir el payload del JWT.
 * @returns Estructura {@link AuthResponseDTO} con `access_token`, `refresh_token` y `expires_in`.
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

export { loginSvc, refreshTokenSvc, registerSvc };
