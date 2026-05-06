'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { useAuthStore } from '@/stores/authStore';
import { reservationApi, paiementApi, avisApi } from '@/lib/api';
import { formatCurrency, formatDate, calculateNights } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import type { PaiementMethode } from '@/types/api.types';

const METHODES: { value: PaiementMethode; label: string; icon: string; desc: string }[] = [
  { value: 'CMI',              label: 'CMI / Carte bancaire',  icon: '💳', desc: 'Visa, Mastercard, CIH...' },
  { value: 'PayPal',           label: 'PayPal',                icon: '🅿️', desc: 'Paiement sécurisé en ligne' },
  { value: 'virement_bancaire',label: 'Virement bancaire',     icon: '🏦', desc: 'RIB communiqué après confirmation' },
  { value: 'especes',          label: 'Espèces à l\'arrivée', icon: '💵', desc: 'Paiement en main propre' },
];

// Étapes du workflow
const STEPS = [
  { label: 'طلب الحجز', icon: '📋' },
  { label: 'انتظار المالك', icon: '⏳' },
  { label: 'الدفع', icon: '💳' },
  { label: 'إقامة مؤكدة', icon: '✅' },
];

function getActiveStep(statut: string, hasPaiement: boolean) {
  if (statut === 'en_attente') return 1;
  if (statut === 'confirmee' && !hasPaiement) return 2;
  if (statut === 'confirmee' && hasPaiement) return 3;
  if (statut === 'terminee') return 3;
  return 0;
}

interface AvisForm {
  note_proprete: number;
  note_localisation: number;
  note_rapport_qp: number;
  note_communication: number;
  commentaire: string;
}

export default function ReservationDetailPage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const id = Number(params.id);
  const [selectedMethode, setSelectedMethode] = useState<PaiementMethode>('CMI');
  const [showAvisForm, setShowAvisForm] = useState(false);

  const { data: reservation, isLoading, refetch } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

  const payer = useMutation({
    mutationFn: () => paiementApi.create({ id_reservation: id, methode: selectedMethode }),
    onSuccess: () => { void refetch(); void qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const annuler = useMutation({
    mutationFn: () => reservationApi.annuler(id),
    onSuccess: () => void refetch(),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AvisForm>({
    defaultValues: { note_proprete: 5, note_localisation: 5, note_rapport_qp: 5, note_communication: 5 },
  });

  const soumettreAvis = useMutation({
    mutationFn: (data: AvisForm) => avisApi.create({ ...data, id_appartement: reservation?.id_appartement, id_reservation: id }),
    onSuccess: () => { setShowAvisForm(false); void refetch(); },
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="bg-sand min-h-screen">
          <div className="container-app py-10 space-y-4 max-w-3xl mx-auto">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
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
            <p className="text-6xl mb-4">📋</p>
            <p className="text-xl font-bold text-primary mb-2">الحجز غير موجود</p>
            <Link href={`/${locale}/dashboard/client`} className="btn-primary mt-4 inline-block">العودة للوحة التحكم</Link>
          </div>
        </main>
      </>
    );
  }

  const nights = calculateNights(reservation.date_arrivee, reservation.date_depart);
  const appart = reservation.appartement;
  const paiement = reservation.paiement;
  const caution = Number((appart as any)?.caution ?? 0);
  const prixSejour = Number(reservation.prix_total);
  const totalAvecCaution = prixSejour + caution;
  const canPay = reservation.statut === 'confirmee' && !paiement;
  const canCancel = ['en_attente', 'confirmee'].includes(reservation.statut);
  const canReview = reservation.statut === 'terminee' && user?.role === 'client' && !reservation.paiement;
  const isProprietaire = user?.role === 'proprietaire';
  const activeStep = getActiveStep(reservation.statut, !!paiement);
  const cautionAtArrival = selectedMethode === 'especes' || selectedMethode === 'virement_bancaire';

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-8 max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href={`/${locale}/dashboard/${user?.role ?? 'client'}`} className="hover:text-primary">لوحة التحكم</Link>
            <span>/</span>
            <span className="text-primary font-medium">الحجز #{reservation.id}</span>
          </nav>

          {/* ── Workflow steps ── */}
          {!['annulee_client', 'annulee_proprietaire', 'litige'].includes(reservation.statut) && (
            <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
              <div className="flex items-center justify-between relative">
                {/* connecting line */}
                <div className="absolute top-5 start-8 end-8 h-0.5 bg-sand-dark" />
                <div
                  className="absolute top-5 start-8 h-0.5 bg-teal transition-all duration-700"
                  style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((step, i) => (
                  <div key={step.label} className="flex flex-col items-center gap-1 z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                      i <= activeStep
                        ? 'bg-teal border-teal text-white'
                        : 'bg-white border-sand-dark text-gray-300'
                    }`}>
                      {step.icon}
                    </div>
                    <span className={`text-xs font-medium text-center leading-tight ${i <= activeStep ? 'text-teal' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Annulation banner */}
          {['annulee_client', 'annulee_proprietaire'].includes(reservation.statut) && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <div>
                <p className="font-bold text-red-700">تم إلغاء الحجز</p>
                {reservation.motif_annulation && (
                  <p className="text-sm text-red-600 mt-0.5">السبب: {reservation.motif_annulation}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Détails réservation ── */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-primary" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                  حجز #{reservation.id}
                </h1>
                {appart && (
                  <Link href={`/${locale}/appartements/${(appart as any).id}`} className="text-primary-mid hover:underline text-sm mt-1 block">
                    🏠 {(appart as any).titre} — {(appart as any).ville}
                  </Link>
                )}
              </div>
              <StatusBadge status={reservation.statut} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-sand-dark text-center mb-4">
              <div className="bg-sand rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">الوصول</p>
                <p className="font-bold text-primary text-sm">{formatDate(reservation.date_arrivee, 'fr-MA')}</p>
              </div>
              <div className="bg-sand rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">المغادرة</p>
                <p className="font-bold text-primary text-sm">{formatDate(reservation.date_depart, 'fr-MA')}</p>
              </div>
              <div className="bg-sand rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">الليالي</p>
                <p className="font-bold text-primary text-sm">{nights}</p>
              </div>
              <div className="bg-sand rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">الأشخاص</p>
                <p className="font-bold text-primary text-sm">{reservation.nb_personnes}</p>
              </div>
            </div>

            {/* Message client */}
            {reservation.message_client && (
              <div className="bg-sand rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">رسالتك للمالك:</p>
                <p className="text-gray-700 text-sm italic">"{reservation.message_client}"</p>
              </div>
            )}

            {/* Résumé financier */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(Number(reservation.prix_nuit_applique))} × {nights} ليالٍ</span>
                <span>{formatCurrency(prixSejour)}</span>
              </div>
              {caution > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    🛡️ ضمان (مبلغ قابل للاسترداد)
                  </span>
                  <span>{formatCurrency(caution)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-primary text-base border-t border-sand-dark pt-2">
                <span>الإجمالي</span>
                <span>{formatCurrency(caution > 0 ? totalAvecCaution : prixSejour)}</span>
              </div>
            </div>
          </div>

          {/* ── Section Paiement ── */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-4">
            <h2 className="font-bold text-primary mb-4 text-lg" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              💳 الدفع والضمان
            </h2>

            {paiement ? (
              /* Paiement déjà effectué */
              <div className="space-y-3">
                <div className="bg-teal/10 border border-teal/30 rounded-xl p-4 flex items-center gap-3 mb-4">
                  <span className="text-3xl">✅</span>
                  <div>
                    <p className="font-bold text-teal">تم الدفع بنجاح</p>
                    <p className="text-sm text-gray-600">{formatDate(paiement.date_paiement, 'fr-MA')}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">حالة الدفع</span>
                    <StatusBadge status={paiement.statut} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبلغ المدفوع</span>
                    <span className="font-bold text-primary">{formatCurrency(Number(paiement.montant))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">طريقة الدفع</span>
                    <span className="text-gray-700">{paiement.methode}</span>
                  </div>
                  {caution > 0 && (
                    <div className="flex justify-between border-t border-sand-dark pt-2">
                      <span className="text-gray-600">🛡️ الضمان (يُسترد بعد الإقامة)</span>
                      <span className="text-gold font-medium">{formatCurrency(caution)}</span>
                    </div>
                  )}
                  {isProprietaire && (
                    <div className="flex justify-between border-t border-sand-dark pt-2">
                      <span className="text-gray-600">حصتك (بعد عمولة 10٪)</span>
                      <span className="font-bold text-teal">{formatCurrency(Number(paiement.montant_proprietaire))}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : canPay ? (
              /* Formulaire de paiement */
              <div className="space-y-5">
                {/* Récap montant */}
                <div className="bg-sand rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>ثمن الإقامة ({nights} ليالٍ)</span>
                    <span>{formatCurrency(prixSejour)}</span>
                  </div>
                  {caution > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>🛡️ الضمان (قابل للاسترداد)</span>
                      <span className="text-gold">{formatCurrency(caution)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-primary border-t border-sand-dark pt-2">
                    <span>المجموع {cautionAtArrival && caution > 0 ? '(بدون الضمان)' : ''}</span>
                    <span>{formatCurrency(cautionAtArrival ? prixSejour : totalAvecCaution)}</span>
                  </div>
                  {cautionAtArrival && caution > 0 && (
                    <p className="text-xs text-gold bg-gold/10 rounded-lg px-3 py-1.5">
                      🛡️ الضمان ({formatCurrency(caution)}) يُدفع نقداً عند الوصول ويُسترد عند المغادرة
                    </p>
                  )}
                </div>

                {/* Choix méthode */}
                <div>
                  <p className="text-sm font-medium text-primary mb-3">اختر طريقة الدفع:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {METHODES.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setSelectedMethode(m.value)}
                        className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-start transition-all ${
                          selectedMethode === m.value
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-sand-dark text-gray-600 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{m.icon}</span>
                          <span className="text-sm font-semibold text-primary">{m.label}</span>
                        </div>
                        <span className="text-xs text-gray-400 ps-7">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avertissement virement */}
                {selectedMethode === 'virement_bancaire' && (
                  <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-sm text-primary">
                    <p className="font-semibold mb-1">📋 تعليمات الدفع بالتحويل</p>
                    <p className="text-gray-600">ستتلقى RIB الخاص بالمالك بعد تأكيد الحجز. يجب إتمام التحويل خلال 48 ساعة.</p>
                  </div>
                )}

                {payer.isError && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">❌ فشل الدفع. حاول مرة أخرى.</p>
                )}

                <button
                  onClick={() => payer.mutate()}
                  disabled={payer.isPending}
                  className="btn-gold w-full flex justify-center gap-2 text-sm"
                >
                  {payer.isPending
                    ? '⏳ جاري المعالجة...'
                    : `💳 تأكيد الدفع — ${formatCurrency(cautionAtArrival ? prixSejour : totalAvecCaution)}`
                  }
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-3">🔒</p>
                <p className="text-sm font-medium">
                  {reservation.statut === 'en_attente'
                    ? 'انتظر تأكيد المالك أولاً قبل إتمام الدفع'
                    : reservation.statut === 'annulee_client' || reservation.statut === 'annulee_proprietaire'
                    ? 'تم إلغاء الحجز — لا يمكن الدفع'
                    : 'لا يوجد دفع مرتبط بهذا الحجز'}
                </p>
              </div>
            )}
          </div>

          {/* ── Section Daman (caution info) ── */}
          {caution > 0 && !['annulee_client', 'annulee_proprietaire'].includes(reservation.statut) && (
            <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
              <h2 className="font-bold text-primary mb-3 flex items-center gap-2">
                🛡️ مبلغ الضمان (دامان)
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between items-center py-2 border-b border-sand-dark">
                  <span>مبلغ الضمان</span>
                  <span className="font-bold text-gold text-base">{formatCurrency(caution)}</span>
                </div>
                <p className="flex items-start gap-2 pt-1">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  الضمان قابل للاسترداد الكامل بعد المغادرة وبعد التحقق من حالة الشقة
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  يُدفع إما عبر الإنترنت مع ثمن الإقامة، أو نقداً عند الوصول (حسب طريقة الدفع)
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold flex-shrink-0">⚠️</span>
                  قد يُحتجز جزء من الضمان في حالة الأضرار أو التأخر في المغادرة
                </p>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {canCancel && (
              <button
                onClick={() => annuler.mutate()}
                disabled={annuler.isPending}
                className="flex-1 border border-red-300 text-red-600 px-5 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors text-sm"
              >
                {annuler.isPending ? '⏳ جاري الإلغاء...' : '❌ إلغاء الحجز'}
              </button>
            )}
            {appart && (
              <Link
                href={`/${locale}/appartements/${(appart as any).id}`}
                className="flex-1 border border-primary/30 text-primary px-5 py-3 rounded-xl font-medium hover:bg-primary/5 transition-colors text-sm text-center"
              >
                🏠 عرض الشقة
              </Link>
            )}
          </div>

          {/* ── Section Avis ── */}
          {reservation.statut === 'terminee' && user?.role === 'client' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-primary mb-4 text-lg" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                ⭐ تقييم إقامتك
              </h2>
              {!showAvisForm ? (
                <button onClick={() => setShowAvisForm(true)} className="btn-gold w-full flex justify-center text-sm">
                  ✍️ اكتب تقييمك
                </button>
              ) : (
                <form onSubmit={(e) => void handleSubmit((d) => soumettreAvis.mutate(d))(e)} className="space-y-5">
                  {[
                    { name: 'note_proprete' as const,      label: '🧹 النظافة' },
                    { name: 'note_localisation' as const,  label: '📍 الموقع' },
                    { name: 'note_rapport_qp' as const,    label: '💰 الجودة/السعر' },
                    { name: 'note_communication' as const, label: '💬 التواصل' },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center gap-4">
                      <label className="w-36 text-sm font-medium text-primary flex-shrink-0">{f.label}</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setValue(f.name, star)}
                            className={`text-2xl transition-transform hover:scale-110 ${watch(f.name) >= star ? 'text-gold' : 'text-gray-300'}`}
                          >
                            ★
                          </button>
                        ))}
                        <input type="hidden" {...register(f.name, { required: true })} />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">تعليقك</label>
                    <textarea
                      {...register('commentaire', { required: 'التعليق مطلوب', minLength: { value: 10, message: 'أدخل 10 أحرف على الأقل' } })}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="شاركنا تجربتك في هذه الشقة..."
                    />
                    {errors.commentaire && <p className="text-red-500 text-xs mt-1">{errors.commentaire.message}</p>}
                  </div>
                  {soumettreAvis.isError && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">❌ فشل إرسال التقييم.</p>}
                  <div className="flex gap-3">
                    <button type="submit" disabled={soumettreAvis.isPending} className="btn-gold flex-1 flex justify-center text-sm">
                      {soumettreAvis.isPending ? '⏳...' : 'إرسال التقييم ⭐'}
                    </button>
                    <button type="button" onClick={() => setShowAvisForm(false)} className="px-4 py-2 border border-sand-dark rounded-xl text-gray-600 hover:bg-sand text-sm">
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
