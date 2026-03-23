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
import { services } from '@/lib/servicesData';

const SCROLL_THRESHOLD = 80; // px to scroll before header hides

export default function Header() {
  const t = useTranslations('Navigation');
  const tServices = useTranslations('Home.services');
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileSignInOpen, setIsMobileSignInOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const mobilePortfolioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerVisible) {
      setIsMenuOpen(false);
      setIsMobileSignInOpen(false);
    }
  }, [headerVisible]);

  // Show header when scrolling up, hide when scrolling down (Quartzo-style)
  // Keep header visible when portfolio dropdown is open so user can click links
  useEffect(() => {
    const handleScroll = () => {
      if (isPortfolioOpen) return; // Don't hide while dropdown is open
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
  }, [isPortfolioOpen]);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isPortfolioOpen) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = portfolioRef.current?.contains(target);
      const insideMobile = mobilePortfolioRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) setIsPortfolioOpen(false);
    };

    const tm = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(tm);
      document.removeEventListener('mousedown', handler);
    };
  }, [isPortfolioOpen]);

  // Reset portfolio dropdown when mobile menu closes
  useEffect(() => {
    if (!isMenuOpen) setIsPortfolioOpen(false);
  }, [isMenuOpen]);

  const isPortfolioActive = pathname.startsWith(`/${locale}/portfolio`);

  const navigation = [
    { name: t('home'), href: `/${locale}`, exact: true },
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
      className="fixed top-0 left-0 right-0 z-50 h-20 overflow-visible bg-[#1A2433] backdrop-blur-sm shadow-sm font-avenir font-thin transition-transform duration-300 ease-out"
      style={{ transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      {/* relative: mobile drawer uses absolute top-full (out of flow) so h-20 stays fixed; moves with transform like the bar */}
      <nav className="mx-auto flex h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-full min-h-0 w-full items-center justify-between">
          <div className="flex min-w-0 max-w-[calc(100vw-7.5rem)] flex-1 items-center pr-3 sm:max-w-[calc(100vw-9rem)] lg:max-w-none lg:flex-none lg:pr-6">
            <LandingLogo size="header" />
          </div>

          {/* Desktop nav from lg (1024px) — sidebar-narrow layouts still get links; tighter gaps lg–xl to fit wide logo */}
          <div className="hidden lg:flex lg:items-center lg:space-x-3 xl:space-x-6 2xl:space-x-8">
            {navigation.slice(0, 1).map((item) => (
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
            {/* Portfolio Dropdown */}
            <div className="relative" ref={portfolioRef}>
              <button
                type="button"
                onClick={() => setIsPortfolioOpen((prev) => !prev)}
                className={cn(
                  'flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent-300',
                  isPortfolioActive
                    ? 'text-secondary-100'
                    : 'text-secondary-200'
                )}
                aria-expanded={isPortfolioOpen}
                aria-haspopup="true"
              >
                {t('portfolio')}
                <ChevronDown className={cn('h-4 w-4 transition-transform', isPortfolioOpen && 'rotate-180')} />
              </button>
              <div
                className={cn(
                  'absolute left-0 top-full mt-2 min-w-[220px] rounded-none bg-primary-800 shadow-xl transition-all',
                  isPortfolioOpen
                    ? 'opacity-100 visible pointer-events-auto translate-y-0'
                    : 'invisible opacity-0 pointer-events-none -translate-y-1'
                )}
              >
                {services.map((service) => (
                  <Link
                    key={service.key}
                    href={`/${locale}/portfolio/${service.slug}`}
                    onClick={() => setIsPortfolioOpen(false)}
                    className={cn(
                      'block px-4 py-3 text-sm font-medium transition-colors first:pt-3 last:pb-3',
                      pathname === `/${locale}/portfolio/${service.slug}`
                        ? 'text-accent-300 bg-accent-500/15'
                        : 'text-secondary-200 hover:text-secondary-100 hover:bg-white/5'
                    )}
                  >
                    {tServices(`${service.key}.title`)}
                  </Link>
                ))}
              </div>
            </div>
            {navigation.slice(1).map((item) => (
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
                className="pressable clip-cut-corners text-sm font-medium px-4 py-2 rounded-none bg-accent-500 text-white hover:bg-accent-400 transition-colors"
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

          <div className="flex lg:hidden flex-shrink-0 items-center space-x-4">
            {isLoggedIn && (
              <Link
                href="/backoffice"
                className="pressable clip-cut-corners text-sm font-medium px-3 py-1.5 rounded-none bg-accent-500 text-white hover:bg-accent-400 transition-colors"
              >
                {t('backoffice')}
              </Link>
            )}
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-secondary-200 hover:text-accent-300"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-nav-menu"
        className={cn(
          'absolute left-0 right-0 top-full z-40 bg-[#1A2433] shadow-lg transition-[max-height,opacity] duration-300 ease-out lg:hidden',
          isMenuOpen
            ? 'max-h-[70vh] overflow-y-auto border-b border-white/10 opacity-100 sm:max-h-[min(70vh,calc(100dvh-5rem))]'
            : 'max-h-0 overflow-hidden border-b-0 opacity-0 pointer-events-none'
        )}
      >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-1 px-2 pb-3 pt-2 border-t border-white/10">
              <Link
                href={`/${locale}`}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block rounded-none px-3 py-2 text-base font-medium',
                  pathname === `/${locale}`
                    ? 'bg-primary-400/20 text-secondary-100'
                    : 'text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100'
                )}
              >
                {t('home')}
              </Link>
              <div ref={mobilePortfolioRef}>
                <button
                  type="button"
                  onClick={() => setIsPortfolioOpen((prev) => !prev)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-none px-3 py-2 text-base font-medium',
                    isPortfolioActive
                      ? 'bg-primary-400/20 text-secondary-100'
                      : 'text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100'
                  )}
                >
                  {t('portfolio')}
                  {isPortfolioOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className={cn('overflow-hidden', isPortfolioOpen ? 'max-h-80' : 'max-h-0')}>
                  {services.map((service) => (
                    <Link
                      key={service.key}
                      href={`/${locale}/portfolio/${service.slug}`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsPortfolioOpen(false);
                      }}
                      className="flex min-h-[44px] touch-manipulation items-center rounded-none px-5 py-3 text-sm font-medium text-secondary-200 hover:bg-white/5 hover:text-secondary-100"
                    >
                      {tServices(`${service.key}.title`)}
                    </Link>
                  ))}
                </div>
              </div>
              {navigation.slice(1).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'block rounded-none px-3 py-2 text-base font-medium',
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
                  className="pressable clip-cut-corners mt-8 block rounded-none bg-accent-500 px-3 py-2 text-center text-base font-medium text-white transition-colors hover:bg-accent-400"
                >
                  {t('backoffice')}
                </Link>
              ) : (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setIsMobileSignInOpen((prev) => !prev)}
                    className="pressable clip-cut-corners flex items-center justify-start gap-2 rounded-none bg-accent-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-400"
                  >
                    {t('login')}
                    {isMobileSignInOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200 ease-in-out',
                      isMobileSignInOpen ? 'mt-3 max-h-80 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="rounded-none border border-white/10 bg-white/5 p-4">
                      <SignInForm
                        variant="dropdown"
                        labels={signInLabels}
                        onSuccess={() => {
                          setIsMenuOpen(false);
                          setIsMobileSignInOpen(false);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
    </header>
  );
}
