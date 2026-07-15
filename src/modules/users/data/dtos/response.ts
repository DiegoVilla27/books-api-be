import { type UserEntity } from '../entity';

// El DTO de respuesta es igual a IUser pero sin la contraseña
export type UserResponseDTO = Omit<UserEntity, 'password' | 'deleteAt'>;
