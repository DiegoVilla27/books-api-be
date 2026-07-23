import { cacheRedis } from "@core/middlewares/cacheRedis";
import { httpLogger } from "@core/middlewares/httpLogger";
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
 * autenticación opcional (`optionalAuth`), control de acceso basado en roles (`restrictTo`) y auditoría de eventos HTTP (`httpLogger`).
 *
 * @remarks
 * Endpoints expuestos:
 * - `GET /books` – Listado paginado público de libros (con caché Redis).
 * - `GET /books/my-books` – Libros del usuario autenticado (con caché Redis).
 * - `GET /books/:id` – Detalle de un libro por ID (con caché Redis).
 * - `POST /books` – Registra un nuevo libro (con auditoría httpLogger).
 * - `PATCH /books/:id` – Actualización parcial de un libro (con auditoría httpLogger).
 * - `DELETE /books/:id` – Eliminación de un libro (con auditoría httpLogger).
 *
 * @see {@link cacheRedis}
 * @see {@link httpLogger}
 * @see {@link restrictTo}
 * @see {@link optionalAuth}
 */
const bookRoutes: Router = Router();

// Endpoint para el listado paginado de libros
bookRoutes.get(ENTITY_BASE, [
  validateDataMiddleware(GetBooksQuerySchema),
  optionalAuth,
  cacheRedis()
], getBooksCtrl);

bookRoutes.get(`${ENTITY_BASE}/my-books`, [
  validateDataMiddleware(GetBooksQuerySchema),
  restrictTo('USER', 'ADMIN'),
  cacheRedis()
], getMyBooksCtrl);

// Endpoint para obtener el detalle de un libro por ID
bookRoutes.get(`${ENTITY_BASE}/:id`, [
  validateDataMiddleware(BookByIdSchema),
  optionalAuth,
  cacheRedis()
], getBookByIdCtrl);

// Endpoint para registrar un nuevo libro (Accesible por USER y ADMIN)
bookRoutes.post(ENTITY_BASE, [
  validateDataMiddleware(CreateBookSchema),
  restrictTo('USER', 'ADMIN'),
  httpLogger
], createBookCtrl);

// Endpoint para actualizar parcialmente un libro por ID (Accesible por USER y ADMIN)
bookRoutes.patch(`${ENTITY_BASE}/:id`, [
  validateDataMiddleware(BookByIdSchema),
  validateDataMiddleware(UpdateBookSchema),
  restrictTo('USER', 'ADMIN'),
  httpLogger
], updateBookCtrl);

// Endpoint para eliminar físicamente un libro por ID (Accesible por USER y ADMIN)
bookRoutes.delete(`${ENTITY_BASE}/:id`, [
  validateDataMiddleware(BookByIdSchema),
  restrictTo('USER', 'ADMIN'),
  httpLogger
], deleteBookCtrl);

export default bookRoutes;