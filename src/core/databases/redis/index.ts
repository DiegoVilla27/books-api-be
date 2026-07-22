import ENVS from '@core/environments';
import Redis from 'ioredis';

/** Dirección host del servidor Redis obtenida de la configuración de entornos */
const redisHost = ENVS.REDIS_HOST || 'localhost';
/** Puerto de conexión del servidor Redis */
const redisPort = ENVS.REDIS_PORT || 6379;

/**
 * Cliente singleton de Redis inicializado con la librería `ioredis`.
 * Proporciona acceso global a la capa de caché en memoria y operaciones de almacenamiento clave-valor.
 * 
 * @remarks
 * Incluye estrategia de reintento exponencial con tope en 2000ms (`retryStrategy`) y
 * escuchadores de eventos para loguear estados de conexión (`connect`) y errores de red (`error`).
 * 
 * @example
 * ```typescript
 * await redisClient.get('cacheKey');
 * await redisClient.setex('cacheKey', 300, JSON.stringify(data));
 * ```
 */
export const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redisClient.on('connect', () => {
  console.log('🟢 Conexión a Redis establecida correctamente.');
});

redisClient.on('error', (err) => {
  console.log('❌ Error al conectar a Redis: ', err);
});