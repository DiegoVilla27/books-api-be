import {
  createBookSvc,
  deleteBookSvc,
  getAllBooksSvc,
  getBookByIdSvc,
  myBooksSvc,
  updateBookSvc
} from "@modules/books/services";
import type { NextFunction, Request, Response } from "express";
import type { BooksPaginationQuery } from "../entities";

/**
 * Controlador para obtener un listado paginado de libros.
 * Extrae los parámetros de paginación del query string y retorna el listado con metadatos.
 * 
 * @param req - Objeto de petición de Express. Espera `page`, `limit`, `search` y `userId` opcionales en `req.query`.
 * @param res - Objeto de respuesta de Express. Retorna un JSON con estructura `IPagination<BookResponseDTO>` y estado 200 OK.
 * @param next - Función de Express para pasar el control al manejador global de errores.
 * 
 * @returns Promesa que resuelve respondiendo el JSON paginado de libros.
 * 
 * @example
 * ```typescript
 * // GET /books?page=1&limit=10&search=clean
 * router.get('/books', getBooksCtrl);
 * ```
 */
const getBooksCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query as unknown as BooksPaginationQuery;

    const books = await getAllBooksSvc(filters, req.user?.role);

    return res.status(200).json(books);
  } catch (e) {
    console.log(`Error al obtener los libros: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para obtener el detalle de un libro específico mediante su ID.
 * 
 * @param req - Objeto de petición de Express. Espera el `id` numérico en `req.params`.
 * @param res - Objeto de respuesta de Express. Retorna el detalle del libro en formato `BookResponseDTO` con estado 200 OK.
 * @param next - Función de Express para pasar el control al manejador global de errores.
 * 
 * @returns Promesa que resuelve respondiendo los detalles del libro solicitado.
 * 
 * @throws {AppError} Retorna un error `404 Not Found` si el libro no existe o si pertenece a un ADMIN y la consulta la realiza un USER normal.
 * 
 * @example
 * ```typescript
 * // GET /books/42
 * router.get('/books/:id', getBookByIdCtrl);
 * ```
 */
const getBookByIdCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const bookById = await getBookByIdSvc(id, req.user?.role);

    return res.status(200).json(bookById);
  } catch (e) {
    console.log(`Error al obtener el libro: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para crear un nuevo libro asociado a un usuario.
 * 
 * @param req - Objeto de petición de Express. Espera los datos en `req.body` validados por `CreateBookRequestDTO`.
 * @param res - Objeto de respuesta de Express. Retorna el libro recién creado en formato `BookResponseDTO` con estado `201 Created`.
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve respondiendo la entidad del libro recién creado.
 * 
 * @remarks
 * **Regla de Autorización/Negocio:**
 * Si el usuario solicitante posee el rol `ADMIN` y proporciona `userId` en el cuerpo, el libro se asignará a dicho usuario.
 * Si el usuario posee el rol `USER`, se ignora cualquier `userId` recibido y se fuerza `req.user.id` para prevenir suplantación.
 * 
 * @example
 * ```typescript
 * // POST /books
 * router.post('/books', restrictTo('USER', 'ADMIN'), createBookCtrl);
 * ```
 */
const createBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newBook = await createBookSvc(req.body, req.user);

    return res.status(201).json(newBook);
  } catch (e) {
    console.log(`Error al crear el libro: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para realizar la actualización parcial (PATCH) de un libro existente.
 * 
 * @param req - Objeto de petición de Express. Espera el `id` en `req.params` y los campos a actualizar en `req.body`.
 * @param res - Objeto de respuesta de Express. Retorna el libro actualizado en formato `BookResponseDTO` con estado 200 OK.
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve respondiendo el libro actualizado.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si no existe la información del usuario autenticado.
 * @throws {AppError} Retorna `404 Not Found` si el libro no existe.
 * @throws {AppError} Retorna `403 Forbidden` si el usuario no es el propietario del libro ni un administrador.
 * 
 * @example
 * ```typescript
 * // PATCH /books/42
 * router.patch('/books/:id', restrictTo('USER', 'ADMIN'), updateBookCtrl);
 * ```
 */
const updateBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const updatedBook = await updateBookSvc(id, req.body, req.user);

    return res.status(200).json(updatedBook);
  } catch (e) {
    console.log(`Error al actualizar el libro: ${e}`);
    return next(e);
  }
}

/**
 * Controlador para eliminar físicamente un libro de la base de datos.
 * 
 * @param req - Objeto de petición de Express. Espera el `id` numérico en `req.params`.
 * @param res - Objeto de respuesta de Express. Retorna el objeto del libro eliminado en formato `BookResponseDTO` con estado 200 OK.
 * @param next - Función de Express para delegar errores.
 * 
 * @returns Promesa que resuelve enviando la entidad del libro eliminado.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si la petición carece de usuario autenticado.
 * @throws {AppError} Retorna `404 Not Found` si el libro no existe.
 * @throws {AppError} Retorna `403 Forbidden` si el usuario solicitante no es el dueño ni un ADMIN.
 * 
 * @example
 * ```typescript
 * // DELETE /books/42
 * router.delete('/books/:id', restrictTo('USER', 'ADMIN'), deleteBookCtrl);
 * ```
 */
const deleteBookCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as unknown as { id: number };

    const deleteBook = await deleteBookSvc(id, req.user);

    return res.status(200).json(deleteBook);
  } catch (e) {
    console.log(`Error al eliminar el libro: ${e}`);
    return next(e);
  }
}

const getMyBooksCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query as unknown as BooksPaginationQuery;

    const books = await myBooksSvc(filters, req.user);

    return res.status(200).json(books);
  } catch (e) {
    console.log(`Error al obtener mis libros: ${e}`);
    return next(e);
  }
}

export {
  createBookCtrl,
  deleteBookCtrl,
  getBookByIdCtrl,
  getBooksCtrl,
  updateBookCtrl,
  getMyBooksCtrl
};
