import type { Request, Response, NextFunction } from 'express';
import { success } from '../../types/models';
import { AppError } from '../../middlewares/errorHandler';
import { uploadImages, deleteImage, setPrincipale } from './image.service';

export async function handleUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw new AppError('Aucun fichier fourni', 400);
    const images = await uploadImages(Number(req.params.id), req.user.id, files);
    res.status(201).json(success(images, `${images.length} image(s) uploadée(s)`));
  } catch (err) { next(err); }
}

export async function handleDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    await deleteImage(Number(req.params.id), req.user.id);
    res.json(success(null, 'Image supprimée'));
  } catch (err) { next(err); }
}

export async function handleSetPrincipale(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const image = await setPrincipale(Number(req.params.id), req.user.id);
    res.json(success(image, 'Image principale définie'));
  } catch (err) { next(err); }
}
