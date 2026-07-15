/**
 * Clase de error personalizada para gestionar excepciones controladas dentro de la aplicación.
 * Permite definir códigos de estado HTTP y distinguir errores operacionales (esperados) de bugs del sistema.
 * 
 * @extends Error
 */
class AppError extends Error {
  /** Código de estado HTTP (ej: 400, 404, 500) */
  public readonly statusCode: number;
  /** Estado simplificado del error: 'fail' para errores de cliente (4xx) y 'error' para fallos del servidor (5xx) */
  public readonly status: string;
  /** Flag que indica que el error es operacional (provocado intencionalmente por lógica de negocio) */
  public readonly isOperational: boolean;

  /**
   * Crea una nueva instancia de AppError.
   * 
   * @param message - Mensaje descriptivo del error legible para el usuario o cliente de la API.
   * @param statusCode - Código de estado HTTP que debe responder la petición.
   */
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