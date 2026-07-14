import type { IBook } from "@modules/books/types";

interface IUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password: string;
  age: number;
  role: 'USER' | 'ADMIN';
  books: IBook[];
}

export {
  type IUser
};
