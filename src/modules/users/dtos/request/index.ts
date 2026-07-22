import { z } from 'zod';
import { CreateUserSchema, ProfileUserSchema, UpdateUserSchema } from '../../schemas';
import type { UserEntity } from '@modules/users/entities';

/**
 * Objeto de transferencia de datos (DTO) para la actualización del perfil propio (`PATCH /users/profile`).
 * Tipado inferido del cuerpo del esquema Zod {@link ProfileUserSchema}.
 */
export type ProfileUserRequestDTO = z.infer<typeof ProfileUserSchema>['body'];

/**
 * Objeto de transferencia de datos (DTO) con los atributos esenciales del usuario extraídos de la sesión JWT.
 * Utilizado internamente para validar permisos y contexto de identidad entre capas del servicio.
 */
export type MeRequestDTO = Pick<UserEntity, 'id' | 'name' | 'lastname' | 'email' | 'role'>;

/**
 * Objeto de transferencia de datos (DTO) para la creación de un nuevo usuario (`POST /users`).
 * Tipado inferido del cuerpo del esquema Zod {@link CreateUserSchema}.
 */
export type CreateUserRequestDTO = z.infer<typeof CreateUserSchema>['body'];

/**
 * Objeto de transferencia de datos (DTO) para la modificación parcial de un usuario (`PATCH /users/:id`).
 * Tipado inferido del cuerpo del esquema Zod {@link UpdateUserSchema}.
 */
export type UpdateUserRequestDTO = z.infer<typeof UpdateUserSchema>['body'];
