import { redisClient } from '../';

/**
 * Constantes de patrones de clave Redis para la invalidación selectiva de caché por módulos.
 * Contiene comodines de coincidencia para búsquedas por patrón (`KEYS` o `SCAN`).
 */
export const KEYS_REDIS = {
  /** Patrón de coincidencia para claves de caché del módulo Libros */
  BOOKS: '*books*',
  /** Patrón de coincidencia para claves de caché del módulo Usuarios */
  USERS: '*users*',
} as const;

/**
 * Tipo unión extraído de los valores literales de {@link KEYS_REDIS}.
 */
type TypeKeysRedis = typeof KEYS_REDIS[keyof typeof KEYS_REDIS];

/**
 * Función asíncrona para la invalidación y purga de claves en la caché de Redis según patrón.
 * 
 * @param key - Patrón de clave de caché a buscar e invalidar ({@link TypeKeysRedis}).
 * @returns Promesa que se resuelve tras eliminar las claves coincidentes.
 * 
 * @remarks
 * Consulta Redis usando el comando `keys` con el prefijo `cache:<key>` y elimina
 * en lote todas las coincidencias mediante `del`. Si no se encuentran claves, no realiza operación.
 * 
 * @example
 * ```typescript
 * await clearCache(KEYS_REDIS.BOOKS);
 * ```
 */
export const clearCache = async (key: TypeKeysRedis) => {
  // Busca todas las claves que comiencen con cache:/key o cache:/api/v1/key
  const keys = await redisClient.keys(`cache:${key}`);
  if (keys.length > 0) {
    await redisClient.del(keys);
    console.log(`🧹 Caché de ${key} invalidada correctamente`);
  }
};