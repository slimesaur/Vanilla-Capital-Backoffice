import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import ComplianceClient from './ComplianceClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Compliance.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function CompliancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pt-16">
      <ComplianceClient />
    </div>
  );
}
