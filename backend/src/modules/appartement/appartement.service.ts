import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { getPaginationParams, getPrismaSkipTake, buildPaginationMeta } from '../../utils/pagination';
import { verifierDisponibilite } from '../../utils/disponibilite';
import type { CreateAppartementInput, UpdateAppartementInput, SearchAppartementInput } from './appartement.schema';
import type { Prisma } from '@prisma/client';

const APPARTEMENT_PUBLIC_SELECT = {
  id: true, titre: true, description: true, adresse: true, ville: true, region: true,
  surface_m2: true, nb_chambres: true, nb_salles_bain: true, capacite_max: true,
  prix_nuit: true, caution: true, equipements: true, statut: true,
  latitude: true, longitude: true, created_at: true, updated_at: true,
  proprietaire: {
    select: { id: true, nom: true, prenom: true, telephone: true, statut_verification: true },
  },
  images: {
    orderBy: [{ est_principale: 'desc' as const }, { ordre_affichage: 'asc' as const }],
    select: { id: true, url_image: true, est_principale: true, ordre_affichage: true },
  },
  _count: { select: { avis: { where: { statut: 'publie' as const } } } },
} satisfies Prisma.AppartementSelect;

export async function listAppartements(input: SearchAppartementInput) {
  const params = getPaginationParams(input);
  const { skip, take } = getPrismaSkipTake(params);

  const where: Prisma.AppartementWhereInput = {
    statut: 'disponible',
    ...(input.ville ? { ville: { contains: input.ville } } : {}),
    ...(input.nb_personnes ? { capacite_max: { gte: input.nb_personnes } } : {}),
    ...(input.nb_chambres ? { nb_chambres: { gte: input.nb_chambres } } : {}),
    ...(input.prix_min || input.prix_max
      ? { prix_nuit: { ...(input.prix_min ? { gte: input.prix_min } : {}), ...(input.prix_max ? { lte: input.prix_max } : {}) } }
      : {}),
  };

  const orderBy: Prisma.AppartementOrderByWithRelationInput =
    input.sort === 'prix_asc' ? { prix_nuit: 'asc' }
    : input.sort === 'prix_desc' ? { prix_nuit: 'desc' }
    : input.sort === 'recent' ? { created_at: 'desc' }
    : { created_at: 'desc' };

  const [items, total] = await Promise.all([
    prisma.appartement.findMany({ where, orderBy, skip, take, select: APPARTEMENT_PUBLIC_SELECT }),
    prisma.appartement.count({ where }),
  ]);

  // Filtrer disponibilité si dates fournies
  let filtered = items;
  if (input.date_arrivee && input.date_depart) {
    const arrivee = new Date(input.date_arrivee);
    const depart = new Date(input.date_depart);
    const disponibles = await Promise.all(
      items.map((a) => verifierDisponibilite({ id_appartement: a.id, date_arrivee: arrivee, date_depart: depart })),
    );
    filtered = items.filter((_, i) => disponibles[i]);
  }

  return { data: filtered, meta: buildPaginationMeta(params, total) };
}

export async function getAppartement(id: number) {
  const appart = await prisma.appartement.findFirst({
    where: { id, statut: { in: ['disponible', 'en_attente_validation'] } },
    select: APPARTEMENT_PUBLIC_SELECT,
  });
  if (!appart) throw new AppError('Appartement introuvable', 404);

  // Note moyenne via agrégation
  const agg = await prisma.avis.aggregate({
    where: { id_appartement: id, statut: 'publie' },
    _avg: { note_globale: true },
    _count: { id: true },
  });

  return { ...appart, note_moyenne: agg._avg.note_globale ?? 0, nb_avis: agg._count.id };
}

export async function createAppartement(id_proprietaire: number, input: CreateAppartementInput) {
  const proprio = await prisma.proprietaire.findUnique({
    where: { id: id_proprietaire },
    select: { statut_verification: true },
  });
  if (!proprio || proprio.statut_verification !== 'verifie') {
    throw new AppError('Compte non vérifié. Attendez la validation de l\'administration.', 403);
  }

  return prisma.appartement.create({
    data: { ...input, id_proprietaire, statut: 'en_attente_validation' },
    select: APPARTEMENT_PUBLIC_SELECT,
  });
}

export async function updateAppartement(id: number, id_proprietaire: number, input: UpdateAppartementInput) {
  const appart = await prisma.appartement.findFirst({ where: { id, id_proprietaire }, select: { id: true } });
  if (!appart) throw new AppError('Appartement introuvable ou non autorisé', 404);

  return prisma.appartement.update({
    where: { id },
    data: input,
    select: APPARTEMENT_PUBLIC_SELECT,
  });
}

export async function deleteAppartement(id: number, requesterId: number, requesterRole: string) {
  const appart = await prisma.appartement.findUnique({ where: { id }, select: { id: true, id_proprietaire: true } });
  if (!appart) throw new AppError('Appartement introuvable', 404);
  if (requesterRole !== 'admin' && appart.id_proprietaire !== requesterId) {
    throw new AppError('Non autorisé', 403);
  }

  const hasActiveReservation = await prisma.reservation.findFirst({
    where: { id_appartement: id, statut: { in: ['en_attente', 'confirmee'] } },
  });
  if (hasActiveReservation) throw new AppError('Impossible de supprimer: réservations actives en cours', 409);

  await prisma.appartement.update({ where: { id }, data: { statut: 'archive' } });
}

export async function getMesAnnonces(id_proprietaire: number) {
  return prisma.appartement.findMany({
    where: { id_proprietaire },
    orderBy: { created_at: 'desc' },
    select: {
      ...APPARTEMENT_PUBLIC_SELECT,
      _count: { select: { reservations: true, avis: true } },
    },
  });
}
