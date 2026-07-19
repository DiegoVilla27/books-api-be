import { z } from 'zod';
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from '../../schemas';

/**
 * Data Transfer Object encapsulating verified user attributes extracted from decoded session signatures.
 * Transports identity context parameters across service boundaries to orchestrate operational security gates.
 */
export type MeRequestDTO = {
  /** The unique numeric record identifier derived directly from the token signature's subject key. */
  id: number;
  /** The first name associated with the authenticated profile identity. */
  name: string;
  /** The family name tracking strings matching the authenticated profile identity. */
  lastname: string;
  /** The electronic communication mail address bound to the incoming request payload context. */
  email: string;
  /** The access scope authorization clearance string claimed by the active token context. */
  role: string;
}

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
