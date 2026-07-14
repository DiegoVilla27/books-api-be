import sanitizeText from '@core/utils/sanitizeHtml';
import { z } from 'zod';

const CreateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .transform((val) => sanitizeText(val)),
    lastname: z
      .string()
      .min(3, 'El apellido debe tener al menos 3 caracteres')
      .transform((val) => sanitizeText(val)),
    email: z
      .string()
      .email('El email es inválido')
      .transform((val) => sanitizeText(val)),
    password: z
      .string()
      .min(3, 'La contraseña debe tener al menos 3 caracteres')
      .transform((val) => sanitizeText(val)),
    age: z
      .number()
      .min(18, 'Debes ser mayor de 18 años'),
    role: z
      .enum(['USER', 'ADMIN'])
      .default('USER')
  }),
});

export {
  CreateUserSchema
};
