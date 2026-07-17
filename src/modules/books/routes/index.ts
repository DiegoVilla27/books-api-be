import { restrictTo } from "@core/middlewares/restrictTo";
import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { createBookCtrl, deleteBookCtrl, getBookByIdCtrl, getBooksCtrl, updateBookCtrl } from "@modules/books/controllers";
import { BookByIdSchema, CreateBookSchema, GetBooksQuerySchema, UpdateBookSchema } from "@modules/books/schemas";
import { Router } from "express";

/**
 * Enrutador de Express encargado de exponer los endpoints CRUD del recurso Libros.
 * Aplica validaciones con esquemas de Zod e integra control de acceso basado
 * en roles (RBAC) con el middleware unificado `restrictTo`.
 */
const bookRoutes = Router();

// Endpoint para el listado paginado de libros (Accesible por USER y ADMIN)
bookRoutes.get('/books', [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(GetBooksQuerySchema)
], getBooksCtrl);

// Endpoint para obtener el detalle de un libro por ID (Accesible por USER y ADMIN)
bookRoutes.get('/books/:id', [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(BookByIdSchema)
], getBookByIdCtrl);

// Endpoint para registrar un nuevo libro (Accesible por USER y ADMIN)
bookRoutes.post('/books', [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(CreateBookSchema)
], createBookCtrl);

// Endpoint para actualizar parcialmente un libro por ID (Accesible por USER y ADMIN)
bookRoutes.patch('/books/:id', [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(BookByIdSchema),
  validateDataMiddleware(UpdateBookSchema)
], updateBookCtrl);

// Endpoint para eliminar físicamente un libro por ID (Accesible por USER y ADMIN)
bookRoutes.delete('/books/:id', [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(BookByIdSchema)
], deleteBookCtrl);

export default bookRoutes;