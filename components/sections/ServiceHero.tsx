'use client';

import { useState, useEffect, useRef } from 'react';
import { publicServiceImagePath } from '@/lib/utils';

const ASPECT_RATIO = 21 / 9; // Smaller than home (1409/793 ~1.78)
const BRAND_BLUE = 'rgb(26, 36, 51)'; // #1A2433
const OPACITY_MIN = 0.25;
const OPACITY_MAX = 0.75;
const SCROLL_RANGE = 400; // px to go from 25% to 75%

interface ServiceHeroProps {
  title: string;
  image: string;
}

/**
 * Native <img> instead of next/image: next/image + fill has caused full blank hydration failures
 * in Chrome/Arc on service pages (LCP/optimizer edge cases with spaces in public path).
 */
export default function ServiceHero({ title, image }: ServiceHeroProps) {
  const [overlayOpacity, setOverlayOpacity] = useState(OPACITY_MIN);
  const [imgError, setImgError] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionBottom = rect.bottom;
      const windowHeight = window.innerHeight;

      if (sectionBottom > windowHeight) {
        const scrollProgress = 1 - (sectionBottom - windowHeight) / SCROLL_RANGE;
        const clamped = Math.max(0, Math.min(1, scrollProgress));
        setOverlayOpacity(OPACITY_MIN + clamped * (OPACITY_MAX - OPACITY_MIN));
      } else {
        setOverlayOpacity(OPACITY_MAX);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden md:-mt-20"
      style={{ aspectRatio: `${ASPECT_RATIO}` }}
      aria-label={title}
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
          opacity: overlayOpacity,
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
    </section>
  );
}
