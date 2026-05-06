import type { Request, Response, NextFunction } from 'express';
import { success } from '../../types/models';
import { AppError } from '../../middlewares/errorHandler';
import {
  createReservation, getReservation, getMesReservations,
  getMesDemandes, confirmerReservation, annulerReservation,
} from './reservation.service';

export async function handleCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const res_ = await createReservation(req.user.id, req.body as Parameters<typeof createReservation>[1]);
    res.status(201).json(success(res_, 'Demande de réservation envoyée'));
  } catch (err) { next(err); }
}

export async function handleGetOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const reservation = await getReservation(Number(req.params.id), req.user.id, req.user.role);
    res.json(success(reservation));
  } catch (err) { next(err); }
}

export async function handleMesReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const reservations = await getMesReservations(req.user.id);
    res.json(success(reservations));
  } catch (err) { next(err); }
}

export async function handleMesDemandes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const demandes = await getMesDemandes(req.user.id);
    res.json(success(demandes));
  } catch (err) { next(err); }
}

export async function handleConfirmer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const reservation = await confirmerReservation(Number(req.params.id), req.user.id);
    res.json(success(reservation, 'Réservation confirmée'));
  } catch (err) { next(err); }
}

export async function handleAnnuler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const reservation = await annulerReservation(
      Number(req.params.id), req.user.id, req.user.role, req.body as Parameters<typeof annulerReservation>[3],
    );
    res.json(success(reservation, 'Réservation annulée'));
  } catch (err) { next(err); }
}
