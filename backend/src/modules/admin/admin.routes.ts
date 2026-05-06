import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';
import { authenticateToken, requireRole } from '../../middlewares/auth';
import { success, paginated } from '../../types/models';
import { AppError } from '../../middlewares/errorHandler';
import {
  getDashboardStats, listProprietaires, verifierProprietaire,
  listAllAppartements, validerAppartement, listAllReservations, listAllPaiements,
  listAllClients, listAllAvis, bloquerClient,
} from './admin.service';
import type { Request, Response, NextFunction } from 'express';

const router = Router();
router.use(authenticateToken, requireRole('admin'));

const verifierSchema = z.object({
  statut: z.enum(['verifie', 'refuse', 'suspendu']),
  motif: z.string().max(500).optional(),
});
const validerSchema = z.object({ statut: z.enum(['disponible', 'suspendu']) });

router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(success(await getDashboardStats())); } catch (err) { next(err); }
});

router.get('/proprietaires', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listProprietaires(req.query as Record<string, string>);
    res.json(paginated(result.data, result.meta));
  } catch (err) { next(err); }
});

router.patch('/proprietaires/:id/verifier', validate(verifierSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const body = req.body as { statut: 'verifie' | 'refuse' | 'suspendu'; motif?: string };
    const proprio = await verifierProprietaire(Number(req.params.id), req.user.id, body.statut, body.motif);
    res.json(success(proprio, 'Statut propriétaire mis à jour'));
  } catch (err) { next(err); }
});

router.get('/appartements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listAllAppartements(req.query as Record<string, string>);
    res.json(paginated(result.data, result.meta));
  } catch (err) { next(err); }
});

router.patch('/appartements/:id/valider', validate(validerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as { statut: 'disponible' | 'suspendu' };
    const appart = await validerAppartement(Number(req.params.id), body.statut);
    res.json(success(appart, 'Statut appartement mis à jour'));
  } catch (err) { next(err); }
});

router.get('/reservations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listAllReservations(req.query as Record<string, string>);
    res.json(paginated(result.data, result.meta));
  } catch (err) { next(err); }
});

router.get('/paiements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listAllPaiements(req.query as Record<string, string>);
    res.json(paginated(result.data, result.meta));
  } catch (err) { next(err); }
});

router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(success(await getDashboardStats())); } catch (err) { next(err); }
});

router.get('/clients', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listAllClients(req.query as Record<string, string>);
    res.json(paginated(result.data, result.meta));
  } catch (err) { next(err); }
});

router.patch('/clients/:id/bloquer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as { statut: 'actif' | 'suspendu' };
    const client = await bloquerClient(Number(req.params.id), body.statut);
    res.json(success(client, 'Statut client mis à jour'));
  } catch (err) { next(err); }
});

router.get('/avis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listAllAvis(req.query as Record<string, string>);
    res.json(paginated(result.data, result.meta));
  } catch (err) { next(err); }
});

export default router;
