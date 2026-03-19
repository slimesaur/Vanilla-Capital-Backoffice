'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import BrandIcon from '@/landing/components/ui/BrandIcon';
import { useState, useRef, useEffect } from 'react';
import { locales, type Locale } from '@/i18n';
import { cn } from '@/landing/lib/utils';

const languageNames: Record<Locale, string> = {
  pt: 'PT',
  en: 'EN',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Robust: strip locale prefix, prepend new locale (handles /pt, /pt/portfolio, edge cases)
    const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}(/|$)`), '$1') || ''
    const newPath = `/${newLocale}${pathWithoutLocale}`
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-none text-sm font-medium text-secondary-200 hover:text-accent-300 hover:bg-white/5 transition-colors"
      >
        <BrandIcon name="21" size={20} variant="light" />
        <span>{languageNames[locale]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-[#1A2433] rounded-none shadow-lg ring-1 ring-white/10 z-50 border border-white/10">
          <div className="py-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors',
                  locale === loc
                    ? 'bg-accent-300/20 text-accent-300 font-medium'
                    : 'text-secondary-200'
                )}
              >
                {languageNames[loc]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
