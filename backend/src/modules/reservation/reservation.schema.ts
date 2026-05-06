import { z } from 'zod';

export const createReservationSchema = z.object({
  id_appartement: z.coerce.number().int().positive(),
  date_arrivee: z.string().date(),
  date_depart: z.string().date(),
  nb_personnes: z.coerce.number().int().min(1),
  message_client: z.string().max(1000).optional(),
}).refine((d) => new Date(d.date_depart) > new Date(d.date_arrivee), {
  message: 'La date de départ doit être après la date d\'arrivée',
  path: ['date_depart'],
});

export const annulerReservationSchema = z.object({
  motif_annulation: z.string().max(500).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type AnnulerReservationInput = z.infer<typeof annulerReservationSchema>;
