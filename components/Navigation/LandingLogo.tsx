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

  const isFooter = size === 'footer';
  const heightClass = isFooter ? 'h-auto' : 'h-20';
  const sizeClasses = isFooter ? 'h-auto w-full max-w-xl' : 'h-20 w-auto max-w-full object-contain';

  const linkClasses = isFooter
    ? `flex-shrink-0 flex items-start ${className}`
    : `flex-shrink-0 flex items-center ${className}`;

  if (!mounted) {
    return (
      <Link href={`/${locale}`} className={linkClasses}>
        <div className={`${heightClass} w-auto min-w-[80px] bg-transparent`} aria-hidden="true" />
      </Link>
    );
  }

  const logoSrc = isFooter ? '/logos/LOGO FEAT MEU PATRIMONIO.svg' : '/logos/LOGO DARK VERSION.svg';

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
