'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { adminApi, avisApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Avis } from '@/types/api.types';

export default function AdminAvisPage() {
  const locale = useLocale();
  const qc = useQueryClient();
  const [statut, setStatut] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-avis', statut],
    queryFn: () => adminApi.avisAdmin(statut ? { statut, limit: '50' } : { limit: '50' }).then((r) => r.data),
  });

  const moderer = useMutation({
    mutationFn: ({ id, s }: { id: number; s: string }) => avisApi.moderer(id, s),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-avis'] }),
  });

  const items = (data?.data ?? []) as Avis[];

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="section-title mb-1">إدارة التقييمات</h1>
              <p className="text-gray-500 text-sm">{data?.meta.total ?? 0} تقييم إجمالي</p>
            </div>
            <Link href={`/${locale}/dashboard/admin`} className="text-primary-mid text-sm hover:underline">← لوحة التحكم</Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { label: 'الكل', value: '' },
              { label: 'في الانتظار', value: 'en_attente' },
              { label: 'منشورة', value: 'publie' },
              { label: 'مخفية', value: 'masque' },
            ].map((f) => (
              <button key={f.value} onClick={() => setStatut(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statut === f.value ? 'bg-primary text-white' : 'bg-white border border-sand-dark text-gray-600 hover:border-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">لا توجد تقييمات</div>
            ) : (
              <div className="divide-y divide-sand-dark">
                {items.map((avis) => {
                  const aptData = avis.appartement as { id?: number; titre?: string; ville?: string } | undefined;
                  return (
                    <div key={avis.id} className="p-5 hover:bg-sand/40 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {avis.client?.prenom?.charAt(0) ?? '?'}
                            </div>
                            <div>
                              <p className="font-medium text-primary text-sm">
                                {avis.client?.prenom} {avis.client?.nom}
                              </p>
                              {aptData?.titre && (
                                <Link href={`/${locale}/appartements/${aptData.id ?? ''}`}
                                  className="text-xs text-primary-mid hover:underline"
                                >
                                  🏠 {aptData.titre}
                                </Link>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ms-auto">
                              <span className="text-gold">★</span>
                              <span className="font-bold text-primary text-sm">{Number(avis.note_globale).toFixed(1)}</span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-2 line-clamp-3">{avis.commentaire}</p>

                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>🧹 {Number(avis.note_proprete).toFixed(1)}</span>
                            <span>📍 {Number(avis.note_localisation).toFixed(1)}</span>
                            <span>💰 {Number(avis.note_rapport_qp).toFixed(1)}</span>
                            <span>💬 {Number(avis.note_communication).toFixed(1)}</span>
                            <span className="ms-auto">{formatDate(avis.date_avis, 'fr-MA')}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <StatusBadge status={avis.statut} />
                          {avis.statut !== 'publie' && (
                            <button onClick={() => moderer.mutate({ id: avis.id, s: 'publie' })}
                              className="text-xs bg-teal text-white px-3 py-1 rounded-lg hover:opacity-90"
                            >نشر ✓</button>
                          )}
                          {avis.statut !== 'masque' && (
                            <button onClick={() => moderer.mutate({ id: avis.id, s: 'masque' })}
                              className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                            >إخفاء</button>
                          )}
                        </div>
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
