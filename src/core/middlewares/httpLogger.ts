import { publishLog } from '@core/brokers/rabbit';
import getHttpMethodDescription from '@core/utils/httpMethods';
import type { NextFunction, Request, Response } from 'express';

/**
 * Estructura de payload de datos enviada a RabbitMQ para la auditoría de peticiones HTTP.
 */
export interface LogPayload {
  /** Identificador del usuario que realizó la acción o `'Desconocido'` si no está autenticado */
  userId: number | string;
  /** Rol asignado al usuario en el token JWT o `'Invitado'` */
  role: string;
  /** Descripción semántica en español de la acción ejecutada (`CREÓ`, `ACTUALIZÓ`, `ELIMINÓ`, `CONSULTÓ`) */
  action: string;
  /** Método HTTP de la solicitud (`POST`, `PATCH`, `DELETE`, etc.) */
  method: string;
  /** Ruta o endpoint accedido por el cliente (`req.originalUrl`) */
  endpoint: string;
  /** Código de estado HTTP retornado en la respuesta (`200`, `201`, `400`, `500`) */
  statusCode: number;
  /** Tiempo transcurrido en milisegundos entre el inicio de la petición y el evento `finish` de la respuesta */
  responseTimeMs: number;
  /** Dirección IP de origen del cliente solicitante */
  clientIp: string;
  /** Agente de usuario (User-Agent) del navegador o cliente HTTP solicitante */
  userAgent: string;
}

/** Lista de métodos HTTP considerados mutaciones que deben ser auditados */
const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Middleware de registro HTTP asíncrono para auditoría de eventos de mutación.
 * 
 * @param req - Objeto de solicitud HTTP de Express.
 * @param res - Objeto de respuesta HTTP de Express.
 * @param next - Función de control para avanzar al siguiente middleware o controlador.
 * 
 * @remarks
 * **Comportamiento:**
 * 1. Filtra peticiones de lectura (`GET`, `OPTIONS`, `HEAD`) y permite que continúen sin auditar.
 * 2. Mide la latencia registrando la marca de tiempo de inicio (`Date.now()`).
 * 3. Escucha el evento `finish` del objeto `res` para obtener el `statusCode` definitivo y calcular `responseTimeMs`.
 * 4. Construye el objeto {@link LogPayload} resolviendo la acción mediante {@link getHttpMethodDescription}.
 * 5. Publica el mensaje en la cola `http_logs_queue` de RabbitMQ mediante {@link publishLog} sin bloquear el hilo principal.
 * 
 * @example
 * ```typescript
 * router.post('/books', [restrictTo('USER'), httpLogger], createBookCtrl);
 * ```
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Filtrar: Si NO es una mutación, pasamos de largo sin auditar
  if (!MUTATION_METHODS.includes(req.method.toUpperCase())) {
    return next();
  }

  const startTime = Date.now();

  // Interceptamos la finalización de la respuesta
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Solo enviamos logs de peticiones o errores relevantes
    const logPayload: LogPayload = {
      // Datos del usuario
      userId: req.user?.id || 'Desconocido',
      role: req.user?.role || 'Invitado',
      action: getHttpMethodDescription(req.method),
      // Detalles técnicos
      method: req.method,
      endpoint: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      // Metadatos de red
      clientIp: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };

    // Publicamos en RabbitMQ de forma totalmente asíncrona
    publishLog(logPayload);
  });

  next();
};