import { type UserRole } from './models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
        email: string;
      };
    }
  }
}

export {};
