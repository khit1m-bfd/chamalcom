import api from './axios';
import type {
  Appartement, Reservation, Paiement, Avis,
  LoginResponse, AuthUser, SearchFilters,
  PaginatedResponse, ApiResponse, AdminStats, ProprietaireStats,
} from '@/types/api.types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  loginClient: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/client/login', data),
  loginProprietaire: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/proprietaire/login', data),
  loginAdmin: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/admin/login', data),
  registerClient: (data: Record<string, unknown>) =>
    api.post<ApiResponse<AuthUser>>('/auth/client/register', data),
  registerProprietaire: (data: Record<string, unknown>) =>
    api.post<ApiResponse<AuthUser>>('/auth/proprietaire/register', data),
  logout: () => api.post('/auth/client/logout'),
  me: () => api.get<ApiResponse<AuthUser & { role: string }>>('/auth/client/me'),
  updateProfile: (data: { nom?: string; prenom?: string; telephone?: string; nationalite?: string }) =>
    api.patch<ApiResponse<AuthUser>>('/auth/client/me', data),
};

// ─── Appartements ─────────────────────────────────────────────────────────────
export const appartementApi = {
  list: (filters: SearchFilters) => {
    // Strip undefined and empty-string values so Zod doesn't reject them
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
    );
    return api.get<PaginatedResponse<Appartement>>('/appartements', { params });
  },
  getById: (id: number) =>
    api.get<ApiResponse<Appartement>>(`/appartements/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Appartement>>('/appartements', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<Appartement>>(`/appartements/${id}`, data),
  delete: (id: number) =>
    api.delete(`/appartements/${id}`),
  mesAnnonces: () =>
    api.get<ApiResponse<Appartement[]>>('/appartements/mes-annonces'),
  disponibilite: (id: number, date_arrivee: string, date_depart: string) =>
    api.get<ApiResponse<{ disponible: boolean; dates_reservees: { date_arrivee: string; date_depart: string }[] }>>(
      '/reservations/disponibilite', { params: { id_appartement: id, date_arrivee, date_depart } },
    ),
  uploadImages: (id: number, formData: FormData) =>
    api.post(`/appartements/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (imageId: number) => api.delete(`/images/${imageId}`),
  setPrincipale: (imageId: number) => api.patch(`/images/${imageId}/principale`),
};

// ─── Réservations ─────────────────────────────────────────────────────────────
export const reservationApi = {
  create: (data: { id_appartement: number; date_arrivee: string; date_depart: string; nb_personnes: number; message_client?: string }) =>
    api.post<ApiResponse<Reservation>>('/reservations', data),
  getById: (id: number) =>
    api.get<ApiResponse<Reservation>>(`/reservations/${id}`),
  mesReservations: () =>
    api.get<ApiResponse<Reservation[]>>('/reservations/mes-reservations'),
  mesDemandes: () =>
    api.get<ApiResponse<Reservation[]>>('/reservations/mes-demandes'),
  confirmer: (id: number) =>
    api.patch<ApiResponse<Reservation>>(`/reservations/${id}/confirmer`),
  annuler: (id: number, motif?: string) =>
    api.patch<ApiResponse<Reservation>>(`/reservations/${id}/annuler`, { motif_annulation: motif }),
};

// ─── Paiements ────────────────────────────────────────────────────────────────
export const paiementApi = {
  create: (data: { id_reservation: number; methode: string }) =>
    api.post<ApiResponse<Paiement>>('/paiements', data),
  getById: (id: number) =>
    api.get<ApiResponse<Paiement>>(`/paiements/${id}`),
  mesPaiements: () =>
    api.get<ApiResponse<Paiement[]>>('/paiements/mes-paiements'),
  rembourser: (id: number) =>
    api.patch<ApiResponse<Paiement>>(`/paiements/${id}/rembourser`),
};

// ─── Avis ─────────────────────────────────────────────────────────────────────
export const avisApi = {
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Avis>>('/avis', data),
  getByAppartement: (id: number) =>
    api.get<ApiResponse<Avis[]>>(`/avis/appartement/${id}`),
  mesAvis: () =>
    api.get<ApiResponse<Avis[]>>('/avis/mes-avis'),
  repondre: (id: number, reponse: string) =>
    api.patch<ApiResponse<Avis>>(`/avis/${id}/reponse`, { reponse_proprietaire: reponse }),
  moderer: (id: number, statut: string) =>
    api.patch<ApiResponse<Avis>>(`/avis/${id}/moderer`, { statut }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => api.get<ApiResponse<AdminStats>>('/admin/dashboard'),
  stats: () => api.get<ApiResponse<AdminStats>>('/admin/stats'),
  proprietaires: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Record<string, unknown>>>('/admin/proprietaires', { params }),
  verifierProprietaire: (id: number, statut: string, motif?: string) =>
    api.patch(`/admin/proprietaires/${id}/verifier`, { statut, motif }),
  appartements: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Appartement>>('/admin/appartements', { params }),
  validerAppartement: (id: number, statut: string) =>
    api.patch(`/admin/appartements/${id}/valider`, { statut }),
  reservations: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Reservation>>('/admin/reservations', { params }),
  paiements: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Paiement>>('/admin/paiements', { params }),
  clients: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Record<string, unknown>>>('/admin/clients', { params }),
  bloquerClient: (id: number, statut: string) =>
    api.patch(`/admin/clients/${id}/bloquer`, { statut }),
  avisAdmin: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Avis>>('/admin/avis', { params }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  list: () => api.get<{ success: true; data: Notification[]; unread: number }>('/notifications'),
  marquerLue: (id: number) => api.patch(`/notifications/${id}/lu`),
  marquerToutesLues: () => api.patch('/notifications/lu-tout'),
};

// ─── Propriétaire ─────────────────────────────────────────────────────────────
export const proprietaireApi = {
  dashboard: () => api.get<ApiResponse<ProprietaireStats>>('/proprietaire/dashboard'),
  revenus: () => api.get<ApiResponse<Paiement[]>>('/proprietaire/revenus'),
  stats: () => api.get<ApiResponse<Record<string, unknown>>>('/proprietaire/stats'),
};
