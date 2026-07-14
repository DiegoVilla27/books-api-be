class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    // status será 'fail' para errores 4xx (errores del cliente) y 'error' para 5xx
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Identifica que es un error controlado/esperado por nosotros
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;