import { z } from 'zod';
import sanitizeText from '@core/utils/sanitizeHtml';

export const GetBooksQuerySchema = z.object({
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

const CreateBookSchema = z.object({
  body: z.object({
    title: z
      .string('El título es obligatorio')
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(100, 'El título no puede superar los 100 caracteres')
      .transform((val) => sanitizeText(val)),

    author: z
      .string('El autor es obligatorio')
      .min(2, 'El autor debe tener al menos 2 caracteres')
      .max(100, 'El autor no puede superar los 100 caracteres')
      .transform((val) => sanitizeText(val)),
  }),
});

export {
  CreateBookSchema
}