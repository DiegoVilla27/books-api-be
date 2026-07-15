import type { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';

/**
 * Generador de middleware para validación de datos utilizando esquemas de Zod.
 * Valida de forma asíncrona el `body`, `query` y `params` de la petición HTTP entrante.
 * 
 * Modifica el objeto de petición (`req`) reescribiendo de forma segura las propiedades
 * validadas, aplicando transformaciones y filtrando propiedades adicionales no especificadas (strip).
 * Utiliza `Object.defineProperty` para sobreescribir con seguridad campos de solo lectura como `query` y `params`.
 * 
 * @param schema - Esquema de Zod de tipo ZodObject que valida la estructura `{ body?, query?, params? }`.
 * @returns Un middleware de Express listo para ser acoplado en las rutas del sistema.
 */
const validateDataMiddleware = (schema: ZodObject<any>) => {
  return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Solo reemplazamos req.body si el esquema de Zod realmente lo validó
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      // Solo reemplazamos req.query si fue validado
      if (parsed.query !== undefined) {
        Object.defineProperty(req, 'query', {
          value: parsed.query,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
      // Solo reemplazamos req.params si fue validado
      if (parsed.params !== undefined) {
        Object.defineProperty(req, 'params', {
          value: parsed.params,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }

      next();
    } catch (error) {
      // ➔ Delegamos TODOS los errores (incluido Zod) al manejador global
      next(error);
    }
  };
};

export default validateDataMiddleware;
