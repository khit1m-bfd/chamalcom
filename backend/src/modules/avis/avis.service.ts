import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import type { CreateAvisInput, ReponseAvisInput, ModererAvisInput } from './avis.schema';

const AVIS_SELECT = {
  id: true, note_proprete: true, note_localisation: true, note_rapport_qp: true,
  note_communication: true, note_globale: true, commentaire: true,
  reponse_proprietaire: true, date_avis: true, statut: true,
  client: { select: { id: true, nom: true, prenom: true, nationalite: true } },
  appartement: { select: { id: true, titre: true, ville: true } },
  reservation: { select: { id: true, date_arrivee: true, date_depart: true } },
} as const;

export async function createAvis(id_client: number, input: CreateAvisInput) {
  // Vérifier réservation terminée et appartenant au client
  const reservation = await prisma.reservation.findFirst({
    where: { id: input.id_reservation, id_client, statut: 'terminee' },
    select: { id: true, id_appartement: true },
  });
  if (!reservation) throw new AppError('Réservation introuvable ou séjour non terminé', 403);

  // Vérifier qu'il n'y a pas déjà un avis
  const existing = await prisma.avis.findUnique({ where: { id_reservation: input.id_reservation } });
  if (existing) throw new AppError('Un avis existe déjà pour cette réservation', 409);

  // Calculer note globale = moyenne des 4 notes
  const note_globale = parseFloat(
    ((input.note_proprete + input.note_localisation + input.note_rapport_qp + input.note_communication) / 4).toFixed(2),
  );

  return prisma.avis.create({
    data: {
      id_client,
      id_appartement: reservation.id_appartement,
      id_reservation: input.id_reservation,
      note_proprete: input.note_proprete,
      note_localisation: input.note_localisation,
      note_rapport_qp: input.note_rapport_qp,
      note_communication: input.note_communication,
      note_globale,
      commentaire: input.commentaire,
      statut: 'en_attente',
    },
    select: AVIS_SELECT,
  });
}

export async function getAvisAppartement(id_appartement: number) {
  return prisma.avis.findMany({
    where: { id_appartement, statut: 'publie' },
    orderBy: { date_avis: 'desc' },
    select: AVIS_SELECT,
  });
}

export async function getMesAvis(id_client: number) {
  return prisma.avis.findMany({
    where: { id_client },
    orderBy: { date_avis: 'desc' },
    select: AVIS_SELECT,
  });
}

export async function repondreAvis(id: number, id_proprietaire: number, input: ReponseAvisInput) {
  const avis = await prisma.avis.findFirst({
    where: { id, appartement: { id_proprietaire }, statut: 'publie' },
  });
  if (!avis) throw new AppError('Avis introuvable ou non autorisé', 404);

  return prisma.avis.update({
    where: { id },
    data: { reponse_proprietaire: input.reponse_proprietaire },
    select: AVIS_SELECT,
  });
}

export async function modererAvis(id: number, input: ModererAvisInput) {
  const avis = await prisma.avis.findUnique({ where: { id } });
  if (!avis) throw new AppError('Avis introuvable', 404);

  return prisma.avis.update({
    where: { id },
    data: { statut: input.statut },
    select: AVIS_SELECT,
  });
}
