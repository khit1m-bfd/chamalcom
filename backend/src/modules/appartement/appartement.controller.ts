import type { Request, Response, NextFunction } from 'express';
import { success, paginated } from '../../types/models';
import { AppError } from '../../middlewares/errorHandler';
import { verifierDisponibilite, getDatesReservees } from '../../utils/disponibilite';
import {
  listAppartements, getAppartement, createAppartement,
  updateAppartement, deleteAppartement, getMesAnnonces,
} from './appartement.service';

export async function handleList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await listAppartements(req.query as unknown as Parameters<typeof listAppartements>[0]);
    res.json(paginated(result.data, result.meta));
  } catch (err) { next(err); }
}

export async function handleGetOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appart = await getAppartement(Number(req.params.id));
    res.json(success(appart));
  } catch (err) { next(err); }
}

export async function handleCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const appart = await createAppartement(req.user.id, req.body as Parameters<typeof createAppartement>[1]);
    res.status(201).json(success(appart, 'Appartement soumis pour validation'));
  } catch (err) { next(err); }
}

export async function handleUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const appart = await updateAppartement(Number(req.params.id), req.user.id, req.body as Parameters<typeof updateAppartement>[2]);
    res.json(success(appart, 'Appartement mis à jour'));
  } catch (err) { next(err); }
}

export async function handleDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    await deleteAppartement(Number(req.params.id), req.user.id, req.user.role);
    res.json(success(null, 'Appartement archivé'));
  } catch (err) { next(err); }
}

export async function handleMesAnnonces(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const annonces = await getMesAnnonces(req.user.id);
    res.json(success(annonces));
  } catch (err) { next(err); }
}

export async function handleDisponibilite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id_appartement, date_arrivee, date_depart } = req.query as Record<string, string>;
    const dispo = await verifierDisponibilite({
      id_appartement: Number(id_appartement),
      date_arrivee: new Date(date_arrivee),
      date_depart: new Date(date_depart),
    });
    const dates_reservees = await getDatesReservees(Number(id_appartement));
    res.json(success({ disponible: dispo, dates_reservees }));
  } catch (err) { next(err); }
}
