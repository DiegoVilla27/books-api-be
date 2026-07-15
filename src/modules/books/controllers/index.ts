import AppError from "@core/errors";
import type { PaginationQuery } from "@core/types/pagination";
import { createBookSvc, deleteBookSvc, getAllBooksSvc, getBookByIdSvc, updateBookSvc } from "@modules/books/services";
import type { NextFunction, Request, Response } from "express";

const getBooksCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as unknown as PaginationQuery;

    const books = await getAllBooksSvc(page, limit);

    return res.status(200).json(books);
  } catch (e) {
    console.log(`Error al obtener los libros: ${e}`);
    return next(e);
  }
}

const getBookByIdCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const bookById = await getBookByIdSvc(id);

    if (!bookById) return next(new AppError('Libro no encontrado', 404));

    return res.status(200).json(bookById);
  } catch (e) {
    console.log(`Error al obtener el libro: ${e}`);
    return next(e);
  }
}

const createBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newBook = await createBookSvc(req.body);

    return res.status(200).json(newBook);
  } catch (e) {
    console.log(`Error al crear el libro: ${e}`);
    return next(e);
  }
}

const updateBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const updatedBook = await updateBookSvc(id, req.body);

    return res.status(200).json(updatedBook);
  } catch (e) {
    console.log(`Error al actualizar el libro: ${e}`);
    return next(e);
  }
}

const deleteBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const deleteBook = await deleteBookSvc(id);

    if (!deleteBook) return next(new AppError('Libro no encontrado', 404));

    return res.status(200).json(deleteBook);
  } catch (e) {
    console.log(`Error al eliminar el libro: ${e}`);
    return next(e);
  }
}

export { createBookCtrl, deleteBookCtrl, getBookByIdCtrl, getBooksCtrl, updateBookCtrl };

