import { z } from 'zod';
import sanitizeText from '@core/utils/sanitizeHtml';

/**
 * Esquema de validación para solicitudes que requieren un ID de libro en los parámetros de ruta (`req.params`).
 * Valida que el ID sea una cadena compuesta por dígitos y lo transforma a un tipo numérico de JavaScript.
 */
const BookByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido') // Solo números
      .transform((val) => parseInt(val, 10)),            // Transforma a número
  }),
});

/**
 * Esquema de validación para la creación de un libro (`POST /books`).
 * Valida los datos requeridos en el cuerpo (`req.body`), eliminando etiquetas HTML de títulos y autores,
 * y requiriendo un ID numérico válido de usuario propietario (`userId`).
 * Utiliza `.strict()` para rechazar campos no especificados.
 */
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
  }).strict(),
});

/**
 * Esquema de validación para la actualización parcial de un libro (`PATCH /books/:id`).
 * Todos los campos del cuerpo (`req.body`) son opcionales. Aplica las mismas validaciones
 * y desinfecciones HTML que la creación.
 * Utiliza `.strict()` para rechazar campos desconocidos.
 */
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
  }).strict(),
});

export {
  CreateBookSchema,
  UpdateBookSchema,
  BookByIdSchema
}