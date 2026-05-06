'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchStore } from '@/stores/searchStore';

interface SearchFormValues {
  date_arrivee: string;
  date_depart: string;
  nb_personnes: number;
}

export function SearchBar() {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const setFilters = useSearchStore((s) => s.setFilters);

  const { register, handleSubmit } = useForm<SearchFormValues>({
    defaultValues: { nb_personnes: 2 },
  });

  const onSubmit = (data: SearchFormValues) => {
    setFilters({ ...data, page: 1 });
    router.push(`/${locale}/appartements`);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="bg-white rounded-2xl shadow-modal p-6 flex flex-col md:flex-row gap-4 w-full max-w-3xl mx-auto">
      {/* Arrivée */}
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1 font-medium">{t('arrival')}</label>
        <input
          type="date"
          {...register('date_arrivee')}
          min={new Date().toISOString().split('T')[0]}
          className="input-field text-sm"
        />
      </div>

      {/* Départ */}
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1 font-medium">{t('departure')}</label>
        <input
          type="date"
          {...register('date_depart')}
          min={new Date().toISOString().split('T')[0]}
          className="input-field text-sm"
        />
      </div>

      {/* Personnes */}
      <div className="w-36">
        <label className="block text-xs text-gray-500 mb-1 font-medium">{t('persons')}</label>
        <input
          type="number"
          min={1}
          max={20}
          {...register('nb_personnes', { valueAsNumber: true })}
          className="input-field text-sm"
        />
      </div>

      {/* Bouton */}
      <div className="flex items-end">
        <button type="submit" className="btn-gold w-full md:w-auto whitespace-nowrap">
          🔍 {t('searchButton')}
        </button>
      </div>
    </form>
  );
}
