import AppError from "@core/errors";
import { createBookSvc, deleteBookSvc, getAllBooksSvc, getBookByIdSvc, updateBookSvc } from "@modules/books/services";
import type { NextFunction, Request, Response } from "express";
import type { BooksPaginationQuery } from "../entities";

/**
 * Controlador para obtener un listado paginado de libros.
 * Extrae los parámetros de paginación del query string y retorna el listado con metadatos.
 * 
 * @param req - Objeto de petición de Express. Espera `page` y `limit` opcionales en el Query String.
 * @param res - Objeto de respuesta de Express. Retorna un JSON con estructura `IPagination<BookResponseDTO>`.
 * @param next - Función de Express para pasar el control al siguiente middleware (manejador global de errores).
 */
const getBooksCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query as unknown as BooksPaginationQuery;
    const requestingUser = req.user;

    const books = await getAllBooksSvc(filters, requestingUser);

    return res.status(200).json(books);
  } catch (e) {
    console.log(`Error al obtener los libros: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para obtener el detalle de un libro específico mediante su ID.
 * 
 * @param req - Objeto de petición de Express. Espera el `id` numérico en los parámetros de la ruta (`params`).
 * @param res - Objeto de respuesta de Express. Retorna el detalle del libro en formato `BookResponseDTO`.
 * @param next - Función de Express para pasar el control al manejador global de errores.
 * 
 * @throws AppError - Retorna un error 404 si el libro no existe en la base de datos.
 */
const getBookByIdCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const requestingUser = req.user;

    const bookById = await getBookByIdSvc(id, requestingUser);

    return res.status(200).json(bookById);
  } catch (e) {
    console.log(`Error al obtener el libro: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para crear un nuevo libro asociado a un usuario.
 * 
 * @param req - Objeto de petición de Express. Espera los datos en el cuerpo (`body`) validados por `CreateBookRequestDTO`.
 * @param res - Objeto de respuesta de Express. Retorna el libro recién creado en formato `BookResponseDTO` (estado 201).
 * @param next - Función de Express para delegar errores.
 */
const createBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = req.user!;
    let targetUserId: number;

    // 🟢 Regla de Negocio
    if (authUser.role === 'ADMIN' && req.body.userId) {
      // El ADMIN especifica a qué usuario le creará el libro
      targetUserId = req.body.userId;
    } else {
      // El USER normal siempre asigna su propia ID (evita suplantación de identidad)
      targetUserId = authUser.id;
    }

    const newBook = await createBookSvc({ ...req.body, userId: targetUserId });

    return res.status(201).json(newBook);
  } catch (e) {
    console.log(`Error al crear el libro: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para realizar la actualización parcial (PATCH) de un libro existente.
 * Envía el objeto completo del usuario autenticado (`req.user`) al servicio para validar autorizaciones.
 * 
 * @param req - Objeto de petición de Express. Espera el `id` en `params` y los campos a actualizar en el `body` (validados por `UpdateBookRequestDTO`).
 * @param res - Objeto de respuesta de Express. Retorna el libro actualizado en formato `BookResponseDTO`.
 * @param next - Función de Express para delegar errores.
 */
const updateBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const requestingUser = req.user!;

    const updatedBook = await updateBookSvc(id, req.body, requestingUser);

    return res.status(200).json(updatedBook);
  } catch (e) {
    console.log(`Error al actualizar el libro: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para eliminar físicamente un libro de la base de datos.
 * Envía el objeto del usuario autenticado al servicio para asegurar que solo el dueño o un ADMIN realicen la acción.
 * 
 * @param req - Objeto de petición de Express. Espera el `id` en los parámetros de la ruta.
 * @param res - Objeto de respuesta de Express. Retorna el objeto del libro eliminado en formato `BookResponseDTO`.
 * @param next - Función de Express para delegar errores.
 * 
 * @throws AppError - Retorna un error 404 si el libro que se desea eliminar no existe o 403 si carece de autorización.
 */
const deleteBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };
    const requestingUser = req.user!;

    const deleteBook = await deleteBookSvc(id, requestingUser);

    return res.status(200).json(deleteBook);
  } catch (e) {
    console.log(`Error al eliminar el libro: ${e}`);
    return next(e);
  }
}

export { createBookCtrl, deleteBookCtrl, getBookByIdCtrl, getBooksCtrl, updateBookCtrl };
