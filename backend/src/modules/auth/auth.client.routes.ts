import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { authLimiter } from '../../middlewares/rateLimiter';
import { authenticateToken } from '../../middlewares/auth';
import { clientRegisterSchema, clientLoginSchema } from './auth.schema';
import {
  handleClientRegister, handleClientLogin,
  handleRefreshToken, handleLogout, handleGetMe,
} from './auth.controller';
import { prisma } from '../../config/db';
import { success } from '../../types/models';
import { AppError } from '../../middlewares/errorHandler';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

router.post('/register', authLimiter, validate(clientRegisterSchema), handleClientRegister);
router.post('/login', authLimiter, validate(clientLoginSchema), handleClientLogin);
router.post('/refresh-token', handleRefreshToken);
router.post('/logout', handleLogout);
router.get('/me', authenticateToken, handleGetMe);

router.patch('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const { nom, prenom, telephone, nationalite } = req.body as Record<string, string>;
    const updated = await prisma.client.update({
      where: { id: req.user.id },
      data: { ...(nom && { nom }), ...(prenom && { prenom }), ...(telephone && { telephone }), ...(nationalite && { nationalite }) },
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, nationalite: true },
    });
    res.json(success(updated, 'Profil mis à jour'));
  } catch (err) { next(err); }
});

export default router;
