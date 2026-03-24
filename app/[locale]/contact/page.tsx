import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';
import { getCompanySettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Contact' });
  const tMeta = await getTranslations({ locale, namespace: 'Contact.metadata' });

  return {
    title: `${t('title')} - Vanilla Capital`,
    description: tMeta('description'),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getCompanySettings();

  return <ContactPageClient settings={settings} />;
}
