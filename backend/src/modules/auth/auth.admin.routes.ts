import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { authLimiter } from '../../middlewares/rateLimiter';
import { authenticateToken } from '../../middlewares/auth';
import { adminLoginSchema } from './auth.schema';
import { handleAdminLogin, handleRefreshToken, handleLogout, handleGetMe } from './auth.controller';

const router = Router();

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion Admin
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', authLimiter, validate(adminLoginSchema), handleAdminLogin);
router.post('/refresh-token', handleRefreshToken);
router.post('/logout', handleLogout);
router.get('/me', authenticateToken, handleGetMe);

export default router;
