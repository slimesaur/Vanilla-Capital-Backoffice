'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import ServiceHero from '@/landing/components/sections/ServiceHero';
import ServiceCardGrid from '@/landing/components/sections/ServiceCardGrid';
import type { ServiceKey } from '@/lib/servicesData';
import { services } from '@/lib/servicesData';
import { getWhatsAppLink } from '@/landing/lib/utils';

interface ServicePageClientProps {
  serviceKey: ServiceKey;
  locale: string;
}

export default function ServicePageClient({
  serviceKey,
  locale,
}: ServicePageClientProps) {
  const t = useTranslations('Portfolio');
  const tFooter = useTranslations('Footer');
  const service = services.find((s) => s.key === serviceKey);
  if (!service) return null;

  const whatsappHref = getWhatsAppLink(
    '+5541988195090',
    tFooter('whatsappMessage')
  );

  const cards = [1, 2, 3, 4].map((i) => ({
    icon: '',
    title: t(`services.${serviceKey}.cards.${i}.title`),
    description: t(`services.${serviceKey}.cards.${i}.description`),
  }));

  return (
    <div>
      <ServiceHero title={t(`services.${serviceKey}.title`)} image={service.image} />

      {/* Description section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-avenir font-bold text-2xl md:text-3xl text-ink mb-6">
            {t(`services.${serviceKey}.descriptionTitle`)}
          </h2>
          <div className="space-y-4 text-secondary-600 font-avenir font-thin leading-relaxed text-base md:text-lg">
            <p>{t(`services.${serviceKey}.descriptionP1`)}</p>
            <p>{t(`services.${serviceKey}.descriptionP2`)}</p>
          </div>
          <div className="mt-8">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex px-6 py-3 text-sm font-medium bg-accent-500 hover:bg-accent-400 text-white rounded-none transition-colors"
            >
              {t('cta')}
            </a>
          </div>
        </div>
      </section>

      <ServiceCardGrid
        serviceKey={serviceKey}
        cardGridTitle={t(`services.${serviceKey}.cardGridTitle`)}
        cards={cards}
      />
    </div>
  );
}
