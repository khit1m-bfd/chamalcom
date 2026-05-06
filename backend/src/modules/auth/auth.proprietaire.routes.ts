import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { authLimiter } from '../../middlewares/rateLimiter';
import { authenticateToken } from '../../middlewares/auth';
import { proprietaireRegisterSchema, proprietaireLoginSchema } from './auth.schema';
import {
  handleProprietaireRegister, handleProprietaireLogin,
  handleRefreshToken, handleLogout, handleGetMe,
} from './auth.controller';

const router = Router();

/**
 * @swagger
 * /auth/proprietaire/register:
 *   post:
 *     tags: [Auth]
 *     summary: Inscription propriétaire
 *     security: []
 */
router.post('/register', authLimiter, validate(proprietaireRegisterSchema), handleProprietaireRegister);
router.post('/login', authLimiter, validate(proprietaireLoginSchema), handleProprietaireLogin);
router.post('/refresh-token', handleRefreshToken);
router.post('/logout', handleLogout);
router.get('/me', authenticateToken, handleGetMe);

export default router;
