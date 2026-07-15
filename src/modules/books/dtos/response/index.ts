import type { BookEntity } from "@modules/books/entities";

/**
 * DTO que define la estructura de salida de los Libros en las respuestas JSON de la API.
 * Omite el campo de clave foránea física `userId`, ya que en su lugar se entrega el objeto
 * anidado `user` con la información del propietario.
 */
export type BookResponseDTO = Omit<BookEntity, "userId">;
