'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/routing';
import {
  emitLandingHashNavigation,
  scrollToSectionId,
} from '@/lib/scrollToSection';
import { LANDING_SECTION_IDS } from '@/lib/landingSections';
import { isMarketingHomePath } from '@/lib/marketingHomePath';

interface LandingLogoProps {
  className?: string;
  /** Header uses h-14, Footer uses h-16 */
  size?: 'header' | 'footer';
  /** When already on the long-scroll home, scroll to #home and update history. */
  onSamePageHomeNavigate?: () => void;
}

/** Same asset for light/dark — do not gate on ThemeProvider `mounted` (if mount stalls, header/footer looked empty). */
export default function LandingLogo({
  className = '',
  size = 'header',
  onSamePageHomeNavigate,
}: LandingLogoProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const homeHashHref = `/${locale}#${LANDING_SECTION_IDS.home}`;
  const onMarketingHome = isMarketingHomePath(pathname, locale);

  const isFooter = size === 'footer';
  const sizeClasses = isFooter
    ? 'h-auto w-full max-w-2xl'
    : 'h-14 w-auto max-w-full object-contain sm:h-16 md:h-20';

  const linkClasses = isFooter
    ? `flex-shrink-0 flex items-start ${className}`
    : `flex-shrink-0 flex items-center ${className}`;

  const logoSrc = '/logos/LOGO FEAT MEU PATRIMONIO.svg';

  return (
    <a
      href={homeHashHref}
      className={linkClasses}
      onClick={(e) => {
        if (!onMarketingHome) return;
        e.preventDefault();
        onSamePageHomeNavigate?.();
        scrollToSectionId(LANDING_SECTION_IDS.home, { focus: true });
        window.history.pushState(null, '', homeHashHref);
        emitLandingHashNavigation(LANDING_SECTION_IDS.home);
      }}
    >
      <img
        src={logoSrc}
        alt="Vanilla Capital"
        className={sizeClasses}
      />
    </a>
  );
}
