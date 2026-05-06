'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { useAuthStore } from '@/stores/authStore';
import { proprietaireApi, reservationApi, appartementApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ProprietaireStats, Reservation, Appartement } from '@/types/api.types';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 flex items-center gap-4">
      <div className={`${color} text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}

export default function ProprietaireDashboardPage() {
  const locale = useLocale();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<ProprietaireStats>({
    queryKey: ['proprietaire-stats'],
    queryFn: () => proprietaireApi.dashboard().then((r) => r.data.data),
  });

  const { data: demandes, isLoading: demandesLoading } = useQuery<Reservation[]>({
    queryKey: ['mes-demandes'],
    queryFn: () => reservationApi.mesDemandes().then((r) => r.data.data),
  });

  const { data: annonces, isLoading: annoncesLoading } = useQuery<Appartement[]>({
    queryKey: ['mes-annonces'],
    queryFn: () => appartementApi.mesAnnonces().then((r) => r.data.data),
  });

  const confirmer = useMutation({
    mutationFn: (id: number) => reservationApi.confirmer(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['mes-demandes'] }),
  });

  const annuler = useMutation({
    mutationFn: (id: number) => reservationApi.annuler(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['mes-demandes'] }),
  });

  const pending = demandes?.filter((r) => r.statut === 'en_attente') ?? [];

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="section-title">مرحباً، {user?.prenom} 👋</h1>
              <p className="text-gray-500">لوحة تحكم المالك — إدارة شققك وحجوزاتك</p>
            </div>
            <Link href={`/${locale}/dashboard/proprietaire/annonce/new`} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 w-fit">
              + إضافة شقة جديدة
            </Link>
          </div>

          {/* Stats */}
          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard label="الشقق" value={stats?.totalAppartements ?? 0} icon="🏠" color="bg-primary" />
              <StatCard label="الحجوزات" value={stats?.totalReservations ?? 0} icon="📋" color="bg-teal" />
              <StatCard label="إجمالي الإيرادات" value={formatCurrency(stats?.totalRevenu ?? 0)} icon="💰" color="bg-gold" />
              <StatCard label="طلبات معلقة" value={stats?.reservationsEnAttente ?? pending.length} icon="⏳" color="bg-primary-mid" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending requests */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-sand-dark">
                <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                  طلبات الحجز المعلقة
                  {pending.length > 0 && (
                    <span className="ms-2 bg-gold text-primary text-xs font-bold rounded-full px-2 py-0.5">{pending.length}</span>
                  )}
                </h2>
              </div>

              {demandesLoading && (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              )}

              {!demandesLoading && pending.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-gray-500">لا توجد طلبات معلقة</p>
                </div>
              )}

              {pending.map((res) => (
                <div key={res.id} className="p-5 border-b border-sand-dark last:border-0 hover:bg-sand/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-primary">
                        {(res.appartement as { titre?: string })?.titre ?? `شقة #${res.id_appartement}`}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        👤 {res.client?.prenom} {res.client?.nom}
                      </p>
                      <p className="text-sm text-gray-500">
                        📅 {formatDate(res.date_arrivee, 'fr-MA')} → {formatDate(res.date_depart, 'fr-MA')}
                        {' · '}{res.nb_nuits} ليالٍ · {res.nb_personnes} أشخاص
                      </p>
                      {res.message_client && (
                        <p className="text-sm text-gray-400 mt-1 italic">"{res.message_client}"</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="font-bold text-primary">{formatCurrency(Number(res.prix_total))}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmer.mutate(res.id)}
                          disabled={confirmer.isPending}
                          className="bg-teal text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                          قبول
                        </button>
                        <button
                          onClick={() => annuler.mutate(res.id)}
                          disabled={annuler.isPending}
                          className="bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-red-200 transition-colors"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* All reservations link */}
              {demandes && demandes.length > pending.length && (
                <div className="p-4 border-t border-sand-dark">
                  <p className="text-sm text-gray-500 text-center">
                    + {demandes.length - pending.length} حجوزات أخرى (مؤكدة/منتهية)
                  </p>
                </div>
              )}
            </div>

            {/* My apartments */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-sand-dark">
                <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>شققي</h2>
              </div>

              {annoncesLoading && (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              )}

              {!annoncesLoading && (!annonces || annonces.length === 0) && (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">🏠</p>
                  <p className="text-gray-500 text-sm">لا توجد شقق بعد</p>
                  <Link href={`/${locale}/dashboard/proprietaire/annonce/new`} className="text-primary-mid text-sm hover:underline mt-2 block">
                    أضف أول شقة
                  </Link>
                </div>
              )}

              {annonces && annonces.length > 0 && (
                <div className="divide-y divide-sand-dark">
                  {annonces.map((apt) => {
                    const image = apt.images?.find((img) => img.est_principale) ?? apt.images?.[0];
                    return (
                      <div key={apt.id} className="p-4 flex items-center gap-3 hover:bg-sand/40 transition-colors">
                        <div className="w-14 h-14 rounded-lg bg-sand-md overflow-hidden flex-shrink-0">
                          {image ? (
                            <img src={image.url_image} alt={apt.titre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary text-sm truncate">{apt.titre}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(apt.prix_nuit)} / ليلة</p>
                          <StatusBadge status={apt.statut} />
                        </div>
                        <Link
                          href={`/${locale}/dashboard/proprietaire/annonce/${apt.id}`}
                          className="text-primary-mid text-xs hover:underline flex-shrink-0"
                        >
                          تعديل
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Revenue chart placeholder */}
          {stats?.revenusMensuels && stats.revenusMensuels.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-bold text-primary mb-6" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>الإيرادات الشهرية</h2>
              <div className="flex items-end gap-2 h-32">
                {stats.revenusMensuels.map((item) => {
                  const max = Math.max(...stats.revenusMensuels.map((m) => m.value), 1);
                  const height = Math.round((item.value / max) * 100);
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-xs text-gray-500 font-medium">{formatCurrency(item.value)}</p>
                      <div
                        className="w-full bg-primary rounded-t-md transition-all"
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                      <p className="text-xs text-gray-400">{item.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
