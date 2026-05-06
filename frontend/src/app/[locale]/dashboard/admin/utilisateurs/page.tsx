'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

type TabType = 'clients' | 'proprietaires';

export default function AdminUtilisateursPage() {
  const locale = useLocale();
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabType>('clients');
  const [searchQ, setSearchQ] = useState('');

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => adminApi.clients({ limit: '50' }).then((r) => r.data),
    enabled: tab === 'clients',
  });

  const { data: proprietaires, isLoading: propriLoading } = useQuery({
    queryKey: ['admin-proprietaires-all'],
    queryFn: () => adminApi.proprietaires({ limit: '50' }).then((r) => r.data),
    enabled: tab === 'proprietaires',
  });

  const bloquerClient = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) => adminApi.bloquerClient(id, statut),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-clients'] }),
  });

  const verifierOwner = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) => adminApi.verifierProprietaire(id, statut),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-proprietaires-all'] }),
  });

  const isLoading = tab === 'clients' ? clientsLoading : propriLoading;
  const items = tab === 'clients' ? clients?.data ?? [] : proprietaires?.data ?? [];

  const filtered = items.filter((u) => {
    const o = u as { nom: string; prenom: string; email: string };
    const q = searchQ.toLowerCase();
    return !q || o.nom.toLowerCase().includes(q) || o.prenom.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
  });

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="section-title mb-0">إدارة المستخدمين</h1>
            <Link href={`/${locale}/dashboard/admin`} className="text-primary-mid text-sm hover:underline">
              ← لوحة التحكم
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-white shadow-card p-1 mb-6 w-fit gap-1">
            {(['clients', 'proprietaires'] as TabType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
                }`}
              >
                {t === 'clients' ? `👤 العملاء (${clients?.meta.total ?? '...'})` : `🏠 الملاك (${proprietaires?.meta.total ?? '...'})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="input-field max-w-sm"
              placeholder="🔍 بحث بالاسم أو البريد..."
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">لا يوجد مستخدمون</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-sand text-primary">
                    <tr>
                      <th className="text-right p-4 font-semibold">المستخدم</th>
                      <th className="text-right p-4 font-semibold">البريد</th>
                      {tab === 'clients' && <th className="text-right p-4 font-semibold">الحجوزات</th>}
                      {tab === 'proprietaires' && <th className="text-right p-4 font-semibold">الشقق</th>}
                      <th className="text-right p-4 font-semibold">تاريخ التسجيل</th>
                      <th className="text-right p-4 font-semibold">الحالة</th>
                      <th className="text-right p-4 font-semibold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-dark">
                    {filtered.map((u) => {
                      const o = u as {
                        id: number; nom: string; prenom: string; email: string;
                        statut?: string; statut_verification?: string;
                        date_inscription?: string; created_at?: string;
                        _count?: { reservations?: number; avis?: number; appartements?: number };
                      };
                      const isActive = tab === 'clients' ? o.statut === 'actif' : o.statut_verification === 'verifie';
                      const dateKey = o.date_inscription ?? o.created_at ?? '';

                      return (
                        <tr key={o.id} className="hover:bg-sand/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {o.prenom.charAt(0)}{o.nom.charAt(0)}
                              </div>
                              <span className="font-medium text-primary">{o.prenom} {o.nom}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-500 ltr" dir="ltr">{o.email}</td>
                          <td className="p-4 text-gray-600">
                            {tab === 'clients' ? (o._count?.reservations ?? 0) : (o._count?.appartements ?? 0)}
                          </td>
                          <td className="p-4 text-gray-500">{dateKey ? formatDate(dateKey, 'fr-MA') : '—'}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-teal text-white' : 'bg-red-100 text-red-700'}`}>
                              {isActive ? 'نشط' : tab === 'clients' ? 'موقوف' : 'قيد المراجعة'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {tab === 'clients' && (
                                isActive ? (
                                  <button
                                    onClick={() => bloquerClient.mutate({ id: o.id, statut: 'suspendu' })}
                                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                                  >
                                    إيقاف
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => bloquerClient.mutate({ id: o.id, statut: 'actif' })}
                                    className="text-xs bg-teal text-white px-3 py-1 rounded-lg hover:opacity-90"
                                  >
                                    تفعيل
                                  </button>
                                )
                              )}
                              {tab === 'proprietaires' && o.statut_verification === 'en_attente' && (
                                <>
                                  <button
                                    onClick={() => verifierOwner.mutate({ id: o.id, statut: 'verifie' })}
                                    className="text-xs bg-teal text-white px-3 py-1 rounded-lg hover:opacity-90"
                                  >
                                    قبول
                                  </button>
                                  <button
                                    onClick={() => verifierOwner.mutate({ id: o.id, statut: 'refuse' })}
                                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                                  >
                                    رفض
                                  </button>
                                </>
                              )}
                              {tab === 'proprietaires' && o.statut_verification === 'verifie' && (
                                <button
                                  onClick={() => verifierOwner.mutate({ id: o.id, statut: 'suspendu' })}
                                  className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200"
                                >
                                  تعليق
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
