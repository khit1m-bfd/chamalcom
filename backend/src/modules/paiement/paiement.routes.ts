import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth';
import { handleCreate, handleGetOne, handleMesPaiements, handleRembourser } from './paiement.controller';

const router = Router();

router.post('/', authenticateToken, requireRole('client'), handleCreate);
router.get('/mes-paiements', authenticateToken, requireRole('client'), handleMesPaiements);
router.get('/:id', authenticateToken, handleGetOne);
router.patch('/:id/rembourser', authenticateToken, requireRole('admin'), handleRembourser);

export default router;
