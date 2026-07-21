import ENVS from "@core/environments";
import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

/**
 * Middleware function that optionally authenticates HTTP requests using JWT Bearer tokens.
 * 
 * @remarks
 * Unlike mandatory authentication guards, this middleware silently inspects the `Authorization` header.
 * If a valid JWT Bearer token is provided, it decodes the payload and populates `req.user`.
 * If the token is missing, expired, or invalid, execution safely continues down the middleware pipeline
 * without throwing an authentication error, leaving `req.user` undefined.
 * 
 * @param req - Express HTTP request object, augmented with `user` context when valid tokens are present.
 * @param _ - Express HTTP response object (unused).
 * @param next - Express next function callback to yield execution to subsequent handlers.
 * 
 * @example
 * ```typescript
 * app.get('/public-or-personalized', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // Return personalized user content
 *   } else {
 *     // Return generic public content
 *   }
 * });
 * ```
 */
export const optionalAuth = (req: Request, _: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, ENVS.JWT_ACCESS_SECRET) as unknown as {
          sub: number;
          name: string;
          lastname: string;
          email: string;
          role: string;
        };

        req.user = {
          id: decoded.sub,
          name: decoded.name,
          lastname: decoded.lastname,
          email: decoded.email,
          role: decoded.role
        };
      } catch (error) {
        // Si el token falló, simplemente no seteamos req.user y dejamos pasar
      }
    }
  }

  return next(); // Siempre continúa a la siguiente función
};