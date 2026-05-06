import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { getPaginationParams, getPrismaSkipTake, buildPaginationMeta } from '../../utils/pagination';
import { sendVerificationProprietaire } from '../../utils/mailer';

export async function getDashboardStats() {
  const [
    totalClients, totalProprietaires, totalAppartements, totalReservations,
    pendingOwners, pendingApartments, revenueAgg,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.proprietaire.count(),
    prisma.appartement.count({ where: { statut: 'disponible' } }),
    prisma.reservation.count(),
    prisma.proprietaire.count({ where: { statut_verification: 'en_attente' } }),
    prisma.appartement.count({ where: { statut: 'en_attente_validation' } }),
    prisma.paiement.aggregate({ where: { statut: 'valide' }, _sum: { montant: true, montant_commission: true } }),
  ]);

  // Réservations des 6 derniers mois
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await prisma.$queryRaw<Array<{ mois: string; reservations: number; revenus: number }>>`
    SELECT
      DATE_FORMAT(r.created_at, '%Y-%m') AS mois,
      COUNT(r.id) AS reservations,
      COALESCE(SUM(p.montant_commission), 0) AS revenus
    FROM reservation r
    LEFT JOIN paiement p ON p.id_reservation = r.id AND p.statut = 'valide'
    WHERE r.created_at >= ${sixMonthsAgo}
    GROUP BY DATE_FORMAT(r.created_at, '%Y-%m')
    ORDER BY mois ASC
  `;

  return {
    totalClients,
    totalProprietaires,
    totalAppartements,
    totalReservations,
    pendingOwners,
    pendingApartments,
    totalRevenue: Number(revenueAgg._sum.montant ?? 0),
    totalCommission: Number(revenueAgg._sum.montant_commission ?? 0),
    monthlyData,
  };
}

export async function listProprietaires(query: { page?: string; limit?: string; statut?: string }) {
  const params = getPaginationParams(query);
  const { skip, take } = getPrismaSkipTake(params);
  const where = query.statut ? { statut_verification: query.statut as 'en_attente' | 'verifie' | 'refuse' | 'suspendu' } : {};

  const [items, total] = await Promise.all([
    prisma.proprietaire.findMany({
      where, skip, take,
      orderBy: { date_inscription: 'desc' },
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, cin: true, rib: true, banque: true, statut_verification: true, date_inscription: true, date_verification: true, _count: { select: { appartements: true } } },
    }),
    prisma.proprietaire.count({ where }),
  ]);
  return { data: items, meta: buildPaginationMeta(params, total) };
}

export async function verifierProprietaire(
  id: number, adminId: number,
  statut: 'verifie' | 'refuse' | 'suspendu', motif?: string,
) {
  const proprio = await prisma.proprietaire.findUnique({ where: { id } });
  if (!proprio) throw new AppError('Propriétaire introuvable', 404);

  const updated = await prisma.proprietaire.update({
    where: { id },
    data: { statut_verification: statut, date_verification: new Date(), id_admin_verificateur: adminId },
  });

  void sendVerificationProprietaire({
    to: proprio.email,
    proprietairePrenom: proprio.prenom,
    statut: statut === 'verifie' ? 'verifie' : 'refuse',
    motif,
  });

  return updated;
}

export async function listAllAppartements(query: { page?: string; limit?: string; statut?: string }) {
  const params = getPaginationParams(query);
  const { skip, take } = getPrismaSkipTake(params);
  const where = query.statut ? { statut: query.statut as 'disponible' | 'en_attente_validation' | 'suspendu' | 'archive' } : {};

  const [items, total] = await Promise.all([
    prisma.appartement.findMany({
      where, skip, take,
      orderBy: { created_at: 'desc' },
      include: {
        proprietaire: { select: { id: true, nom: true, prenom: true, email: true } },
        images: { where: { est_principale: true }, take: 1 },
        _count: { select: { reservations: true } },
      },
    }),
    prisma.appartement.count({ where }),
  ]);
  return { data: items, meta: buildPaginationMeta(params, total) };
}

export async function validerAppartement(id: number, statut: 'disponible' | 'suspendu') {
  const appart = await prisma.appartement.findUnique({ where: { id } });
  if (!appart) throw new AppError('Appartement introuvable', 404);
  return prisma.appartement.update({ where: { id }, data: { statut } });
}

export async function listAllReservations(query: { page?: string; limit?: string }) {
  const params = getPaginationParams(query);
  const { skip, take } = getPrismaSkipTake(params);

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      skip, take,
      orderBy: { created_at: 'desc' },
      include: {
        client: { select: { id: true, nom: true, prenom: true, email: true } },
        appartement: { select: { id: true, titre: true, ville: true } },
        paiement: { select: { statut: true, montant: true } },
      },
    }),
    prisma.reservation.count(),
  ]);
  return { data: items, meta: buildPaginationMeta(params, total) };
}

export async function listAllClients(query: { page?: string; limit?: string; statut?: string }) {
  const params = getPaginationParams(query);
  const { skip, take } = getPrismaSkipTake(params);
  const where = query.statut ? { statut: query.statut as 'actif' | 'suspendu' } : {};

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where, skip, take,
      orderBy: { date_inscription: 'desc' },
      select: {
        id: true, nom: true, prenom: true, email: true, telephone: true,
        nationalite: true, statut: true, date_inscription: true,
        _count: { select: { reservations: true, avis: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);
  return { data: items, meta: buildPaginationMeta(params, total) };
}

export async function listAllAvis(query: { page?: string; limit?: string; statut?: string }) {
  const params = getPaginationParams(query);
  const { skip, take } = getPrismaSkipTake(params);
  const where = query.statut ? { statut: query.statut as 'en_attente' | 'publie' | 'masque' } : {};

  const [items, total] = await Promise.all([
    prisma.avis.findMany({
      where, skip, take,
      orderBy: { date_avis: 'desc' },
      include: {
        client: { select: { id: true, nom: true, prenom: true } },
        appartement: { select: { id: true, titre: true, ville: true } },
      },
    }),
    prisma.avis.count({ where }),
  ]);
  return { data: items, meta: buildPaginationMeta(params, total) };
}

export async function bloquerClient(id: number, statut: 'actif' | 'suspendu') {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new AppError('Client introuvable', 404);
  return prisma.client.update({ where: { id }, data: { statut } });
}

export async function listAllPaiements(query: { page?: string; limit?: string }) {
  const params = getPaginationParams(query);
  const { skip, take } = getPrismaSkipTake(params);

  const [items, total] = await Promise.all([
    prisma.paiement.findMany({
      skip, take,
      orderBy: { date_paiement: 'desc' },
      include: {
        reservation: {
          include: {
            client: { select: { id: true, nom: true, prenom: true } },
            appartement: { select: { id: true, titre: true, proprietaire: { select: { nom: true, prenom: true, rib: true } } } },
          },
        },
      },
    }),
    prisma.paiement.count(),
  ]);
  return { data: items, meta: buildPaginationMeta(params, total) };
}
