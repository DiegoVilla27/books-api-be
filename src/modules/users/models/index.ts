/**
 * Modelo de persistencia que representa de forma directa la tabla `User`
 * en la base de datos de PostgreSQL administrada por Prisma.
 */
interface UserModel {
  /** Clave primaria incremental */
  id: number;
  /** Columna varchar de nombre */
  name: string;
  /** Columna varchar de apellido */
  lastname: string;
  /** Columna de correo electrónico con restricción unique */
  email: string;
  /** Contraseña almacenada (hash de bcrypt) */
  password: string;
  /** Columna de edad (entero) */
  age: number;
  /** Rol mapeado como Enum de Postgres */
  role: 'USER' | 'ADMIN';
  /** Flag que controla la activación o bloqueo lógico de la cuenta */
  isActive: boolean;
  /** Marca de tiempo de registro */
  createdAt: Date;
  /** Marca de tiempo de actualización */
  updatedAt: Date;
  /** Fecha de inhabilitación lógica o null si sigue activo */
  deletedAt: Date | null;
}

export {
  type UserModel
};
