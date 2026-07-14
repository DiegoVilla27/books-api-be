import AppError from '@core/errors';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

// Formato de respuesta para Entorno de Desarrollo
const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// En la respuesta de producción, si el error tiene sub-errores (como Zod), los mostramos
const sendErrorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }) // <-- Muestra los detalles de campos fallidos
    });
  } else {
    console.error('💥 ERROR INESPERADO:', err);
    res.status(500).json({
      status: 'error',
      message: 'Algo salió muy mal en el servidor.',
    });
  }
};

// Traduce el error estructurado de Zod a nuestro formato estándar
const handleZodError = (err: ZodError) => {
  const formattedErrors: Record<string, string> = {};

  // Extraemos un mapa simple de 'campo': 'mensaje de error'
  err.issues.forEach((issue) => {
    const fieldName = issue.path[1] || issue.path[0] || 'campo';
    formattedErrors[fieldName as string] = issue.message;
  });

  const appError = new AppError('Error de validación de datos', 400);
  (appError as any).errors = formattedErrors;
  return appError;
};

// Traductores de errores conocidos de base de datos
const handlePrismaUniqueConstraintError = () => {
  return new AppError('El registro ya existe (violación de restricción única).', 409);
};

const handleMongooseCastError = (err: any) => {
  return new AppError(`Valor inválido "${err.value}" para el campo "${err.path}".`, 400);
};

// Middleware de Express (debe tener exactamente 4 parámetros)
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // 1. Traducir primero los errores conocidos (Zod, Prisma, Mongoose)
  if (err instanceof ZodError) error = handleZodError(err);
  if (err.code === 'P2002') error = handlePrismaUniqueConstraintError();
  if (err.name === 'CastError') error = handleMongooseCastError(error);

  // 2. Garantizar valores de estado por defecto
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // 3. Responder según el entorno
  if (process.env.NODE_ENV === 'dev') {
    // Desarrollo: Muestra detalles pero usando el error ya traducido y limpio
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      errors: error.errors, // Muestra los fallos de campos si existen
      stack: error.stack,
    });
  } else {
    // Producción: Oculta la pila de ejecución (stack)
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;