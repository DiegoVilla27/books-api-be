import sanitizeText from '@core/utils/sanitizeHtml';
import { z } from 'zod';

/**
 * Esquema de validación para el inicio de sesión (`POST /auth/login`).
 * Valida que el email tenga el formato adecuado y desinfecta ambos campos de texto.
 */
const LoginSchema = z.object({
  body: z.object({
    email: z
      .email('El email es inválido')
      .transform((val) => sanitizeText(val)),
    password: z
      .string()
      .min(3, 'La contraseña debe tener al menos 3 caracteres')
      .max(20, 'La contraseña debe tener como máximo 20 caracteres')
      .transform((val) => sanitizeText(val)),
  }).strict(),
});

/**
 * Esquema de validación para el registro de un nuevo usuario (`POST /auth/register`).
 * Valida los datos requeridos, aplica desinfección HTML a las entradas de texto
 * y comprueba mediante un refinamiento que la contraseña coincida con su confirmación.
 */
const RegisterSchema = z.object({
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
    passwordConfirmation: z
      .string()
      .min(3, 'La contraseña debe tener al menos 3 caracteres')
      .max(20, 'La contraseña debe tener como máximo 20 caracteres')
      .transform((val) => sanitizeText(val)),
    age: z
      .number()
      .min(18, 'Debes ser mayor de 18 años')
      .max(100, 'Debes ser menor de 100 años')
  }).strict()
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Las contraseñas no coinciden",
      path: ["passwordConfirmation"],
    }),
});

/**
 * Esquema de validación para refrescar los tokens de acceso (`POST /auth/refresh`).
 * Valida que el refresh token sea enviado como una cadena de caracteres.
 */
const RefreshTokenSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1, 'El refresh token es requerido'),
  }).strict(),
});

export {
  LoginSchema,
  RefreshTokenSchema,
  RegisterSchema
};
