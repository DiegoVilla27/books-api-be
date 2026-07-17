import { BaseQuerySchema } from '@core/types/pagination';
import sanitizeText from '@core/utils/sanitizeHtml';
import { z } from 'zod';

const GetUsersQuerySchema = z.object({
  query: BaseQuerySchema.merge(
    z.object({
      role: z.enum(['ADMIN', 'USER']).optional(),
      isActive: z.string().optional().transform((val) => {
        if (!val || val === 'undefined' || val === 'null') return undefined;
        return val === 'true'; // Devuelve true si es "true", false para cualquier otra cosa
      }),
    }).strict()
  )
});

/**
 * Esquema para validar solicitudes que contengan un identificador de usuario (`req.params.id`).
 * Transforma el string numérico de los parámetros de ruta en un valor numérico entero.
 */
const UserByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido') // Solo números
      .transform((val) => parseInt(val, 10)),            // Transforma a número
  }).strict(),
});

/**
 * Esquema de validación para registrar un usuario nuevo (`POST /users`).
 * Valida de forma estricta los campos del cuerpo de la petición. Aplica saneado HTML
 * a los campos de texto `name`, `lastname`, `email` y `password` para evitar XSS.
 * Valida la mayoría de edad (mínimo 18 años).
 */
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
    isActive: z
      .boolean()
      .default(true),
  }).strict(),
});

/**
 * Esquema de validación para modificar parcialmente a un usuario (`PATCH /users/:id`).
 * Todos los campos del cuerpo de la petición son opcionales. Utiliza el método `.strict()`
 * para rechazar cualquier propiedad desconocida o no permitida.
 */
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
      .optional(), // Sin .default(): si no se envía, queda undefined y Prisma no lo sobreescribe
    isActive: z
      .boolean()
      .optional(),
  }).strict(),
});

export {
  CreateUserSchema,
  UpdateUserSchema,
  UserByIdSchema,
  GetUsersQuerySchema
};
