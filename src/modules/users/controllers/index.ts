import AppError from "@core/errors";
import { checkEmailSvc, createUserSvc, deleteUserSvc, getAllUsersSvc, getUserByIdSvc, getUsersLookupSvc, updateUserSvc } from "@modules/users/services";
import type { NextFunction, Request, Response } from "express";
import type { UsersPaginationQuery } from "../entities";

/**
 * Controlador para obtener un listado simplificado de todos los usuarios.
 * Retorna únicamente el ID, nombre y apellido para alimentar selectores y listas de asignación.
 * 
 * @param _ - Objeto de petición de Express (no utilizado).
 * @param res - Objeto de respuesta de Express. Retorna el listado de lookup con código 200.
 * @param next - Función de Express para delegar errores.
 */
const getUsersLookupCtrl = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getUsersLookupSvc();

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
 */
const getUsersCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query as unknown as UsersPaginationQuery;
    const requestingRole = req.user!.role; // Extraemos el rol del token JWT

    const users = await getAllUsersSvc(requestingRole, filters);

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
 * @throws {AppError} Retorna un error 404 si el usuario no existe o no tiene permisos de lectura sobre él.
 */
const getUserByIdCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const requestingRole = req.user!.role;

    const userById = await getUserByIdSvc(id, requestingRole);

    if (!userById) return next(new AppError('Usuario no encontrado', 404));

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
 * @param res - Objeto de respuesta de Express. Retorna el usuario creado en formato `UserResponseDTO` (código 200).
 * @param next - Función de Express para delegar errores.
 */
const createUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await createUserSvc(req.body);

    return res.status(200).json(newUser);
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
 * @throws {AppError} Retorna un error 404 si el usuario a actualizar no existe.
 */
const updateUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const updatedUser = await updateUserSvc(id, req.body);

    if (!updatedUser) return next(new AppError('Usuario no encontrado', 404));

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
 * @throws {AppError} Retorna un error 404 si el usuario no existe.
 */
const deleteUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const deletedUser = await deleteUserSvc(id);

    if (!deletedUser) return next(new AppError('Usuario no encontrado', 404));

    return res.status(200).json(deletedUser);
  } catch (e) {
    console.log(`Error al eliminar el usuario: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para verificar si un correo electrónico ya está registrado en la base de datos.
 * 
 * @param req - Objeto de petición de Express con el `email` en parámetros de ruta.
 * @param res - Objeto de respuesta de Express. Devuelve `true` si el email existe, y `false` si no existe.
 * @param next - Función de Express para delegar errores.
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

export { checkEmailCtrl, createUserCtrl, deleteUserCtrl, getUserByIdCtrl, getUsersCtrl, getUsersLookupCtrl, updateUserCtrl };

