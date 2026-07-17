import { restrictTo } from "@core/middlewares/restrictTo";
import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { GetQuerySchema } from "@core/types/pagination";
import { createUserCtrl, deleteUserCtrl, getUserByIdCtrl, getUsersCtrl, getUsersLookupCtrl, updateUserCtrl } from "@modules/users/controllers";
import { CreateUserSchema, GetUsersQuerySchema, UpdateUserSchema, UserByIdSchema } from "@modules/users/schemas";
import { Router } from "express";

/**
 * Enrutador de Express encargado de exponer las rutas del recurso Usuarios.
 * Aplica validaciones con esquemas de Zod e integra control de acceso basado
 * en roles (RBAC) con el middleware unificado `restrictTo`.
 */
const userRoutes = Router();

// Endpoint para obtener la lista resumida/lookup (Solamente accesible por ADMIN)
userRoutes.get('/users/lookup', [
  restrictTo('ADMIN')
], getUsersLookupCtrl);

// Endpoint para el listado paginado de usuarios (Accesible por USER y ADMIN)
userRoutes.get('/users', [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(GetUsersQuerySchema)
], getUsersCtrl);

// Endpoint para obtener un usuario por ID (Accesible por USER y ADMIN)
userRoutes.get('/users/:id', [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(UserByIdSchema)
], getUserByIdCtrl);

// Endpoint para registrar un nuevo usuario (Solo ADMIN)
userRoutes.post('/users', [
  restrictTo('ADMIN'),
  validateDataMiddleware(CreateUserSchema)
], createUserCtrl);

// Endpoint para actualización parcial de un usuario (Solo ADMIN)
userRoutes.patch('/users/:id', [
  restrictTo('ADMIN'),
  validateDataMiddleware(UserByIdSchema),
  validateDataMiddleware(UpdateUserSchema)
], updateUserCtrl);

// Endpoint para inhabilitar lógicamente a un usuario (Solo ADMIN)
userRoutes.delete('/users/:id', [
  restrictTo('ADMIN'),
  validateDataMiddleware(UserByIdSchema)
], deleteUserCtrl);

export default userRoutes;