import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[0-9]/, 'Au moins un chiffre');

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminLoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// ─── Propriétaire ─────────────────────────────────────────────────────────────
export const proprietaireRegisterSchema = z.object({
  nom: z.string().min(2).max(100),
  prenom: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordSchema,
  telephone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, 'Numéro de téléphone invalide'),
  cin: z.string().min(5).max(20),
  rib: z.string().max(50).optional(),
  banque: z.string().max(100).optional(),
});

export const proprietaireLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Client ───────────────────────────────────────────────────────────────────
export const clientRegisterSchema = z.object({
  nom: z.string().min(2).max(100),
  prenom: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordSchema,
  telephone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/)
    .optional(),
  date_naissance: z.string().date().optional(),
  nationalite: z.string().max(100).optional(),
  adresse: z.string().max(500).optional(),
});

export const clientLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Refresh token ─────────────────────────────────────────────────────────────
export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type ProprietaireRegisterInput = z.infer<typeof proprietaireRegisterSchema>;
export type ProprietaireLoginInput = z.infer<typeof proprietaireLoginSchema>;
export type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;
export type ClientLoginInput = z.infer<typeof clientLoginSchema>;
