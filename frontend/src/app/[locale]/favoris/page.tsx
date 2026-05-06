'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AppartCard } from '@/components/appartement/AppartCard';
import { useFavoritesStore } from '@/stores/favoritesStore';

export default function FavorisPage() {
  const locale = useLocale();
  const { favorites, removeFavorite } = useFavoritesStore();

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="section-title mb-1">المفضلة ❤️</h1>
              <p className="text-gray-500 text-sm">{favorites.length} شقة محفوظة</p>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={() => favorites.forEach((f) => removeFavorite(f.id))}
                className="text-sm text-red-500 hover:underline"
              >
                مسح الكل
              </button>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-card">
              <p className="text-6xl mb-4">💔</p>
              <h2 className="text-xl font-bold text-primary mb-2" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
                لا توجد شقق مفضلة بعد
              </h2>
              <p className="text-gray-500 mb-6">تصفح الشقق وانقر على ❤️ لحفظها هنا</p>
              <Link href={`/${locale}/appartements`} className="btn-gold inline-block">
                🏖️ تصفح الشقق
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((appart) => (
                <div key={appart.id} className="relative">
                  <AppartCard appartement={appart} />
                  <button
                    onClick={() => removeFavorite(appart.id)}
                    className="absolute top-3 start-3 bg-white/90 backdrop-blur-sm text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-colors z-10"
                    title="إزالة من المفضلة"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
