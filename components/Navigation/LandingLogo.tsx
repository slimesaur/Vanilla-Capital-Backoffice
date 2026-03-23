'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface LandingLogoProps {
  className?: string;
  /** Header uses h-14, Footer uses h-16 */
  size?: 'header' | 'footer';
}

/** Same asset for light/dark — do not gate on ThemeProvider `mounted` (if mount stalls, header/footer looked empty). */
export default function LandingLogo({ className = '', size = 'header' }: LandingLogoProps) {
  const locale = useLocale();

  const isFooter = size === 'footer';
  const sizeClasses = isFooter ? 'h-auto w-full max-w-2xl' : 'h-20 w-auto max-w-full object-contain';

  const linkClasses = isFooter
    ? `flex-shrink-0 flex items-start ${className}`
    : `flex-shrink-0 flex items-center ${className}`;

  const logoSrc = '/logos/LOGO FEAT MEU PATRIMONIO.svg';

  return (
    <Link href={`/${locale}`} className={linkClasses}>
      <img
        src={logoSrc}
        alt="Vanilla Capital"
        className={sizeClasses}
      />
    </Link>
  );
}
