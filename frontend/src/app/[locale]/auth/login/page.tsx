'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type Role = 'client' | 'proprietaire' | 'admin';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [role, setRole] = useState<Role>('client');
  const { loginClient, loginProprietaire, loginAdmin } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const mutation = role === 'admin' ? loginAdmin : role === 'proprietaire' ? loginProprietaire : loginClient;

  const onSubmit = (data: LoginForm) => {
    mutation.mutate(data);
  };

  const tabs: { key: Role; label: string }[] = [
    { key: 'client', label: t('asClient') },
    { key: 'proprietaire', label: t('asOwner') },
    { key: 'admin', label: t('asAdmin') },
  ];

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary p-8 text-center text-white">
          <h1 className="text-3xl font-bold text-gold mb-1" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>شمال كوم</h1>
          <p className="text-white/80 text-sm">{t('login')}</p>
        </div>

        <div className="p-8">
          {/* Role tabs */}
          <div className="flex rounded-xl bg-sand p-1 mb-6 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRole(tab.key)}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                  role === tab.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{t('email')}</label>
              <input
                type="email"
                {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
                placeholder="example@email.com"
                className="input-field ltr"
                dir="ltr"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">{t('password')}</label>
              <input
                type="password"
                {...register('password', { required: 'كلمة المرور مطلوبة' })}
                placeholder="••••••••"
                className="input-field ltr"
                dir="ltr"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {mutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                ❌ البريد الإلكتروني أو كلمة المرور غير صحيحة
              </div>
            )}

            {role === 'proprietaire' && (
              <div className="bg-gold/10 border border-gold/30 text-sm p-3 rounded-lg text-primary">
                ⚠️ {t('ownerPending')}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full justify-center flex items-center gap-2"
            >
              {mutation.isPending ? '⏳ جاري الدخول...' : `${t('login')} كـ${tabs.find(t => t.key === role)?.label}`}
            </button>
          </form>

          {/* Forgot password */}
          {role === 'client' && (
            <p className="text-center text-xs text-gray-500 mt-3">
              <Link href={`/${locale}/auth/forgot-password`} className="hover:underline text-primary-mid">
                نسيت كلمة المرور؟
              </Link>
            </p>
          )}

          {/* Register link */}
          {role !== 'admin' && (
            <p className="text-center text-sm text-gray-600 mt-4">
              {t('noAccount')}{' '}
              <Link href={`/${locale}/auth/register`} className="text-primary-mid font-medium hover:underline">
                {t('register')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
