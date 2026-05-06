'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { AdminStats } from '@/types/api.types';

export default function AdminDashboardPage() {
  const locale = useLocale();
  const qc = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data.data as AdminStats),
  });

  const { data: pendingOwners } = useQuery({
    queryKey: ['admin-owners-pending'],
    queryFn: () => adminApi.proprietaires({ statut: 'en_attente' }).then((r) => r.data),
  });

  const { data: pendingApparts } = useQuery({
    queryKey: ['admin-apparts-pending'],
    queryFn: () => adminApi.appartements({ statut: 'en_attente_validation' }).then((r) => r.data),
  });

  const verifierOwner = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) =>
      adminApi.verifierProprietaire(id, statut),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-stats'] });
      void qc.invalidateQueries({ queryKey: ['admin-owners-pending'] });
    },
  });

  const validerAppart = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) =>
      adminApi.validerAppartement(id, statut),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-stats'] });
      void qc.invalidateQueries({ queryKey: ['admin-apparts-pending'] });
    },
  });

  const kpis = [
    { label: 'العملاء',        value: stats?.totalClients ?? 0,                   icon: '👥', color: 'bg-primary' },
    { label: 'الملاك',          value: stats?.totalProprietaires ?? 0,             icon: '🏠', color: 'bg-teal' },
    { label: 'الحجوزات',       value: stats?.totalReservations ?? 0,              icon: '📋', color: 'bg-primary-mid' },
    { label: 'إجمالي الإيرادات', value: formatCurrency(stats?.totalRevenue ?? 0), icon: '💰', color: 'bg-gold' },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-sand min-h-screen">
        <div className="container-app py-10">
          <h1 className="section-title mb-8">لوحة تحكم الإدارة</h1>

          {/* Quick nav */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'إدارة المستخدمين', icon: '👥', href: `/${locale}/dashboard/admin/utilisateurs` },
              { label: 'إدارة الإعلانات', icon: '🏠', href: `/${locale}/dashboard/admin/annonces` },
              { label: 'إدارة التقييمات', icon: '⭐', href: `/${locale}/dashboard/admin/avis` },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="bg-white rounded-xl shadow-card p-5 flex flex-col items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all text-center"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm font-semibold text-primary">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
              : kpis.map((s) => (
                  <div key={s.label} className="bg-white rounded-xl shadow-card p-5 flex items-center gap-3">
                    <div className={`${s.color} text-white rounded-lg w-10 h-10 flex items-center justify-center text-xl flex-shrink-0`}>
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">{s.label}</p>
                      <p className="font-bold text-primary truncate">{s.value}</p>
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Pending approvals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Propriétaires en attente */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="p-5 border-b border-sand-dark flex justify-between items-center">
                <h2 className="font-bold text-primary">ملاك في انتظار التحقق</h2>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                  {stats?.pendingOwners ?? 0}
                </span>
              </div>
              <div className="divide-y divide-sand-dark">
                {pendingOwners?.data.map((owner) => {
                  const o = owner as { id: number; nom: string; prenom: string; email: string; cin: string; telephone: string; created_at: string };
                  return (
                    <div key={o.id} className="p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-primary">{o.prenom} {o.nom}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{o.email}</p>
                          <p className="text-gray-400 text-xs">CIN: {o.cin} · {o.telephone}</p>
                          <p className="text-gray-400 text-xs">منذ: {formatDate(o.created_at, 'fr-MA')}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => verifierOwner.mutate({ id: o.id, statut: 'verifie' })}
                            disabled={verifierOwner.isPending}
                            className="text-xs bg-teal text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
                          >
                            قبول ✓
                          </button>
                          <button
                            onClick={() => verifierOwner.mutate({ id: o.id, statut: 'refuse' })}
                            disabled={verifierOwner.isPending}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium"
                          >
                            رفض ✗
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!pendingOwners?.data.length && (
                  <p className="text-center text-gray-400 py-8 text-sm">لا توجد طلبات معلقة ✅</p>
                )}
              </div>
            </div>

            {/* Appartements en attente */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="p-5 border-b border-sand-dark flex justify-between items-center">
                <h2 className="font-bold text-primary">شقق في انتظار الموافقة</h2>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                  {stats?.pendingApartments ?? 0}
                </span>
              </div>
              <div className="divide-y divide-sand-dark">
                {pendingApparts?.data.map((appart) => {
                  const a = appart as { id: number; titre: string; ville: string; prix_nuit: number; proprietaire?: { prenom: string; nom: string } };
                  return (
                    <div key={a.id} className="p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-primary line-clamp-1">{a.titre}</p>
                          <p className="text-gray-500 text-xs mt-0.5">📍 {a.ville} · {formatCurrency(a.prix_nuit)} / ليلة</p>
                          {a.proprietaire && (
                            <p className="text-gray-400 text-xs">المالك: {a.proprietaire.prenom} {a.proprietaire.nom}</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => validerAppart.mutate({ id: a.id, statut: 'disponible' })}
                            disabled={validerAppart.isPending}
                            className="text-xs bg-teal text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
                          >
                            اعتماد ✓
                          </button>
                          <button
                            onClick={() => validerAppart.mutate({ id: a.id, statut: 'suspendu' })}
                            disabled={validerAppart.isPending}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium"
                          >
                            رفض ✗
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!pendingApparts?.data.length && (
                  <p className="text-center text-gray-400 py-8 text-sm">لا توجد شقق معلقة ✅</p>
                )}
              </div>
            </div>
          </div>

          {/* Revenue chart */}
          {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="font-bold text-primary mb-6">الإيرادات الشهرية للمنصة</h2>
              <div className="flex items-end gap-2 h-40">
                {stats.monthlyRevenue.map((item) => {
                  const max = Math.max(...stats.monthlyRevenue.map((m) => m.value), 1);
                  const pct = Math.round((item.value / max) * 100);
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500 font-medium">{formatCurrency(item.value)}</span>
                      <div className="w-full bg-primary rounded-t-md" style={{ height: `${Math.max(pct, 4)}%` }} />
                      <span className="text-xs text-gray-400">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
