import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Hero from '@/landing/components/sections/Hero';
import Services from '@/landing/components/sections/Services';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Services />
    </>
  );
}
