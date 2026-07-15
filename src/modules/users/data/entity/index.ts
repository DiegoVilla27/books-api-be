/**
 * Entidad de dominio que representa a un Usuario.
 * Define la estructura y reglas de negocio del Usuario en la aplicación.
 */
interface UserEntity {
  /** Identificador único del usuario */
  id: number;
  /** Nombre del usuario */
  name: string;
  /** Apellidos del usuario */
  lastname: string;
  /** Dirección de correo electrónico única */
  email: string;
  /** Contraseña del usuario (habitualmente encriptada) */
  password: string;
  /** Edad del usuario */
  age: number;
  /** Rol o perfil de acceso asignado */
  role: 'USER' | 'ADMIN';
  /** Estado de activación de la cuenta (inhabilitación lógica) */
  isActive: boolean;
  /** Cantidad de libros registrados bajo este usuario */
  quantityBooks?: number;
  /** Fecha de creación en formato de cadena legible */
  createdAt: string;
  /** Fecha de última modificación o null */
  updatedAt: string | null;
}

export {
  type UserEntity
};
