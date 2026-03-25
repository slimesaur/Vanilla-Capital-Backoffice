'use client';

import PortfolioOnboardingProcess from '@/landing/components/sections/PortfolioOnboardingProcess';
import PortfolioDeliverablesCarousel from '@/landing/components/sections/PortfolioDeliverablesCarousel';

/** Loaded with `dynamic(..., { ssr: false })` only — avoids Chromium hydration fights on this route. */
export default function PortfolioAssetSectionsInner() {
  return (
    <>
      <PortfolioOnboardingProcess />
      <PortfolioDeliverablesCarousel />
    </>
  );
}
