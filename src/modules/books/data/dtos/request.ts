import { z } from 'zod';
import { CreateBookSchema, UpdateBookSchema } from '../../schemas';

/**
 * Tipo que representa los datos necesarios en el cuerpo de una petición
 * para registrar un nuevo Libro. Inferido directamente de `CreateBookSchema`.
 */
export type CreateBookRequestDTO = z.infer<typeof CreateBookSchema>['body'];

/**
 * Tipo que representa los datos opcionales aceptados en el cuerpo de una petición
 * para actualizar parcialmente un Libro. Inferido directamente de `UpdateBookSchema`.
 */
export type UpdateBookRequestDTO = z.infer<typeof UpdateBookSchema>['body'];
