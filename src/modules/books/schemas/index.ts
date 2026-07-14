import { z } from 'zod';
import sanitizeText from '@core/utils/sanitizeHtml';

const BookByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido') // Solo números
      .transform((val) => parseInt(val, 10)),            // Transforma a número
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

    userId: z
      .number('El ID del usuario es obligatorio'),
  }),
});

const UpdateBookSchema = z.object({
  body: z.object({
    title: z
      .string('El título es obligatorio')
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(100, 'El título no puede superar los 100 caracteres')
      .transform((val) => sanitizeText(val))
      .optional(),

    author: z
      .string('El autor es obligatorio')
      .min(2, 'El autor debe tener al menos 2 caracteres')
      .max(100, 'El autor no puede superar los 100 caracteres')
      .transform((val) => sanitizeText(val))
      .optional(),

    userId: z
      .number('El ID del usuario es obligatorio'),
  }),
});

export {
  CreateBookSchema,
  UpdateBookSchema,
  BookByIdSchema
}