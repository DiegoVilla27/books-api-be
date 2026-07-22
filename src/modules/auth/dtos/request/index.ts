import { z } from 'zod';
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from '../../schemas';

/**
 * Objeto de transferencia de datos (DTO) para la petición de inicio de sesión (`POST /auth/login`).
 * Contiene el email y la contraseña sanitizados, inferido del esquema Zod {@link LoginSchema}.
 */
export type LoginRequestDTO = z.infer<typeof LoginSchema>['body'];

/**
 * Objeto de transferencia de datos (DTO) para solicitar la renovación de tokens (`POST /auth/refresh`).
 * Contiene el token de refresco JWT previo, inferido del esquema Zod {@link RefreshTokenSchema}.
 */
export type RefreshTokenRequestDTO = z.infer<typeof RefreshTokenSchema>['body'];

/**
 * Objeto de transferencia de datos (DTO) para la petición de registro de un nuevo usuario (`POST /auth/register`).
 * Incluye los datos personales, contraseña y su confirmación, inferido del esquema Zod {@link RegisterSchema}.
 */
export type RegisterRequestDTO = z.infer<typeof RegisterSchema>['body'];
