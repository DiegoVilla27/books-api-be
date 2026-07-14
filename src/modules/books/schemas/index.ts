import { z } from 'zod';
import sanitizeText from '@core/utils/sanitizeHtml';

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