'use client';

import { useState, useEffect, useRef } from 'react';
import { publicServiceImagePath } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scrollToSection';

const ASPECT_RATIO = 21 / 9; // Smaller than home (1409/793 ~1.78)
const BRAND_BLUE = 'rgb(26, 36, 51)'; // #1A2433
const OPACITY_MIN = 0.25;
const OPACITY_MAX = 0.75;
const SCROLL_RANGE = 400; // px to go from 25% to 75%

/** When hero bottom is below this fraction of viewport height, the hero block stays fully visible. */
const HEADER_FADE_START_FRAC = 0.52;
/** Fully faded when hero bottom is at or above this offset from viewport top (~header). */
const HEADER_FADE_END_PX = 88;
/** Upward shift (px) at full fade when motion is allowed. */
const HEADER_SHIFT_MAX_PX = 16;

interface ServiceHeroProps {
  title: string;
  image: string;
}

type HeroScrollVisual = {
  overlayOpacity: number;
  headerOpacity: number;
  headerTranslateY: number;
};

/**
 * Native <img> instead of next/image: next/image + fill has caused full blank hydration failures
 * in Chrome/Arc on service pages (LCP/optimizer edge cases with spaces in public path).
 */
export default function ServiceHero({ title, image }: ServiceHeroProps) {
  const [visual, setVisual] = useState<HeroScrollVisual>({
    overlayOpacity: OPACITY_MIN,
    headerOpacity: 1,
    headerTranslateY: 0,
  });
  const [imgError, setImgError] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionBottom = rect.bottom;

      let overlayOpacity: number;
      if (sectionBottom > windowHeight) {
        const scrollProgress = 1 - (sectionBottom - windowHeight) / SCROLL_RANGE;
        const clamped = Math.max(0, Math.min(1, scrollProgress));
        overlayOpacity = OPACITY_MIN + clamped * (OPACITY_MAX - OPACITY_MIN);
      } else {
        overlayOpacity = OPACITY_MAX;
      }

      let headerOpacity = 1;
      let headerTranslateY = 0;
      if (!prefersReducedMotion()) {
        const fadeStart = windowHeight * HEADER_FADE_START_FRAC;
        if (sectionBottom >= fadeStart) {
          headerOpacity = 1;
          headerTranslateY = 0;
        } else if (sectionBottom <= HEADER_FADE_END_PX) {
          headerOpacity = 0;
          headerTranslateY = -HEADER_SHIFT_MAX_PX;
        } else {
          const t = Math.max(
            0,
            Math.min(1, (sectionBottom - HEADER_FADE_END_PX) / (fadeStart - HEADER_FADE_END_PX))
          );
          headerOpacity = t;
          headerTranslateY = -HEADER_SHIFT_MAX_PX * (1 - t);
        }
      }

      setVisual((prev) => {
        if (
          prev.overlayOpacity === overlayOpacity &&
          prev.headerOpacity === headerOpacity &&
          prev.headerTranslateY === headerTranslateY
        ) {
          return prev;
        }
        return { overlayOpacity, headerOpacity, headerTranslateY };
      });
    };

    const scheduleUpdate = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden md:-mt-20"
      style={{ aspectRatio: `${ASPECT_RATIO}` }}
      aria-label={title}
    >
      {/* Non-fading fill: when the stack above goes transparent, desktop otherwise shows
          `main` (--bg-primary) through this box; the next content block is below in flow,
          not composited behind. Mobile snap can mask that — white matches portfolio / light sections. */}
      <div className="absolute inset-0 bg-white" aria-hidden />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: visual.headerOpacity,
          transform: `translate3d(0, ${visual.headerTranslateY}px, 0)`,
          willChange:
            visual.headerOpacity < 1 && visual.headerOpacity > 0
              ? 'opacity, transform'
              : undefined,
        }}
      >
        <div className="absolute inset-0 z-0 bg-primary-900">
          {!imgError ? (
            <img
              src={publicServiceImagePath(image)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={() => setImgError(true)}
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
        </div>

        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            backgroundColor: BRAND_BLUE,
            opacity: visual.overlayOpacity,
          }}
          aria-hidden
        />

        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <h1 className="font-avenir font-thin text-secondary-100 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
