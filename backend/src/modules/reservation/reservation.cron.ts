import cron from 'node-cron';
import { prisma } from '../../config/db';
import { logger } from '../../config/logger';
import { sendAnnulationReservation } from '../../utils/mailer';

// Toutes les heures — annule les réservations en_attente > 24h sans réponse du proprio
cron.schedule('0 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredReservations = await prisma.reservation.findMany({
      where: { statut: 'en_attente', created_at: { lt: cutoff } },
      include: {
        client: { select: { email: true, prenom: true } },
        appartement: { select: { titre: true } },
      },
    });

    if (expiredReservations.length === 0) return;

    logger.info(`Cron: ${expiredReservations.length} réservation(s) expirée(s) à annuler`);

    await prisma.reservation.updateMany({
      where: { id: { in: expiredReservations.map((r) => r.id) } },
      data: {
        statut: 'annulee_proprietaire',
        motif_annulation: 'Annulation automatique: aucune réponse du propriétaire sous 24h',
      },
    });

    // Notifier les clients
    await Promise.all(
      expiredReservations.map((r) =>
        sendAnnulationReservation({
          to: r.client.email,
          clientPrenom: r.client.prenom,
          appartementTitre: r.appartement.titre,
          motif: 'Le propriétaire n\'a pas répondu dans les 24h. Votre demande a été annulée automatiquement.',
        }),
      ),
    );

    logger.info(`Cron: ${expiredReservations.length} réservation(s) annulée(s)`);
  } catch (err) {
    logger.error('Cron annulation réservations échoué', { err });
  }
});

// Toutes les nuits à minuit — marquer les séjours terminés
cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.reservation.updateMany({
      where: { statut: 'confirmee', date_depart: { lt: today } },
      data: { statut: 'terminee' },
    });

    if (result.count > 0) {
      logger.info(`Cron: ${result.count} réservation(s) marquée(s) comme terminée(s)`);
    }
  } catch (err) {
    logger.error('Cron marquage terminée échoué', { err });
  }
});

logger.info('✅ Cron jobs réservations initialisés');
