import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import { getCompanySettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getCompanySettings();

  return (
    <AboutClient settings={settings} />
  );
}
