'use client';

import dynamic from 'next/dynamic';

const PortfolioAssetSectionsInner = dynamic(
  () => import('@/landing/components/sections/PortfolioAssetSectionsInner'),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[32rem] w-full bg-gradient-to-b from-primary-50 via-primary-50 to-secondary-100"
        role="status"
        aria-busy="true"
        aria-label="Loading"
      />
    ),
  }
);

export default function PortfolioAssetSections() {
  return <PortfolioAssetSectionsInner />;
}
