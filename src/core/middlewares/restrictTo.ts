import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '@core/errors';
import ENVS from '@core/environments';
import prisma from '@core/databases/postgres';
import type { RoleUser } from '@modules/users/entities';

const JWT_ACCESS_SECRET = ENVS.JWT_ACCESS_SECRET;

/**
 * Middleware unificado de Autenticación y Autorización por Roles (RBAC).
 *
 * Realiza dos comprobaciones en secuencia sobre cada petición entrante:
 *
 * 1. **Autenticación**: Extrae y verifica el JWT del encabezado `Authorization: Bearer <token>`.
 *    Si el token es inválido, malformado o ha expirado, la petición es rechazada con `401 Unauthorized`.
 *
 * 2. **Autorización**: Comprueba que el rol decodificado del token (`role`) esté incluido
 *    en la lista de roles permitidos. Si el rol no tiene acceso, responde con `403 Forbidden`.
 *
 * Tras superar ambas comprobaciones, inyecta los datos del usuario autenticado en `req.user`
 * para que los controladores posteriores puedan consumirlos sin volver a decodificar el token.
 *
 * @param roles - Lista de roles autorizados para acceder a la ruta protegida (ej: `'ADMIN'`, `'USER'`).
 * @returns Middleware asíncrono de Express que autentica y autoriza la petición entrante.
 *
 * @throws {AppError} Retorna `401 Unauthorized` si el token está ausente, malformado, firmado con clave inválida, expirado o si el usuario no existe/está inactivo.
 * @throws {AppError} Retorna `403 Forbidden` si el rol decodificado no se encuentra entre los roles autorizados.
 *
 * @remarks
 * Este middleware realiza una consulta a la base de datos PostgreSQL vía Prisma para validar
 * la propiedad `isActive` del usuario en tiempo real, garantizando que cuentas inhabilitadas pierdan acceso de inmediato.
 *
 * @example
 * ```typescript
 * // Solo administradores
 * router.delete('/users/:id', restrictTo('ADMIN'), deleteUserCtrl);
 *
 * // Cualquier usuario autenticado
 * router.get('/books', restrictTo('USER', 'ADMIN'), getBooksCtrl);
 * ```
 */
export const restrictTo = (...roles: string[]) => {
  return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    // 1. AUTENTICACIÓN: Verificar presencia del Token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Acceso denegado. Token ausente.', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('Acceso denegado. Token malformado.', 401));
    }

    try {
      // 2. AUTENTICACIÓN: Validar firma del Token
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as unknown as {
        sub: number;
        role: RoleUser;
      };

      // Verificamos en BD que el usuario siga existiendo y esté activo
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { isActive: true },
      });

      // Si fue eliminado o su cuenta fue desactivada mientras tenía sesión iniciada
      if (!user || !user.isActive) {
        return next(
          new AppError('Tu cuenta se encuentra inactiva o deshabilitada. Contacta al administrador.', 401)
        );
      }

      // 3. AUTORIZACIÓN: Validar Rol
      if (!roles.includes(decoded.role)) {
        return next(new AppError('No tienes permisos para realizar esta acción.', 403));
      }

      // Inyectar usuario en el request para que los controladores lo usen
      req.user = {
        id: decoded.sub,
        role: decoded.role
      };

      return next();
    } catch (error) {
      return next(new AppError('Sesión expirada o token inválido.', 401));
    }
  };
};
