'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { reservationApi } from '@/lib/api';
import { formatCurrency, formatDate, calculateNights } from '@/lib/utils';
import type { Reservation, ReservationStatut } from '@/types/api.types';

const STATUT_FILTERS: { label: string; value: string }[] = [
  { label: 'الكل', value: '' },
  { label: 'في الانتظار', value: 'en_attente' },
  { label: 'مؤكدة', value: 'confirmee' },
  { label: 'منتهية', value: 'terminee' },
  { label: 'ملغاة', value: 'annulee_client' },
];

export default function ProprietaireReservationsPage() {
  const locale = useLocale();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data: demandes, isLoading } = useQuery<Reservation[]>({
    queryKey: ['mes-demandes'],
    queryFn: () => reservationApi.mesDemandes().then((r) => r.data.data),
  });

  const confirmer = useMutation({
    mutationFn: (id: number) => reservationApi.confirmer(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['mes-demandes'] }),
  });

  const annuler = useMutation({
    mutationFn: (id: number) => reservationApi.annuler(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['mes-demandes'] }),
  });

  const filtered = demandes?.filter((r) => !filter || r.statut === filter) ?? [];

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="section-title mb-1">إدارة الحجوزات</h1>
              <p className="text-gray-500 text-sm">{demandes?.length ?? 0} حجز إجمالي</p>
            </div>
            <Link href={`/${locale}/dashboard/proprietaire`} className="text-primary-mid text-sm hover:underline">
              ← لوحة التحكم
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {STATUT_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-sand-dark hover:border-primary'
                }`}
              >
                {f.label}
                {f.value && (
                  <span className="ms-1 text-xs">
                    ({demandes?.filter((r) => r.statut === f.value).length ?? 0})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {isLoading && (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">📋</p>
                <p className="text-gray-500">لا توجد حجوزات بهذا الفلتر</p>
              </div>
            )}

            <div className="divide-y divide-sand-dark">
              {filtered.map((res) => {
                const nights = calculateNights(res.date_arrivee, res.date_depart);
                return (
                  <div key={res.id} className="p-5 hover:bg-sand/40 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-primary">
                            {(res.appartement as { titre?: string })?.titre ?? `شقة #${res.id_appartement}`}
                          </p>
                          <StatusBadge status={res.statut} />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          👤 <strong>{res.client?.prenom} {res.client?.nom}</strong>
                        </p>
                        <p className="text-sm text-gray-500">
                          📅 {formatDate(res.date_arrivee, 'fr-MA')} → {formatDate(res.date_depart, 'fr-MA')}
                          {' · '}{nights} ليالٍ · {res.nb_personnes} أشخاص
                        </p>
                        {res.message_client && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{res.message_client}"</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <p className="font-bold text-primary text-lg">{formatCurrency(Number(res.prix_total))}</p>

                        <div className="flex gap-2">
                          <Link
                            href={`/${locale}/reservation/${res.id}`}
                            className="text-xs border border-primary/30 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                          >
                            عرض
                          </Link>

                          {res.statut === 'en_attente' && (
                            <>
                              <button
                                onClick={() => confirmer.mutate(res.id)}
                                disabled={confirmer.isPending}
                                className="text-xs bg-teal text-white px-3 py-1.5 rounded-lg hover:opacity-90 font-medium"
                              >
                                قبول ✓
                              </button>
                              <button
                                onClick={() => annuler.mutate(res.id)}
                                disabled={annuler.isPending}
                                className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 font-medium"
                              >
                                رفض ✗
                              </button>
                            </>
                          )}

                          {res.statut === 'confirmee' && (
                            <button
                              onClick={() => annuler.mutate(res.id)}
                              disabled={annuler.isPending}
                              className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                              إلغاء
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
