'use client';

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
} from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  DELIVERABLE_SLIDE_ORDER,
  deliverableImageCandidates,
  type DeliverableSlideId,
} from '@/lib/assetAllocationDeliverables';

/** Space between tiles — tighter reads more “editorial” (benchmark-style). */
const GAP_PX = 10;

function DeliverableSlideBackground({
  slideId,
  alt,
}: {
  slideId: DeliverableSlideId;
  alt: string;
}) {
  const candidates = deliverableImageCandidates(slideId);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [giveUp, setGiveUp] = useState(false);

  if (giveUp) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900"
        aria-hidden
      />
    );
  }

  const src = candidates[candidateIdx]!;

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover object-center"
      onError={() => {
        setCandidateIdx((prev) => {
          if (prev < candidates.length - 1) return prev + 1;
          setGiveUp(true);
          return prev;
        });
      }}
    />
  );
}

function DeliverableTile({
  slideId,
  title,
  description,
  imageAlt,
  size,
}: {
  slideId: DeliverableSlideId;
  title: string;
  description: string;
  imageAlt: string;
  size: number;
}) {
  const descId = `deliverable-desc-${slideId}`;

  return (
    <div
      className="group relative shrink-0 overflow-hidden rounded-none bg-primary-900 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400"
      style={{ width: size, height: size, minWidth: size }}
      tabIndex={0}
      role="group"
      aria-roledescription="slide"
      aria-label={title}
      aria-describedby={descId}
    >
      <DeliverableSlideBackground slideId={slideId} alt={imageAlt} />
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-primary-900/50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[11] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(26,36,51,0.65)_100%)]"
        aria-hidden
      />
      <div className="absolute inset-0 z-20 flex flex-col items-stretch justify-center px-4 py-3 md:px-5 md:py-4">
        <h3 className="font-avenir font-bold leading-snug text-accent-400 drop-shadow-md text-center md:text-left line-clamp-3 [overflow-wrap:anywhere] text-[clamp(0.875rem,5.5vw,1.6875rem)] md:text-[clamp(1.125rem,3.25vw,1.875rem)]">
          {title}
        </h3>
        {/* Mobile: row always expanded. Desktop: collapses; expands on hover/focus-within; motion-reduce: always expanded */}
        <div
          className="mt-2 grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none max-md:grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] md:group-focus-within:grid-rows-[1fr] md:motion-reduce:grid-rows-[1fr]"
        >
          <div className="min-h-0 overflow-hidden">
            <p
              id={descId}
              className="font-avenir font-thin text-xs md:text-sm text-secondary-50 leading-relaxed text-center md:text-left line-clamp-6 md:line-clamp-5"
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioDeliverablesCarousel() {
  const t = useTranslations('Portfolio.services.assets.deliverables');
  const slides = DELIVERABLE_SLIDE_ORDER;
  const slideCount = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focusedInside, setFocusedInside] = useState(false);
  const paused = hovered || focusedInside;
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(280);
  const [viewportW, setViewportW] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex((index + slideCount) % slideCount);
  }, [slideCount]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w < 16) return;
      setViewportW(w);
      const narrow = w < 640;
      const tile = narrow
        ? Math.max(168, (w - GAP_PX) / 1.28)
        : Math.max(176, (w - 2 * GAP_PX) / 2.55);
      setTileSize(tile);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stride = tileSize + GAP_PX;

  const scrollOffset = useMemo(() => {
    const trackWidth = slideCount * tileSize + (slideCount - 1) * GAP_PX;
    if (viewportW <= 0) return 0;
    const maxOffset = Math.max(0, trackWidth - viewportW);
    return Math.min(activeIndex * stride, maxOffset);
  }, [activeIndex, stride, slideCount, tileSize, viewportW]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToSlide(activeIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(activeIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, goToSlide]);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, 6000);
    return () => clearTimeout(timer);
  }, [paused, activeIndex, slideCount]);

  return (
    <section
      className="relative w-full py-12 md:py-16 bg-secondary-100"
      aria-label={t('title')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusedInside(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocusedInside(false);
        }
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-10 md:mb-14">
          {t('title')}
        </h2>

        <div className="w-full" aria-roledescription="carousel">
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden"
            style={{ height: tileSize }}
            aria-live="polite"
            aria-atomic="true"
          >
            <motion.div
              className="flex h-full"
              style={{ gap: GAP_PX }}
              initial={false}
              animate={{ x: -scrollOffset }}
              transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {slides.map((slideId) => (
                <DeliverableTile
                  key={slideId}
                  slideId={slideId}
                  title={t(`slides.${slideId}.title`)}
                  description={t(`slides.${slideId}.description`)}
                  imageAlt={t(`slides.${slideId}.imageAlt`)}
                  size={tileSize}
                />
              ))}
            </motion.div>
          </div>

          <div
            className="mt-3 md:mt-4 flex justify-center items-center gap-1 py-1 md:py-1.5"
            role="tablist"
            aria-label={t('title')}
          >
            {slides.map((slideId, index) => (
              <button
                key={slideId}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                aria-label={t(`slides.${slideId}.title`)}
                onClick={() => goToSlide(index)}
                className="p-0.5 md:p-1 rounded-none transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-100"
              >
                <span
                  className={`block rounded-none transition-all duration-300 ${
                    activeIndex === index
                      ? 'w-6 h-1 md:w-7 md:h-1 bg-accent-400'
                      : 'w-1.5 h-1.5 bg-secondary-300 hover:bg-secondary-400'
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
