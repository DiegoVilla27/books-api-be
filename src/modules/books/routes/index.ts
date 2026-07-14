import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { GetQuerySchema } from "@core/utils/pagination";
import { createBookCtrl, deleteBookCtrl, getBookByIdCtrl, getBooksCtrl, updateBookCtrl } from "@modules/books/controllers";
import { BookByIdSchema, CreateBookSchema, UpdateBookSchema } from "@modules/books/schemas";
import { Router } from "express";

const bookRoutes = Router();

bookRoutes.get('/books', validateDataMiddleware(GetQuerySchema), getBooksCtrl);
bookRoutes.get('/books/:id', validateDataMiddleware(BookByIdSchema), getBookByIdCtrl);
bookRoutes.post('/books', validateDataMiddleware(CreateBookSchema), createBookCtrl);
bookRoutes.patch('/books/:id', [
  validateDataMiddleware(BookByIdSchema),
  validateDataMiddleware(UpdateBookSchema)
], updateBookCtrl);
bookRoutes.delete('/books/:id', validateDataMiddleware(BookByIdSchema), deleteBookCtrl);

export default bookRoutes;