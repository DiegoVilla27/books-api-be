import prisma from "@core/database/postgres";
import { type IBook } from "@modules/books/data";

// Obtener todos los libros
const getAllBooksSvc = async (): Promise<IBook[]> => {
  try {
    return await prisma.book.findMany();
  } catch (e) {
    console.log(e);
    return [];
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

