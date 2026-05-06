import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { authenticateToken, requireRole, optionalAuth } from '../../middlewares/auth';
import {
  createAppartementSchema, updateAppartementSchema,
  searchAppartementSchema, disponibiliteQuerySchema,
} from './appartement.schema';
import {
  handleList, handleGetOne, handleCreate, handleUpdate,
  handleDelete, handleMesAnnonces, handleDisponibilite,
} from './appartement.controller';

const router = Router();

// Public
router.get('/', validate(searchAppartementSchema, 'query'), handleList);
router.get('/disponibilite', validate(disponibiliteQuerySchema, 'query'), handleDisponibilite);

// Propriétaire
router.get('/mes-annonces', authenticateToken, requireRole('proprietaire'), handleMesAnnonces);

// Public (doit être après les routes statiques)
router.get('/:id', optionalAuth, handleGetOne);

// Propriétaire vérifié
router.post('/', authenticateToken, requireRole('proprietaire'), validate(createAppartementSchema), handleCreate);
router.put('/:id', authenticateToken, requireRole('proprietaire'), validate(updateAppartementSchema), handleUpdate);
router.delete('/:id', authenticateToken, requireRole('proprietaire', 'admin'), handleDelete);

export default router;
