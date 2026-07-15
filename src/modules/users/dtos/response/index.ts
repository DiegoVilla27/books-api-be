import { type UserEntity } from '../../entities';

/**
 * DTO que define la estructura del objeto Usuario para respuestas de la API.
 * Filtra y omite datos confidenciales (como la contraseña encriptada `password`)
 * e información irrelevante del borrado físico para el frontend.
 */
export type UserResponseDTO = Omit<UserEntity, 'password' | 'deleteAt'>;
