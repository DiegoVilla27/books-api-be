import type { NextFunction, Request, Response } from "express";
import { loginSvc, refreshTokenSvc, registerSvc } from "../services";

/**
 * Controlador para autenticar a un usuario existente mediante sus credenciales.
 *
 * @param req - Objeto de petición de Express. Espera `email` y `password` en `req.body` (validados previamente por `LoginSchema`).
 * @param res - Objeto de respuesta de Express. Retorna el payload `AuthResponseDTO` con estado HTTP `200 OK`.
 * @param next - Función de Express para delegar errores inesperados al middleware de errores global.
 *
 * @returns Promesa que resuelve enviando la respuesta HTTP JSON con los tokens.
 *
 * @throws {AppError} Retorna un error `401 Unauthorized` si las credenciales (email o password) no coinciden o la cuenta está inactiva.
 *
 * @example
 * ```typescript
 * // Invocado en la ruta POST /api/v1/auth/login
 * authRoutes.post('/login', validateDataMiddleware(LoginSchema), loginCtrl);
 * ```
 */
const loginCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await loginSvc(req.body);

    return res.status(200).json(user);
  } catch (e) {
    console.log(`Error al iniciar sesión: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para registrar un nuevo usuario en el sistema.
 * Crea la cuenta, encripta la contraseña y devuelve un par de tokens JWT listos para usar.
 *
 * @param req - Objeto de petición de Express. Espera los campos del `RegisterRequestDTO` en `req.body` (validados por `RegisterSchema`).
 * @param res - Objeto de respuesta de Express. Retorna el payload `AuthResponseDTO` con estado HTTP `200 OK`.
 * @param next - Función de Express para delegar errores inesperados al middleware de errores global.
 *
 * @returns Promesa que resuelve enviando la respuesta HTTP JSON con los tokens generados.
 *
 * @throws {AppError} Retorna un error `400 Bad Request` si el correo electrónico ya se encuentra registrado en el sistema.
 *
 * @example
 * ```typescript
 * // Invocado en la ruta POST /api/v1/auth/register
 * authRoutes.post('/register', validateDataMiddleware(RegisterSchema), registerCtrl);
 * ```
 */
const registerCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await registerSvc(req.body);

    return res.status(200).json(user);
  } catch (e) {
    console.log(`Error al registrar usuario: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para renovar el par de tokens JWT a partir de un refresh token válido.
 * Implementa la estrategia de **Refresh Token Rotation**: cada llamada consume el refresh
 * token actual y emite uno nuevo, invalidando el anterior de forma implícita.
 *
 * @param req - Objeto de petición de Express. Espera `refresh_token` en `req.body` (validado por `RefreshTokenSchema`).
 * @param res - Objeto de respuesta de Express. Retorna un nuevo `AuthResponseDTO` con estado HTTP `200 OK`.
 * @param next - Función de Express para delegar errores inesperados al middleware de errores global.
 *
 * @returns Promesa que resuelve enviando la respuesta HTTP JSON con el par de tokens renovado.
 *
 * @throws {AppError} Retorna `401 Unauthorized` si el refresh token es inválido, expirado o si el usuario asociado ha sido inhabilitado.
 *
 * @example
 * ```typescript
 * // Invocado en la ruta POST /api/v1/auth/refresh
 * authRoutes.post('/refresh', validateDataMiddleware(RefreshTokenSchema), refreshTokenCtrl);
 * ```
 */
const refreshTokenCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await refreshTokenSvc(req.body);

    return res.status(200).json(tokens);
  } catch (e) {
    console.log(`Error al renovar el token: ${e}`);
    return next(e);
  }
}

export { loginCtrl, refreshTokenCtrl, registerCtrl };
