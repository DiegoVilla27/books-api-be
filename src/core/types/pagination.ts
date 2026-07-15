import { z } from 'zod';

interface IPagination<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }
}

interface PaginationQuery {
  page: number;
  limit: number;
}

const GetQuerySchema = z.object({
  query: z.object({
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
  }),
});

export {
  type IPagination,
  GetQuerySchema,
  type PaginationQuery
}