import { optionalAuth } from "@core/middlewares/optionalAuth";
import { restrictTo } from "@core/middlewares/restrictTo";
import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { checkEmailCtrl, createUserCtrl, deleteUserCtrl, getUserByIdCtrl, getUsersCtrl, getUsersLookupCtrl, updateUserCtrl } from "@modules/users/controllers";
import { CreateUserSchema, GetUsersQuerySchema, UpdateUserSchema, CheckEmailSchema, UserByIdSchema } from "@modules/users/schemas";
import { Router } from "express";

const ENTITY_BASE = '/users';

/**
 * Enrutador de Express encargado de exponer las rutas del recurso Usuarios.
 * Aplica validaciones con esquemas de Zod e integra control de acceso basado
 * en roles (RBAC) con el middleware unificado `restrictTo`.
 */
const userRoutes = Router();

// Endpoint para obtener la lista resumida/lookup
userRoutes.get(`${ENTITY_BASE}/lookup`, [
  optionalAuth,
], getUsersLookupCtrl);

// Endpoint para verificar si un email existe
userRoutes.post(`${ENTITY_BASE}/check-email`, [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(CheckEmailSchema)
], checkEmailCtrl);

// Endpoint para el listado paginado de usuarios (Accesible por USER y ADMIN)
userRoutes.get(ENTITY_BASE, [
  restrictTo('ADMIN'),
  validateDataMiddleware(GetUsersQuerySchema)
], getUsersCtrl);

// Endpoint para obtener un usuario por ID (Accesible por USER y ADMIN)
userRoutes.get(`${ENTITY_BASE}/:id`, [
  restrictTo('ADMIN'),
  validateDataMiddleware(UserByIdSchema)
], getUserByIdCtrl);

// Endpoint para registrar un nuevo usuario (Solo ADMIN)
userRoutes.post(ENTITY_BASE, [
  restrictTo('ADMIN'),
  validateDataMiddleware(CreateUserSchema)
], createUserCtrl);

// Endpoint para actualización parcial de un usuario (Solo ADMIN)
userRoutes.patch(`${ENTITY_BASE}/:id`, [
  restrictTo('ADMIN'),
  validateDataMiddleware(UserByIdSchema),
  validateDataMiddleware(UpdateUserSchema)
], updateUserCtrl);

// Endpoint para inhabilitar lógicamente a un usuario (Solo ADMIN)
userRoutes.delete(`${ENTITY_BASE}/:id`, [
  restrictTo('ADMIN'),
  validateDataMiddleware(UserByIdSchema)
], deleteUserCtrl);

export default userRoutes;