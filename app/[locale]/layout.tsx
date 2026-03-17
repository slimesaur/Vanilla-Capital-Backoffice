import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import Header from '@/landing/components/Navigation/Header';
import Footer from '@/landing/components/Navigation/Footer';
import { getCompanySettings } from '@/lib/settings';

// Always fetch fresh settings so backoffice changes appear on landing pages (About, Contact, Footer)
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const settings = await getCompanySettings();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer settings={settings} />
      </div>
    </NextIntlClientProvider>
  );
}
