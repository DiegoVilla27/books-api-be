import { format } from "date-fns";
import type { BookModel } from "../models";
import type { BookResponseDTO } from "../dtos/response";

/**
 * Tipo interno para representar un objeto de libro de base de datos (`BookModel`)
 * enriquecido con la información opcional de relación del propietario (`user`).
 */
type BookUser = BookModel & {
  user?: {
    id: number;
    name: string;
    lastname: string;
  };
};

/**
 * Mapeador que transforma un objeto de libro de base de datos (`BookUser`)
 * a su correspondiente DTO de salida (`BookResponseDTO`) limpio y formateado.
 * Formatea las marcas de tiempo a cadenas de texto con patrón `"dd/MM/yyyy"`.
 * 
 * @param book - Objeto de entrada con tipo `BookUser`.
 * @returns El DTO formateado listo para la API (`BookResponseDTO`).
 */
export const toBookResponseDTO = (book: BookUser): BookResponseDTO => ({
  id: book.id,
  title: book.title,
  author: book.author,
  user: {
    id: book.user ? book.user.id : 0,
    name: book.user ? book.user.name : '',
    lastname: book.user ? book.user.lastname : '',
  },
  createdAt: format(book.createdAt, 'dd/MM/yyyy'),
  updatedAt: book.updatedAt ? format(book.updatedAt, 'dd/MM/yyyy') : null,
})

/**
 * Mapeador secundario para transformar colecciones (arrays) de libros de base de datos
 * a colecciones limpias de DTOs.
 * 
 * @param books - Array de objetos `BookUser`.
 * @returns Array de objetos `BookResponseDTO`.
 */
export const toBookResponseDTOs = (books: BookUser[]): BookResponseDTO[] =>
  books.map((book) => toBookResponseDTO(book));