interface UserModel {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password: string;
  age: number;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export {
  type UserModel
};
