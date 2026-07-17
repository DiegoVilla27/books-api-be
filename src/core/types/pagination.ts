import { z } from 'zod';

/**
 * Interfaz genérica para estructurar las respuestas paginadas de la API.
 * 
 * @template T - El tipo de la entidad o DTO que se encuentra en el listado de datos (`data`).
 */
interface IPagination<T> {
  /** Array de elementos paginados del recurso solicitado */
  data: T[];
  /** Metadatos asociados al estado de la paginación */
  pagination: {
    /** Cantidad total de registros existentes en la base de datos que coinciden con los filtros */
    totalItems: number;
    /** Cantidad total de páginas calculadas a partir del límite y el total de registros */
    totalPages: number;
    /** Número de la página actual solicitada (1-indexed) */
    currentPage: number;
    /** Cantidad máxima de registros retornados en la página actual */
    limit: number;
  }
}

/**
 * Interfaz para representar la estructura final de los query params de paginación
 * después de ser transformados por Zod a tipos numéricos nativos.
 */
interface PaginationQuery {
  /** Número de página solicitado */
  page: number;
  /** Límite de ítems por página */
  limit: number;
  /** Término de búsqueda opcional */
  search?: string;
}

/**
 * Esquema de Zod para validar y sanitizar los parámetros de consulta (Query Params) de paginación.
 * Transforma los valores de tipo string enviados por URL a números enteros válidos
 * y define rangos seguros por defecto (página inicial 1 y límite entre 1 y 100).
 */
const BaseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => Math.max(1, parseInt(val, 10))), // Mínimo página 1
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => Math.max(1, Math.min(100, parseInt(val, 10)))), // Límite entre 1 y 100
  search: z
    .string()
    .optional()
    .default(''),
});

const GetQuerySchema = z.object({
  query: BaseQuerySchema,
});

export {
  type IPagination,
  BaseQuerySchema,
  GetQuerySchema,
  type PaginationQuery
}