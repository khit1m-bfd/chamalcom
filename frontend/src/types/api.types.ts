// ─── Standard API Response ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ─── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'proprietaire' | 'client';

export interface JwtPayload {
  id: number;
  role: UserRole;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: UserRole;
}

// ─── Apartment ────────────────────────────────────────────────────────────────
export type AppartementStatut =
  | 'disponible'
  | 'en_attente_validation'
  | 'suspendu'
  | 'archive';

export interface Appartement {
  id: number;
  id_proprietaire: number;
  titre: string;
  description: string;
  adresse: string;
  ville: string;
  region: string;
  surface_m2: number;
  nb_chambres: number;
  nb_salles_bain: number;
  capacite_max: number;
  prix_nuit: number;
  caution: number;
  equipements: string;
  statut: AppartementStatut;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  // Relations
  proprietaire?: ProprietairePublic;
  images?: ImageAppartement[];
  note_moyenne?: number;
  nb_avis?: number;
}

export interface ImageAppartement {
  id: number;
  id_appartement: number;
  url_image: string;
  est_principale: boolean;
  ordre_affichage: number;
}

// ─── Reservation ──────────────────────────────────────────────────────────────
export type ReservationStatut =
  | 'en_attente'
  | 'confirmee'
  | 'annulee_client'
  | 'annulee_proprietaire'
  | 'terminee'
  | 'litige';

export interface Reservation {
  id: number;
  id_client: number;
  id_appartement: number;
  date_arrivee: string;
  date_depart: string;
  nb_nuits: number;
  nb_personnes: number;
  prix_nuit_applique: number;
  prix_total: number;
  statut: ReservationStatut;
  message_client?: string;
  motif_annulation?: string;
  created_at: string;
  date_confirmation?: string;
  // Relations
  client?: ClientPublic;
  appartement?: Appartement;
  paiement?: Paiement;
}

// ─── Paiement ─────────────────────────────────────────────────────────────────
export type PaiementMethode = 'CMI' | 'PayPal' | 'virement_bancaire' | 'especes';
export type PaiementStatut = 'en_attente' | 'valide' | 'echoue' | 'rembourse';

export interface Paiement {
  id: number;
  id_reservation: number;
  montant: number;
  taux_commission: number;
  montant_commission: number;
  montant_proprietaire: number;
  methode: PaiementMethode;
  statut: PaiementStatut;
  reference_externe?: string;
  date_paiement?: string;
  date_remboursement?: string;
}

// ─── Avis ─────────────────────────────────────────────────────────────────────
export type AvisStatut = 'en_attente' | 'publie' | 'masque';

export interface Avis {
  id: number;
  id_client: number;
  id_appartement: number;
  id_reservation: number;
  note_proprete: number;
  note_localisation: number;
  note_rapport_qp: number;
  note_communication: number;
  note_globale: number;
  commentaire: string;
  reponse_proprietaire?: string;
  date_avis: string;
  statut: AvisStatut;
  // Relations
  client?: ClientPublic;
}

// ─── Public profiles (no password) ────────────────────────────────────────────
export interface ClientPublic {
  id: number;
  nom: string;
  prenom: string;
  nationalite?: string;
}

export interface ProprietairePublic {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  statut_verification: 'en_attente' | 'verifie' | 'refuse' | 'suspendu';
}

// ─── Search filters ────────────────────────────────────────────────────────────
export interface SearchFilters {
  ville?: string;
  date_arrivee?: string;
  date_depart?: string;
  nb_personnes?: number;
  prix_min?: number;
  prix_max?: number;
  nb_chambres?: number;
  sort?: 'recent' | 'prix_asc' | 'prix_desc' | 'note_desc';
  page?: number;
  limit?: number;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export interface AdminStats {
  totalClients: number;
  totalProprietaires: number;
  totalAppartements: number;
  totalReservations: number;
  totalRevenue: number;
  pendingOwners: number;
  pendingApartments: number;
  monthlyReservations: MonthlyData[];
  monthlyRevenue: MonthlyData[];
}

export interface ProprietaireStats {
  totalAppartements: number;
  totalReservations: number;
  totalRevenu: number;
  tauxOccupation: number;
  notesMoyenne: number;
  reservationsEnAttente: number;
  revenusMensuels: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  value: number;
}

// ─── Notification ──────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  type_role: string;
  id_user: number;
  titre: string;
  message: string;
  lu: boolean;
  lien?: string;
  created_at: string;
}
