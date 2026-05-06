'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { useAuthStore } from '@/stores/authStore';
import { appartementApi, reservationApi, avisApi } from '@/lib/api';
import { formatCurrency, formatDate, calculateNights, parseEquipements } from '@/lib/utils';
import type { Appartement, Avis } from '@/types/api.types';

interface ReservationForm {
  date_arrivee: string;
  date_depart: string;
  nb_personnes: number;
  message_client: string;
}

function StarRating({ note, size = 'sm' }: { note: number; size?: 'sm' | 'lg' }) {
  const full = Math.floor(note);
  const half = note - full >= 0.5;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    if (i < full) return '★';
    if (i === full && half) return '⯨';
    return '☆';
  });
  return (
    <span className={`text-gold ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}>
      {stars.join('')}
    </span>
  );
}

export default function AppartementDetailPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const id = Number(params.id);
  const { isAuthenticated, user } = useAuthStore();
  const [activeImage, setActiveImage] = useState(0);
  const [showReservationForm, setShowReservationForm] = useState(false);

  const { data: appart, isLoading } = useQuery<Appartement>({
    queryKey: ['appartement', id],
    queryFn: () => appartementApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: avis } = useQuery<Avis[]>({
    queryKey: ['avis', id],
    queryFn: () => avisApi.getByAppartement(id).then((r) => r.data.data),
    enabled: !!id,
  });

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ReservationForm>();

  const dateArrivee = watch('date_arrivee');
  const dateDepart = watch('date_depart');
  const nights = dateArrivee && dateDepart ? calculateNights(dateArrivee, dateDepart) : 0;
  const totalPrice = nights > 0 && appart ? nights * appart.prix_nuit : 0;

  const reservation = useMutation({
    mutationFn: (data: ReservationForm) =>
      reservationApi.create({
        id_appartement: id,
        date_arrivee: data.date_arrivee,
        date_depart: data.date_depart,
        nb_personnes: Number(data.nb_personnes),
        message_client: data.message_client || undefined,
      }),
    onSuccess: () => {
      reset();
      setShowReservationForm(false);
    },
  });

  const onReserve = (data: ReservationForm) => {
    reservation.mutate(data);
  };

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="bg-sand min-h-screen">
          <div className="container-app py-10 space-y-6">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </>
    );
  }

  if (!appart) {
    return (
      <>
        <Navbar />
        <main className="bg-sand min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🏚️</p>
            <p className="text-xl font-bold text-primary mb-2">الشقة غير موجودة</p>
            <Link href={`/${locale}/appartements`} className="btn-primary mt-4 inline-block">
              العودة إلى القائمة
            </Link>
          </div>
        </main>
      </>
    );
  }

  const images = appart.images ?? [];
  const principalImage = images.find((img) => img.est_principale) ?? images[0];
  const displayImages = images.length > 0 ? images : [];
  const equipements = parseEquipements(appart.equipements);
  const publishedAvis = avis?.filter((a) => a.statut === 'publie') ?? [];

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <Link href={`/${locale}`} className="hover:text-primary">الرئيسية</Link>
            <span>/</span>
            <Link href={`/${locale}/appartements`} className="hover:text-primary">الشقق</Link>
            <span>/</span>
            <span className="text-primary">{appart.titre}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-card">
                {displayImages.length > 0 ? (
                  <>
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={displayImages[activeImage]?.url_image ?? principalImage?.url_image}
                        alt={appart.titre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {displayImages.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                        {displayImages.map((img, i) => (
                          <button
                            key={img.id}
                            onClick={() => setActiveImage(i)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                              i === activeImage ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            <img src={img.url_image} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-video bg-sand-md flex items-center justify-center">
                    <span className="text-6xl">🏖️</span>
                  </div>
                )}
              </div>

              {/* Title + status */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                    {appart.titre}
                  </h1>
                  <StatusBadge status={appart.statut} />
                </div>

                <p className="text-gray-600 mb-4">
                  📍 {appart.adresse}, {appart.ville}
                  {appart.region ? ` — ${appart.region}` : ''}
                </p>

                {/* Note */}
                {appart.note_moyenne ? (
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating note={appart.note_moyenne} size="lg" />
                    <span className="text-lg font-bold text-primary">{appart.note_moyenne.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({appart.nb_avis ?? 0} تقييم)</span>
                  </div>
                ) : null}

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-sand-dark">
                  {[
                    { icon: '🛏️', label: 'غرف', value: appart.nb_chambres },
                    { icon: '🚿', label: 'حمامات', value: appart.nb_salles_bain },
                    { icon: '👥', label: 'أشخاص', value: appart.capacite_max },
                    { icon: '📐', label: 'م²', value: appart.surface_m2 },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-2xl">{s.icon}</p>
                      <p className="text-lg font-bold text-primary">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h2 className="font-bold text-primary mb-2">الوصف</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{appart.description}</p>
                </div>
              </div>

              {/* Equipements */}
              {equipements.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-bold text-primary mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>المرافق والتجهيزات</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {equipements.map((eq) => (
                      <div key={eq} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-teal">✓</span> {eq}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner info */}
              {appart.proprietaire && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-bold text-primary mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>معلومات المالك</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                      {appart.proprietaire.prenom.charAt(0)}{appart.proprietaire.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-primary">{appart.proprietaire.prenom} {appart.proprietaire.nom}</p>
                      {appart.proprietaire.statut_verification === 'verifie' && (
                        <p className="text-teal text-sm">✅ مالك موثق</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-bold text-primary mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                  التقييمات ({publishedAvis.length})
                </h2>

                {publishedAvis.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">💬</p>
                    <p className="text-gray-500">لا توجد تقييمات بعد</p>
                  </div>
                )}

                <div className="space-y-4">
                  {publishedAvis.map((avis) => (
                    <div key={avis.id} className="border border-sand-dark rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-sand-md flex items-center justify-center font-bold text-xs text-primary">
                            {avis.client?.prenom?.charAt(0) ?? '?'}
                          </div>
                          <p className="font-medium text-primary text-sm">
                            {avis.client?.prenom} {avis.client?.nom}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRating note={avis.note_globale} />
                          <span className="text-sm font-bold text-primary">{avis.note_globale.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{avis.commentaire}</p>
                      <p className="text-gray-400 text-xs mt-2">{formatDate(avis.date_avis, 'fr-MA')}</p>
                      {avis.reponse_proprietaire && (
                        <div className="mt-3 bg-sand p-3 rounded-lg text-sm text-gray-700 border-r-4 border-primary">
                          <p className="font-medium text-primary text-xs mb-1">رد المالك:</p>
                          {avis.reponse_proprietaire}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: reservation widget */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-primary">{formatCurrency(appart.prix_nuit)}</span>
                  <span className="text-gray-500">/ ليلة</span>
                </div>

                {appart.caution > 0 && (
                  <p className="text-sm text-gray-500 mb-4">ضمان: {formatCurrency(appart.caution)}</p>
                )}

                {/* WhatsApp contact */}
                <div className="mb-4">
                  <WhatsAppButton
                    inline
                    message={`مرحباً، أريد الاستفسار عن شقة "${appart.titre}" في ${appart.ville}`}
                    label="📞 تواصل مع المالك"
                  />
                </div>

                {appart.statut !== 'disponible' ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl text-center">
                    هذه الشقة غير متاحة حالياً
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-center space-y-3">
                    <p className="text-gray-600 text-sm">يجب تسجيل الدخول لإجراء الحجز</p>
                    <Link href={`/${locale}/auth/login`} className="btn-primary w-full flex justify-center">
                      تسجيل الدخول
                    </Link>
                    <Link href={`/${locale}/auth/register`} className="block text-center text-primary-mid text-sm hover:underline">
                      إنشاء حساب مجاني
                    </Link>
                  </div>
                ) : user?.role !== 'client' ? (
                  <div className="bg-gold/10 border border-gold/30 text-primary text-sm p-4 rounded-xl text-center">
                    الحجز متاح للعملاء فقط
                  </div>
                ) : !showReservationForm ? (
                  <button
                    onClick={() => setShowReservationForm(true)}
                    className="btn-gold w-full flex justify-center"
                  >
                    احجز الآن
                  </button>
                ) : (
                  <form onSubmit={(e) => void handleSubmit(onReserve)(e)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">تاريخ الوصول</label>
                      <input
                        type="date"
                        {...register('date_arrivee', { required: 'مطلوب' })}
                        min={today}
                        className="input-field ltr"
                        dir="ltr"
                      />
                      {errors.date_arrivee && <p className="text-red-500 text-xs mt-1">{errors.date_arrivee.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">تاريخ المغادرة</label>
                      <input
                        type="date"
                        {...register('date_depart', {
                          required: 'مطلوب',
                          validate: (v) => !dateArrivee || v > dateArrivee || 'يجب أن يكون بعد تاريخ الوصول',
                        })}
                        min={dateArrivee || today}
                        className="input-field ltr"
                        dir="ltr"
                      />
                      {errors.date_depart && <p className="text-red-500 text-xs mt-1">{errors.date_depart.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">عدد الأشخاص</label>
                      <input
                        type="number"
                        {...register('nb_personnes', {
                          required: 'مطلوب',
                          min: { value: 1, message: 'الحد الأدنى شخص' },
                          max: { value: appart.capacite_max, message: `الحد الأقصى ${appart.capacite_max} أشخاص` },
                        })}
                        min={1}
                        max={appart.capacite_max}
                        defaultValue={1}
                        className="input-field ltr"
                        dir="ltr"
                      />
                      {errors.nb_personnes && <p className="text-red-500 text-xs mt-1">{errors.nb_personnes.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">رسالة للمالك (اختياري)</label>
                      <textarea
                        {...register('message_client')}
                        rows={2}
                        className="input-field resize-none"
                        placeholder="معلومات إضافية..."
                      />
                    </div>

                    {nights > 0 && (
                      <div className="bg-sand rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatCurrency(appart.prix_nuit)} × {nights} ليالٍ</span>
                          <span>{formatCurrency(totalPrice)}</span>
                        </div>
                        {appart.caution > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>ضمان</span>
                            <span>{formatCurrency(appart.caution)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-primary border-t border-sand-dark pt-2">
                          <span>الإجمالي</span>
                          <span>{formatCurrency(totalPrice + appart.caution)}</span>
                        </div>
                      </div>
                    )}

                    {reservation.isError && (
                      <p className="text-red-500 text-sm">❌ فشل الحجز. حاول مرة أخرى.</p>
                    )}

                    {reservation.isSuccess && (
                      <p className="text-teal text-sm">✅ تم إرسال طلب الحجز! انتظر تأكيد المالك.</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={reservation.isPending}
                        className="btn-gold flex-1 flex justify-center text-sm"
                      >
                        {reservation.isPending ? '⏳ جاري الإرسال...' : 'تأكيد الطلب'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReservationForm(false)}
                        className="px-3 py-2 border border-sand-dark rounded-lg text-gray-600 hover:bg-sand text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
