import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types/api.types';
import { clearAccessToken } from '@/lib/axios';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hydrated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hydrated: false,

      setUser: (user: AuthUser) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        clearAccessToken();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'chamalcom-auth',
      // localStorage (disponible SSR via guard) au lieu de sessionStorage
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        // Fallback no-op pour SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    },
  ),
);
