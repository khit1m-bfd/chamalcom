import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appartement } from '@/types/api.types';

interface FavoritesState {
  favorites: Appartement[];
  addFavorite: (appart: Appartement) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (appart: Appartement) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (appart) =>
        set((s) => ({ favorites: s.favorites.some((f) => f.id === appart.id) ? s.favorites : [...s.favorites, appart] })),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      toggleFavorite: (appart) => {
        if (get().isFavorite(appart.id)) get().removeFavorite(appart.id);
        else get().addFavorite(appart);
      },
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
    }),
    {
      name: 'chamalcom-favorites',
      storage: typeof window !== 'undefined'
        ? { getItem: (k) => { try { return JSON.parse(localStorage.getItem(k) ?? 'null') as null; } catch { return null; } }, setItem: (k, v) => localStorage.setItem(k, JSON.stringify(v)), removeItem: (k) => localStorage.removeItem(k) }
        : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    },
  ),
);
