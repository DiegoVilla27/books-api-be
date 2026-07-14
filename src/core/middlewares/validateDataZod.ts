// En src/core/middlewares/validateDataZod.ts
import type { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';

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
