import { type UserEntity } from '../../entities';

/**
 * Objeto de transferencia de datos (DTO) que representa el perfil del usuario actualmente autenticado (`GET /users/me`).
 * Contiene únicamente las propiedades públicas necesarias para la inicialización y contexto del cliente.
 */
export type MeResponseDTO = Pick<UserEntity, 'id' | 'name' | 'lastname' | 'email' | 'role'>;

/**
 * Objeto de transferencia de datos (DTO) que define la representación pública de la entidad {@link UserEntity}.
 * Filtra y omite atributos confidenciales (`password`) o internos (`deleteAt`).
 * 
 * @example
 * ```typescript
 * const userResponse: UserResponseDTO = {
 *   id: 1,
 *   name: 'Diego',
 *   lastname: 'Villa',
 *   email: 'diego@example.com',
 *   age: 28,
 *   role: 'ADMIN',
 *   isActive: true,
 *   createdAt: '2026-01-01T00:00:00.000Z',
 *   updatedAt: null
 * };
 * ```
 */
export type UserResponseDTO = Omit<UserEntity, 'password' | 'deleteAt'>;
