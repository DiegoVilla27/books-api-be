import { redisClient } from '@core/databases/redis';
import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware de orden superior (Factory) para el almacenamiento y recuperación en caché de respuestas HTTP mediante Redis.
 * 
 * @param ttl - Tiempo de vida de la clave en caché expresado en segundos (por defecto `300` s / 5 minutos).
 * @returns Middleware asíncrono de Express que gestiona el ciclo de caché para peticiones `GET`.
 * 
 * @remarks
 * **Mecanismo de Caché:**
 * 1. **Solo peticiones HTTP `GET`:** Ignora peticiones mutativas (`POST`, `PUT`, `PATCH`, `DELETE`).
 * 2. **Clave única:** Genera la clave mediante el patrón `cache:<req.originalUrl>` (incluyendo query params).
 * 3. **Cache Hit:** Si la clave existe en Redis, responde inmediatamente con estado `200 OK` y el JSON deserializado, evitando consultar la base de datos.
 * 4. **Cache Miss:** Si no existe, intercepta el método `res.json` para guardar la respuesta resultante en Redis mediante `setex(cacheKey, ttl, body)` únicamente si el código de estado es `200 OK`.
 * 5. **Tolerancia a fallos:** Captura errores de red en Redis y permite continuar el flujo normal sin romper la petición.
 * 
 * @example
 * ```typescript
 * // Aplicar caché con TTL por defecto (5 min) en un endpoint público
 * router.get('/books', cacheRedis(), getBooksCtrl);
 * 
 * // Aplicar caché personalizada de 1 hora (3600 segundos)
 * router.get('/users/lookup', cacheRedis(3600), getUsersLookupCtrl);
 * ```
 */
export const cacheRedis = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Solo cacheamos peticiones GET
    if (req.method !== 'GET') {
      return next();
    }

    // Usamos la URL completa (con query params como ?page=1&search=xyz) como clave única
    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      const cacheData = await redisClient.get(cacheKey);

      if (cacheData) {
        // Cache Hit 🎯: Retornamos la respuesta guardada
        return res.status(200).json(JSON.parse(cacheData));
      }

      // Cache Miss ❌: Modificamos res.json para interceptar la respuesta de la BD y guardarla en Redis
      const originalJson = res.json.bind(res);

      res.json = (body: any): Response => {
        // Solo cacheamos respuestas exitosas 200 OK
        if (res.statusCode === 200) {
          redisClient.setex(cacheKey, ttl, JSON.stringify(body))
            .catch((error) => {
              console.log('Error al guardar el cache: ', error);
            });
        }
        return originalJson(body);
      }

      next();
    } catch (error) {
      console.log('Error al obtener el cache: ', error);
      next();
    }
  }
}