'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { services } from '@/lib/servicesData';

const ASPECT_RATIO = 16 / 9;

export default function Services() {
  const t = useTranslations('Home.services');
  const locale = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const activeService = services[activeIndex];
  const showImage = !failedImages.has(activeService.image);

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

  // Auto-advance to next service when mouse is not on image for 4 seconds
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
        <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-8 md:mb-10">
          {t('title')}
        </h2>
        {/* Framed carousel container - Quartzo-style */}
        <div
          className="relative w-full overflow-hidden rounded-xl border border-secondary-200/80 bg-primary-900 shadow-xl"
        >
          {/* Hero carousel - 16:9 within frame */}
          <div
            className="relative w-full overflow-hidden rounded-t-xl"
            style={{ aspectRatio: ASPECT_RATIO }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeIndex}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            {showImage ? (
              <Image
                src={`/services images/${activeService.image}`}
                alt=""
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority={activeIndex === 0}
                onError={() =>
                  setFailedImages((prev) =>
                    new Set(prev).add(activeService.image)
                  )
                }
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900"
                aria-hidden
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Overlay - gradient bottom to top (75% at bottom), more opaque on hover */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to top, rgba(26, 36, 51, 0.75), rgba(26, 36, 51, 0.2))',
          }}
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 bg-primary-900 z-10 pointer-events-none"
          initial={false}
          animate={{ opacity: isHovered ? 0.8 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          aria-hidden
        />

        {/* Content overlay - title always visible; description + sub-description on hover */}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
            <h3 className="font-avenir font-bold text-2xl md:text-3xl lg:text-4xl text-accent-400 mb-6 drop-shadow-lg">
              {t(`${activeService.key}.title`)}
            </h3>
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="overflow-hidden mb-6"
                >
                  <p className="font-avenir font-bold text-base md:text-lg mb-2 text-secondary-50">
                    {t(`${activeService.key}.description`)}
                  </p>
                  <p className="font-avenir font-thin text-xs md:text-sm text-secondary-200 max-w-2xl">
                    {t(`${activeService.key}.subDescription`)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/portfolio/${activeService.slug}`}
                className="pressable inline-flex items-center px-5 py-2 text-sm bg-accent-500 hover:bg-accent-400 text-secondary-50 font-avenir font-thin rounded-lg transition-colors duration-300"
              >
                {t('learnMore')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="pressable inline-flex items-center px-5 py-2 text-sm bg-white/20 hover:bg-white/30 text-secondary-50 font-avenir font-thin rounded-lg border border-secondary-50/50 transition-colors duration-300"
              >
                {t('contactUs')}
              </Link>
            </div>
          </div>
        </div>
          </div>

          {/* Dot navigation */}
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
                className="p-1.5 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
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
