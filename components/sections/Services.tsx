'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { services } from '@/lib/servicesData';
import { publicServiceImagePath } from '@/lib/utils';
import { cn } from '@/landing/lib/utils';
import {
  LANDING_SECTION_IDS,
  SERVICE_SLUG_TO_SECTION_ID,
} from '@/lib/landingSections';
import LandingHashLink from '@/landing/components/landing/LandingHashLink';

const ASPECT_RATIO = 16 / 9;

/**
 * No framer-motion / no next/image: same stack caused Chromium (Chrome/Arc) blank screens
 * after client navigation (hydration + optimizer + paths with spaces in /public).
 */
export default function Services() {
  const t = useTranslations('Home.services');
  const locale = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const activeService = services[activeIndex];

  const goToSlide = useCallback((index: number) => {
    setActiveIndex((index + services.length) % services.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToSlide(activeIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(activeIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, goToSlide]);

  useEffect(() => {
    if (isHovered) return;
    const timer = setTimeout(() => {
      goToSlide(activeIndex + 1);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isHovered, activeIndex, goToSlide]);

  return (
    <section
      className="relative w-full py-12 md:py-16 bg-secondary-100"
      aria-label={t('title')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-10 md:mb-14">
          {t('title')}
        </h2>
        <div className="relative w-full overflow-hidden rounded-none clip-cut-corners-all border border-secondary-200/80 bg-primary-900 shadow-xl">
          <div
            className="relative w-full overflow-hidden rounded-none"
            style={{ aspectRatio: ASPECT_RATIO }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {services.map((service, index) => {
              const visible = index === activeIndex;
              const showImg = !failedImages.has(service.image);
              return (
                <div
                  key={service.key}
                  className={cn(
                    'absolute inset-0 transition-opacity duration-500 ease-out',
                    visible
                      ? 'z-[1] opacity-100'
                      : 'z-0 opacity-0 pointer-events-none'
                  )}
                  aria-hidden={!visible}
                >
                  {showImg ? (
                    <img
                      src={publicServiceImagePath(service.image)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : undefined}
                      decoding="async"
                      onError={() =>
                        setFailedImages((prev) =>
                          new Set(prev).add(service.image)
                        )
                      }
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900"
                      aria-hidden
                    />
                  )}
                </div>
              );
            })}

            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(26, 36, 51, 0.75), rgba(26, 36, 51, 0.2))',
              }}
              aria-hidden
            />
            <div
              className={cn(
                'absolute inset-0 z-10 bg-primary-900 pointer-events-none transition-opacity duration-300 ease-out',
                isHovered ? 'opacity-80' : 'opacity-0'
              )}
              aria-hidden
            />

            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
                <h3 className="font-avenir font-bold text-2xl md:text-3xl lg:text-4xl text-accent-400 mb-6 drop-shadow-lg">
                  {t(`${activeService.key}.title`)}
                </h3>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-out',
                    isHovered
                      ? 'mb-6 max-h-[min(24rem,70vh)] opacity-100'
                      : 'mb-0 max-h-0 opacity-0'
                  )}
                >
                  <p className="font-avenir font-bold text-base md:text-lg mb-2 text-secondary-50">
                    {t(`${activeService.key}.description`)}
                  </p>
                  <p className="font-avenir font-thin text-xs md:text-sm text-secondary-200 max-w-2xl">
                    {t(`${activeService.key}.subDescription`)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <LandingHashLink
                    locale={locale}
                    sectionId={SERVICE_SLUG_TO_SECTION_ID[activeService.slug]}
                    className="pressable inline-flex items-center px-5 py-2 text-sm bg-accent-500 hover:bg-accent-400 text-secondary-50 font-avenir font-thin rounded-none transition-colors duration-300"
                  >
                    {t('learnMore')}
                  </LandingHashLink>
                  <LandingHashLink
                    locale={locale}
                    sectionId={LANDING_SECTION_IDS.contact}
                    className="pressable clip-cut-corners inline-flex items-center px-5 py-2 text-sm bg-white/20 hover:bg-white/30 text-secondary-50 font-avenir font-thin rounded-none border border-secondary-50/50 transition-colors duration-300"
                  >
                    {t('contactUs')}
                  </LandingHashLink>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2"
            role="tablist"
            aria-label="Service navigation"
          >
            {services.map((service, index) => (
              <button
                key={service.key}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                aria-label={`${t(`${service.key}.title`)}`}
                onClick={() => goToSlide(index)}
                className="p-1.5 rounded-none transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
              >
                <span
                  className={`block rounded-none transition-all duration-300 ${
                    activeIndex === index
                      ? 'w-8 h-2.5 bg-accent-400'
                      : 'w-2.5 h-2.5 bg-secondary-50/60 hover:bg-secondary-50'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
