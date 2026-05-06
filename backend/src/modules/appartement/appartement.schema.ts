import { z } from 'zod';

export const createAppartementSchema = z.object({
  titre: z.string().min(5).max(255),
  description: z.string().min(20),
  adresse: z.string().min(5).max(500),
  ville: z.string().max(100).default('Oued Laou'),
  region: z.string().max(150).default('Tanger-Tétouan-Al Hoceima'),
  surface_m2: z.coerce.number().positive(),
  nb_chambres: z.coerce.number().int().min(1),
  nb_salles_bain: z.coerce.number().int().min(1),
  capacite_max: z.coerce.number().int().min(1),
  prix_nuit: z.coerce.number().positive(),
  caution: z.coerce.number().min(0).default(0),
  equipements: z.string().or(z.array(z.string())).transform((v) =>
    typeof v === 'string' ? v : JSON.stringify(v),
  ),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const updateAppartementSchema = createAppartementSchema.partial().extend({
  statut: z.enum(['disponible', 'suspendu', 'archive']).optional(),
});

export const searchAppartementSchema = z.object({
  ville: z.string().optional(),
  date_arrivee: z.string().date().optional(),
  date_depart: z.string().date().optional(),
  nb_personnes: z.coerce.number().int().min(1).optional(),
  prix_min: z.coerce.number().min(0).optional(),
  prix_max: z.coerce.number().min(0).optional(),
  nb_chambres: z.coerce.number().int().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sort: z.enum(['prix_asc', 'prix_desc', 'note_desc', 'recent']).default('recent'),
});

export const disponibiliteQuerySchema = z.object({
  id_appartement: z.coerce.number().int().positive(),
  date_arrivee: z.string().date(),
  date_depart: z.string().date(),
});

export type CreateAppartementInput = z.infer<typeof createAppartementSchema>;
export type UpdateAppartementInput = z.infer<typeof updateAppartementSchema>;
export type SearchAppartementInput = z.infer<typeof searchAppartementSchema>;
