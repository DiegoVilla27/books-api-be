import type { UserEntity } from '@modules/users/entities';
import { Request } from 'express';

/**
 * Ampliación global del módulo de Express para incluir tipos de contexto de aplicación.
 */
declare global {
  namespace Express {
    /**
     * Extensión de la interfaz de Petición HTTP de Express.
     * Añade propiedades de contexto inyectadas por middlewares de autenticación.
     */
    interface Request {
      /**
       * Datos del usuario autenticado inyectados en la petición por el middleware `restrictTo`.
       * Contiene exclusivamente las propiedades esenciales de identificación y rol.
       */
      user?: Pick<UserEntity, 'id' | 'role'>;
    }
  }
}
