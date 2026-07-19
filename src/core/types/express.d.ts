import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        lastname: string;
        email: string;
        role: string;
      };
    }
  }
}
