'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
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

export default function EditAnnoncePage({ params }: { params: { id: string } }) {
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();
  const id = Number(params.id);
  const [selectedEquip, setSelectedEquip] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: appart, isLoading } = useQuery({
    queryKey: ['appartement', id],
    queryFn: () => appartementApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppartForm>();

  useEffect(() => {
    if (appart) {
      reset({
        titre: appart.titre,
        description: appart.description,
        adresse: appart.adresse,
        ville: appart.ville,
        region: appart.region,
        surface_m2: appart.surface_m2,
        nb_chambres: appart.nb_chambres,
        nb_salles_bain: appart.nb_salles_bain,
        capacite_max: appart.capacite_max,
        prix_nuit: appart.prix_nuit,
        caution: appart.caution,
        latitude: appart.latitude?.toString() ?? '',
        longitude: appart.longitude?.toString() ?? '',
      });
      try {
        const eq = JSON.parse(appart.equipements) as string[];
        setSelectedEquip(Array.isArray(eq) ? eq : []);
      } catch {
        setSelectedEquip(appart.equipements.split(',').map((e) => e.trim()).filter(Boolean));
      }
    }
  }, [appart, reset]);

  const updateMutation = useMutation({
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
      await appartementApi.update(id, payload);

      if (newImages.length > 0) {
        const fd = new FormData();
        newImages.forEach((img) => fd.append('images', img));
        await appartementApi.uploadImages(id, fd);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appartement', id] });
      void qc.invalidateQueries({ queryKey: ['mes-annonces'] });
      router.push(`/${locale}/dashboard/proprietaire`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => appartementApi.delete(id),
    onSuccess: () => router.push(`/${locale}/dashboard/proprietaire`),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => appartementApi.deleteImage(imageId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['appartement', id] }),
  });

  const setPrincipaleMutation = useMutation({
    mutationFn: (imageId: number) => appartementApi.setPrincipale(imageId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['appartement', id] }),
  });

  const toggleEquip = (eq: string) => {
    setSelectedEquip((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]);
  };

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const onSubmit = (data: AppartForm) => updateMutation.mutate(data);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="bg-sand min-h-screen">
          <div className="container-app py-10 space-y-4 max-w-3xl mx-auto">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-8 max-w-3xl mx-auto">
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href={`/${locale}/dashboard/proprietaire`} className="hover:text-primary">لوحة التحكم</Link>
            <span>/</span>
            <span className="text-primary">تعديل الإعلان</span>
          </nav>

          <div className="flex items-center justify-between mb-6">
            <h1 className="section-title mb-0">تعديل الإعلان</h1>
            {appart && <StatusBadge status={appart.statut} />}
          </div>

          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
            {/* Informations de base */}
            <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
              <h2 className="font-bold text-primary text-lg" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>المعلومات الأساسية</h2>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">عنوان الإعلان</label>
                <input {...register('titre', { required: 'مطلوب' })} className="input-field" />
                {errors.titre && <p className="text-red-500 text-xs mt-1">{errors.titre.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">الوصف</label>
                <textarea {...register('description', { required: 'مطلوب' })} rows={5} className="input-field resize-none" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">العنوان</label>
                  <input {...register('adresse', { required: 'مطلوب' })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">المدينة</label>
                  <input {...register('ville', { required: 'مطلوب' })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">المنطقة</label>
                <input {...register('region')} className="input-field" />
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-primary text-lg mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>المواصفات</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: 'nb_chambres' as const,    label: '🛏️ الغرف' },
                  { name: 'nb_salles_bain' as const, label: '🚿 الحمامات' },
                  { name: 'capacite_max' as const,   label: '👥 الطاقة' },
                  { name: 'surface_m2' as const,     label: '📐 المساحة (م²)' },
                  { name: 'prix_nuit' as const,      label: '💰 السعر/ليلة' },
                  { name: 'caution' as const,        label: '🔐 الضمان' },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-primary mb-1">{f.label}</label>
                    <input type="number" {...register(f.name, { required: 'مطلوب', min: 0 })} className="input-field ltr" dir="ltr" />
                  </div>
                ))}
              </div>
            </div>

            {/* Équipements */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-primary text-lg mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>التجهيزات</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EQUIPEMENTS_OPTIONS.map((eq) => (
                  <button key={eq} type="button" onClick={() => toggleEquip(eq)}
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

            {/* Gestion photos */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-primary text-lg mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>الصور الحالية</h2>
              {appart?.images && appart.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {appart.images.map((img) => (
                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-sand-md">
                      <img src={img.url_image} alt="" className="w-full h-full object-cover" />
                      {img.est_principale && (
                        <div className="absolute top-1 start-1 bg-gold text-primary text-xs px-2 py-0.5 rounded-full font-bold">رئيسية</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.est_principale && (
                          <button type="button" onClick={() => setPrincipaleMutation.mutate(img.id)}
                            className="text-white text-xs bg-gold/80 px-2 py-1 rounded-lg"
                          >جعلها رئيسية</button>
                        )}
                        <button type="button" onClick={() => deleteImageMutation.mutate(img.id)}
                          className="text-white text-xs bg-red-500/80 px-2 py-1 rounded-lg"
                        >حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm mb-4">لا توجد صور</p>
              )}

              <label className="block w-full border-2 border-dashed border-sand-dark rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleNewImages} className="sr-only" />
                <p className="text-3xl mb-1">📷</p>
                <p className="text-gray-600 text-sm">إضافة صور جديدة</p>
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {updateMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
                ❌ فشل حفظ التغييرات.
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={updateMutation.isPending} className="btn-gold flex-1 flex justify-center">
                {updateMutation.isPending ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
              </button>
              <Link href={`/${locale}/dashboard/proprietaire`}
                className="px-5 py-3 border border-sand-dark rounded-xl text-gray-600 hover:bg-sand transition-colors text-sm flex items-center"
              >
                إلغاء
              </Link>
              <button
                type="button"
                onClick={() => { if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
                className="px-5 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm"
              >
                🗑️ حذف
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
