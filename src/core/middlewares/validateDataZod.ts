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

      req.body = parsed.body;
      next();
    } catch (error) {
      // ➔ Delegamos TODOS los errores (incluido Zod) al manejador global
      next(error);
    }
  };
};

export default validateDataMiddleware;
