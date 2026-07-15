import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { GetQuerySchema } from "@core/types/pagination";
import { createBookCtrl, deleteBookCtrl, getBookByIdCtrl, getBooksCtrl, updateBookCtrl } from "@modules/books/controllers";
import { BookByIdSchema, CreateBookSchema, UpdateBookSchema } from "@modules/books/schemas";
import { Router } from "express";

/**
 * Enrutador de Express encargado de exponer los endpoints CRUD del recurso Libros.
 * Aplica middlewares de validación Zod para proteger cada ruta garantizando la integridad de los parámetros,
 * query strings y cuerpos de petición.
 */
const bookRoutes = Router();

// Endpoint para el listado paginado de libros
bookRoutes.get('/books', validateDataMiddleware(GetQuerySchema), getBooksCtrl);

// Endpoint para obtener el detalle de un libro por ID
bookRoutes.get('/books/:id', validateDataMiddleware(BookByIdSchema), getBookByIdCtrl);

// Endpoint para registrar un nuevo libro
bookRoutes.post('/books', validateDataMiddleware(CreateBookSchema), createBookCtrl);

// Endpoint para actualizar parcialmente un libro por ID (valida ID en URL y campos parciales en el body)
bookRoutes.patch('/books/:id', [
  validateDataMiddleware(BookByIdSchema),
  validateDataMiddleware(UpdateBookSchema)
], updateBookCtrl);

// Endpoint para eliminar físicamente un libro por ID
bookRoutes.delete('/books/:id', validateDataMiddleware(BookByIdSchema), deleteBookCtrl);

export default bookRoutes;