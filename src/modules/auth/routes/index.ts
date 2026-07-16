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
 * Las rutas disponibles son:
 * - `POST /login`   – Autentica un usuario con email y contraseña.
 * - `POST /register` – Registra un nuevo usuario en el sistema.
 * - `POST /refresh`  – Renueva el par de tokens JWT a partir de un refresh token válido.
 */
const authRoutes = Router();

// Endpoint para autenticar un usuario con sus credenciales
authRoutes.post('/login', validateDataMiddleware(LoginSchema), loginCtrl);

// Endpoint para registrar un nuevo usuario en el sistema
authRoutes.post('/register', validateDataMiddleware(RegisterSchema), registerCtrl);

// Endpoint para renovar el par de tokens JWT mediante un refresh token válido
authRoutes.post('/refresh', validateDataMiddleware(RefreshTokenSchema), refreshTokenCtrl);

export default authRoutes;