import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { GetQuerySchema } from "@core/types/pagination";
import { createUserCtrl, deleteUserCtrl, getUserByIdCtrl, getUsersCtrl, updateUserCtrl } from "@modules/users/controllers";
import { UserByIdSchema, CreateUserSchema, UpdateUserSchema } from "@modules/users/schemas";
import { Router } from "express";

/**
 * Enrutador de Express encargado de exponer las rutas del recurso Usuarios.
 * Aplica middlewares de validación Zod en cada endpoint para controlar los parámetros de entrada.
 */
const userRoutes = Router();

// Endpoint para el listado paginado de usuarios
userRoutes.get('/users', validateDataMiddleware(GetQuerySchema), getUsersCtrl);

// Endpoint para obtener un usuario por ID
userRoutes.get('/users/:id', validateDataMiddleware(UserByIdSchema), getUserByIdCtrl);

// Endpoint para registrar un nuevo usuario
userRoutes.post('/users', validateDataMiddleware(CreateUserSchema), createUserCtrl);

// Endpoint para actualización parcial de un usuario
userRoutes.patch('/users/:id', [
  validateDataMiddleware(UserByIdSchema),
  validateDataMiddleware(UpdateUserSchema)
], updateUserCtrl);

// Endpoint para inhabilitar lógicamente a un usuario
userRoutes.delete('/users/:id', validateDataMiddleware(UserByIdSchema), deleteUserCtrl);

export default userRoutes;