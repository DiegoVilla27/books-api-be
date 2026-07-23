import { cacheRedis } from "@core/middlewares/cacheRedis";
import { httpLogger } from "@core/middlewares/httpLogger";
import { optionalAuth } from "@core/middlewares/optionalAuth";
import { restrictTo } from "@core/middlewares/restrictTo";
import validateDataMiddleware from "@core/middlewares/validateDataZod";
import {
  checkEmailCtrl,
  createUserCtrl,
  deleteUserCtrl,
  getMeCtrl,
  getUserByIdCtrl,
  getUsersCtrl,
  getUsersLookupCtrl,
  profileCtrl,
  updateUserCtrl
} from "@modules/users/controllers";
import {
  CheckEmailSchema,
  CreateUserSchema,
  GetUsersQuerySchema,
  ProfileUserSchema,
  UpdateUserSchema,
  UserByIdSchema
} from "@modules/users/schemas";
import { Router } from "express";

const ENTITY_BASE = '/users';

/**
 * Enrutador de Express encargado de exponer las rutas REST del recurso Usuarios (`/users`).
 * Aplica validaciones con esquemas de Zod, caché en Redis (`cacheRedis`) en consultas de lectura (`GET`),
 * auditoría de eventos en RabbitMQ (`httpLogger`) en mutaciones e integra control de acceso basado en roles (RBAC)
 * mediante los middlewares `restrictTo` y `optionalAuth`.
 *
 * @remarks
 * Endpoints expuestos:
 * - `PATCH /users/profile` – Actualiza el perfil del usuario autenticado (con auditoría httpLogger).
 * - `GET /users/me` – Obtiene los datos del usuario actual.
 * - `GET /users/lookup` – Listado resumido de usuarios (con caché Redis).
 * - `POST /users/check-email` – Verifica disponibilidad de un email.
 * - `GET /users` – Listado paginado de usuarios (solo ADMIN, con caché Redis).
 * - `GET /users/:id` – Obtiene un usuario por ID (con caché Redis).
 * - `POST /users` – Registra un usuario (solo ADMIN, con auditoría httpLogger).
 * - `PATCH /users/:id` – Actualización parcial de un usuario (solo ADMIN, con auditoría httpLogger).
 * - `DELETE /users/:id` – Inhabilitación lógica de un usuario (solo ADMIN, con auditoría httpLogger).
 *
 * @see {@link cacheRedis}
 * @see {@link httpLogger}
 * @see {@link restrictTo}
 * @see {@link validateDataMiddleware}
 */
const userRoutes: Router = Router();

// Endpoint para obtener el usuario actual autenticado.
userRoutes.patch(`${ENTITY_BASE}/profile`, [
  validateDataMiddleware(ProfileUserSchema),
  restrictTo('USER', 'ADMIN'),
  httpLogger
], profileCtrl);

// Endpoint para obtener el usuario actual autenticado.
userRoutes.get(`${ENTITY_BASE}/me`,
  restrictTo('USER', 'ADMIN'),
  getMeCtrl
);

// Endpoint para obtener la lista resumida/lookup
userRoutes.get(`${ENTITY_BASE}/lookup`, [
  optionalAuth,
  cacheRedis(),
], getUsersLookupCtrl);

// Endpoint para verificar si un email existe
userRoutes.post(`${ENTITY_BASE}/check-email`, [
  validateDataMiddleware(CheckEmailSchema),
  restrictTo('USER', 'ADMIN')
], checkEmailCtrl);

// Endpoint para el listado paginado de usuarios (Accesible por ADMIN)
userRoutes.get(ENTITY_BASE, [
  validateDataMiddleware(GetUsersQuerySchema),
  restrictTo('ADMIN'),
  cacheRedis()
], getUsersCtrl);

// Endpoint para obtener un usuario por ID (Accesible por USER y ADMIN)
userRoutes.get(`${ENTITY_BASE}/:id`, [
  validateDataMiddleware(UserByIdSchema),
  restrictTo('USER', 'ADMIN'),
  cacheRedis()
], getUserByIdCtrl);

// Endpoint para registrar un nuevo usuario (Solo ADMIN)
userRoutes.post(ENTITY_BASE, [
  validateDataMiddleware(CreateUserSchema),
  restrictTo('ADMIN'),
  httpLogger
], createUserCtrl);

// Endpoint para actualización parcial de un usuario (Solo ADMIN)
userRoutes.patch(`${ENTITY_BASE}/:id`, [
  validateDataMiddleware(UserByIdSchema),
  validateDataMiddleware(UpdateUserSchema),
  restrictTo('ADMIN'),
  httpLogger
], updateUserCtrl);

// Endpoint para inhabilitar lógicamente a un usuario (Solo ADMIN)
userRoutes.delete(`${ENTITY_BASE}/:id`, [
  validateDataMiddleware(UserByIdSchema),
  restrictTo('ADMIN'),
  httpLogger
], deleteUserCtrl);

export default userRoutes;