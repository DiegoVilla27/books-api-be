import { cacheRedis } from "@core/middlewares/cacheRedis";
import { optionalAuth } from "@core/middlewares/optionalAuth";
import { restrictTo } from "@core/middlewares/restrictTo";
import validateDataMiddleware from "@core/middlewares/validateDataZod";
import {
  createBookCtrl,
  deleteBookCtrl,
  getBookByIdCtrl,
  getBooksCtrl,
  getMyBooksCtrl,
  updateBookCtrl
} from "@modules/books/controllers";
import {
  BookByIdSchema,
  CreateBookSchema,
  GetBooksQuerySchema,
  UpdateBookSchema
} from "@modules/books/schemas";
import { Router } from "express";

const ENTITY_BASE = '/books';

/**
 * Enrutador de Express encargado de exponer las rutas REST del recurso Libros (`/books`).
 * Integra middleware de caché con Redis (`cacheRedis`), validación de esquemas Zod (`validateDataMiddleware`),
 * autenticación opcional (`optionalAuth`) y control de acceso basado en roles (`restrictTo`).
 *
 * @remarks
 * Endpoints expuestos:
 * - `GET /books` – Listado paginado público de libros (con caché Redis).
 * - `GET /books/my-books` – Libros del usuario autenticado (con caché Redis).
 * - `GET /books/:id` – Detalle de un libro por ID (con caché Redis).
 * - `POST /books` – Registra un nuevo libro.
 * - `PATCH /books/:id` – Actualización parcial de un libro.
 * - `DELETE /books/:id` – Eliminación de un libro.
 *
 * @see {@link cacheRedis}
 * @see {@link restrictTo}
 * @see {@link optionalAuth}
 */
const bookRoutes: Router = Router();

// Endpoint para el listado paginado de libros
bookRoutes.get(ENTITY_BASE, [
  optionalAuth,
  cacheRedis(),
  validateDataMiddleware(GetBooksQuerySchema)
], getBooksCtrl);

bookRoutes.get(`${ENTITY_BASE}/my-books`, [
  restrictTo('USER', 'ADMIN'),
  cacheRedis(),
  validateDataMiddleware(GetBooksQuerySchema)
], getMyBooksCtrl);

// Endpoint para obtener el detalle de un libro por ID
bookRoutes.get(`${ENTITY_BASE}/:id`, [
  optionalAuth,
  cacheRedis(),
  validateDataMiddleware(BookByIdSchema)
], getBookByIdCtrl);

// Endpoint para registrar un nuevo libro (Accesible por USER y ADMIN)
bookRoutes.post(ENTITY_BASE, [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(CreateBookSchema)
], createBookCtrl);

// Endpoint para actualizar parcialmente un libro por ID (Accesible por USER y ADMIN)
bookRoutes.patch(`${ENTITY_BASE}/:id`, [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(BookByIdSchema),
  validateDataMiddleware(UpdateBookSchema)
], updateBookCtrl);

// Endpoint para eliminar físicamente un libro por ID (Accesible por USER y ADMIN)
bookRoutes.delete(`${ENTITY_BASE}/:id`, [
  restrictTo('USER', 'ADMIN'),
  validateDataMiddleware(BookByIdSchema)
], deleteBookCtrl);

export default bookRoutes;