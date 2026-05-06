import { create } from 'zustand';
import type { SearchFilters } from '@/types/api.types';

interface SearchState {
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  ville: undefined,
  date_arrivee: undefined,
  date_depart: undefined,
  nb_personnes: undefined,
  prix_min: undefined,
  prix_max: undefined,
  nb_chambres: undefined,
  page: 1,
  limit: 12,
};

export const useSearchStore = create<SearchState>()((set) => ({
  filters: defaultFilters,

  setFilters: (newFilters: Partial<SearchFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },
}));
