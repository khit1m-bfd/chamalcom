'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationApi } from '@/lib/api';

export function useMesReservations() {
  return useQuery({
    queryKey: ['mes-reservations'],
    queryFn: () => reservationApi.mesReservations().then((r) => r.data.data),
  });
}

export function useMesDemandes() {
  return useQuery({
    queryKey: ['mes-demandes'],
    queryFn: () => reservationApi.mesDemandes().then((r) => r.data.data),
  });
}

export function useReservation(id: number) {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reservationApi.create,
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['mes-reservations'] }); },
  });
}

export function useConfirmerReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservationApi.confirmer(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['mes-demandes'] }); },
  });
}

export function useAnnulerReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: number; motif?: string }) => reservationApi.annuler(id, motif),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['mes-reservations'] });
      void qc.invalidateQueries({ queryKey: ['mes-demandes'] });
    },
  });
}
