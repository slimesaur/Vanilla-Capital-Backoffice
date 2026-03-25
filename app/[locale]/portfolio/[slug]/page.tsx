import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServicePageClient from './ServicePageClient';
import { getServiceBySlug } from '@/lib/servicesData';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: 'Vanilla Capital' };

  const t = await getTranslations({ locale, namespace: 'Portfolio' });
  const title = t(`services.${service.key}.title`);

  return {
    title: `${title} - Vanilla Capital`,
    description: t(`services.${service.key}.descriptionTitle`),
  };
}

export function generateStaticParams() {
  const slugs = [
    'asset-allocation',
    'retirement-planning',
    'wealth-protection',
    'real-estate-auction',
    'ai-solutions',
    'business-advisory',
  ];
  return ['pt', 'en'].flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return <ServicePageClient serviceKey={service.key} />;
}
