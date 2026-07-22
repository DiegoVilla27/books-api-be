import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { Router } from "express";
import { loginCtrl, refreshTokenCtrl, registerCtrl } from "../controllers";
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from "../schemas";

/**
 * Enrutador de Express encargado de exponer los endpoints públicos del módulo de Autenticación.
 * Todas las rutas de este módulo son de acceso libre (no requieren JWT previo).
 * Aplica middlewares de validación Zod en cada endpoint para garantizar la integridad de los datos.
 *
 * @remarks
 * Endpoints disponibles:
 * - `POST /login` - Autentica un usuario mediante sus credenciales (email/password).
 * - `POST /register` - Registra un nuevo usuario en el sistema y emite sus tokens iniciales.
 * - `POST /refresh` - Renueva el par de tokens JWT a partir de un refresh token válido.
 *
 * @see {@link loginCtrl}
 * @see {@link registerCtrl}
 * @see {@link refreshTokenCtrl}
 */
const authRoutes = Router();

// Endpoint para autenticar un usuario con sus credenciales
authRoutes.post('/login', validateDataMiddleware(LoginSchema), loginCtrl);

// Endpoint para registrar un nuevo usuario en el sistema
authRoutes.post('/register', validateDataMiddleware(RegisterSchema), registerCtrl);

// Endpoint para renovar el par de tokens JWT mediante un refresh token válido
authRoutes.post('/refresh', [validateDataMiddleware(RefreshTokenSchema)], refreshTokenCtrl);

export default authRoutes;