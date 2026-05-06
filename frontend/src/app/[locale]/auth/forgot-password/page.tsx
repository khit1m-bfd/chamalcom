'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simuler l'envoi (backend email non configuré en dev)
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md overflow-hidden">
        <div className="bg-gradient-primary p-8 text-center text-white">
          <h1 className="text-3xl font-bold text-gold mb-1" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
            شمال كوم
          </h1>
          <p className="text-white/80 text-sm">استعادة كلمة المرور</p>
        </div>

        <div className="p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-primary mb-3" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                تم إرسال الرابط!
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                إذا كان البريد الإلكتروني <strong>{email}</strong> مسجلاً لدينا،
                ستتلقى رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                لم تجد الرسالة؟ تحقق من مجلد البريد غير المرغوب فيه (Spam).
              </p>
              <Link href={`/${locale}/auth/login`} className="btn-primary inline-block">
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-6 text-center">
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
              </p>
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field ltr"
                    dir="ltr"
                    placeholder="example@email.com"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center">
                  {loading ? '⏳ جاري الإرسال...' : '📧 إرسال رابط الاستعادة'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                <Link href={`/${locale}/auth/login`} className="text-primary-mid hover:underline">
                  ← العودة لتسجيل الدخول
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
