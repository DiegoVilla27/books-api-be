import prisma from "@core/database/postgres";
import type { IPagination } from "@core/types/pagination";
import { type IBook } from "@modules/books/types";

// Obtener todos los libros
const getAllBooksSvc = async (page: number, limit: number): Promise<IPagination<IBook>> => {
  try {
    const skip = (page - 1) * limit;

    const [totalItems, data] = await prisma.$transaction([
      prisma.book.count(),
      prisma.book.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' }, // Ordenamos para que la paginación sea consistente
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };

  } catch (e) {
    console.log(e);
    return { data: [], pagination: { totalItems: 0, totalPages: 0, currentPage: page, limit } };
  }
}

// Obtener un libro por id
const getBookByIdSvc = async (id: number): Promise<IBook | null> => {
  try {
    return await prisma.book.findUnique({ where: { id } });
  } catch (e) {
    console.log(e);
    return null;
  }
}

// Crear un libro
const createBookSvc = async (book: Omit<IBook, 'id'>): Promise<IBook | null> => {
  try {
    return await prisma.book.create({
      data: { ...book }
    });
  } catch (e) {
    console.log(e);
    return null;
  }
}

// Actualizar un libro
const updateBookSvc = async (id: number, book: Omit<IBook, 'id'>): Promise<IBook | null> => {
  try {
    return await prisma.book.update({
      where: { id },
      data: { ...book }
    });
  } catch (e) {
    console.log(e);
    return null;
  }
}

// Eliminar un libro
const deleteBookSvc = async (id: number): Promise<IBook | null> => {
  try {
    return await prisma.book.delete({ where: { id } });
  } catch (e) {
    console.log(e);
    return null;
  }
}

export { createBookSvc, deleteBookSvc, getAllBooksSvc, getBookByIdSvc, updateBookSvc };

