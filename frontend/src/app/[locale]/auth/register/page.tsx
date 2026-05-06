'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type Role = 'client' | 'proprietaire';

interface ClientForm {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  nationalite: string;
}

interface ProprietaireForm {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  cin: string;
  rib_bancaire: string;
  banque: string;
}

type FormData = ClientForm & ProprietaireForm;

export default function RegisterPage() {
  const locale = useLocale();
  const [role, setRole] = useState<Role>('client');
  const { registerClient, registerProprietaire } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const password = watch('password');

  const onSubmit = (data: FormData) => {
    const { confirmPassword, ...rest } = data;
    void confirmPassword;

    if (role === 'client') {
      registerClient.mutate({
        nom: rest.nom,
        prenom: rest.prenom,
        email: rest.email,
        password: rest.password,
        telephone: rest.telephone,
        nationalite: rest.nationalite,
      });
    } else {
      registerProprietaire.mutate({
        nom: rest.nom,
        prenom: rest.prenom,
        email: rest.email,
        password: rest.password,
        telephone: rest.telephone,
        cin: rest.cin,
        rib_bancaire: rest.rib_bancaire,
        banque: rest.banque,
      });
    }
  };

  const mutation = role === 'client' ? registerClient : registerProprietaire;

  const switchRole = (r: Role) => {
    setRole(r);
    reset();
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary p-8 text-center text-white">
          <h1 className="text-3xl font-bold text-gold mb-1" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>شمال كوم</h1>
          <p className="text-white/80 text-sm">إنشاء حساب جديد</p>
        </div>

        <div className="p-8">
          {/* Role tabs */}
          <div className="flex rounded-xl bg-sand p-1 mb-6 gap-1">
            <button
              onClick={() => switchRole('client')}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                role === 'client' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary'
              }`}
            >
              عميل
            </button>
            <button
              onClick={() => switchRole('proprietaire')}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                role === 'proprietaire' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary'
              }`}
            >
              مالك شقة
            </button>
          </div>

          {role === 'proprietaire' && (
            <div className="bg-gold/10 border border-gold/30 text-sm p-3 rounded-lg text-primary mb-5">
              ⚠️ سيتم مراجعة حسابك من قِبل الإدارة قبل التفعيل
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            {/* Nom + Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">الاسم</label>
                <input
                  {...register('nom', { required: 'الاسم مطلوب' })}
                  className="input-field"
                  placeholder="المحمدي"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">الاسم الأول</label>
                <input
                  {...register('prenom', { required: 'الاسم الأول مطلوب' })}
                  className="input-field"
                  placeholder="أحمد"
                />
                {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                {...register('email', {
                  required: 'البريد الإلكتروني مطلوب',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'بريد إلكتروني غير صالح' },
                })}
                className="input-field ltr"
                dir="ltr"
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">رقم الهاتف</label>
              <input
                type="tel"
                {...register('telephone', { required: 'رقم الهاتف مطلوب' })}
                className="input-field ltr"
                dir="ltr"
                placeholder="+212 6XX XXX XXX"
              />
              {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
            </div>

            {/* Client-specific: nationalité */}
            {role === 'client' && (
              <div>
                <label className="block text-sm font-medium text-primary mb-1">الجنسية</label>
                <input
                  {...register('nationalite')}
                  className="input-field"
                  placeholder="مغربية"
                />
              </div>
            )}

            {/* Propriétaire-specific fields */}
            {role === 'proprietaire' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">رقم البطاقة الوطنية (CIN)</label>
                  <input
                    {...register('cin', { required: 'رقم CIN مطلوب' })}
                    className="input-field ltr"
                    dir="ltr"
                    placeholder="AB123456"
                  />
                  {errors.cin && <p className="text-red-500 text-xs mt-1">{errors.cin.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">رقم الحساب البنكي (RIB)</label>
                  <input
                    {...register('rib_bancaire', { required: 'RIB مطلوب' })}
                    className="input-field ltr"
                    dir="ltr"
                    placeholder="007 123 0001234567890012 56"
                  />
                  {errors.rib_bancaire && <p className="text-red-500 text-xs mt-1">{errors.rib_bancaire.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">البنك</label>
                  <input
                    {...register('banque', { required: 'اسم البنك مطلوب' })}
                    className="input-field"
                    placeholder="CIH, Attijariwafa, BMCE..."
                  />
                  {errors.banque && <p className="text-red-500 text-xs mt-1">{errors.banque.message}</p>}
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">كلمة المرور</label>
              <input
                type="password"
                {...register('password', {
                  required: 'كلمة المرور مطلوبة',
                  minLength: { value: 8, message: 'الحد الأدنى 8 أحرف' },
                })}
                className="input-field ltr"
                dir="ltr"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">تأكيد كلمة المرور</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'تأكيد كلمة المرور مطلوب',
                  validate: (v) => v === password || 'كلمتا المرور غير متطابقتين',
                })}
                className="input-field ltr"
                dir="ltr"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {mutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                ❌ فشل إنشاء الحساب. تحقق من البيانات أو استخدم بريداً آخر.
              </div>
            )}

            {mutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
                ✅ تم إنشاء الحساب! جارٍ التوجيه إلى صفحة الدخول...
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {mutation.isPending ? '⏳ جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href={`/${locale}/auth/login`} className="text-primary-mid font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
