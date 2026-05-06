import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../utils/cloudinary';
import { env } from '../../config/env';

export async function uploadImages(
  id_appartement: number,
  id_proprietaire: number,
  files: Express.Multer.File[],
) {
  const appart = await prisma.appartement.findFirst({
    where: { id: id_appartement, id_proprietaire },
    select: { id: true, _count: { select: { images: true } } },
  });
  if (!appart) throw new AppError('Appartement introuvable ou non autorisé', 404);

  const currentCount = appart._count.images;
  if (currentCount + files.length > env.MAX_IMAGES_PER_APPART) {
    throw new AppError(`Maximum ${env.MAX_IMAGES_PER_APPART} images par appartement (actuellement ${currentCount})`, 400);
  }

  const hasPrincipal = await prisma.imageAppartement.findFirst({
    where: { id_appartement, est_principale: true },
  });

  const maxOrdre = await prisma.imageAppartement.aggregate({
    where: { id_appartement },
    _max: { ordre_affichage: true },
  });
  let ordre = (maxOrdre._max.ordre_affichage ?? -1) + 1;

  const uploaded = await Promise.all(
    files.map((file) => uploadImageToCloudinary(file.buffer)),
  );

  const images = await prisma.$transaction(
    uploaded.map((result, i) =>
      prisma.imageAppartement.create({
        data: {
          id_appartement,
          url_image: result.url,
          nom_fichier: files[i].originalname,
          taille_ko: Math.round(result.bytes / 1024),
          format: 'webp',
          est_principale: !hasPrincipal && i === 0,
          ordre_affichage: ordre++,
        },
      }),
    ),
  );

  return images;
}

export async function deleteImage(id: number, id_proprietaire: number) {
  const image = await prisma.imageAppartement.findUnique({
    where: { id },
    include: { appartement: { select: { id_proprietaire: true } } },
  });
  if (!image) throw new AppError('Image introuvable', 404);
  if (image.appartement.id_proprietaire !== id_proprietaire) throw new AppError('Non autorisé', 403);

  await deleteImageFromCloudinary(image.url_image);
  await prisma.imageAppartement.delete({ where: { id } });

  // Si c'était la principale, promouvoir la suivante
  if (image.est_principale) {
    const next = await prisma.imageAppartement.findFirst({
      where: { id_appartement: image.id_appartement },
      orderBy: { ordre_affichage: 'asc' },
    });
    if (next) {
      await prisma.imageAppartement.update({ where: { id: next.id }, data: { est_principale: true } });
    }
  }
}

export async function setPrincipale(id: number, id_proprietaire: number) {
  const image = await prisma.imageAppartement.findUnique({
    where: { id },
    include: { appartement: { select: { id_proprietaire: true, id: true } } },
  });
  if (!image) throw new AppError('Image introuvable', 404);
  if (image.appartement.id_proprietaire !== id_proprietaire) throw new AppError('Non autorisé', 403);

  await prisma.$transaction([
    prisma.imageAppartement.updateMany({
      where: { id_appartement: image.id_appartement },
      data: { est_principale: false },
    }),
    prisma.imageAppartement.update({ where: { id }, data: { est_principale: true } }),
  ]);

  return prisma.imageAppartement.findUnique({ where: { id } });
}
