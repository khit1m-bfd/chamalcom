import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { AppError } from './errorHandler';
import { env } from '../config/env';

const MAX_SIZE_BYTES = env.MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Format non supporté: ${file.mimetype}. Utilisez JPG, PNG ou WebP.`, 400));
  }
}

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_BYTES,
    files: env.MAX_IMAGES_PER_APPART,
  },
});

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
});
