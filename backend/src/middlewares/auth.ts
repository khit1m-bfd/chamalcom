import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './errorHandler';
import type { UserRole } from '../types/models';

export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Token d\'authentification manquant', 401);
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError('Token invalide ou expiré', 401));
    }
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Non authentifié', 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError('Accès interdit — rôle insuffisant', 403));
      return;
    }
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const payload = verifyAccessToken(token);
      req.user = { id: payload.id, role: payload.role, email: payload.email };
    } catch {
      // Token invalide ignoré silencieusement
    }
  }
  next();
}
