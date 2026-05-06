import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { env } from '../../config/env';
import { creerNotification } from '../notification/notification.service';
import { z } from 'zod';

export const createPaiementSchema = z.object({
  id_reservation: z.coerce.number().int().positive(),
  methode: z.enum(['CMI', 'PayPal', 'virement_bancaire', 'especes']),
  reference_externe: z.string().max(255).optional(),
});

export type CreatePaiementInput = z.infer<typeof createPaiementSchema>;

const PAIEMENT_SELECT = {
  id: true, montant: true, taux_commission: true, montant_commission: true,
  montant_proprietaire: true, methode: true, statut: true,
  reference_externe: true, date_paiement: true, date_remboursement: true,
  reservation: {
    select: {
      id: true, date_arrivee: true, date_depart: true, nb_nuits: true,
      prix_total: true, statut: true,
      client: { select: { id: true, nom: true, prenom: true, email: true } },
      appartement: { select: { id: true, titre: true, ville: true, id_proprietaire: true } },
    },
  },
} as const;

export async function createPaiement(id_client: number, input: CreatePaiementInput) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: input.id_reservation, id_client, statut: 'confirmee' },
  });
  if (!reservation) throw new AppError('Réservation introuvable ou non confirmée', 404);

  const existing = await prisma.paiement.findUnique({ where: { id_reservation: input.id_reservation } });
  if (existing) throw new AppError('Paiement déjà effectué pour cette réservation', 409);

  const montant = Number(reservation.prix_total);
  const taux = env.COMMISSION_RATE;
  const montant_commission = parseFloat((montant * taux / 100).toFixed(2));
  const montant_proprietaire = parseFloat((montant - montant_commission).toFixed(2));

  const paiement = await prisma.paiement.create({
    data: {
      id_reservation: input.id_reservation,
      montant,
      taux_commission: taux,
      montant_commission,
      montant_proprietaire,
      methode: input.methode,
      statut: 'valide',
      reference_externe: input.reference_externe,
      date_paiement: new Date(),
    },
    select: PAIEMENT_SELECT,
  });

  // Notifications in-app
  void creerNotification(
    'client', id_client,
    'تم الدفع بنجاح ✅',
    `تم تأكيد دفعك بمبلغ ${montant} درهم`,
    `/ar/reservation/${input.id_reservation}`,
  );
  void creerNotification(
    'proprietaire', paiement.reservation.appartement.id_proprietaire,
    'دفع مُستلم 💰',
    `استلمت دفعة بمبلغ ${montant_proprietaire} درهم للشقة "${paiement.reservation.appartement.titre}"`,
    `/ar/reservation/${input.id_reservation}`,
  );

  return paiement;
}

export async function getPaiement(id: number, requesterId: number, requesterRole: string) {
  const paiement = await prisma.paiement.findUnique({ where: { id }, select: PAIEMENT_SELECT });
  if (!paiement) throw new AppError('Paiement introuvable', 404);

  const isClient = requesterRole === 'client' && paiement.reservation.client.id === requesterId;
  const isProprio = requesterRole === 'proprietaire' && paiement.reservation.appartement.id_proprietaire === requesterId;
  if (!isClient && !isProprio && requesterRole !== 'admin') throw new AppError('Non autorisé', 403);

  return paiement;
}

export async function getMesPaiements(id_client: number) {
  return prisma.paiement.findMany({
    where: { reservation: { id_client } },
    orderBy: { date_paiement: 'desc' },
    select: PAIEMENT_SELECT,
  });
}

export async function rembourserPaiement(id: number) {
  const paiement = await prisma.paiement.findUnique({ where: { id } });
  if (!paiement) throw new AppError('Paiement introuvable', 404);
  if (paiement.statut !== 'valide') throw new AppError('Seuls les paiements validés peuvent être remboursés', 400);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.paiement.update({
      where: { id },
      data: { statut: 'rembourse', date_remboursement: new Date() },
      select: PAIEMENT_SELECT,
    });
    await tx.reservation.update({
      where: { id: paiement.id_reservation },
      data: { statut: 'annulee_client' },
    });
    return updated;
  });
}
