'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUT_OPTIONS = [
  { label: 'الكل', value: '' },
  { label: 'قيد المراجعة', value: 'en_attente_validation' },
  { label: 'متاحة', value: 'disponible' },
  { label: 'موقوفة', value: 'suspendu' },
  { label: 'مؤرشفة', value: 'archive' },
];

export default function AdminAnnoncesPage() {
  const locale = useLocale();
  const qc = useQueryClient();
  const [statut, setStatut] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-annonces', statut],
    queryFn: () => adminApi.appartements(statut ? { statut, limit: '50' } : { limit: '50' }).then((r) => r.data),
  });

  const valider = useMutation({
    mutationFn: ({ id, s }: { id: number; s: string }) => adminApi.validerAppartement(id, s),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-annonces'] }),
  });

  const items = (data?.data ?? []).filter((a) => {
    const apt = a as { titre: string; ville: string };
    const q = search.toLowerCase();
    return !q || apt.titre.toLowerCase().includes(q) || apt.ville.toLowerCase().includes(q);
  });

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="section-title mb-1">إدارة الإعلانات</h1>
              <p className="text-gray-500 text-sm">{data?.meta.total ?? 0} إعلان إجمالي</p>
            </div>
            <Link href={`/${locale}/dashboard/admin`} className="text-primary-mid text-sm hover:underline">← لوحة التحكم</Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field max-w-xs"
              placeholder="🔍 بحث..."
            />
            <div className="flex gap-2 flex-wrap">
              {STATUT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setStatut(o.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    statut === o.value ? 'bg-primary text-white' : 'bg-white border border-sand-dark text-gray-600 hover:border-primary'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">لا توجد إعلانات</div>
            ) : (
              <div className="divide-y divide-sand-dark">
                {items.map((appart) => {
                  const a = appart as {
                    id: number; titre: string; ville: string; prix_nuit: number;
                    statut: string; created_at: string;
                    proprietaire?: { prenom: string; nom: string; email: string };
                    images?: { url_image: string; est_principale: boolean }[];
                    _count?: { reservations: number };
                  };
                  const img = a.images?.find((i) => i.est_principale) ?? a.images?.[0];

                  return (
                    <div key={a.id} className="p-5 flex items-center gap-4 hover:bg-sand/40 transition-colors">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl bg-sand-md overflow-hidden flex-shrink-0">
                        {img ? (
                          <img src={img.url_image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-primary truncate">{a.titre}</p>
                          <StatusBadge status={a.statut as never} />
                        </div>
                        <p className="text-sm text-gray-500">📍 {a.ville} · {formatCurrency(a.prix_nuit)}/ليلة</p>
                        {a.proprietaire && (
                          <p className="text-xs text-gray-400">المالك: {a.proprietaire.prenom} {a.proprietaire.nom}</p>
                        )}
                        <p className="text-xs text-gray-400">{formatDate(a.created_at, 'fr-MA')} · {a._count?.reservations ?? 0} حجز</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Link href={`/${locale}/appartements/${a.id}`} target="_blank"
                          className="text-xs border border-primary/30 text-primary px-3 py-1 rounded-lg hover:bg-primary/5 text-center"
                        >
                          عرض
                        </Link>
                        {a.statut === 'en_attente_validation' && (
                          <button onClick={() => valider.mutate({ id: a.id, s: 'disponible' })}
                            className="text-xs bg-teal text-white px-3 py-1 rounded-lg hover:opacity-90"
                          >اعتماد ✓</button>
                        )}
                        {a.statut === 'disponible' && (
                          <button onClick={() => valider.mutate({ id: a.id, s: 'suspendu' })}
                            className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200"
                          >تعليق</button>
                        )}
                        {a.statut === 'suspendu' && (
                          <button onClick={() => valider.mutate({ id: a.id, s: 'disponible' })}
                            className="text-xs bg-teal text-white px-3 py-1 rounded-lg hover:opacity-90"
                          >إعادة نشر</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
