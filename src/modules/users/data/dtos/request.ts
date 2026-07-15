import { z } from 'zod';
import { CreateUserSchema, UpdateUserSchema } from '../../schemas';

// Extrae el tipo del 'body' del esquema de Zod
export type CreateUserRequestDTO = z.infer<typeof CreateUserSchema>['body'];
export type UpdateUserRequestDTO = z.infer<typeof UpdateUserSchema>['body'];
