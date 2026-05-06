import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { verifierDisponibilite, calculerNbNuits } from '../../utils/disponibilite';
import {
  sendConfirmationReservation, sendDemandeReservation, sendAnnulationReservation,
} from '../../utils/mailer';
import { creerNotification } from '../notification/notification.service';
import type { CreateReservationInput, AnnulerReservationInput } from './reservation.schema';

const RESERVATION_DETAIL_SELECT = {
  id: true, date_arrivee: true, date_depart: true, nb_nuits: true,
  nb_personnes: true, prix_nuit_applique: true, prix_total: true,
  statut: true, message_client: true, motif_annulation: true,
  created_at: true, date_confirmation: true,
  client: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
  appartement: {
    select: {
      id: true, titre: true, adresse: true, ville: true, prix_nuit: true,
      proprietaire: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
      images: { where: { est_principale: true }, select: { url_image: true }, take: 1 },
    },
  },
  paiement: { select: { id: true, statut: true, methode: true, montant: true } },
} as const;

export async function createReservation(id_client: number, input: CreateReservationInput) {
  const { id_appartement, date_arrivee: da, date_depart: dd, nb_personnes, message_client } = input;
  const date_arrivee = new Date(da);
  const date_depart = new Date(dd);

  const appart = await prisma.appartement.findFirst({
    where: { id: id_appartement, statut: 'disponible' },
    include: { proprietaire: { select: { email: true, prenom: true } } },
  });
  if (!appart) throw new AppError('Appartement non disponible', 404);
  if (appart.capacite_max < nb_personnes) {
    throw new AppError(`Capacité max: ${appart.capacite_max} personnes`, 400);
  }

  const dispo = await verifierDisponibilite({ id_appartement, date_arrivee, date_depart });
  if (!dispo) throw new AppError('Appartement non disponible pour ces dates', 409);

  const nb_nuits = calculerNbNuits(date_arrivee, date_depart);
  const prix_nuit_applique = Number(appart.prix_nuit);
  const prix_total = prix_nuit_applique * nb_nuits;

  const reservation = await prisma.reservation.create({
    data: {
      id_client, id_appartement, date_arrivee, date_depart,
      nb_nuits, nb_personnes, prix_nuit_applique, prix_total,
      message_client, statut: 'en_attente',
    },
    select: RESERVATION_DETAIL_SELECT,
  });

  // Notifier le propriétaire (notification in-app)
  void creerNotification(
    'proprietaire', appart.id_proprietaire,
    'طلب حجز جديد',
    `طلب حجز جديد للشقة "${appart.titre}"`,
    `/ar/reservation/${reservation.id}`,
  );

  const client = await prisma.client.findUnique({ where: { id: id_client }, select: { nom: true, prenom: true, email: true } });
  if (client && appart.proprietaire) {
    void sendDemandeReservation({
      to: appart.proprietaire.email,
      proprietairePrenom: appart.proprietaire.prenom,
      clientNom: `${client.prenom} ${client.nom}`,
      appartementTitre: appart.titre,
      dateArrivee: da,
      dateDepart: dd,
      nbPersonnes: nb_personnes,
      reservationId: reservation.id,
    });
  }

  return reservation;
}

export async function getReservation(id: number, requesterId: number, requesterRole: string) {
  const res = await prisma.reservation.findUnique({ where: { id }, select: RESERVATION_DETAIL_SELECT });
  if (!res) throw new AppError('Réservation introuvable', 404);

  const isOwner = requesterRole === 'client' && res.client.id === requesterId;
  const isProprio = requesterRole === 'proprietaire' && res.appartement.proprietaire.id === requesterId;
  if (!isOwner && !isProprio && requesterRole !== 'admin') throw new AppError('Non autorisé', 403);

  return res;
}

export async function getMesReservations(id_client: number) {
  return prisma.reservation.findMany({
    where: { id_client },
    orderBy: { created_at: 'desc' },
    select: RESERVATION_DETAIL_SELECT,
  });
}

export async function getMesDemandes(id_proprietaire: number) {
  return prisma.reservation.findMany({
    where: { appartement: { id_proprietaire } },
    orderBy: { created_at: 'desc' },
    select: RESERVATION_DETAIL_SELECT,
  });
}

export async function confirmerReservation(id: number, id_proprietaire: number) {
  const res = await prisma.reservation.findFirst({
    where: { id, appartement: { id_proprietaire }, statut: 'en_attente' },
    include: { client: { select: { id: true, email: true, prenom: true } }, appartement: { select: { titre: true } } },
  });
  if (!res) throw new AppError('Réservation introuvable ou déjà traitée', 404);

  const updated = await prisma.reservation.update({
    where: { id },
    data: { statut: 'confirmee', date_confirmation: new Date() },
    select: RESERVATION_DETAIL_SELECT,
  });

  void sendConfirmationReservation({
    to: res.client.email,
    clientPrenom: res.client.prenom,
    appartementTitre: res.appartement.titre,
    dateArrivee: res.date_arrivee.toISOString().split('T')[0],
    dateDepart: res.date_depart.toISOString().split('T')[0],
    nbNuits: res.nb_nuits,
    prixTotal: Number(res.prix_total),
    reservationId: id,
  });

  // Notifier le client (notification in-app)
  void creerNotification(
    'client', res.client.id,
    'تم تأكيد حجزك ✅',
    `تم تأكيد حجزك في "${res.appartement.titre}" — يمكنك الآن إتمام الدفع`,
    `/ar/reservation/${id}`,
  );

  return updated;
}

export async function annulerReservation(
  id: number, requesterId: number, requesterRole: string, input: AnnulerReservationInput,
) {
  const res = await prisma.reservation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, email: true, prenom: true } },
      appartement: { select: { titre: true, id_proprietaire: true } },
    },
  });
  if (!res) throw new AppError('Réservation introuvable', 404);
  if (!['en_attente', 'confirmee'].includes(res.statut)) {
    throw new AppError('Cette réservation ne peut plus être annulée', 400);
  }

  const isClient = requesterRole === 'client' && res.client.id === requesterId;
  const isProprio = requesterRole === 'proprietaire' && res.appartement.id_proprietaire === requesterId;
  if (!isClient && !isProprio && requesterRole !== 'admin') throw new AppError('Non autorisé', 403);

  const newStatut = isClient ? 'annulee_client' : 'annulee_proprietaire';

  const updated = await prisma.reservation.update({
    where: { id },
    data: { statut: newStatut, motif_annulation: input.motif_annulation },
    select: RESERVATION_DETAIL_SELECT,
  });

  void sendAnnulationReservation({
    to: res.client.email,
    clientPrenom: res.client.prenom,
    appartementTitre: res.appartement.titre,
    motif: input.motif_annulation,
  });

  // Notifications in-app
  if (isClient) {
    void creerNotification(
      'proprietaire', res.appartement.id_proprietaire,
      'إلغاء حجز',
      `تم إلغاء الحجز في "${res.appartement.titre}" من قِبَل العميل`,
      `/ar/reservation/${id}`,
    );
  } else {
    void creerNotification(
      'client', res.client.id,
      'إلغاء حجز ❌',
      `تم إلغاء حجزك في "${res.appartement.titre}" من قِبَل المالك`,
      `/ar/reservation/${id}`,
    );
  }

  return updated;
}
