import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Noto_Kufi_Arabic, Cairo } from 'next/font/google';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import '@/app/globals.css';
import { Providers } from '@/app/providers';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
});

export async function generateStaticParams(): Promise<{ locale: string }[]> {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: {
      default: t('appName'),
      template: `%s | ${t('appName')}`,
    },
    description:
      locale === 'ar'
        ? 'منصة إيجار سياحي في واد لاو، المغرب'
        : 'Plateforme de location saisonnière à Oued Laou, Maroc',
    keywords:
      locale === 'ar'
        ? ['واد لاو', 'إيجار', 'شقق', 'سياحة', 'المغرب']
        : ['Oued Laou', 'location', 'appartement', 'vacances', 'Maroc'],
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${notoKufiArabic.variable} ${cairo.variable}`}>
      <body
        className={`${cairo.className} bg-sand text-primary antialiased`}
        style={{ fontFamily: "'Cairo', sans-serif" }}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <WhatsAppButton />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
