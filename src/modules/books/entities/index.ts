import type { PaginationQuery } from "@core/types/pagination";
import type { UserEntity } from "@modules/users/entities";

interface BooksPaginationQuery extends PaginationQuery {
  userId?: number;
}

/**
 * Entidad de dominio que representa un Libro.
 * Contiene la lógica, estructura y relaciones del negocio del recurso Libro.
 */
interface BookEntity {
  /** Identificador único del libro */
  id: number;
  /** Título descriptivo del libro */
  title: string;
  /** Nombre del autor del libro */
  author: string;
  /** Clave foránea del usuario propietario del libro */
  userId: number;
  /** Datos mínimos obligatorios del usuario propietario */
  user: Pick<UserEntity, "id" | "name" | "lastname">;
  /** Fecha de creación en formato string legible (dd/MM/yyyy) */
  createdAt: string;
  /** Fecha de última actualización o null en caso de no haber sido modificado */
  updatedAt: string | null;
}

export {
  type BookEntity,
  type BooksPaginationQuery
};
