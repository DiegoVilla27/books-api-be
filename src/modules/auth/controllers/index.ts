import type { NextFunction, Request, Response } from "express";
import { getMetSvc, loginSvc, refreshTokenSvc, registerSvc } from "../services";

/**
 * Controller responsible for retrieving the current authenticated user's profile identity.
 * Serves as the main validation endpoint during application bootstrap lifecycles.
 * 
 * @remarks
 * This handler expects the upstream authentication middleware (`restrictTo`) to have already 
 * successfully verified the incoming JWT and injected the credentials into `req.user`.
 *
 * @param req - Express Request object containing the parsed context metadata inside `req.user`.
 * @param res - Express Response object returning the authenticated user's profile properties.
 * @param next - Express Next function to forward internal application errors to the global handler layer.
 */
const getMeCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getMetSvc(req.user);

    return res.status(200).json(user);
  } catch (error) {
    console.log(`Error al obtener el usuario: ${error}`);
    return next(error);
  }
}

/**
 * Controlador para autenticar a un usuario existente mediante sus credenciales.
 *
 * @param req - Objeto de petición de Express. Espera `email` y `password` validados en el `body`.
 * @param res - Objeto de respuesta de Express. Devuelve un `AuthResponseDTO` con el par de tokens JWT.
 * @param next - Función de Express para delegar errores al manejador global.
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
 * @param req - Objeto de petición de Express. Espera los campos del `RegisterRequestDTO` validados en el `body`.
 * @param res - Objeto de respuesta de Express. Devuelve un `AuthResponseDTO` con el par de tokens JWT.
 * @param next - Función de Express para delegar errores al manejador global.
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
 * @param req - Objeto de petición de Express. Espera `refresh_token` en el `body`.
 * @param res - Objeto de respuesta de Express. Devuelve un nuevo `AuthResponseDTO` con tokens frescos.
 * @param next - Función de Express para delegar errores al manejador global.
 * @throws {AppError} Retorna `401` si el refresh token es inválido, expirado o el usuario está inactivo.
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

export { getMeCtrl, loginCtrl, refreshTokenCtrl, registerCtrl };
