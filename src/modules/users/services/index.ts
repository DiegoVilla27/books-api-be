import prisma from "@core/database/postgres";
import type { IPagination } from "@core/types/pagination";
import { removeDataUndefined } from "@core/utils/removeDataUndefined";
import { toUserResponseDTO, toUserResponseDTOs } from "../mappers";
import type { CreateUserRequestDTO, UpdateUserRequestDTO } from "../dtos/request";
import type { UserResponseDTO } from "../dtos/response";
import AppError from "@core/errors";
import bcrypt from "bcrypt";

/**
 * Servicio para obtener una lista paginada de todos los usuarios.
 * Realiza una consulta paralela en una transacción de Prisma. Incluye el recuento
 * de libros creados por cada usuario (`_count`).
 * 
 * @param page - Número de página.
 * @param limit - Cantidad máxima de registros por página.
 * @returns Promesa que resuelve a un objeto paginado de tipo `UserResponseDTO`.
 */
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

/**
 * Servicio para obtener un usuario específico por su ID único.
 * Carga el recuento de libros asociados al usuario.
 * 
 * @param id - Identificador del usuario.
 * @returns Promesa que resuelve a un `UserResponseDTO` si el usuario existe, o `null` si no se encuentra.
 */
const getUserByIdSvc = async (id: number): Promise<UserResponseDTO | null> => {
  const userFind = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { books: true } } }
  });

  if (!userFind) return null;

  return toUserResponseDTO(userFind);
}

/**
 * Servicio para crear y registrar un nuevo usuario en la base de datos.
 * Comprueba que el correo electrónico no esté registrado previamente.
 * Encripta la contraseña de forma asíncrona utilizando `bcrypt` antes de guardarla.
 * 
 * @param user - DTO con los datos del usuario requeridos en la creación.
 * @returns Promesa que resuelve a los datos del usuario creado en formato `UserResponseDTO`.
 * @throws {AppError} Lanza un error 400 si el email del usuario ya está en uso.
 */
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

/**
 * Servicio para actualizar parcialmente la información de un usuario existente.
 * Limpia campos con valor `undefined` antes de ejecutar el update.
 * 
 * @param id - Identificador único del usuario a actualizar.
 * @param user - DTO que contiene de manera opcional las propiedades que se desean modificar.
 * @returns Promesa que resuelve a la representación del usuario actualizado en `UserResponseDTO`.
 * @throws {PrismaClientKnownRequestError} Si el ID especificado no pertenece a ningún usuario.
 */
const updateUserSvc = async (id: number, user: UpdateUserRequestDTO): Promise<UserResponseDTO> => {
  const userClean = removeDataUndefined(user);
  const userUpdated = await prisma.user.update({
    where: { id },
    data: userClean,
    include: { _count: { select: { books: true } } }
  });

  return toUserResponseDTO(userUpdated);
}

/**
 * Servicio para inhabilitar lógicamente a un usuario en el sistema.
 * Establece el atributo `isActive` a `false`.
 * 
 * @param id - Identificador del usuario a inhabilitar.
 * @returns Promesa con los datos formateados del usuario inhabilitado (`UserResponseDTO`).
 * @throws {PrismaClientKnownRequestError} Si el ID especificado no se encuentra.
 */
const deleteUserSvc = async (id: number): Promise<UserResponseDTO> => {
  const userDeleted = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    include: { _count: { select: { books: true } } }
  });

  return toUserResponseDTO(userDeleted);
}

export { createUserSvc, deleteUserSvc, getAllUsersSvc, getUserByIdSvc, updateUserSvc };
