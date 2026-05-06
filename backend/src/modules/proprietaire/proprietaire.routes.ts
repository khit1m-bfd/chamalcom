import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middlewares/auth';
import { success } from '../../types/models';
import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import type { Request, Response, NextFunction } from 'express';

const router = Router();
router.use(authenticateToken, requireRole('proprietaire'));

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const id = req.user.id;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalAppartements, totalReservations, reservationsEnAttente,
      revenueAgg, noteAgg,
    ] = await Promise.all([
      prisma.appartement.count({ where: { id_proprietaire: id } }),
      prisma.reservation.count({ where: { appartement: { id_proprietaire: id } } }),
      prisma.reservation.count({ where: { appartement: { id_proprietaire: id }, statut: 'en_attente' } }),
      prisma.paiement.aggregate({
        where: { reservation: { appartement: { id_proprietaire: id } }, statut: 'valide' },
        _sum: { montant_proprietaire: true },
      }),
      prisma.avis.aggregate({
        where: { appartement: { id_proprietaire: id }, statut: 'publie' },
        _avg: { note_globale: true },
      }),
    ]);

    // Revenus mensuels 6 derniers mois
    const revenusMensuels = await prisma.$queryRaw<Array<{ mois: string; montant: number }>>`
      SELECT DATE_FORMAT(p.date_paiement, '%Y-%m') AS mois, SUM(p.montant_proprietaire) AS montant
      FROM paiement p
      INNER JOIN reservation r ON p.id_reservation = r.id
      INNER JOIN appartement a ON r.id_appartement = a.id
      WHERE a.id_proprietaire = ${id} AND p.statut = 'valide' AND p.date_paiement >= ${sixMonthsAgo}
      GROUP BY DATE_FORMAT(p.date_paiement, '%Y-%m')
      ORDER BY mois ASC
    `;

    // Taux d'occupation (réservations confirmées + terminées / jours disponibles)
    const reservationsActives = await prisma.reservation.count({
      where: { appartement: { id_proprietaire: id }, statut: { in: ['confirmee', 'terminee'] } },
    });
    const tauxOccupation = totalReservations > 0
      ? Math.round((reservationsActives / totalReservations) * 100)
      : 0;

    res.json(success({
      totalAppartements,
      totalReservations,
      reservationsEnAttente,
      totalRevenu: Number(revenueAgg._sum.montant_proprietaire ?? 0),
      noteMoyenne: Number(noteAgg._avg.note_globale ?? 0).toFixed(2),
      tauxOccupation,
      revenusMensuels,
    }));
  } catch (err) { next(err); }
});

router.get('/revenus', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const revenus = await prisma.paiement.findMany({
      where: { reservation: { appartement: { id_proprietaire: req.user.id } }, statut: 'valide' },
      orderBy: { date_paiement: 'desc' },
      include: {
        reservation: {
          select: {
            date_arrivee: true, date_depart: true, nb_nuits: true,
            appartement: { select: { titre: true } },
            client: { select: { nom: true, prenom: true } },
          },
        },
      },
    });
    res.json(success(revenus));
  } catch (err) { next(err); }
});

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const avisStats = await prisma.avis.groupBy({
      by: ['id_appartement'],
      where: { appartement: { id_proprietaire: req.user.id }, statut: 'publie' },
      _avg: { note_globale: true, note_proprete: true, note_localisation: true, note_rapport_qp: true, note_communication: true },
      _count: { id: true },
    });
    res.json(success({ avisParAppartement: avisStats }));
  } catch (err) { next(err); }
});

export default router;
