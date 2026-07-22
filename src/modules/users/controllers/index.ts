import {
  checkEmailSvc,
  createUserSvc,
  deleteUserSvc,
  getAllUsersSvc,
  getMeSvc,
  getUserByIdSvc,
  getUsersLookupSvc,
  profileSvc,
  updateUserSvc
} from "@modules/users/services";
import type { NextFunction, Request, Response } from "express";
import type { UsersPaginationQuery } from "../entities";

/**
 * Controlador para actualizar el perfil del usuario autenticado.
 * 
 * @param req - Objeto de petición de Express con los campos de perfil en `req.body`.
 * @param res - Objeto de respuesta de Express. Devuelve los datos del perfil actualizado en formato `UserResponseDTO` con estado 200 OK.
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve enviando la respuesta HTTP JSON con el usuario actualizado.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si no existe la información del usuario en `req.user`.
 * 
 * @example
 * ```typescript
 * router.patch('/users/profile', restrictTo('USER', 'ADMIN'), validateDataMiddleware(ProfileUserSchema), profileCtrl);
 * ```
 */
const profileCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await profileSvc(req.body, req.user?.id);

    return res.status(200).json(user);
  } catch (error) {
    console.log(`Error al actualizar el usuario: ${error}`);
    return next(error);
  }
}

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
 * 
 * @returns Promise resolving to the HTTP response payload.
 * 
 * @throws {AppError} Returns `401 Unauthorized` if the session is missing or user is inactive.
 * 
 * @example
 * ```typescript
 * router.get('/users/me', restrictTo('USER', 'ADMIN'), getMeCtrl);
 * ```
 */
const getMeCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getMeSvc(req.user?.id);

    return res.status(200).json(user);
  } catch (error) {
    console.log(`Error al obtener el usuario: ${error}`);
    return next(error);
  }
}

/**
 * Controlador para obtener un listado simplificado de todos los usuarios.
 * Retorna únicamente el ID, nombre y apellido para alimentar selectores y listas de asignación.
 * 
 * @param req - Objeto de petición de Express.
 * @param res - Objeto de respuesta de Express. Retorna el listado de lookup con código 200 OK.
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve enviando el listado resumido de usuarios.
 * 
 * @example
 * ```typescript
 * router.get('/users/lookup', optionalAuth, getUsersLookupCtrl);
 * ```
 */
const getUsersLookupCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getUsersLookupSvc(req.user?.role);

    return res.status(200).json(users);
  } catch (e) {
    console.log(`Error al obtener los usuarios: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para obtener una lista paginada de todos los usuarios registrados.
 * Aplica un filtrado automático para que los usuarios estándar no puedan visualizar perfiles ADMIN.
 * 
 * @param req - Objeto de petición de Express. Espera `page` y `limit` opcionales en el Query String.
 * @param res - Objeto de respuesta de Express. Retorna el listado paginado en formato JSON `IPagination<UserResponseDTO>`.
 * @param next - Función de Express para delegar errores inesperados al manejador global.
 * 
 * @returns Promesa que resuelve respondiendo el listado paginado de usuarios.
 * 
 * @example
 * ```typescript
 * router.get('/users', restrictTo('ADMIN'), validateDataMiddleware(GetUsersQuerySchema), getUsersCtrl);
 * ```
 */
const getUsersCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query as unknown as UsersPaginationQuery;

    const users = await getAllUsersSvc(filters);

    return res.status(200).json(users);
  } catch (e) {
    console.log(`Error al obtener los usuarios: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para obtener un usuario específico por su ID único.
 * Evita la fuga de perfiles ADMIN cuando un rol USER intenta adivinar el identificador.
 * 
 * @param req - Objeto de petición de Express con el parámetro `id` en la ruta.
 * @param res - Objeto de respuesta de Express. Devuelve el `UserResponseDTO` correspondiente.
 * @param next - Función para pasar el control al siguiente middleware.
 * 
 * @returns Promesa que resuelve con los datos del usuario.
 * 
 * @throws {AppError} Retorna un error `404 Not Found` si el usuario no existe o `403 Forbidden` si carece de permisos.
 * 
 * @example
 * ```typescript
 * router.get('/users/:id', restrictTo('USER', 'ADMIN'), validateDataMiddleware(UserByIdSchema), getUserByIdCtrl);
 * ```
 */
const getUserByIdCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const userById = await getUserByIdSvc(id, req.user);

    return res.status(200).json(userById);
  } catch (e) {
    console.log(`Error al obtener el usuario: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para la creación (registro) de un nuevo usuario en el sistema.
 * 
 * @param req - Objeto de petición de Express con el body validado según `CreateUserRequestDTO`.
 * @param res - Objeto de respuesta de Express. Retorna el usuario creado en formato `UserResponseDTO` (código `201 Created`).
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve respondiendo el nuevo usuario creado.
 * 
 * @throws {AppError} Retorna `400 Bad Request` si el correo electrónico ya existe.
 * 
 * @example
 * ```typescript
 * router.post('/users', restrictTo('ADMIN'), validateDataMiddleware(CreateUserSchema), createUserCtrl);
 * ```
 */
const createUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await createUserSvc(req.body);

    return res.status(201).json(newUser);
  } catch (e) {
    console.log(`Error al crear el usuario: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para la actualización parcial de un usuario existente.
 * 
 * @param req - Objeto de petición de Express con el `id` en parámetros y los campos del `body` validados por `UpdateUserRequestDTO`.
 * @param res - Objeto de respuesta de Express. Retorna el usuario actualizado en formato `UserResponseDTO`.
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve enviando los datos del usuario modificado.
 * 
 * @throws {AppError} Retorna un error `404 Not Found` si el usuario a actualizar no existe.
 * 
 * @example
 * ```typescript
 * router.patch('/users/:id', restrictTo('ADMIN'), validateDataMiddleware(UpdateUserSchema), updateUserCtrl);
 * ```
 */
const updateUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const updatedUser = await updateUserSvc(id, req.body);

    return res.status(200).json(updatedUser);
  } catch (e) {
    console.log(`Error al actualizar el usuario: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para inhabilitar a un usuario del sistema (borrado lógico).
 * Modifica el flag `isActive` a `false`.
 * 
 * @param req - Objeto de petición de Express con el `id` a inhabilitar en los parámetros de ruta.
 * @param res - Objeto de respuesta de Express. Devuelve los datos del usuario inhabilitado en formato `UserResponseDTO`.
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve enviando los datos del usuario inhabilitado.
 * 
 * @throws {AppError} Retorna un error `404 Not Found` si el usuario no existe.
 * 
 * @example
 * ```typescript
 * router.delete('/users/:id', restrictTo('ADMIN'), validateDataMiddleware(UserByIdSchema), deleteUserCtrl);
 * ```
 */
const deleteUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const deletedUser = await deleteUserSvc(id);

    return res.status(200).json(deletedUser);
  } catch (e) {
    console.log(`Error al eliminar el usuario: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para verificar si un correo electrónico ya está registrado en la base de datos.
 * 
 * @param req - Objeto de petición de Express con el `email` en `req.body`.
 * @param res - Objeto de respuesta de Express. Devuelve `true` si el email existe, y `false` si no existe.
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve enviando un booleano `true` o `false`.
 * 
 * @example
 * ```typescript
 * router.post('/users/check-email', restrictTo('USER', 'ADMIN'), validateDataMiddleware(CheckEmailSchema), checkEmailCtrl);
 * ```
 */
const checkEmailCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emailExists = await checkEmailSvc(req.body.email);

    return res.status(200).json(emailExists);
  } catch (e) {
    console.log(`Error al verificar el email: ${e}`);
    return next(e);
  }
}

export {
  getMeCtrl,
  checkEmailCtrl,
  createUserCtrl,
  deleteUserCtrl,
  getUserByIdCtrl,
  getUsersCtrl,
  getUsersLookupCtrl,
  updateUserCtrl,
  profileCtrl
};

