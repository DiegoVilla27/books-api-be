import ENVS from '@core/environments';
import type { LogPayload } from '@core/middlewares/httpLogger';
import amqp, { type Channel, type ChannelModel } from 'amqplib';

/**
 * URL de conexión al servidor de RabbitMQ.
 * Toma la dirección desde la variable de entorno `RABBITMQ_URL` o usa la conexión local por defecto.
 * 
 * @default 'amqp://guest:guest@localhost:5672'
 */
const RABBITMQ_URL: string = ENVS.RABBITMQ_URL;

/**
 * Nombre de la cola en RabbitMQ destinada a almacenar los logs de auditoría de peticiones HTTP.
 */
export const LOGS_QUEUE: string = 'http_logs_queue';

/**
 * Instancia guardada en caché de la conexión TCP con RabbitMQ.
 * Implementa el patrón Singleton para reutilizar la conexión existente en lugar de abrir nuevas.
 * 
 * @internal
 */
let connection: ChannelModel | null = null;

/**
 * Instancia guardada en caché del canal virtual de comunicación con RabbitMQ.
 * Reutilizado a través de la conexión para evitar sobrecarga de recursos de red.
 * 
 * @internal
 */
let channel: Channel | null = null;

/**
 * Establece u obtiene una conexión y canal activos con el servidor de RabbitMQ.
 * 
 * @returns Promesa que resuelve al canal de RabbitMQ listo para enviar/recibir mensajes.
 * 
 * @throws {Error} Si ocurre un error de red o de autenticación al intentar conectar con el broker.
 * 
 * @remarks
 * Si ya existe un canal abierto en memoria, lo retorna inmediatamente sin volver a conectar (Singleton).
 * De lo contrario, abre la conexión TCP, crea el canal multiplexado y asegura la existencia de la cola (`durable: true`).
 * 
 * @example
 * ```typescript
 * const channel = await connectRabbitMQ();
 * ```
 */
export const connectRabbitMQ = async (): Promise<Channel> => {
  // Retorna el canal almacenado si ya está activo
  if (channel) return channel;

  try {
    // 1. Inicia la conexión TCP con el servidor RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL);

    // 2. Abre un canal multiplexado sobre la conexión
    channel = await connection.createChannel();

    // 3. Afirma que la cola existe. durable: true garantiza que la cola sobreviva a reinicios del broker
    await channel.assertQueue(LOGS_QUEUE, { durable: true });

    console.log('🐰 RabbitMQ conectado y cola lista:', LOGS_QUEUE);
    return channel;
  } catch (error) {
    console.error('❌ Error conectando a RabbitMQ:', error);
    // Limpia el estado interno si la conexión falla para permitir futuros reintentos
    connection = null;
    channel = null;
    throw error;
  }
};

/**
 * Publica un mensaje con datos de registro (log) de auditoría en la cola de RabbitMQ.
 * 
 * @param logData - Objeto clave-valor con la información del log (ej. método HTTP, ruta, status code, usuario).
 * @returns Promesa que se resuelve una vez enviado el mensaje al buffer de salida del canal.
 * 
 * @remarks
 * Convierte el objeto recibido en un JSON enriquecido con metadatos adicionales (`timestamp` e identificador de servicio `express-books-api`),
 * lo transforma a `Buffer` y lo envía a `http_logs_queue` con opción `persistent: true` para que se conserve en disco.
 * 
 * @example
 * ```typescript
 * await publishLog({
 *   userId: 1,
 *   role: 'ADMIN',
 *   action: 'CREÓ',
 *   method: 'POST',
 *   endpoint: '/api/v1/books',
 *   statusCode: 201,
 *   responseTimeMs: 18,
 *   clientIp: '127.0.0.1',
 *   userAgent: 'Mozilla/5.0'
 * });
 * ```
 */
export const publishLog = async (logData: LogPayload): Promise<void> => {
  try {
    // Obtiene el canal existente o establece una nueva conexión si no existía
    const ch: Channel = await connectRabbitMQ();

    // Construye la estructura del mensaje codificada en string JSON
    const messagePayload = JSON.stringify({
      ...logData,
      timestamp: new Date().toISOString(),
      service: 'express-books-api',
    });

    // Convierte la cadena JSON a Buffer para transmisión de bytes en RabbitMQ
    const messageBuffer: Buffer = Buffer.from(messagePayload);

    // Envía el mensaje a la cola con opción persistent: true para escribirlo en disco
    ch.sendToQueue(LOGS_QUEUE, messageBuffer, { persistent: true });
  } catch (error) {
    // Captura errores de publicación para evitar que afecten la respuesta de la API principal
    console.error('Error publicando log en RabbitMQ:', error);
  }
};