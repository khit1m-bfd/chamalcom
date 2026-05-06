import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchBar } from '@/components/appartement/SearchBar';
import { FeaturedAppartements } from '@/components/appartement/FeaturedAppartements';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-[85vh] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0A3D6B 0%, #1A5CA8 60%, #0B7A6E 100%)' }}
        >
          <div className="relative text-center text-white container-app py-16 px-4">
            <div className="inline-block bg-gold/20 text-gold border border-gold/30 px-4 py-2 rounded-full text-sm font-medium mb-6">
              🌊 واد لاو — تطوان-طنجة-الحسيمة
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ fontFamily: 'Noto Kufi Arabic, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {t('heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>
            <div className="flex justify-center">
              <SearchBar />
            </div>
          </div>
        </section>

        {/* ── Appartements vedettes ─────────────────────────────────────── */}
        <section className="bg-sand py-16">
          <div className="container-app">
            <div className="text-center mb-10">
              <h2
                className="text-3xl font-bold text-primary mb-3"
                style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}
              >
                {t('featuredTitle')}
              </h2>
              <p className="text-gray-500 text-lg">{t('featuredSubtitle')}</p>
            </div>
            <FeaturedAppartements locale={locale} />
          </div>
        </section>

        {/* ── Pourquoi nous ─────────────────────────────────────────────── */}
        <section className="bg-white py-16">
          <div className="container-app text-center">
            <h2
              className="text-3xl font-bold text-primary mb-10"
              style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}
            >
              {t('whyUs')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: '✅', title: t('verified'), desc: t('verifiedDesc') },
                { icon: '💰', title: t('bestPrice'), desc: t('bestPriceDesc') },
                { icon: '🎧', title: t('support'), desc: t('supportDesc') },
              ].map((item) => (
                <div key={item.title} className="p-8 rounded-2xl border border-sand-dark hover:shadow-card-hover transition-shadow">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <section className="bg-primary py-14">
          <div className="container-app">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {[
                { value: '+150', label: 'شقة متاحة' },
                { value: '+5000', label: 'حجز ناجح' },
                { value: '4.8 ★', label: 'تقييم المستخدمين' },
                { value: '24/7', label: 'دعم متواصل' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-4xl font-bold text-gold mb-2">{s.value}</div>
                  <div className="text-white/70 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
