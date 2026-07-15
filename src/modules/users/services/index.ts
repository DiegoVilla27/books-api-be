import prisma from "@core/database/postgres";
import type { IPagination } from "@core/types/pagination";
import { removeDataUndefined } from "@core/utils/removeDataUndefined";
import { toUserResponseDTO, toUserResponseDTOs } from "../data/dtos/mapper";
import type { CreateUserRequestDTO, UpdateUserRequestDTO } from "../data/dtos/request";
import type { UserResponseDTO } from "../data/dtos/response";
import AppError from "@core/errors";
import bcrypt from "bcrypt";

// Obtener todos los usuarios
const getAllUsersSvc = async (page: number, limit: number): Promise<IPagination<UserResponseDTO>> => {
  const skip = (page - 1) * limit;

  const [users, totalItems] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' }, // Ordenamos para que la paginación sea consistente
      include: { _count: { select: { books: true } } }
    }),
    prisma.user.count()
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: toUserResponseDTOs(users),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    },
  };
}

// Obtener un usuario por id
const getUserByIdSvc = async (id: number): Promise<UserResponseDTO | null> => {
  const userFind = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { books: true } } }
  });

  if (!userFind) return null;

  return toUserResponseDTO(userFind);
}

// Crear un usuario
const createUserSvc = async (user: CreateUserRequestDTO): Promise<UserResponseDTO> => {
  const emailExists = await prisma.user.findUnique({ where: { email: user.email } });
  if (emailExists) {
    throw new AppError("El correo electrónico ya está registrado", 400);
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const userCreated = await prisma.user.create({
    data: { ...user, password: hashedPassword },
    include: { _count: { select: { books: true } } }
  });

  return toUserResponseDTO(userCreated);
}

// Actualizar un usuario
const updateUserSvc = async (id: number, user: UpdateUserRequestDTO): Promise<UserResponseDTO> => {
  const userClean = removeDataUndefined(user);
  const userUpdated = await prisma.user.update({
    where: { id },
    data: userClean,
    include: { _count: { select: { books: true } } }
  });

  return toUserResponseDTO(userUpdated);
}

// Eliminar un usuario
const deleteUserSvc = async (id: number): Promise<UserResponseDTO> => {
  const userDeleted = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    include: { _count: { select: { books: true } } }
  });

  return toUserResponseDTO(userDeleted);
}

export { createUserSvc, deleteUserSvc, getAllUsersSvc, getUserByIdSvc, updateUserSvc };
