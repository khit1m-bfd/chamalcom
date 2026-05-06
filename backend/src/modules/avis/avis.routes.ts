import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { authenticateToken, requireRole, optionalAuth } from '../../middlewares/auth';
import { createAvisSchema, reponseAvisSchema, modererAvisSchema } from './avis.schema';
import { createAvis, getAvisAppartement, getMesAvis, repondreAvis, modererAvis } from './avis.service';
import { success } from '../../types/models';
import { AppError } from '../../middlewares/errorHandler';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

router.post('/', authenticateToken, requireRole('client'), validate(createAvisSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const avis = await createAvis(req.user.id, req.body as Parameters<typeof createAvis>[1]);
    res.status(201).json(success(avis, 'Avis soumis, en attente de modération'));
  } catch (err) { next(err); }
});

router.get('/appartement/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const avis = await getAvisAppartement(Number(req.params.id));
    res.json(success(avis));
  } catch (err) { next(err); }
});

router.get('/mes-avis', authenticateToken, requireRole('client'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const avis = await getMesAvis(req.user.id);
    res.json(success(avis));
  } catch (err) { next(err); }
});

router.patch('/:id/reponse', authenticateToken, requireRole('proprietaire'), validate(reponseAvisSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const avis = await repondreAvis(Number(req.params.id), req.user.id, req.body as Parameters<typeof repondreAvis>[2]);
    res.json(success(avis, 'Réponse publiée'));
  } catch (err) { next(err); }
});

router.patch('/:id/moderer', authenticateToken, requireRole('admin'), validate(modererAvisSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const avis = await modererAvis(Number(req.params.id), req.body as Parameters<typeof modererAvis>[1]);
    res.json(success(avis, 'Statut de l\'avis mis à jour'));
  } catch (err) { next(err); }
});

export default router;
