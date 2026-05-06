import { prisma } from '../config/db';

export interface DisponibiliteParams {
  id_appartement: number;
  date_arrivee: Date;
  date_depart: Date;
  exclude_reservation_id?: number;
}

export async function verifierDisponibilite(params: DisponibiliteParams): Promise<boolean> {
  const { id_appartement, date_arrivee, date_depart, exclude_reservation_id } = params;

  const conflit = await prisma.reservation.findFirst({
    where: {
      id_appartement,
      statut: { in: ['en_attente', 'confirmee'] },
      ...(exclude_reservation_id ? { id: { not: exclude_reservation_id } } : {}),
      // Algorithme overlap: (arrivee < res.depart) AND (depart > res.arrivee)
      AND: [
        { date_arrivee: { lt: date_depart } },
        { date_depart: { gt: date_arrivee } },
      ],
    },
    select: { id: true },
  });

  return conflit === null;
}

export function calculerNbNuits(date_arrivee: Date, date_depart: Date): number {
  const diffMs = date_depart.getTime() - date_arrivee.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export async function getDatesReservees(id_appartement: number): Promise<
  Array<{ date_arrivee: Date; date_depart: Date }>
> {
  return prisma.reservation.findMany({
    where: {
      id_appartement,
      statut: { in: ['en_attente', 'confirmee'] },
    },
    select: { date_arrivee: true, date_depart: true },
    orderBy: { date_arrivee: 'asc' },
  });
}
