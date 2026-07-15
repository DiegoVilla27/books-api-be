import { format } from "date-fns";
import type { UserModel } from "../model";
import type { UserResponseDTO } from "./response";

/**
 * Tipo que representa el modelo de usuario de base de datos (`UserModel`)
 * enriquecido opcionalmente con el contador de relaciones calculado por Prisma (`_count`).
 */
type UserBooks = UserModel & {
  _count?: {
    books: number;
  };
};

/**
 * Mapeador para transformar una instancia del usuario de base de datos (`UserBooks`)
 * en el DTO formateado final de salida de la API (`UserResponseDTO`).
 * Oculte datos confidenciales y traduce el contador de base de datos `_count.books` al campo limpio `quantityBooks`.
 * Formatea marcas de tiempo a cadenas del patrón `"dd/MM/yyyy"`.
 * 
 * @param user - Objeto que representa el registro de base de datos.
 * @returns El DTO seguro e inmutable resultante (`UserResponseDTO`).
 */
export const toUserResponseDTO = (user: UserBooks): UserResponseDTO => ({
  id: user.id,
  name: user.name,
  lastname: user.lastname,
  email: user.email,
  age: user.age,
  role: user.role,
  isActive: user.isActive,
  quantityBooks: user._count?.books ?? 0,
  createdAt: format(user.createdAt, 'dd/MM/yyyy'),
  updatedAt: user.updatedAt ? format(user.updatedAt, 'dd/MM/yyyy') : null,
})

/**
 * Mapea una colección (array) de usuarios de base de datos a sus DTOs correspondientes.
 * 
 * @param users - Array de registros `UserBooks`.
 * @returns Array de DTOs `UserResponseDTO`.
 */
export const toUserResponseDTOs = (users: UserBooks[]): UserResponseDTO[] => 
  users.map((user) => toUserResponseDTO(user));