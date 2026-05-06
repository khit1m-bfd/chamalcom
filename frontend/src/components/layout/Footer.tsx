import Link from 'next/link';
import { ChamalLogoFull } from '@/components/common/Logo';

const WHATSAPP = '212600000000';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <ChamalLogoFull className="h-12 w-auto brightness-0 invert" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              منصة الإيجار السياحي الأولى في واد لاو — تطوان، المغرب.
              نربط المسافرين بأفضل الشقق والمنازل الساحلية.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold text-gold mb-4 text-sm uppercase tracking-wide">الصفحات</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/" className="hover:text-gold transition-colors">الرئيسية</Link></li>
              <li><Link href="/appartements" className="hover:text-gold transition-colors">تصفح الشقق</Link></li>
              <li><Link href="/auth/login" className="hover:text-gold transition-colors">تسجيل الدخول</Link></li>
              <li><Link href="/auth/register" className="hover:text-gold transition-colors">إنشاء حساب</Link></li>
            </ul>
          </div>

          {/* Pour les propriétaires */}
          <div>
            <h3 className="font-bold text-gold mb-4 text-sm uppercase tracking-wide">للملاك</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/auth/register" className="hover:text-gold transition-colors">سجّل كمالك</Link></li>
              <li><Link href="/dashboard/proprietaire" className="hover:text-gold transition-colors">لوحة التحكم</Link></li>
              <li><Link href="/dashboard/proprietaire/annonce/new" className="hover:text-gold transition-colors">نشر إعلان جديد</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gold mb-4 text-sm uppercase tracking-wide">تواصل معنا</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>واد لاو، تطوان، المغرب</span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن شمال كوم')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
                >
                  <span className="text-[#25D366]">●</span> واتساب
                </a>
              </li>
              <li>
                <a href="mailto:contact@chamalcom.ma" className="flex items-center gap-2 hover:text-gold transition-colors">
                  <span>✉️</span> contact@chamalcom.ma
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs">
          <p>© {year} شمال كوم — ChamalCom. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <span>واد لاو، تطوان-شفشاون-الحسيمة، المغرب</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
