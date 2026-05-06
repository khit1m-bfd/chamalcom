'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

interface ProfileForm {
  nom: string;
  prenom: string;
  telephone: string;
  nationalite: string;
}

export default function ProfilPage() {
  const locale = useLocale();
  const { user, setUser } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileForm>();

  useEffect(() => {
    if (user) {
      reset({
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone ?? '',
        nationalite: '',
      });
    }
  }, [user, reset]);

  const update = useMutation({
    mutationFn: (data: ProfileForm) => authApi.updateProfile(data),
    onSuccess: (res) => {
      setUser({ ...user!, ...res.data.data });
    },
  });

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="bg-sand min-h-screen flex items-center justify-center">
          <p className="text-gray-500">يرجى تسجيل الدخول أولاً</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10 max-w-2xl mx-auto">
          <h1 className="section-title mb-8">ملفي الشخصي</h1>

          {/* Avatar card */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {user.prenom.charAt(0)}{user.nom.charAt(0)}
            </div>
            <div>
              <p className="text-xl font-bold text-primary">{user.prenom} {user.nom}</p>
              <p className="text-gray-500 text-sm ltr" dir="ltr">{user.email}</p>
              <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                {user.role === 'client' ? '👤 عميل' : user.role === 'proprietaire' ? '🏠 مالك' : '⚙️ مدير'}
              </span>
            </div>
          </div>

          {/* Edit form */}
          {user.role === 'client' && (
            <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
              <h2 className="font-bold text-primary mb-5" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                تعديل المعلومات الشخصية
              </h2>
              <form onSubmit={(e) => void handleSubmit((d) => update.mutate(d))(e)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">الاسم العائلي</label>
                    <input {...register('nom', { required: 'مطلوب' })} className="input-field" />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">الاسم الشخصي</label>
                    <input {...register('prenom', { required: 'مطلوب' })} className="input-field" />
                    {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">رقم الهاتف</label>
                  <input {...register('telephone')} className="input-field ltr" dir="ltr" placeholder="+212 6XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">الجنسية</label>
                  <input {...register('nationalite')} className="input-field" placeholder="مغربية" />
                </div>

                {update.isError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
                    ❌ فشل حفظ التغييرات.
                  </div>
                )}
                {update.isSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl">
                    ✅ تم حفظ التغييرات بنجاح.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={update.isPending || !isDirty}
                  className="btn-primary w-full flex justify-center"
                >
                  {update.isPending ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
                </button>
              </form>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-primary mb-4" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              روابط سريعة
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {user.role === 'client' && (
                <>
                  <a href={`/${locale}/dashboard/client`} className="flex items-center gap-3 p-4 rounded-xl border border-sand-dark hover:border-primary hover:bg-sand/50 transition-colors text-sm font-medium text-primary">
                    <span className="text-2xl">📋</span> حجوزاتي
                  </a>
                  <a href={`/${locale}/favoris`} className="flex items-center gap-3 p-4 rounded-xl border border-sand-dark hover:border-primary hover:bg-sand/50 transition-colors text-sm font-medium text-primary">
                    <span className="text-2xl">❤️</span> المفضلة
                  </a>
                </>
              )}
              {user.role === 'proprietaire' && (
                <>
                  <a href={`/${locale}/dashboard/proprietaire`} className="flex items-center gap-3 p-4 rounded-xl border border-sand-dark hover:border-primary hover:bg-sand/50 transition-colors text-sm font-medium text-primary">
                    <span className="text-2xl">🏠</span> لوحة التحكم
                  </a>
                  <a href={`/${locale}/dashboard/proprietaire/annonce/new`} className="flex items-center gap-3 p-4 rounded-xl border border-sand-dark hover:border-primary hover:bg-sand/50 transition-colors text-sm font-medium text-primary">
                    <span className="text-2xl">➕</span> إضافة شقة
                  </a>
                </>
              )}
              <a href={`/${locale}/appartements`} className="flex items-center gap-3 p-4 rounded-xl border border-sand-dark hover:border-primary hover:bg-sand/50 transition-colors text-sm font-medium text-primary col-span-2">
                <span className="text-2xl">🏖️</span> تصفح الشقق
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
