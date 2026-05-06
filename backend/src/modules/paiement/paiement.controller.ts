import type { Request, Response, NextFunction } from 'express';
import { success } from '../../types/models';
import { AppError } from '../../middlewares/errorHandler';
import { createPaiementSchema, createPaiement, getPaiement, getMesPaiements, rembourserPaiement } from './paiement.service';

export async function handleCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const input = createPaiementSchema.parse(req.body);
    const paiement = await createPaiement(req.user.id, input);
    res.status(201).json(success(paiement, 'Paiement enregistré'));
  } catch (err) { next(err); }
}

export async function handleGetOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const paiement = await getPaiement(Number(req.params.id), req.user.id, req.user.role);
    res.json(success(paiement));
  } catch (err) { next(err); }
}

export async function handleMesPaiements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const paiements = await getMesPaiements(req.user.id);
    res.json(success(paiements));
  } catch (err) { next(err); }
}

export async function handleRembourser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const paiement = await rembourserPaiement(Number(req.params.id));
    res.json(success(paiement, 'Remboursement effectué'));
  } catch (err) { next(err); }
}
