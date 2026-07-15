import sanitizeText from '@core/utils/sanitizeHtml';
import { z } from 'zod';

const UserByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido') // Solo números
      .transform((val) => parseInt(val, 10)),            // Transforma a número
  }),
});

const CreateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(50, 'El nombre debe tener como máximo 50 caracteres')
      .transform((val) => sanitizeText(val)),
    lastname: z
      .string()
      .min(3, 'El apellido debe tener al menos 3 caracteres')
      .max(50, 'El apellido debe tener como máximo 50 caracteres')
      .transform((val) => sanitizeText(val)),
    email: z
      .email('El email es inválido')
      .transform((val) => sanitizeText(val)),
    password: z
      .string()
      .min(3, 'La contraseña debe tener al menos 3 caracteres')
      .max(20, 'La contraseña debe tener como máximo 20 caracteres')
      .transform((val) => sanitizeText(val)),
    age: z
      .number()
      .min(18, 'Debes ser mayor de 18 años')
      .max(100, 'Debes ser menor de 100 años'),
    role: z
      .enum(['USER', 'ADMIN'])
      .default('USER'),
  }).strict(),
});

const UpdateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(50, 'El nombre debe tener como máximo 50 caracteres')
      .transform((val) => sanitizeText(val))
      .optional(),
    lastname: z
      .string()
      .min(3, 'El apellido debe tener al menos 3 caracteres')
      .max(50, 'El apellido debe tener como máximo 50 caracteres')
      .transform((val) => sanitizeText(val))
      .optional(),
    email: z
      .email('El email es inválido')
      .transform((val) => sanitizeText(val))
      .optional(),
    password: z
      .string()
      .min(3, 'La contraseña debe tener al menos 3 caracteres')
      .max(20, 'La contraseña debe tener como máximo 20 caracteres')
      .transform((val) => sanitizeText(val))
      .optional(),
    age: z
      .number()
      .min(18, 'Debes ser mayor de 18 años')
      .max(100, 'Debes ser menor de 100 años')
      .optional(),
    role: z
      .enum(['USER', 'ADMIN'])
      .default('USER')
      .optional(),
  }).strict(),
});

export {
  CreateUserSchema,
  UpdateUserSchema,
  UserByIdSchema
};
