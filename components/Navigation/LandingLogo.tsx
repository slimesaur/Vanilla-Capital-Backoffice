'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';

interface LandingLogoProps {
  className?: string;
  /** Header uses h-14, Footer uses h-16 */
  size?: 'header' | 'footer';
}

export default function LandingLogo({ className = '', size = 'header' }: LandingLogoProps) {
  const locale = useLocale();
  const { theme, mounted } = useTheme();

  const heightClass = size === 'header' ? 'h-20' : 'h-32';

  if (!mounted) {
    return (
      <Link href={`/${locale}`} className={`flex-shrink-0 flex items-center ${className}`}>
        <div className={`${heightClass} w-auto min-w-[80px] bg-transparent`} aria-hidden="true" />
      </Link>
    );
  }

  // Header uses LOGO DARK VERSION; Footer uses new LOGO FEAT MEU PATRIMONIO (wider, cropped)
  const logoSrc = size === 'footer' ? '/logos/LOGO FEAT MEU PATRIMONIO.svg' : '/logos/LOGO DARK VERSION.svg';

  return (
    <Link href={`/${locale}`} className={`flex-shrink-0 flex items-center ${className}`}>
      <img
        src={logoSrc}
        alt="Vanilla Capital"
        className={`${heightClass} w-auto max-w-full object-contain`}
      />
    </Link>
  );
}
