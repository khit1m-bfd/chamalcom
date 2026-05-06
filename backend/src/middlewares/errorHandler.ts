import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Request error', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({ success: false, error: 'Données invalides', details });
    return;
  }

  // App business error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Prisma unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[]) ?? [];
      res.status(409).json({
        success: false,
        error: `Valeur déjà utilisée: ${fields.join(', ')}`,
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Ressource introuvable' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ success: false, error: 'Référence invalide (clé étrangère)' });
      return;
    }
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Erreur serveur interne' : err.message,
  });
}
