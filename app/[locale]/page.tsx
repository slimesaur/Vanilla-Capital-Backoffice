import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Hero from '@/landing/components/sections/Hero';
import StrategicPartners from '@/landing/components/sections/StrategicPartners';
import Services from '@/landing/components/sections/Services';
import PortfolioOnboardingProcess from '@/landing/components/sections/PortfolioOnboardingProcess';
import PortfolioDeliverablesCarousel from '@/landing/components/sections/PortfolioDeliverablesCarousel';
import ServiceBlockLanding from '@/landing/components/landing/ServiceBlockLanding';
import HomeHashScroll from '@/landing/components/landing/HomeHashScroll';
import HomeScrollSnapRoot from '@/landing/components/landing/HomeScrollSnapRoot';
import AboutClient from './about/AboutClient';
import ContactPageClient from './contact/ContactPageClient';
import { getCompanySettings } from '@/lib/settings';
import { services } from '@/lib/servicesData';
import {
  LANDING_SCROLL_MARGIN_CLASS,
  LANDING_SCROLL_SNAP_CLASS,
  LANDING_SECTION_IDS,
  SERVICE_SLUG_TO_SECTION_ID,
} from '@/lib/landingSections';

export const dynamic = 'force-dynamic';

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
    alternates: {
      canonical: `/${locale}`,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getCompanySettings();

  return (
    <HomeScrollSnapRoot>
      <HomeHashScroll />

      <div
        id={LANDING_SECTION_IDS.home}
        className={`${LANDING_SCROLL_MARGIN_CLASS} ${LANDING_SCROLL_SNAP_CLASS}`}
        tabIndex={-1}
      >
        <Hero />
      </div>

      <div
        id={LANDING_SECTION_IDS.partners}
        className={`${LANDING_SCROLL_MARGIN_CLASS} ${LANDING_SCROLL_SNAP_CLASS}`}
        tabIndex={-1}
      >
        <StrategicPartners />
      </div>

      <div
        id={LANDING_SECTION_IDS.services}
        className={`${LANDING_SCROLL_MARGIN_CLASS} ${LANDING_SCROLL_SNAP_CLASS}`}
        tabIndex={-1}
      >
        <Services />
      </div>

      <div
        id={LANDING_SECTION_IDS.assetOnboarding}
        className={`${LANDING_SCROLL_MARGIN_CLASS} ${LANDING_SCROLL_SNAP_CLASS}`}
        tabIndex={-1}
      >
        <PortfolioOnboardingProcess />
      </div>

      <div
        id={LANDING_SECTION_IDS.assetDeliverables}
        className={`${LANDING_SCROLL_MARGIN_CLASS} ${LANDING_SCROLL_SNAP_CLASS}`}
        tabIndex={-1}
      >
        <PortfolioDeliverablesCarousel />
      </div>

      {services.map((s) => (
        <ServiceBlockLanding
          key={s.key}
          serviceKey={s.key}
          sectionId={SERVICE_SLUG_TO_SECTION_ID[s.slug]}
        />
      ))}

      <AboutClient settings={settings} variant="home" />
      <ContactPageClient settings={settings} variant="home" />
    </HomeScrollSnapRoot>
  );
}
