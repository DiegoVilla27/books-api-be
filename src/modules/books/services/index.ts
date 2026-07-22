import prisma from "@core/databases/postgres";
import AppError from "@core/errors";
import type { IPagination } from "@core/types/pagination";
import { removeDataUndefined } from "@core/utils/removeDataUndefined";
import type { UserResponseDTO } from "@modules/users/dtos/response";
import type { RoleUser } from "@modules/users/entities";
import type { CreateBookRequestDTO, UpdateBookRequestDTO } from "../dtos/request";
import type { BookResponseDTO } from "../dtos/response";
import type { BooksPaginationQuery } from "../entities";
import { toBookResponseDTO, toBookResponseDTOs } from "../mappers";

/**
 * Servicio para obtener una lista paginada de libros.
 * Realiza una consulta paralela mediante una transacción de Prisma para obtener los registros y el conteo total.
 * Incluye la información básica del usuario propietario de cada libro.
 * 
 * @param filters - Filtros de paginación y búsqueda ({@link BooksPaginationQuery}).
 * @param userRole - Rol del usuario que realiza la consulta (opcional). Si no es `'ADMIN'`, filtra libros creados por usuarios administradores.
 * @returns Promesa que resuelve a un objeto paginado conteniendo un listado de `BookResponseDTO`.
 * 
 * @remarks
 * Los usuarios no administradores no pueden visualizar libros creados por cuentas con rol `'ADMIN'`.
 * 
 * @example
 * ```typescript
 * const result = await getAllBooksSvc({ page: 1, limit: 10, search: 'Architecture' }, 'USER');
 * ```
 */
const getAllBooksSvc = async (
  filters: BooksPaginationQuery,
  userRole?: RoleUser
): Promise<IPagination<BookResponseDTO>> => {
  const { page, limit, search, userId } = filters;

  const skip = (page - 1) * limit;

  // Creamos un array vacío de condiciones que Prisma unirá con un AND
  const conditions: any[] = [];

  if (userRole !== 'ADMIN') {
    // Si NO es admin, excluimos cualquier libro que pertenezca a un usuario con rol ADMIN
    conditions.push({
      user: {
        role: {
          not: 'ADMIN',
        },
      },
    });
  }

  // 1. Filtro de búsqueda (solo si llega y no está vacío)
  if (search && search.trim() !== '') {
    conditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { author: { contains: search, mode: 'insensitive' as const } }
      ]
    });
  }

  // 2. Filtro por userId (solo si llega en los filtros)
  // Útil para vistas como "Mis Libros" o "Libros de un usuario específico"
  if (userId) {
    conditions.push({
      userId: userId
    });
  }

  // 3. Montamos la cláusula final condicionalmente
  const whereClause = conditions.length > 0 ? { AND: conditions } : {};

  const [books, totalItems] = await prisma.$transaction([
    prisma.book.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' }, // Ordenamos para que la paginación sea consistente
      where: whereClause, // <-- Aplicamos la cláusula combinada
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
    prisma.book.count({ where: whereClause }) // <-- El contador también debe filtrar
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
 * @param userRole - Rol del usuario autenticado que realiza la solicitud.
 * @returns Promesa que resuelve al `BookResponseDTO` con los datos del libro.
 * 
 * @throws {AppError} Retorna `404 Not Found` si el libro no existe o si pertenece a un ADMIN y el solicitante no es ADMIN.
 * 
 * @example
 * ```typescript
 * const book = await getBookByIdSvc(15, 'ADMIN');
 * ```
 */
const getBookByIdSvc = async (id: number, userRole?: RoleUser): Promise<BookResponseDTO> => {
  const bookFind = await prisma.book.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
          role: true,
        }
      }
    }
  });

  if (!bookFind) {
    throw new AppError("Libro no encontrado", 404);
  }

  // Regla de visibilidad: Si quien consulta NO es ADMIN y el libro pertenece a un ADMIN -> 404
  const isOwnerAdmin = bookFind.user.role === 'ADMIN';
  const isRequestingUserAdmin = userRole === 'ADMIN';

  if (!isRequestingUserAdmin && isOwnerAdmin) {
    throw new AppError("Libro no encontrado", 404);
  }

  return toBookResponseDTO(bookFind);
}

/**
 * Servicio para registrar un nuevo libro en la base de datos.
 * Vincula el libro obligatoriamente al usuario especificado por su `userId`.
 * 
 * @param book - DTO con la información requerida para crear el libro ({@link CreateBookRequestDTO}).
 * @returns Promesa que resuelve al `BookResponseDTO` del libro creado.
 * 
 * @example
 * ```typescript
 * const newBook = await createBookSvc({
 *   title: 'Design Patterns',
 *   author: 'Erich Gamma',
 *   userId: 1
 * });
 * ```
 */
const createBookSvc = async (
  book: CreateBookRequestDTO,
  userAuth?: Pick<UserResponseDTO, "id" | "role">
): Promise<BookResponseDTO> => {

  if (!userAuth) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const isAdmin = userAuth.role === 'ADMIN';
  const targetUserId = (isAdmin && book.userId) ? book.userId : userAuth.id;

  const bookCreated = await prisma.book.create({
    data: { ...book, userId: targetUserId },
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
 * @param userAuth - Datos del usuario que realiza la petición (para comprobar autorizaciones).
 * @returns Promesa que devuelve el `BookResponseDTO` del libro actualizado.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si no hay usuario autenticado.
 * @throws {AppError} Retorna `404 Not Found` si el libro no existe.
 * @throws {AppError} Retorna `403 Forbidden` si el usuario no es el propietario ni un administrador.
 * 
 * @example
 * ```typescript
 * const updated = await updateBookSvc(5, { title: 'Refactoring 2nd Ed' }, { id: 1, role: 'USER' });
 * ```
 */
const updateBookSvc = async (
  id: number,
  book: UpdateBookRequestDTO,
  userAuth?: Pick<UserResponseDTO, "id" | "role">
): Promise<BookResponseDTO> => {

  if (!userAuth) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const existingBook = await prisma.book.findUnique({ where: { id } });

  if (!existingBook) {
    throw new AppError("Libro no encontrado", 404);
  }

  // Control de Acceso: Debe ser el dueño del libro O ser un ADMIN
  const isOwner = existingBook.userId === userAuth.id;
  const isAdmin = userAuth.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new AppError("No tienes permisos para modificar este libro", 403);
  }

  const bookClean = removeDataUndefined(book);

  // Regla de negocio para el dueño (userId):
  if (isAdmin && bookClean.userId) {
    // El ADMIN decide cambiar el dueño del libro por el userId enviado en el body
    bookClean.userId = bookClean.userId;
  } else {
    // Si es USER (o ADMIN sin especificar userId nuevo), el libro pertenece al dueño actual/solicitante
    bookClean.userId = existingBook.userId;
  }

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
 * @param userAuth - Datos del usuario que realiza la petición (para comprobar autorizaciones).
 * @returns Promesa que resuelve a la representación del libro eliminado en formato `BookResponseDTO`.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si no hay usuario autenticado.
 * @throws {AppError} Retorna `404 Not Found` si el libro no existe.
 * @throws {AppError} Retorna `403 Forbidden` si el usuario no es el propietario ni un administrador.
 * 
 * @example
 * ```typescript
 * const deleted = await deleteBookSvc(5, { id: 1, role: 'ADMIN' });
 * ```
 */
const deleteBookSvc = async (
  id: number,
  userAuth?: Pick<UserResponseDTO, "id" | "role">
): Promise<BookResponseDTO> => {

  if (!userAuth) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const existingBook = await prisma.book.findUnique({ where: { id } });

  if (!existingBook) {
    throw new AppError("Libro no encontrado", 404);
  }

  if (existingBook.userId !== userAuth.id && userAuth.role !== 'ADMIN') {
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

const myBooksSvc = (
  filters: BooksPaginationQuery,
  userAuth?: Pick<UserResponseDTO, "id" | "role">
): Promise<IPagination<BookResponseDTO>> => {

  if (!userAuth) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  return getAllBooksSvc({ ...filters, userId: userAuth.id }, userAuth.role);
}

export {
  createBookSvc,
  deleteBookSvc,
  getAllBooksSvc,
  getBookByIdSvc, myBooksSvc, updateBookSvc
};

