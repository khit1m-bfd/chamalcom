'use client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AppartCard } from '@/components/appartement/AppartCard';
import { AppartCardSkeleton } from '@/components/common/LoadingSkeleton';
import { useAppartements } from '@/hooks/useAppartements';
import { useSearchStore } from '@/stores/searchStore';
import { useTranslations } from 'next-intl';

export default function AppartementsPage() {
  const t = useTranslations('apartments');
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const { data, isLoading, isError } = useAppartements(filters);

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="section-title mb-1">{t('title')}</h1>
              {data && <p className="text-gray-500 text-sm">{data.meta.total} شقة متاحة</p>}
            </div>

            {/* Sort */}
            <select
              className="input-field w-auto"
              value={filters.sort ?? 'recent'}
              onChange={(e) => setFilters({ sort: e.target.value as 'recent' | 'prix_asc' | 'prix_desc' | 'note_desc' })}
            >
              <option value="recent">{t('sortNew')}</option>
              <option value="prix_asc">{t('sortPrice')} ↑</option>
              <option value="prix_desc">{t('sortPrice')} ↓</option>
              <option value="note_desc">{t('sortRating')}</option>
            </select>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white rounded-xl shadow-card">
            <input
              type="number"
              placeholder="السعر الأدنى"
              className="input-field w-32 text-sm"
              value={filters.prix_min ?? ''}
              onChange={(e) => setFilters({ prix_min: e.target.value ? Number(e.target.value) : undefined })}
            />
            <input
              type="number"
              placeholder="السعر الأقصى"
              className="input-field w-32 text-sm"
              value={filters.prix_max ?? ''}
              onChange={(e) => setFilters({ prix_max: e.target.value ? Number(e.target.value) : undefined })}
            />
            <input
              type="number"
              placeholder="عدد الغرف"
              min={1}
              className="input-field w-32 text-sm"
              value={filters.nb_chambres ?? ''}
              onChange={(e) => setFilters({ nb_chambres: e.target.value ? Number(e.target.value) : undefined })}
            />
            <button
              onClick={() => setFilters({ prix_min: undefined, prix_max: undefined, nb_chambres: undefined, nb_personnes: undefined })}
              className="text-sm text-primary-mid hover:text-primary underline"
            >
              إعادة تعيين
            </button>
          </div>

          {/* Grid */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <AppartCardSkeleton key={i} />)}
            </div>
          )}

          {isError && (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">⚠️</p>
              <p className="text-gray-500">خطأ في تحميل الشقق. حاول مجدداً.</p>
            </div>
          )}

          {data && data.data.length === 0 && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🏖️</p>
              <h3 className="text-xl font-bold text-primary mb-2">{t('noResults')}</h3>
              <p className="text-gray-500">{t('noResultsDesc')}</p>
            </div>
          )}

          {data && data.data.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.map((appart) => (
                  <AppartCard key={appart.id} appartement={appart} />
                ))}
              </div>

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    disabled={data.meta.page <= 1}
                    onClick={() => setFilters({ page: data.meta.page - 1 })}
                    className="px-4 py-2 rounded-lg bg-white border border-sand-dark text-primary disabled:opacity-40 hover:bg-sand transition-colors"
                  >
                    السابق
                  </button>
                  <span className="text-sm text-gray-600">
                    {data.meta.page} / {data.meta.totalPages}
                  </span>
                  <button
                    disabled={data.meta.page >= data.meta.totalPages}
                    onClick={() => setFilters({ page: data.meta.page + 1 })}
                    className="px-4 py-2 rounded-lg bg-white border border-sand-dark text-primary disabled:opacity-40 hover:bg-sand transition-colors"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
