import prisma from "@core/database/postgres";
import AppError from "@core/errors";
import type { IPagination } from "@core/types/pagination";
import { removeDataUndefined } from "@core/utils/removeDataUndefined";
import type { CreateBookRequestDTO, UpdateBookRequestDTO } from "../dtos/request";
import type { BookResponseDTO } from "../dtos/response";
import { toBookResponseDTO, toBookResponseDTOs } from "../mappers";

/**
 * Servicio para obtener una lista paginada de libros.
 * Realiza una consulta paralela mediante una transacción de Prisma para obtener los registros y el conteo total.
 * Incluye la información básica del usuario propietario de cada libro.
 * 
 * @param page - Número de la página a consultar.
 * @param limit - Límite de registros por página.
 * @returns Promesa que resuelve a un objeto paginado conteniendo un listado de `BookResponseDTO`.
 */
const getAllBooksSvc = async (page: number, limit: number): Promise<IPagination<BookResponseDTO>> => {
  const skip = (page - 1) * limit;

  const [books, totalItems] = await prisma.$transaction([
    prisma.book.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' }, // Ordenamos para que la paginación sea consistente
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastname: true,
          }
        }
      }
    }),
    prisma.book.count()
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: toBookResponseDTOs(books),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    },
  };
}

/**
 * Servicio para obtener un libro específico a partir de su identificador único.
 * Carga los datos asociados del usuario propietario.
 * 
 * @param id - Identificador único del libro.
 * @returns Promesa que resuelve al `BookResponseDTO` si el libro es encontrado, o `null` si no existe.
 */
const getBookByIdSvc = async (id: number): Promise<BookResponseDTO | null> => {
  const bookFind = await prisma.book.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
        }
      }
    }
  });

  if (!bookFind) return null;

  return toBookResponseDTO(bookFind);
}

/**
 * Servicio para registrar un nuevo libro en la base de datos.
 * Vincula el libro obligatoriamente al usuario especificado por su id.
 * 
 * @param book - DTO con la información requerida para crear el libro.
 * @returns Promesa que resuelve al `BookResponseDTO` del libro creado.
 */
const createBookSvc = async (book: CreateBookRequestDTO): Promise<BookResponseDTO> => {
  const bookCreated = await prisma.book.create({
    data: book,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
        }
      }
    }
  });

  return toBookResponseDTO(bookCreated);
}

/**
 * Servicio para actualizar parcialmente las propiedades de un libro existente.
 * Valida que el libro exista, y que el usuario solicitante sea el propietario del registro o administrador.
 * Remueve previamente cualquier propiedad `undefined` para evitar fallos de persistencia.
 * 
 * @param id - Identificador único del libro a modificar.
 * @param book - DTO con los campos que se desean actualizar de manera opcional.
 * @param requestingUser - Datos del usuario que realiza la petición (para comprobar autorizaciones).
 * @returns Promesa que devuelve el `BookResponseDTO` del libro actualizado.
 * @throws {AppError} 404 si el libro no existe.
 * @throws {AppError} 403 si el usuario no es el propietario ni un administrador.
 */
const updateBookSvc = async (id: number, book: UpdateBookRequestDTO, requestingUser: { id: number, email: string, role: string }): Promise<BookResponseDTO> => {
  const existingBook = await prisma.book.findUnique({ where: { id } });

  if (!existingBook) {
    throw new AppError("Libro no encontrado", 404);
  }

  if (existingBook.userId !== requestingUser.id && requestingUser.role !== 'ADMIN') {
    throw new AppError("No tienes permisos para modificar este libro", 403); // 403 Forbidden
  }

  const bookClean = removeDataUndefined(book);

  const bookUpdated = await prisma.book.update({
    where: { id },
    data: bookClean,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
        }
      }
    }
  });

  return toBookResponseDTO(bookUpdated);
}

/**
 * Servicio para eliminar físicamente un libro de la base de datos relacional.
 * Valida que el libro exista, y que el usuario solicitante sea el propietario o administrador.
 * 
 * @param id - Identificador único del libro a eliminar.
 * @param requestingUser - Datos del usuario que realiza la petición (para comprobar autorizaciones).
 * @returns Promesa que resuelve a la representación del libro eliminado en formato `BookResponseDTO`.
 * @throws {AppError} 404 si el libro no existe.
 * @throws {AppError} 403 si el usuario no es el propietario ni un administrador.
 */
const deleteBookSvc = async (id: number, requestingUser: { id: number, email: string, role: string }): Promise<BookResponseDTO> => {

  const existingBook = await prisma.book.findUnique({ where: { id } });

  if (!existingBook) {
    throw new AppError("Libro no encontrado", 404);
  }

  if (existingBook.userId !== requestingUser.id && requestingUser.role !== 'ADMIN') {
    throw new AppError("No tienes permisos para eliminar este libro", 403);
  }

  const bookDeleted = await prisma.book.delete({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
        }
      }
    }
  });

  return toBookResponseDTO(bookDeleted);
}

export { createBookSvc, deleteBookSvc, getAllBooksSvc, getBookByIdSvc, updateBookSvc };
