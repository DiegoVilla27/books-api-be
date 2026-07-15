interface UserEntity {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password: string;
  age: number;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  quantityBooks?: number;
  createdAt: string;
  updatedAt: string | null;
}

export {
  type UserEntity
};
