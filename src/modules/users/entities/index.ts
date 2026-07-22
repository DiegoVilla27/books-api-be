import { type PaginationQuery } from "@core/types/pagination";

/**
 * Define los roles de usuario soportados en el sistema para el Control de Acceso Basado en Roles (RBAC).
 * - `ADMIN`: Acceso total de gestión sobre usuarios y libros.
 * - `USER`: Acceso restringido a sus propios recursos y lecturas autorizadas.
 */
type RoleUser = 'ADMIN' | 'USER';

/**
 * Interfaz para los parámetros de consulta paginada del recurso Usuarios (`GET /users`).
 * Extiende {@link PaginationQuery} agregando filtros específicos por rol y estado.
 */
interface UsersPaginationQuery extends PaginationQuery {
  /** Rol por el cual filtrar el listado de usuarios */
  role?: RoleUser;
  /** Estado de activación del usuario (true = activo, false = inactivo) */
  isActive?: boolean;
}

/**
 * Entidad de dominio que representa a un Usuario en la base de datos y modelo del sistema.
 */
interface UserEntity {
  /** Identificador único autonumérico del usuario */
  id: number;
  /** Nombre o nombres del usuario */
  name: string;
  /** Apellidos del usuario */
  lastname: string;
  /** Dirección de correo electrónico única */
  email: string;
  /** Hash bcrypt de la contraseña del usuario */
  password: string;
  /** Edad del usuario en años (debe ser mayor o igual a 18) */
  age: number;
  /** Rol de permisos asignado ({@link RoleUser}) */
  role: RoleUser;
  /** Flag de activación de la cuenta (inhabilitación lógica) */
  isActive: boolean;
  /** Cantidad de libros registrados bajo la autoría de este usuario */
  quantityBooks?: number;
  /** Fecha de registro en formato ISO 8601 */
  createdAt: string;
  /** Fecha de la última actualización en formato ISO 8601, o `null` si no ha sido modificado */
  updatedAt: string | null;
}

export {
  type RoleUser,
  type UserEntity,
  type UsersPaginationQuery
};
