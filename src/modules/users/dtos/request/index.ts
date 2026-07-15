import { z } from 'zod';
import { CreateUserSchema, UpdateUserSchema } from '../../schemas';

/**
 * Tipo que representa los campos requeridos en el cuerpo de una petición
 * para registrar un nuevo Usuario. Inferido de `CreateUserSchema`.
 */
export type CreateUserRequestDTO = z.infer<typeof CreateUserSchema>['body'];

/**
 * Tipo que representa los campos opcionales permitidos en el cuerpo de una petición
 * para actualizar un Usuario existente. Inferido de `UpdateUserSchema`.
 */
export type UpdateUserRequestDTO = z.infer<typeof UpdateUserSchema>['body'];
