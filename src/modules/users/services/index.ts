import prisma from "@core/database/postgres";
import AppError from "@core/errors";
import type { IPagination } from "@core/types/pagination";
import { removeDataUndefined } from "@core/utils/removeDataUndefined";
import bcrypt from "bcrypt";
import type { CreateUserRequestDTO, UpdateUserRequestDTO } from "../dtos/request";
import type { UserResponseDTO } from "../dtos/response";
import { toUserResponseDTO, toUserResponseDTOs } from "../mappers";
import type { UsersPaginationQuery } from "../entities";

/**
 * Servicio para obtener un listado resumido e incondicional de todos los usuarios
 * (principalmente para selectores en formularios de creación y edición).
 * 
 * @returns Promesa que resuelve a un arreglo de objetos con id, nombre y apellido.
 */
const getUsersLookupSvc = async (): Promise<Pick<UserResponseDTO, 'id' | 'name' | 'lastname'>[]> => {
  return await prisma.user.findMany({
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
 * Servicio para obtener una lista paginada de todos los usuarios.
 * Aplica reglas de filtrado según el rol del usuario que realiza la consulta.
 * 
 * @param page - Número de página actual.
 * @param limit - Cantidad máxima de registros por página.
 * @param requestingRole - Rol del usuario que realiza la petición ('ADMIN' o 'USER').
 * @returns Promesa que resuelve a un objeto paginado de tipo `UserResponseDTO`.
 */
const getAllUsersSvc = async (
  requestingRole: string,
  filters: UsersPaginationQuery
): Promise<IPagination<UserResponseDTO>> => {
  const { page, limit, search, role, isActive } = filters;

  const skip = (page - 1) * limit;

  // Creamos un array vacío de condiciones que Prisma unirá con un AND
  const conditions: any[] = [];

  // 1. Filtro de seguridad por rol (mismo que ya tenías)
  // Si el que consulta no es ADMIN, lo obligamos a ver solo "USER"
  if (requestingRole !== 'ADMIN') {
    conditions.push({ role: 'USER' as const });
  }

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
 * Carga el recuento de libros asociados y restringe el acceso de usuarios estándar a perfiles administradores.
 * 
 * @param id - Identificador único del usuario a consultar.
 * @param requestingRole - Rol del usuario que realiza la consulta.
 * @returns Promesa que resuelve a un `UserResponseDTO` si el usuario existe y está autorizado, o `null`.
 */
const getUserByIdSvc = async (id: number, requestingRole: string): Promise<UserResponseDTO | null> => {
  const userFind = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { books: true } } }
  });

  if (!userFind) return null;

  // Un USER no puede ver el perfil de un ADMIN aunque adivine el ID
  if (userFind.role === 'ADMIN' && requestingRole !== 'ADMIN') return null;

  return toUserResponseDTO(userFind);
}

/**
 * Servicio para crear y registrar un nuevo usuario en la base de datos.
 * Comprueba que el correo electrónico no esté registrado previamente.
 * Encripta la contraseña utilizando `bcrypt` antes de guardarla.
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
 * Realiza una comprobación previa de existencia del usuario y limpia los campos con valor `undefined`.
 * 
 * @param id - Identificador único del usuario a actualizar.
 * @param user - DTO que contiene de manera opcional las propiedades que se desean modificar.
 * @returns Promesa que devuelve la representación del usuario actualizado en `UserResponseDTO`.
 * @throws {AppError} Si el ID especificado no pertenece a ningún usuario (404).
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
 * @returns Promesa con los datos formateados del usuario inhabilitado (`UserResponseDTO`).
 * @throws {AppError} Si el ID especificado no se encuentra (404).
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

export { getUsersLookupSvc, createUserSvc, deleteUserSvc, getAllUsersSvc, getUserByIdSvc, updateUserSvc };
