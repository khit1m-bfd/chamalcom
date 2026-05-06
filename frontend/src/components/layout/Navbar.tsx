'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { ChamalLogo } from '@/components/common/Logo';
import { NotificationBell } from '@/components/common/NotificationBell';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { user, isAuthenticated, _hydrated } = useAuthStore();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Éviter le mismatch SSR/CSR
  useEffect(() => { setMounted(true); }, []);

  const switchLocale = locale === 'ar' ? 'fr' : 'ar';
  const isAuth = mounted && _hydrated && isAuthenticated;

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container-app flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
          <ChamalLogo className="h-9 w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          <Link href={`/${locale}`} className="hover:text-gold transition-colors">{t('home')}</Link>
          <Link href={`/${locale}/appartements`} className="hover:text-gold transition-colors">{t('apartments')}</Link>

          {isAuth && user ? (
            <>
              {/* Client extras */}
              {user.role === 'client' && (
                <>
                  <Link href={`/${locale}/favoris`} className="hover:text-gold transition-colors" title="المفضلة">❤️</Link>
                  <Link href={`/${locale}/profil`} className="hover:text-gold transition-colors">الملف الشخصي</Link>
                </>
              )}

              {/* Proprietaire extras */}
              {user.role === 'proprietaire' && (
                <Link href={`/${locale}/dashboard/proprietaire/reservations`} className="hover:text-gold transition-colors">
                  الحجوزات
                </Link>
              )}

              {/* Admin extras */}
              {user.role === 'admin' && (
                <div className="flex items-center gap-3">
                  <Link href={`/${locale}/dashboard/admin/utilisateurs`} className="hover:text-gold transition-colors">المستخدمون</Link>
                  <Link href={`/${locale}/dashboard/admin/annonces`} className="hover:text-gold transition-colors">الإعلانات</Link>
                  <Link href={`/${locale}/dashboard/admin/avis`} className="hover:text-gold transition-colors">التقييمات</Link>
                </div>
              )}

              <Link href={`/${locale}/dashboard/${user.role}`} className="hover:text-gold transition-colors">
                {t('dashboard')}
              </Link>
              <NotificationBell />
              <button onClick={() => void logout()} className="hover:text-gold transition-colors">
                {t('logout')}
              </button>
              <div className="w-8 h-8 rounded-full bg-gold text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.prenom.charAt(0)}{user.nom.charAt(0)}
              </div>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`} className="hover:text-gold transition-colors">
                {t('login')}
              </Link>
              <Link href={`/${locale}/auth/register`} className="bg-gold text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gold-dark transition-colors text-sm">
                {t('register')}
              </Link>
            </>
          )}

          {/* Switcher langue */}
          <Link
            href={`/${switchLocale}`}
            className="border border-white/40 text-white/80 hover:text-white hover:border-white px-2 py-1 rounded text-xs transition-colors"
          >
            {switchLocale === 'ar' ? 'ع' : 'FR'}
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-mid border-t border-white/20 px-4 py-4 flex flex-col gap-3 text-sm">
          <Link href={`/${locale}`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">{t('home')}</Link>
          <Link href={`/${locale}/appartements`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">{t('apartments')}</Link>
          {isAuth && user ? (
            <>
              {user.role === 'client' && (
                <>
                  <Link href={`/${locale}/favoris`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">❤️ المفضلة</Link>
                  <Link href={`/${locale}/profil`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">👤 الملف الشخصي</Link>
                </>
              )}
              {user.role === 'proprietaire' && (
                <Link href={`/${locale}/dashboard/proprietaire/reservations`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">📋 الحجوزات</Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link href={`/${locale}/dashboard/admin/utilisateurs`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">👥 المستخدمون</Link>
                  <Link href={`/${locale}/dashboard/admin/annonces`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">🏠 الإعلانات</Link>
                  <Link href={`/${locale}/dashboard/admin/avis`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">⭐ التقييمات</Link>
                </>
              )}
              <Link href={`/${locale}/dashboard/${user.role}`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">{t('dashboard')}</Link>
              <button onClick={() => { setMenuOpen(false); void logout(); }} className="text-start hover:text-gold transition-colors">{t('logout')}</button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">{t('login')}</Link>
              <Link href={`/${locale}/auth/register`} onClick={() => setMenuOpen(false)} className="hover:text-gold transition-colors">{t('register')}</Link>
            </>
          )}
          <Link href={`/${switchLocale}`} className="text-white/70 hover:text-white w-fit">
            {switchLocale === 'ar' ? 'العربية' : 'Français'}
          </Link>
        </div>
      )}
    </nav>
  );
}
