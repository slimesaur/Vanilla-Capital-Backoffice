'use client';

import { useTranslations } from 'next-intl';
import { getWhatsAppLink } from '@/lib/utils';

const ONBOARDING_IMAGE = '/portfolio/asset-allocation/onboarding-section.png';
/** Intrinsic size of onboarding-section.png — used for layout stability without next/image. */
const ONBOARDING_WIDTH = 1024;
const ONBOARDING_HEIGHT = 512;

/**
 * Client-only under ServicePageClient (no RSC siblings) to avoid Chrome/Arc blank screens.
 * Single <ol> + native <img> to reduce hydration / duplicate-DOM issues.
 */
export default function PortfolioOnboardingProcess() {
  const t = useTranslations('Portfolio');
  const tFooter = useTranslations('Footer');

  const whatsappHref = getWhatsAppLink(
    '+5541988195090',
    tFooter('whatsappMessage')
  );

  const steps = [1, 2, 3, 4].map((i) => ({
    n: i,
    title: t(`services.assets.onboarding.steps.${i}.title`),
    description: t(`services.assets.onboarding.steps.${i}.description`),
  }));

  return (
    <section
      className="py-12 md:py-16 bg-primary-50"
      aria-labelledby="portfolio-onboarding-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="portfolio-onboarding-heading"
          className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-8 md:mb-10 md:text-left text-center"
        >
          {t('services.assets.onboarding.title')}
        </h2>

        <div className="relative mb-10 w-full max-h-[280px] min-h-[160px] overflow-hidden bg-primary-100 lg:mb-12 aspect-[2/1]">
          <img
            src={ONBOARDING_IMAGE}
            alt={t('services.assets.onboarding.imageAlt')}
            width={ONBOARDING_WIDTH}
            height={ONBOARDING_HEIGHT}
            className="h-full w-full object-cover object-bottom"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-6 z-0 hidden h-0.5 bg-primary-200 lg:block"
            aria-hidden
          />
          <ol className="relative z-10 m-0 flex list-none flex-col p-0 lg:grid lg:grid-cols-4 lg:gap-x-4">
            {steps.map((step, idx) => (
              <li
                key={step.title}
                className="flex items-stretch gap-5 pb-10 last:pb-0 lg:flex-col lg:items-center lg:pb-0 lg:text-center"
              >
                <div className="flex w-11 shrink-0 flex-col items-center self-stretch lg:mb-6 lg:w-auto lg:self-auto">
                  <span className="z-10 flex h-11 w-11 shrink-0 items-center justify-center bg-accent-500 font-avenir text-sm font-bold text-white ring-4 ring-primary-50 lg:h-12 lg:w-12 lg:text-base rounded-none">
                    {step.n}
                  </span>
                  {idx < steps.length - 1 ? (
                    <div
                      className="mt-2 min-h-[2rem] w-0.5 flex-1 bg-primary-200 lg:hidden"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className="min-w-0 pt-1 lg:pt-0">
                  <h3 className="mb-2 font-avenir text-lg font-bold text-primary-800">
                    {step.title}
                  </h3>
                  <p className="font-avenir text-sm font-thin leading-relaxed text-secondary-600 sm:text-base">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex justify-center lg:justify-start">
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
  );
}
