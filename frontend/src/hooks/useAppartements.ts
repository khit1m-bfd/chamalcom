'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appartementApi } from '@/lib/api';
import type { SearchFilters } from '@/types/api.types';

export function useAppartements(filters: SearchFilters) {
  return useQuery({
    queryKey: ['appartements', filters],
    queryFn: () => appartementApi.list(filters).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAppartement(id: number) {
  return useQuery({
    queryKey: ['appartement', id],
    queryFn: () => appartementApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMesAnnonces() {
  return useQuery({
    queryKey: ['mes-annonces'],
    queryFn: () => appartementApi.mesAnnonces().then((r) => r.data.data),
  });
}

export function useDisponibilite(id: number, dateArrivee: string, dateDepart: string) {
  return useQuery({
    queryKey: ['disponibilite', id, dateArrivee, dateDepart],
    queryFn: () => appartementApi.disponibilite(id, dateArrivee, dateDepart).then((r) => r.data.data),
    enabled: !!id && !!dateArrivee && !!dateDepart,
  });
}

export function useCreateAppartement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => appartementApi.create(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['mes-annonces'] }); },
  });
}

export function useDeleteAppartement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appartementApi.delete(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['mes-annonces'] }); },
  });
}
