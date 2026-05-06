'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { cn, formatCurrency, parseEquipements } from '@/lib/utils';
import { useFavoritesStore } from '@/stores/favoritesStore';
import type { Appartement } from '@/types/api.types';

interface AppartCardProps {
  appartement: Appartement;
  className?: string;
}

export function AppartCard({ appartement, className }: AppartCardProps) {
  const locale = useLocale();
  const [imgError, setImgError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const image = appartement.images?.find((i) => i.est_principale) ?? appartement.images?.[0];
  const equipements = parseEquipements(appartement.equipements).slice(0, 4);
  const noteAvg = appartement.note_moyenne ?? 0;

  return (
    <Link href={`/${locale}/appartements/${appartement.id}`}>
      <article className={cn('card-apartment group', className)}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-sand-md">
          {image && !imgError ? (
            <img
              src={image.url_image}
              alt={appartement.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-5xl">🏖️</span>
              <span className="text-xs text-gray-400">واد لاو</span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(appartement); }}
            className="absolute top-3 start-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            aria-label="مفضلة"
          >
            <span className={isFavorite(appartement.id) ? 'text-red-500' : 'text-gray-400'} style={{ fontSize: 16 }}>
              {isFavorite(appartement.id) ? '❤️' : '🤍'}
            </span>
          </button>

          {/* Note badge */}
          {noteAvg > 0 && (
            <div className="absolute top-3 end-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-sm">
              <span className="text-gold">★</span>
              <span className="text-primary">{Number(noteAvg).toFixed(1)}</span>
            </div>
          )}

          {/* Statut badge */}
          {appartement.statut !== 'disponible' && (
            <div className="absolute bottom-3 start-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              غير متاح
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-primary text-base line-clamp-2 mb-1 leading-snug" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
            {appartement.titre}
          </h3>
          <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
            <span>📍</span> {appartement.ville}
          </p>

          {/* Features */}
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
            <span title="غرف">🛏 {appartement.nb_chambres}</span>
            <span title="حمامات">🚿 {appartement.nb_salles_bain}</span>
            <span title="أشخاص">👥 {appartement.capacite_max}</span>
            <span title="مساحة">📐 {appartement.surface_m2}م²</span>
          </div>

          {/* Equipements tags */}
          {equipements.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {equipements.map((eq) => (
                <span key={eq} className="text-xs bg-sand px-2 py-0.5 rounded-full text-gray-600 border border-sand-dark">
                  {eq}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-sand-dark">
            <div>
              <span className="text-xl font-bold text-primary">{formatCurrency(Number(appartement.prix_nuit))}</span>
              <span className="text-sm text-gray-500"> / ليلة</span>
            </div>
            <span className="bg-primary text-white text-sm px-4 py-2 rounded-lg group-hover:bg-gold group-hover:text-primary transition-colors">
              احجز
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
