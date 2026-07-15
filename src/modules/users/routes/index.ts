import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { GetQuerySchema } from "@core/types/pagination";
import { createUserCtrl, deleteUserCtrl, getUserByIdCtrl, getUsersCtrl, updateUserCtrl } from "@modules/users/controllers";
import { UserByIdSchema, CreateUserSchema, UpdateUserSchema } from "@modules/users/schemas";
import { Router } from "express";

const userRoutes = Router();

userRoutes.get('/users', validateDataMiddleware(GetQuerySchema), getUsersCtrl);
userRoutes.get('/users/:id', validateDataMiddleware(UserByIdSchema), getUserByIdCtrl);
userRoutes.post('/users', validateDataMiddleware(CreateUserSchema), createUserCtrl);
userRoutes.patch('/users/:id', [
  validateDataMiddleware(UserByIdSchema),
  validateDataMiddleware(UpdateUserSchema)
], updateUserCtrl);
userRoutes.delete('/users/:id', validateDataMiddleware(UserByIdSchema), deleteUserCtrl);

export default userRoutes;