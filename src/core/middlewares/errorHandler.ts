import AppError from '@core/errors';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

/**
 * Envía una respuesta detallada de error en entornos de desarrollo.
 * Muestra el código de error, el stack trace completo y la causa.
 * 
 * @param err - Objeto de error capturado.
 * @param res - Objeto de respuesta de Express.
 */
const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Envía una respuesta de error controlada y amigable en entornos de producción.
 * Si el error es operacional, muestra el mensaje de error. Si es inesperado,
 * oculta los detalles de implementación para no exponer información sensible.
 * 
 * @param err - Objeto de error capturado.
 * @param res - Objeto de respuesta de Express.
 */
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

/**
 * Traduce un error estructurado de validación de Zod a una instancia estándar de `AppError`.
 * Agrupa los campos fallidos en un objeto formateado llave-valor.
 * 
 * @param err - Instancia de error lanzada por Zod.
 * @returns Instancia mapeada de `AppError` con estado 400.
 */
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

/**
 * Traduce errores de violación de restricción de clave única (Unique Constraint) de Prisma (código P2002).
 * 
 * @returns Instancia mapeada de `AppError` con estado 409 (Conflict).
 */
const handlePrismaUniqueConstraintError = () => {
  return new AppError('El registro ya existe (violación de restricción única).', 409);
};

/**
 * Traduce errores de conversión de tipos de Mongoose (Cast Error) a un formato amigable.
 * 
 * @param err - Objeto de error original de Mongoose.
 * @returns Instancia mapeada de `AppError` con estado 400.
 */
const handleMongooseCastError = (err: any) => {
  return new AppError(`Valor inválido "${err.value}" para el campo "${err.path}".`, 400);
};

/**
 * Middleware centralizado de Express para la gestión de errores.
 * Captura excepciones no controladas y errores controlados de negocio, los traduce
 * al formato unificado de la aplicación y responde al cliente según el entorno actual.
 * 
 * @param err - Excepción capturada en el pipeline de Express.
 * @param req - Objeto de petición de Express.
 * @param res - Objeto de respuesta de Express.
 * @param next - Función Next de Express.
 */
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