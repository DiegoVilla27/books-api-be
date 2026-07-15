import AppError from "@core/errors";
import type { PaginationQuery } from "@core/types/pagination";
import { createUserSvc, deleteUserSvc, getAllUsersSvc, getUserByIdSvc, updateUserSvc } from "@modules/users/services";
import type { NextFunction, Request, Response } from "express";

const getUsersCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as unknown as PaginationQuery;

    const users = await getAllUsersSvc(page, limit);

    return res.status(200).json(users);
  } catch (e) {
    console.log(`Error al obtener los usuarios: ${e}`);
    return next(e);
  }
}

const getUserByIdCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const userById = await getUserByIdSvc(id);

    if (!userById) return next(new AppError('Usuario no encontrado', 404));

    return res.status(200).json(userById);
  } catch (e) {
    console.log(`Error al obtener el usuario: ${e}`);
    return next(e);
  }
}

const createUserCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await createUserSvc(req.body);

    return res.status(200).json(newUser);
  } catch (e) {
    console.log(`Error al crear el usuario: ${e}`);
    return next(e);
  }
}

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

export { createUserCtrl, deleteUserCtrl, getUserByIdCtrl, getUsersCtrl, updateUserCtrl };
