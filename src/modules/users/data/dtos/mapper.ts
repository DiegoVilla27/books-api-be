import { format } from "date-fns";
import type { UserModel } from "../model";
import type { UserResponseDTO } from "./response";

type UserBooks = UserModel & {
  _count?: {
    books: number;
  };
};

export const toUserResponseDTO = (user: UserBooks): UserResponseDTO => ({
  id: user.id,
  name: user.name,
  lastname: user.lastname,
  email: user.email,
  age: user.age,
  role: user.role,
  isActive: user.isActive,
  quantityBooks: user._count?.books ?? 0,
  createdAt: format(user.createdAt, 'dd/MM/yyyy'),
  updatedAt: user.updatedAt ? format(user.updatedAt, 'dd/MM/yyyy') : null,
})

export const toUserResponseDTOs = (users: UserBooks[]): UserResponseDTO[] => users.map((user) => toUserResponseDTO(user))