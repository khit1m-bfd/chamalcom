import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]) as Record<string, unknown>;
      // Express 5 : req.query est un getter en lecture seule → utiliser Object.defineProperty
      if (target === 'query') {
        Object.defineProperty(req, 'query', {
          value: parsed,
          writable: true,
          configurable: true,
        });
      } else {
        req[target] = parsed as never;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(err);
      } else {
        next(err);
      }
    }
  };
}
