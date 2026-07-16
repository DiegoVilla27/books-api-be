import { z } from 'zod';
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from '../../schemas';

/**
 * DTO para la petición de inicio de sesión.
 * Tipado inferido del esquema de validación `LoginSchema`.
 */
export type LoginRequestDTO = z.infer<typeof LoginSchema>['body'];

/**
 * DTO para la petición de refresco de token.
 * Tipado inferido del esquema de validación `RefreshTokenSchema`.
 */
export type RefreshTokenRequestDTO = z.infer<typeof RefreshTokenSchema>['body'];

/**
 * DTO para la petición de registro de nuevos usuarios.
 * Tipado inferido del esquema de validación `RegisterSchema`.
 */
export type RegisterRequestDTO = z.infer<typeof RegisterSchema>['body'];
