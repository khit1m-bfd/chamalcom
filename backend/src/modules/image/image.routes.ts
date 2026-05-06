import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth';
import { uploadImages as uploadMiddleware, uploadSingle } from '../../middlewares/upload';
import { uploadLimiter } from '../../middlewares/rateLimiter';
import { handleUpload, handleDelete, handleSetPrincipale } from './image.controller';

const router = Router();

// POST /appartements/:id/images — monté depuis appartement.routes aussi
router.post(
  '/appartements/:id/images',
  authenticateToken,
  requireRole('proprietaire'),
  uploadLimiter,
  uploadMiddleware.array('images', 15),
  handleUpload,
);

router.delete('/:id', authenticateToken, requireRole('proprietaire'), handleDelete);
router.patch('/:id/principale', authenticateToken, requireRole('proprietaire'), handleSetPrincipale);

// Supprime les lignes inutilisées
void uploadSingle;

export default router;
