import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import Header from '@/landing/components/Navigation/Header';
import FooterLoader from '@/landing/components/Navigation/FooterLoader';

// Fresh settings: footer uses `noStore()`; pages that read settings use `dynamic = 'force-dynamic'`.

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

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-500 focus:text-white focus:rounded-none focus:outline-none focus:w-auto focus:h-auto focus:m-0 focus:overflow-visible"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" className="flex-1 pt-20">{children}</main>
        {/* Prisma-backed footer streams separately so Chrome/Arc get main markup without waiting on DB */}
        <FooterLoader />
      </div>
    </NextIntlClientProvider>
  );
}
