'use client';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useMesReservations } from '@/hooks/useReservation';
import { useAnnulerReservation } from '@/hooks/useReservation';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function ClientDashboardPage() {
  const locale = useLocale();
  const { user } = useAuthStore();
  const { data: reservations, isLoading } = useMesReservations();
  const annuler = useAnnulerReservation();

  const stats = {
    total: reservations?.length ?? 0,
    active: reservations?.filter((r) => ['en_attente', 'confirmee'].includes(r.statut)).length ?? 0,
    terminee: reservations?.filter((r) => r.statut === 'terminee').length ?? 0,
  };

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="section-title">مرحباً، {user?.prenom} 👋</h1>
            <p className="text-gray-500">هنا يمكنك متابعة حجوزاتك وتقييماتك</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: 'إجمالي الحجوزات', value: stats.total, icon: '📋', color: 'bg-primary' },
              { label: 'الحجوزات النشطة', value: stats.active, icon: '✅', color: 'bg-teal' },
              { label: 'الرحلات المنتهية', value: stats.terminee, icon: '🏖️', color: 'bg-gold' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl shadow-card p-6 flex items-center gap-4">
                <div className={`${s.color} text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl`}>{s.icon}</div>
                <div>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Réservations */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-sand-dark flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>حجوزاتي</h2>
              <Link href={`/${locale}/appartements`} className="btn-primary text-sm px-4 py-2">+ حجز جديد</Link>
            </div>

            {isLoading && (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            )}

            {!isLoading && (!reservations || reservations.length === 0) && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🏠</p>
                <p className="text-gray-500">لا توجد حجوزات بعد</p>
                <Link href={`/${locale}/appartements`} className="btn-primary mt-4 inline-block">ابحث عن شقة</Link>
              </div>
            )}

            {reservations && reservations.length > 0 && (
              <div className="divide-y divide-sand-dark">
                {reservations.map((res) => (
                  <div key={res.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-sand/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-bold text-primary">
                        {(res.appartement as { titre?: string })?.titre ?? `شقة #${res.id_appartement}`}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        📅 {formatDate(res.date_arrivee, locale === 'ar' ? 'ar-MA' : 'fr-MA')} → {formatDate(res.date_depart, locale === 'ar' ? 'ar-MA' : 'fr-MA')}
                        {'  ·  '}{res.nb_nuits} ليلة · {res.nb_personnes} أشخاص
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-bold text-primary">{formatCurrency(Number(res.prix_total))}</p>
                      <StatusBadge status={res.statut} />
                      {['en_attente', 'confirmee'].includes(res.statut) && (
                        <button
                          onClick={() => annuler.mutate({ id: res.id })}
                          disabled={annuler.isPending}
                          className="text-sm text-red-500 hover:underline"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
