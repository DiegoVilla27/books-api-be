import prisma from "@core/database/postgres";
import AppError from "@core/errors";
import type { IPagination } from "@core/types/pagination";
import { removeDataUndefined } from "@core/utils/removeDataUndefined";
import bcrypt from "bcrypt";
import type { CreateUserRequestDTO, ProfileUserRequestDTO, UpdateUserRequestDTO } from "../dtos/request";
import type { MeResponseDTO, UserResponseDTO } from "../dtos/response";
import type { RoleUser, UsersPaginationQuery } from "../entities";
import { toUserResponseDTO, toUserResponseDTOs } from "../mappers";

/**
 * Servicio para actualizar la información de perfil del usuario actualmente autenticado.
 * 
 * @param payload - DTO con las propiedades opcionales a modificar ({@link ProfileUserRequestDTO}).
 * @param userId - Identificador único del usuario autenticado (extraído de `req.user.id`).
 * @returns Promesa que resuelve al {@link UserResponseDTO} del usuario actualizado.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si no se proporciona `userId` o si el usuario no existe/está inactivo.
 * 
 * @example
 * ```typescript
 * const updated = await profileSvc({ name: 'Jane' }, 1);
 * ```
 */
const profileSvc = async (
  payload: ProfileUserRequestDTO,
  userId?: number,
): Promise<UserResponseDTO> => {
  if (!userId) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const userExists = await prisma.user.findUnique({ where: { id: userId } });

  if (!userExists || !userExists.isActive) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: removeDataUndefined(payload),
    include: { _count: { select: { books: true } } }
  });

  return toUserResponseDTO(updatedUser);
}

/**
 * Servicio para resolver los datos de identidad pública del usuario actual (`GET /users/me`).
 * Valida la existencia y el estado activo del registro en la base de datos PostgreSQL.
 * 
 * @param userId - Identificador único del usuario autenticado.
 * @returns Promesa que resuelve a un objeto de respuesta {@link MeResponseDTO}.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si la sesión no es válida, o el usuario fue eliminado/inhabilitado.
 * 
 * @example
 * ```typescript
 * const me = await getMeSvc(1);
 * ```
 */
const getMeSvc = async (userId?: number): Promise<MeResponseDTO> => {
  if (!userId) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isActive) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  return {
    id: user.id,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    role: user.role
  };
}

/**
 * Servicio para obtener un listado resumido de usuarios (lookup) para selectores en clientes.
 * Filtra los usuarios con rol `'ADMIN'` si el solicitante no posee el rol `'ADMIN'`.
 * 
 * @param userRole - Rol del usuario autenticado que realiza la solicitud.
 * @returns Promesa que resuelve a un arreglo de objetos conteniendo `id`, `name` y `lastname`.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si no se puede determinar el rol del usuario.
 * 
 * @example
 * ```typescript
 * const lookupList = await getUsersLookupSvc('ADMIN');
 * ```
 */
const getUsersLookupSvc = async (
  userRole?: RoleUser
): Promise<Pick<UserResponseDTO, 'id' | 'name' | 'lastname'>[]> => {
  if (!userRole) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const isAdmin = userRole === 'ADMIN';

  return await prisma.user.findMany({
    where: isAdmin ? {} : { role: { not: 'ADMIN' } },
    select: {
      id: true,
      name: true,
      lastname: true
    },
    orderBy: {
      name: 'asc'
    }
  });
}

/**
 * Servicio para obtener una lista paginada de todos los usuarios registrados.
 * Aplica reglas de filtrado transaccional en Prisma por búsqueda, rol y estado activo.
 * 
 * @param filters - Objeto con los parámetros de paginación y filtros ({@link UsersPaginationQuery}).
 * @returns Promesa que resuelve a un objeto paginado `IPagination<UserResponseDTO>`.
 * 
 * @example
 * ```typescript
 * const users = await getAllUsersSvc({ page: 1, limit: 10, role: 'USER', isActive: true });
 * ```
 */
const getAllUsersSvc = async (
  filters: UsersPaginationQuery
): Promise<IPagination<UserResponseDTO>> => {
  const { page, limit, search, role, isActive } = filters;

  const skip = (page - 1) * limit;

  // Creamos un array vacío de condiciones que Prisma unirá con un AND
  const conditions: any[] = [];

  // 2. Filtro de búsqueda (solo si llega y no está vacío)
  if (search && search.trim() !== '') {
    conditions.push({
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { lastname: { contains: search, mode: 'insensitive' as const } },
      ]
    });
  }

  // 3. Filtro por Rol específico (solo si llega)
  if (role) {
    conditions.push({ role });
  }

  // 4. Filtro por Estado Activo (solo si es explícitamente true o false)
  // Evaluamos con !== undefined porque si es false, un "if (isActive)" lo ignoraría
  if (isActive !== undefined) {
    conditions.push({ isActive });
  }

  // 5. Construimos el whereClause final.
  // Si hay condiciones, las unimos con AND. Si el array está vacío, mandamos un objeto vacío {} 
  // para que Prisma entienda que debe traer todos los registros sin restricciones adicionales.
  const whereClause = conditions.length > 0 ? { AND: conditions } : {};

  const [users, totalItems] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' },
      where: whereClause, // <-- Aplicamos la cláusula combinada
      include: { _count: { select: { books: true } } },
    }),
    prisma.user.count({ where: whereClause }) // <-- El contador también debe filtrar para que cuadre la paginación
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
 * Carga el recuento de libros asociados y valida que un usuario normal solo consulte su propio perfil.
 * 
 * @param id - Identificador único del usuario a consultar.
 * @param userAuth - Objeto con el id y rol del usuario autenticado.
 * @returns Promesa que resuelve a un {@link UserResponseDTO}.
 * 
 * @throws {AppError} Retorna `401 Unauthorized` si no existe `userAuth`.
 * @throws {AppError} Retorna `403 Forbidden` si el usuario no es ADMIN ni consulta su propio ID.
 * @throws {AppError} Retorna `404 Not Found` si el usuario no existe.
 * 
 * @example
 * ```typescript
 * const user = await getUserByIdSvc(1, { id: 1, role: 'USER' });
 * ```
 */
const getUserByIdSvc = async (
  id: number,
  userAuth?: Pick<UserResponseDTO, 'id' | 'role'>
): Promise<UserResponseDTO> => {
  if (!userAuth) {
    throw new AppError("No se pudo obtener la información del usuario", 401);
  }

  const isAdmin = userAuth.role === 'ADMIN';
  const isSelf = userAuth.id === id;

  // 🔴 1. Regla de Autorización: Si no es ADMIN ni es él mismo -> 403 Forbidden
  if (!isAdmin && !isSelf) {
    throw new AppError("No tienes permisos para acceder al perfil de este usuario", 403);
  }

  const userFind = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { books: true } } }
  });

  if (!userFind) {
    throw new AppError("Usuario no encontrado", 404);
  }

  return toUserResponseDTO(userFind);
}

/**
 * Servicio para crear y registrar un nuevo usuario en la base de datos.
 * Comprueba que el correo electrónico no esté registrado previamente.
 * Encripta la contraseña utilizando `bcrypt` antes de guardarla.
 * 
 * @param user - DTO con los datos del usuario requeridos en la creación ({@link CreateUserRequestDTO}).
 * @returns Promesa que resuelve a los datos del usuario creado en formato {@link UserResponseDTO}.
 * 
 * @throws {AppError} Retorna `400 Bad Request` si el email del usuario ya está en uso.
 * 
 * @example
 * ```typescript
 * const newUser = await createUserSvc({
 *   name: 'Carlos',
 *   lastname: 'Pérez',
 *   email: 'carlos@example.com',
 *   password: 'secretPassword123',
 *   age: 30,
 *   role: 'USER',
 *   isActive: true
 * });
 * ```
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
 * Realiza una comprobación previa de existencia del usuario y limpia los campos con valor `undefined`.
 * 
 * @param id - Identificador único del usuario a actualizar.
 * @param user - DTO que contiene de manera opcional las propiedades que se desean modificar.
 * @returns Promesa que devuelve la representación del usuario actualizado en {@link UserResponseDTO}.
 * 
 * @throws {AppError} Retorna `404 Not Found` si el ID especificado no pertenece a ningún usuario.
 * 
 * @example
 * ```typescript
 * const updated = await updateUserSvc(1, { name: 'Carlos Mario' });
 * ```
 */
const updateUserSvc = async (id: number, user: UpdateUserRequestDTO): Promise<UserResponseDTO> => {
  // Verificar existencia antes del update para evitar errores de Prisma
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new AppError("Usuario no encontrado", 404);
  }

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
 * @param id - Identificador único del usuario a inhabilitar.
 * @returns Promesa con los datos formateados del usuario inhabilitado ({@link UserResponseDTO}).
 * 
 * @throws {AppError} Retorna `404 Not Found` si el ID especificado no se encuentra.
 * 
 * @example
 * ```typescript
 * const disabled = await deleteUserSvc(1);
 * ```
 */
const deleteUserSvc = async (id: number): Promise<UserResponseDTO> => {
  // Verificar existencia antes del update para evitar errores de Prisma
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const userDeleted = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    include: { _count: { select: { books: true } } }
  });

  return toUserResponseDTO(userDeleted);
}

/**
 * Servicio para verificar si un correo electrónico ya está registrado en la base de datos.
 * 
 * @param email - Correo electrónico a consultar.
 * @returns Promesa que resuelve a `true` si el email existe, y `false` si no existe.
 * 
 * @example
 * ```typescript
 * const isTaken = await checkEmailSvc('test@example.com');
 * ```
 */
const checkEmailSvc = async (email: string): Promise<boolean> => {
  const emailExists = await prisma.user.findUnique({ where: { email } });
  return !!emailExists;
}

export {
  checkEmailSvc,
  createUserSvc,
  deleteUserSvc,
  getAllUsersSvc, getMeSvc, getUserByIdSvc,
  getUsersLookupSvc, profileSvc, updateUserSvc
};

