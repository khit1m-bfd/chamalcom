import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  MAIL_HOST: z.string().default('smtp.gmail.com'),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('ChamalCom <noreply@chamalcom.ma>'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  COMMISSION_RATE: z.coerce.number().default(10),
  MAX_IMAGES_PER_APPART: z.coerce.number().default(15),
  MAX_IMAGE_SIZE_MB: z.coerce.number().default(5),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    throw new Error(`❌ Variables d'environnement invalides:\n${JSON.stringify(errors, null, 2)}`);
  }
  return result.data;
}

export const env = validateEnv();
