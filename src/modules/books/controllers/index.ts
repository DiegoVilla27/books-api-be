import type { NextFunction, Request, Response } from "express";
import { createBookSvc, deleteBookSvc, getAllBooksSvc, getBookByIdSvc, updateBookSvc } from "@modules/books/services";
import AppError from "@core/errors";

const getBooksCtrl = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const books = await getAllBooksSvc();

    return res.status(200).json({ data: books });
  } catch (e) {
    console.log(`Error al obtener los libros: ${e}`);
    return next(e);
  }
}

const getBookByIdCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const bookById = await getBookByIdSvc(id);

    if (!bookById) return next(new AppError('Libro no encontrado', 404));

    return res.status(200).json({ data: bookById });
  } catch (e) {
    console.log(`Error al obtener el libro: ${e}`);
    return next(e);
  }
}

const createBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, author } = req.body;

    if (!title || !author) return next(new AppError('Faltan datos del libro', 400));

    const newBook = await createBookSvc(req.body);

    return res.status(200).json({ data: newBook });
  } catch (e) {
    console.log(`Error al crear el libro: ${e}`);
    return next(e);
  }
}

const updateBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, author } = req.body;
    const id = Number(req.params.id);

    if (!title || !author) return next(new AppError('Faltan datos del libro', 400));

    const updatedBook = await updateBookSvc(id, { title, author });

    return res.status(200).json({ data: updatedBook });
  } catch (e) {
    console.log(`Error al actualizar el libro: ${e}`);
    return next(e);
  }
}

const deleteBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const deleteBook = await deleteBookSvc(id);

    if (!deleteBook) return next(new AppError('Libro no encontrado', 404));

    return res.status(200).json({ data: deleteBook });
  } catch (e) {
    console.log(`Error al eliminar el libro: ${e}`);
    return next(e);
  }
}

export { createBookCtrl, deleteBookCtrl, getBooksCtrl, getBookByIdCtrl, updateBookCtrl };
