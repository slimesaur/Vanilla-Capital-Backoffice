'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import LanguageSwitcher from '@/landing/components/LanguageSwitcher/LanguageSwitcher';
import { cn } from '@/landing/lib/utils';
import LandingLogo from './LandingLogo';
import SignInDropdown from '@/landing/components/auth/SignInDropdown';
import SignInForm from '@/landing/components/auth/SignInForm';

const SCROLL_THRESHOLD = 80; // px to scroll before header hides

export default function Header() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileSignInOpen, setIsMobileSignInOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Show header when scrolling up, hide when scrolling down (Quartzo-style)
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y < SCROLL_THRESHOLD) {
        setHeaderVisible(true);
      } else if (y > lastScrollY.current) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

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

  const signInLabels = {
    email: t('signInEmail'),
    password: t('signInPassword'),
    submit: t('signInSubmit'),
    submitting: t('signInSubmitting'),
    networkError: t('signInNetworkError'),
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#1A2433] backdrop-blur-sm shadow-sm font-avenir font-thin transition-transform duration-300 ease-out"
      style={{ transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
          <div className="flex items-center pr-6">
            <LandingLogo size="header" />
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
            {isLoggedIn ? (
              <Link
                href="/backoffice"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-400 transition-colors"
              >
                {t('backoffice')}
              </Link>
            ) : (
              <SignInDropdown
                triggerLabel={t('login')}
                labels={signInLabels}
              />
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            {isLoggedIn && (
              <Link
                href="/backoffice"
                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-accent-500 text-white hover:bg-accent-400 transition-colors"
              >
                {t('backoffice')}
              </Link>
            )}
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

              {isLoggedIn ? (
                <Link
                  href="/backoffice"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium bg-accent-500 text-white hover:bg-accent-400 transition-colors text-center mt-2"
                >
                  {t('backoffice')}
                </Link>
              ) : (
                <div className="mt-2">
                  <button
                    onClick={() => setIsMobileSignInOpen((prev) => !prev)}
                    className="w-full flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-base font-medium bg-accent-500 text-white hover:bg-accent-400 transition-colors"
                  >
                    {t('login')}
                    {isMobileSignInOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200 ease-in-out',
                      isMobileSignInOpen ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <SignInForm
                        variant="dropdown"
                        labels={signInLabels}
                        onSuccess={() => {
                          setIsMenuOpen(false)
                          setIsMobileSignInOpen(false)
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
