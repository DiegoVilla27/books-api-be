import { Router } from "express";
import { createBookCtrl, deleteBookCtrl, getBooksCtrl, getBookByIdCtrl, updateBookCtrl } from "@modules/books/controllers";
import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { CreateBookSchema } from "@modules/books/schemas";

const bookRoutes = Router();

bookRoutes.get('/books', getBooksCtrl);
bookRoutes.get('/books/:id', getBookByIdCtrl);
bookRoutes.post('/books', validateDataMiddleware(CreateBookSchema), createBookCtrl);
bookRoutes.patch('/books/:id', validateDataMiddleware(CreateBookSchema), updateBookCtrl);
bookRoutes.delete('/books/:id', deleteBookCtrl);

export default bookRoutes;