/**
 * Traduce y mapea un método HTTP a su representación de acción semántica en español para auditoría de eventos.
 * 
 * @param method - Verbo del método HTTP recibido en la petición (`POST`, `PUT`, `PATCH`, `DELETE`, `GET`).
 * @returns Cadena de texto descriptiva en mayúsculas (`CREÓ`, `ACTUALIZÓ`, `ELIMINÓ`, `CONSULTÓ`).
 * 
 * @remarks
 * Útil para homogenizar los registros de auditoría almacenados en RabbitMQ y consumidos por microservicios.
 * Si el método no corresponde a una mutación conocida, retorna `'CONSULTÓ'`.
 * 
 * @example
 * ```typescript
 * const action = getHttpMethodDescription('POST'); // Retorna 'CREÓ'
 * const actionPatch = getHttpMethodDescription('PATCH'); // Retorna 'ACTUALIZÓ'
 * ```
 */
const getHttpMethodDescription = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'CREÓ';
    case 'PUT':
    case 'PATCH':
      return 'ACTUALIZÓ';
    case 'DELETE':
      return 'ELIMINÓ';
    default:
      return 'CONSULTÓ';
  }
};

export default getHttpMethodDescription;