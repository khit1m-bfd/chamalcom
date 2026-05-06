import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth';
import { getNotifications, marquerLue, marquerToutesLues } from './notification.service';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET /notifications — liste pour l'utilisateur connecté
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, role } = (req as any).user;
    const result = await getNotifications(role, id);
    res.json({ success: true, data: result.data, unread: result.unread });
  } catch (err) {
    next(err);
  }
});

// PATCH /notifications/lu-tout — marquer toutes lues
router.patch('/lu-tout', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, role } = (req as any).user;
    await marquerToutesLues(role, id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /notifications/:id/lu — marquer une lue
router.patch('/:id/lu', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId, role } = (req as any).user;
    await marquerLue(Number(req.params.id), role, userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
