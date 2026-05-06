'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { appartementApi } from '@/lib/api';

const EQUIPEMENTS_OPTIONS = [
  'واي فاي', 'مكيف هواء', 'تدفئة', 'مطبخ مجهز', 'غسالة', 'تلفاز',
  'موقف سيارات', 'شرفة', 'إطلالة على البحر', 'مسبح', 'حديقة',
  'مصعد', 'خزنة', 'غرفة غسيل', 'ميكروويف', 'ثلاجة', 'فرن',
];

interface AppartForm {
  titre: string;
  description: string;
  adresse: string;
  ville: string;
  region: string;
  surface_m2: number;
  nb_chambres: number;
  nb_salles_bain: number;
  capacite_max: number;
  prix_nuit: number;
  caution: number;
  latitude: string;
  longitude: string;
}

export default function NouvelleAnnoncePage() {
  const locale = useLocale();
  const router = useRouter();
  const [selectedEquip, setSelectedEquip] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<AppartForm>();

  const createMutation = useMutation({
    mutationFn: async (data: AppartForm) => {
      const payload = {
        ...data,
        surface_m2: Number(data.surface_m2),
        nb_chambres: Number(data.nb_chambres),
        nb_salles_bain: Number(data.nb_salles_bain),
        capacite_max: Number(data.capacite_max),
        prix_nuit: Number(data.prix_nuit),
        caution: Number(data.caution),
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        equipements: JSON.stringify(selectedEquip),
      };
      const res = await appartementApi.create(payload);
      const newId = res.data.data.id;

      // Upload images si présentes
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach((img) => fd.append('images', img));
        await appartementApi.uploadImages(newId, fd);
      }

      return newId;
    },
    onSuccess: (newId) => {
      router.push(`/${locale}/dashboard/proprietaire/annonce/${newId}`);
    },
  });

  const toggleEquip = (eq: string) => {
    setSelectedEquip((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq],
    );
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const onSubmit = (data: AppartForm) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-8 max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href={`/${locale}/dashboard/proprietaire`} className="hover:text-primary">لوحة التحكم</Link>
            <span>/</span>
            <span className="text-primary">إضافة شقة جديدة</span>
          </nav>

          <h1 className="section-title mb-8">إضافة شقة جديدة</h1>

          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
            {/* Informations de base */}
            <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
              <h2 className="font-bold text-primary text-lg mb-2" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                المعلومات الأساسية
              </h2>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">عنوان الإعلان</label>
                <input
                  {...register('titre', { required: 'العنوان مطلوب', minLength: { value: 10, message: 'الحد الأدنى 10 أحرف' } })}
                  className="input-field"
                  placeholder="مثال: شقة فاخرة بإطلالة على البحر في واد لاو"
                />
                {errors.titre && <p className="text-red-500 text-xs mt-1">{errors.titre.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">وصف تفصيلي</label>
                <textarea
                  {...register('description', { required: 'الوصف مطلوب', minLength: { value: 50, message: 'الحد الأدنى 50 حرفاً' } })}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="صف شقتك بالتفصيل: الموقع، المميزات، القرب من الخدمات..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">العنوان التفصيلي</label>
                  <input {...register('adresse', { required: 'مطلوب' })} className="input-field" placeholder="رقم، شارع، حي..." />
                  {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">المدينة</label>
                  <input {...register('ville', { required: 'مطلوب' })} className="input-field" placeholder="واد لاو، تطوان، شفشاون..." />
                  {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">المنطقة / الإقليم</label>
                <input {...register('region')} className="input-field" placeholder="تطوان-شفشاون" />
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-primary text-lg mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                المواصفات
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: 'nb_chambres' as const,    label: 'عدد الغرف',    icon: '🛏️', min: 0 },
                  { name: 'nb_salles_bain' as const, label: 'عدد الحمامات', icon: '🚿', min: 1 },
                  { name: 'capacite_max' as const,   label: 'الطاقة الاستيعابية', icon: '👥', min: 1 },
                  { name: 'surface_m2' as const,     label: 'المساحة (م²)', icon: '📐', min: 10 },
                  { name: 'prix_nuit' as const,      label: 'السعر / ليلة (درهم)', icon: '💰', min: 1 },
                  { name: 'caution' as const,        label: 'مبلغ الضمان (درهم)', icon: '🔐', min: 0 },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-primary mb-1">{f.icon} {f.label}</label>
                    <input
                      type="number"
                      {...register(f.name, { required: 'مطلوب', min: { value: f.min, message: `الحد الأدنى ${f.min}` } })}
                      min={f.min}
                      className="input-field ltr"
                      dir="ltr"
                    />
                    {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]?.message}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Équipements */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-primary text-lg mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                التجهيزات والمرافق
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EQUIPEMENTS_OPTIONS.map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquip(eq)}
                    className={`text-sm px-3 py-2 rounded-xl border-2 text-right transition-colors ${
                      selectedEquip.includes(eq)
                        ? 'border-primary bg-primary text-white'
                        : 'border-sand-dark text-gray-600 hover:border-primary/50'
                    }`}
                  >
                    {selectedEquip.includes(eq) ? '✓ ' : ''}{eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-primary text-lg mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                الصور
              </h2>
              <label className="block w-full border-2 border-dashed border-sand-dark rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImages} className="sr-only" />
                <p className="text-4xl mb-2">📷</p>
                <p className="text-gray-600 font-medium">اضغط لاختيار الصور</p>
                <p className="text-gray-400 text-sm mt-1">JPG, PNG — حتى 5 صور</p>
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-sand-md">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coordonnées GPS (optionnel) */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-primary text-lg mb-1" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                الإحداثيات الجغرافية
                <span className="text-gray-400 text-sm font-normal me-2">(اختياري)</span>
              </h2>
              <p className="text-gray-400 text-xs mb-4">أضف الموقع لتحسين ظهور إعلانك على الخريطة</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">خط العرض (Latitude)</label>
                  <input {...register('latitude')} className="input-field ltr" dir="ltr" placeholder="35.4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">خط الطول (Longitude)</label>
                  <input {...register('longitude')} className="input-field ltr" dir="ltr" placeholder="-5.0234" />
                </div>
              </div>
            </div>

            {/* Submit */}
            {createMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
                ❌ فشل نشر الإعلان. تأكد من ملء جميع الحقول المطلوبة.
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-gold flex-1 flex justify-center text-base"
              >
                {createMutation.isPending ? '⏳ جاري النشر...' : '🚀 نشر الإعلان'}
              </button>
              <Link
                href={`/${locale}/dashboard/proprietaire`}
                className="px-6 py-3 border border-sand-dark rounded-xl text-gray-600 hover:bg-sand transition-colors text-sm flex items-center"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
