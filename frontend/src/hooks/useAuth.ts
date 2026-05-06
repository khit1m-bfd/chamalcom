'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';
import { setAccessToken } from '@/lib/axios';
import type { AuthUser } from '@/types/api.types';

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  const loginClientMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.loginClient(data),
    onSuccess: (res) => {
      const { user: u, accessToken } = res.data.data;
      setAccessToken(accessToken);
      setUser({ ...u, role: 'client' } as AuthUser);
      router.push(`/${locale}/dashboard/client`);
    },
  });

  const loginProprietaireMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.loginProprietaire(data),
    onSuccess: (res) => {
      const { user: u, accessToken } = res.data.data;
      setAccessToken(accessToken);
      setUser({ ...u, role: 'proprietaire' } as AuthUser);
      router.push(`/${locale}/dashboard/proprietaire`);
    },
  });

  const loginAdminMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.loginAdmin(data),
    onSuccess: (res) => {
      const { user: u, accessToken } = res.data.data;
      setAccessToken(accessToken);
      setUser({ ...u, role: 'admin' } as AuthUser);
      router.push(`/${locale}/dashboard/admin`);
    },
  });

  const registerClientMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => authApi.registerClient(data),
    onSuccess: () => router.push(`/${locale}/auth/login`),
  });

  const registerProprietaireMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => authApi.registerProprietaire(data),
    onSuccess: () => router.push(`/${locale}/auth/login`),
  });

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    storeLogout();
    router.push(`/${locale}/auth/login`);
  };

  return {
    user, isAuthenticated,
    loginClient: loginClientMutation,
    loginProprietaire: loginProprietaireMutation,
    loginAdmin: loginAdminMutation,
    registerClient: registerClientMutation,
    registerProprietaire: registerProprietaireMutation,
    logout,
  };
}
