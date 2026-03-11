'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '@/landing/components/LanguageSwitcher/LanguageSwitcher';
import { cn } from '@/landing/lib/utils';

export default function Header() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: t('home'), href: `/${locale}`, exact: true },
    { name: t('portfolio'), href: `/${locale}/portfolio` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
    { name: t('compliance'), href: `/${locale}/compliance` },
  ];

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A2433] backdrop-blur-sm shadow-sm font-subtitle-alt">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex-shrink-0 flex items-center">
              <Image
                src="/images/VANILLA%20LOGO%20WHITE.svg"
                alt="Vanilla Capital"
                width={300}
                height={72}
                className="h-20 w-auto object-contain min-w-[220px]"
                priority
                unoptimized
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-accent-300',
                  isActive(item)
                    ? 'text-secondary-100'
                    : 'text-secondary-200'
                )}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm font-medium text-secondary-200 hover:text-accent-300 transition-colors"
            >
              {t('login')}
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link
              href="/login"
              className="text-sm font-medium text-secondary-200 hover:text-accent-300"
            >
              {t('login')}
            </Link>
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-secondary-200 hover:text-accent-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1A2433]">
            <div className="space-y-1 px-2 pb-3 pt-2 border-t border-white/10">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-base font-medium',
                    isActive(item)
                      ? 'bg-primary-400/20 text-secondary-100'
                      : 'text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100"
              >
                {t('login')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
