import { prisma } from '../../config/db';

export async function creerNotification(
  type_role: string,
  id_user: number,
  titre: string,
  message: string,
  lien?: string,
) {
  try {
    await (prisma as any).notification.create({
      data: { type_role, id_user, titre, message, lien: lien ?? null },
    });
  } catch {
    // notifications non bloquantes
  }
}

export async function getNotifications(type_role: string, id_user: number) {
  const items = await (prisma as any).notification.findMany({
    where: { type_role, id_user },
    orderBy: { created_at: 'desc' },
    take: 30,
  });
  const unread = await (prisma as any).notification.count({
    where: { type_role, id_user, lu: false },
  });
  return { data: items, unread };
}

export async function marquerLue(id: number, type_role: string, id_user: number) {
  await (prisma as any).notification.updateMany({
    where: { id, type_role, id_user },
    data: { lu: true },
  });
}

export async function marquerToutesLues(type_role: string, id_user: number) {
  await (prisma as any).notification.updateMany({
    where: { type_role, id_user, lu: false },
    data: { lu: true },
  });
}
