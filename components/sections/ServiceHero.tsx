'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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

      // As user scrolls down, increase opacity (from section top entering view to section leaving)
      if (sectionBottom > windowHeight) {
        const scrollProgress = 1 - (sectionBottom - windowHeight) / SCROLL_RANGE;
        const clamped = Math.max(0, Math.min(1, scrollProgress));
        setOverlayOpacity(OPACITY_MIN + clamped * (OPACITY_MAX - OPACITY_MIN));
      } else {
        setOverlayOpacity(OPACITY_MAX);
      }
    };

    handleScroll(); // Initial
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
          <Image
            src={publicServiceImagePath(image)}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            onError={() => setImgError(true)}
          />
        ) : null}
      </div>

      {/* Blue overlay - opacity increases on scroll (25% → 75%) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundColor: BRAND_BLUE,
          opacity: overlayOpacity,
        }}
        aria-hidden
      />

      {/* Title - AVENIR THIN, off-white, left-aligned, vertically centered */}
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
