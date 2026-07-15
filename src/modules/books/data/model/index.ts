/**
 * Modelo de persistencia que representa la estructura exacta de la tabla `Book`
 * en la base de datos física de PostgreSQL.
 */
interface BookModel {
  /** Clave primaria única autoincremental de la base de datos */
  id: number;
  /** Título del libro almacenado en columna varchar */
  title: string;
  /** Autor del libro almacenado en columna varchar */
  author: string;
  /** ID del usuario propietario de la clave foránea en la tabla User */
  userId: number;
  /** Marca de tiempo de la creación física del registro */
  createdAt: Date;
  /** Marca de tiempo de la modificación física del registro */
  updatedAt: Date;
  /** Fecha de borrado lógico o null si sigue activo */
  deletedAt: Date | null;
}

export {
  type BookModel
};
