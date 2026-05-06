import { z } from 'zod';

const noteSchema = z.coerce.number().int().min(1).max(5);

export const createAvisSchema = z.object({
  id_reservation: z.coerce.number().int().positive(),
  note_proprete: noteSchema,
  note_localisation: noteSchema,
  note_rapport_qp: noteSchema,
  note_communication: noteSchema,
  commentaire: z.string().min(10).max(2000),
});

export const reponseAvisSchema = z.object({
  reponse_proprietaire: z.string().min(5).max(1000),
});

export const modererAvisSchema = z.object({
  statut: z.enum(['publie', 'masque']),
});

export type CreateAvisInput = z.infer<typeof createAvisSchema>;
export type ReponseAvisInput = z.infer<typeof reponseAvisSchema>;
export type ModererAvisInput = z.infer<typeof modererAvisSchema>;
