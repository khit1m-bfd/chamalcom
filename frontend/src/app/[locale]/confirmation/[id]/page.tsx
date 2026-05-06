'use client';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { reservationApi } from '@/lib/api';
import { formatCurrency, formatDate, calculateNights } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const { user } = useAuthStore();
  const id = Number(params.id);

  const { data: reservation, isLoading } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="bg-sand min-h-screen flex items-center justify-center">
          <div className="w-full max-w-lg space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  if (!reservation) {
    return (
      <>
        <Navbar />
        <main className="bg-sand min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-4">❓</p>
            <p className="text-xl font-bold text-primary">الحجز غير موجود</p>
            <Link href={`/${locale}/dashboard/client`} className="btn-primary mt-4 inline-block">لوحة التحكم</Link>
          </div>
        </main>
      </>
    );
  }

  const nights = calculateNights(reservation.date_arrivee, reservation.date_depart);
  const appart = reservation.appartement;
  const isConfirmed = reservation.statut === 'confirmee';
  const isPending = reservation.statut === 'en_attente';

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen py-12">
        <div className="container-app max-w-xl mx-auto">
          {/* Status banner */}
          <div className={`rounded-2xl p-8 text-center mb-6 ${isConfirmed ? 'bg-teal' : isPending ? 'bg-gold' : 'bg-primary'}`}>
            <div className="text-6xl mb-4">
              {isConfirmed ? '✅' : isPending ? '⏳' : '📋'}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              {isConfirmed ? 'تم تأكيد حجزك!' : isPending ? 'طلب الحجز قيد المراجعة' : 'تفاصيل الحجز'}
            </h1>
            <p className="text-white/80 text-sm">
              {isConfirmed
                ? 'يمكنك الآن الدفع وإتمام الحجز'
                : isPending
                ? 'سيتصل بك المالك خلال 24 ساعة للتأكيد'
                : ''}
            </p>
            <div className="mt-4 bg-white/20 rounded-xl px-6 py-2 inline-block">
              <p className="text-white font-bold text-lg">رقم الحجز: #{reservation.id}</p>
            </div>
          </div>

          {/* Détails */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-4">
            <h2 className="font-bold text-primary mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              تفاصيل الإقامة
            </h2>
            {appart && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-sand rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-sand-md flex items-center justify-center text-2xl flex-shrink-0">🏠</div>
                <div>
                  <p className="font-semibold text-primary">{appart.titre}</p>
                  <p className="text-gray-500 text-sm">📍 {appart.ville}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div className="bg-sand rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">تاريخ الوصول</p>
                <p className="font-bold text-primary">{formatDate(reservation.date_arrivee, 'fr-MA')}</p>
              </div>
              <div className="bg-sand rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">تاريخ المغادرة</p>
                <p className="font-bold text-primary">{formatDate(reservation.date_depart, 'fr-MA')}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{nights} ليالٍ × {formatCurrency(reservation.prix_nuit_applique)}</span>
              <span className="font-bold text-primary">{formatCurrency(Number(reservation.prix_total))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">الحالة</span>
              <StatusBadge status={reservation.statut} />
            </div>
          </div>

          {/* Message client */}
          {reservation.message_client && (
            <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
              <p className="text-sm font-medium text-primary mb-2">رسالتك للمالك:</p>
              <p className="text-gray-600 text-sm italic">"{reservation.message_client}"</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-primary mb-3">📌 الخطوات التالية</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              {isPending && (
                <>
                  <li className="flex items-start gap-2"><span className="bg-gold text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span> انتظر تأكيد المالك (خلال 24 ساعة)</li>
                  <li className="flex items-start gap-2"><span className="bg-sand-dark text-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span> بعد التأكيد: أكمل عملية الدفع</li>
                  <li className="flex items-start gap-2"><span className="bg-sand-dark text-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span> استلم تفاصيل الوصول من المالك</li>
                </>
              )}
              {isConfirmed && (
                <>
                  <li className="flex items-start gap-2"><span className="bg-gold text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span> اذهب لصفحة الحجز وأكمل الدفع</li>
                  <li className="flex items-start gap-2"><span className="bg-sand-dark text-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span> ستتلقى تفاصيل الوصول من المالك</li>
                </>
              )}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/${locale}/reservation/${reservation.id}`} className="btn-gold flex-1 flex justify-center">
              {isConfirmed ? '💳 الدفع الآن' : '📋 تفاصيل الحجز'}
            </Link>
            <Link href={`/${locale}/dashboard/${user?.role ?? 'client'}`} className="flex-1 border border-sand-dark text-primary rounded-xl px-4 py-3 text-sm font-medium hover:bg-sand transition-colors text-center">
              لوحة التحكم
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
