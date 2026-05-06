import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { env } from '../config/env';
import { logger } from '../config/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder = 'chamalcom/appartements',
): Promise<UploadResult> {
  // Resize + convert to WebP via Sharp
  const processedBuffer = await sharp(buffer)
    .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        format: 'webp',
        transformation: [{ quality: 'auto', fetch_format: 'webp' }],
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary upload error', { error });
          reject(new Error('Échec de l\'upload vers Cloudinary'));
          return;
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      },
    );
    stream.end(processedBuffer);
  });
}

export async function deleteImageFromCloudinary(public_id: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    logger.error('Cloudinary delete error', { public_id, err });
  }
}

export function extractPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  const subfolder = parts[parts.length - 3];
  return `${subfolder}/${folder}/${fileName.split('.')[0]}`;
}
