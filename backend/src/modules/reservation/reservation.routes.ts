import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { authenticateToken, requireRole } from '../../middlewares/auth';
import { createReservationSchema, annulerReservationSchema } from './reservation.schema';
import {
  handleCreate, handleGetOne, handleMesReservations,
  handleMesDemandes, handleConfirmer, handleAnnuler,
} from './reservation.controller';

const router = Router();

router.post('/', authenticateToken, requireRole('client'), validate(createReservationSchema), handleCreate);
router.get('/mes-reservations', authenticateToken, requireRole('client'), handleMesReservations);
router.get('/mes-demandes', authenticateToken, requireRole('proprietaire'), handleMesDemandes);
router.get('/:id', authenticateToken, handleGetOne);
router.patch('/:id/confirmer', authenticateToken, requireRole('proprietaire'), handleConfirmer);
router.patch('/:id/annuler', authenticateToken, validate(annulerReservationSchema), handleAnnuler);

export default router;
