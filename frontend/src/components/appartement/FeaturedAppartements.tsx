'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppartCard } from './AppartCard';
import { AppartCardSkeleton } from '@/components/common/LoadingSkeleton';
import type { Appartement } from '@/types/api.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface FeaturedAppartementsProps {
  locale: string;
}

export function FeaturedAppartements({ locale }: FeaturedAppartementsProps) {
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAppartements = async () => {
      try {
        const res = await fetch(`${API_URL}/appartements?limit=6&sort=recent`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as { data: Appartement[] };
        setAppartements(json.data ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchAppartements();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => <AppartCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-sand-dark">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-gray-500">تعذر الاتصال بالخادم. تأكد من تشغيل الـ Backend.</p>
        <p className="text-gray-400 text-sm mt-2">http://localhost:3001 يجب أن يكون شغالاً</p>
      </div>
    );
  }

  if (appartements.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-sand-dark">
        <p className="text-4xl mb-3">🏖️</p>
        <p className="text-gray-500">لا توجد شقق متاحة حالياً</p>
        <p className="text-gray-400 text-sm mt-1">قم بتشغيل الـ seed: <code className="bg-sand px-2 py-0.5 rounded">npm run db:seed</code></p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {appartements.map((appart) => (
          <AppartCard key={appart.id} appartement={appart} />
        ))}
      </div>
      <div className="text-center mt-10">
        <Link
          href={`/${locale}/appartements`}
          className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-mid transition-colors"
        >
          عرض جميع الشقق ←
        </Link>
      </div>
    </>
  );
}
