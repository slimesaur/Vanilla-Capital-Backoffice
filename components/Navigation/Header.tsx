'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from '@/routing';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import LanguageSwitcher from '@/landing/components/LanguageSwitcher/LanguageSwitcher';
import { cn } from '@/landing/lib/utils';
import LandingLogo from './LandingLogo';
import SignInDropdown from '@/landing/components/auth/SignInDropdown';
import SignInForm from '@/landing/components/auth/SignInForm';
import { services } from '@/lib/servicesData';
import LandingHashLink from '@/landing/components/landing/LandingHashLink';
import {
  LANDING_SECTION_IDS,
  SERVICE_SLUG_TO_SECTION_ID,
} from '@/lib/landingSections';
import { LANDING_HASH_NAV_EVENT } from '@/lib/scrollToSection';
import { isMarketingHomePath } from '@/lib/marketingHomePath';

const SCROLL_THRESHOLD = 80; // px to scroll before header hides

export default function Header() {
  const t = useTranslations('Navigation');
  const tServices = useTranslations('Home.services');
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /** Desktop and mobile must not share one flag — closing the hamburger was resetting the desktop dropdown. */
  const [desktopPortfolioOpen, setDesktopPortfolioOpen] = useState(false);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileSignInOpen, setIsMobileSignInOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const mobilePortfolioRef = useRef<HTMLDivElement>(null);
  const [urlHash, setUrlHash] = useState('');

  const syncHashFromLocation = () => {
    setUrlHash(window.location.hash.replace(/^#/, ''));
  };

  useEffect(() => {
    const onCustom = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (id) setUrlHash(id);
    };
    syncHashFromLocation();
    window.addEventListener('hashchange', syncHashFromLocation);
    window.addEventListener('popstate', syncHashFromLocation);
    window.addEventListener(LANDING_HASH_NAV_EVENT, onCustom);
    return () => {
      window.removeEventListener('hashchange', syncHashFromLocation);
      window.removeEventListener('popstate', syncHashFromLocation);
      window.removeEventListener(LANDING_HASH_NAV_EVENT, onCustom);
    };
  }, []);

  useEffect(() => {
    setHeaderVisible(true);
    setUrlHash(
      typeof window !== 'undefined'
        ? window.location.hash.replace(/^#/, '')
        : ''
    );
  }, [pathname]);

  const onMarketingHome = isMarketingHomePath(pathname, locale);
  const handleSamePageSectionNav = (sectionId: string) => {
    setHeaderVisible(true);
    setIsMenuOpen(false);
    setDesktopPortfolioOpen(false);
    setMobilePortfolioOpen(false);
  };

  const isHomeNavActive =
    onMarketingHome &&
    (!urlHash || urlHash === LANDING_SECTION_IDS.home);
  const isAboutNavActive =
    onMarketingHome &&
    (urlHash === LANDING_SECTION_IDS.about || urlHash.startsWith('about-'));
  const isContactNavActive =
    onMarketingHome &&
    (urlHash === LANDING_SECTION_IDS.contact || urlHash.startsWith('contact-'));
  const isPortfolioNavActive =
    onMarketingHome &&
    services.some((s) => SERVICE_SLUG_TO_SECTION_ID[s.slug] === urlHash);

  useEffect(() => {
    if (!headerVisible) {
      setIsMenuOpen(false);
      setIsMobileSignInOpen(false);
    }
  }, [headerVisible]);

  // Show header when scrolling up, hide when scrolling down (Quartzo-style)
  // Keep header visible when portfolio dropdown or mobile drawer is open
  useEffect(() => {
    const handleScroll = () => {
      if (desktopPortfolioOpen || isMenuOpen) return;
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
  }, [desktopPortfolioOpen, isMenuOpen]);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!desktopPortfolioOpen && !mobilePortfolioOpen) return;

    /** pointerdown (not click) avoids racing React's delegated click + stopPropagation; rAF skips the opening gesture. */
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      const insideDesktop = portfolioRef.current?.contains(target);
      const insideMobile = mobilePortfolioRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setDesktopPortfolioOpen(false);
        setMobilePortfolioOpen(false);
      }
    };

    let remove: (() => void) | undefined;
    const rafId = requestAnimationFrame(() => {
      document.addEventListener('pointerdown', handler);
      remove = () => document.removeEventListener('pointerdown', handler);
    });
    return () => {
      cancelAnimationFrame(rafId);
      remove?.();
    };
  }, [desktopPortfolioOpen, mobilePortfolioOpen]);

  useEffect(() => {
    if (!isMenuOpen) setMobilePortfolioOpen(false);
  }, [isMenuOpen]);

  const isComplianceActive =
    pathname === '/compliance' || pathname.startsWith('/compliance/');

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
          <div className="flex min-w-0 max-w-[calc(100vw-7.5rem)] flex-1 items-center pr-3 sm:max-w-[calc(100vw-9rem)] lg:max-w-none lg:flex-none lg:pr-7 xl:pr-8">
            <LandingLogo
              size="header"
              onSamePageHomeNavigate={() =>
                handleSamePageSectionNav(LANDING_SECTION_IDS.home)
              }
            />
          </div>

          {/* Desktop nav from lg (1024px) — extra pr on logo + space-x keeps links readable without crowding the mark */}
          <div className="hidden lg:flex lg:items-center lg:space-x-5 xl:space-x-7 2xl:space-x-10">
            <LandingHashLink
              locale={locale}
              sectionId={LANDING_SECTION_IDS.home}
              onSamePageNavigate={handleSamePageSectionNav}
              className={cn(
                'text-sm font-medium transition-colors hover:text-accent-300',
                isHomeNavActive ? 'text-secondary-100' : 'text-secondary-200'
              )}
            >
              {t('home')}
            </LandingHashLink>
            {/* Portfolio Dropdown */}
            <div className="relative" ref={portfolioRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesktopPortfolioOpen((prev) => !prev);
                }}
                className={cn(
                  'flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent-300',
                  isPortfolioNavActive
                    ? 'text-secondary-100'
                    : 'text-secondary-200'
                )}
                aria-expanded={desktopPortfolioOpen}
                aria-haspopup="true"
              >
                {t('portfolio')}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    desktopPortfolioOpen && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'absolute left-0 top-full z-[100] mt-2 min-w-[220px] rounded-none bg-primary-800 py-1 shadow-xl',
                  desktopPortfolioOpen ? 'block' : 'hidden'
                )}
                role="menu"
                aria-hidden={!desktopPortfolioOpen}
              >
                {services.map((service) => (
                  <LandingHashLink
                    key={service.key}
                    locale={locale}
                    sectionId={SERVICE_SLUG_TO_SECTION_ID[service.slug]}
                    onClick={() => setDesktopPortfolioOpen(false)}
                    onSamePageNavigate={handleSamePageSectionNav}
                    className={cn(
                      'block px-4 py-3 text-sm font-medium transition-colors first:pt-3 last:pb-3',
                      urlHash === SERVICE_SLUG_TO_SECTION_ID[service.slug]
                        ? 'text-accent-300 bg-accent-500/15'
                        : 'text-secondary-200 hover:text-secondary-100 hover:bg-white/5'
                    )}
                  >
                    {tServices(`${service.key}.title`)}
                  </LandingHashLink>
                ))}
              </div>
            </div>
            <LandingHashLink
              locale={locale}
              sectionId={LANDING_SECTION_IDS.about}
              onSamePageNavigate={handleSamePageSectionNav}
              className={cn(
                'text-sm font-medium transition-colors hover:text-accent-300',
                isAboutNavActive ? 'text-secondary-100' : 'text-secondary-200'
              )}
            >
              {t('about')}
            </LandingHashLink>
            <LandingHashLink
              locale={locale}
              sectionId={LANDING_SECTION_IDS.contact}
              onSamePageNavigate={handleSamePageSectionNav}
              className={cn(
                'text-sm font-medium transition-colors hover:text-accent-300',
                isContactNavActive ? 'text-secondary-100' : 'text-secondary-200'
              )}
            >
              {t('contact')}
            </LandingHashLink>
            <a
              href={`/${locale}/compliance`}
              className={cn(
                'text-sm font-medium transition-colors hover:text-accent-300',
                isComplianceActive ? 'text-secondary-100' : 'text-secondary-200'
              )}
            >
              {t('compliance')}
            </a>
            {isLoggedIn ? (
              <a
                href="/backoffice"
                className="pressable text-sm font-medium px-4 py-2 rounded-none bg-accent-500 text-white hover:bg-accent-400 transition-colors"
              >
                {t('backoffice')}
              </a>
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
              <a
                href="/backoffice"
                className="pressable text-sm font-medium px-3 py-1.5 rounded-none bg-accent-500 text-white hover:bg-accent-400 transition-colors"
              >
                {t('backoffice')}
              </a>
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
              <LandingHashLink
                locale={locale}
                sectionId={LANDING_SECTION_IDS.home}
                onClick={() => setIsMenuOpen(false)}
                onSamePageNavigate={handleSamePageSectionNav}
                className={cn(
                  'block rounded-none px-3 py-2 text-base font-medium',
                  isHomeNavActive
                    ? 'bg-primary-400/20 text-secondary-100'
                    : 'text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100'
                )}
              >
                {t('home')}
              </LandingHashLink>
              <div ref={mobilePortfolioRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobilePortfolioOpen((prev) => !prev);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-none px-3 py-2 text-base font-medium',
                    isPortfolioNavActive
                      ? 'bg-primary-400/20 text-secondary-100'
                      : 'text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100'
                  )}
                >
                  {t('portfolio')}
                  {mobilePortfolioOpen ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                <div
                  className={cn(
                    'overflow-hidden',
                    mobilePortfolioOpen ? 'max-h-80' : 'max-h-0'
                  )}
                >
                  {services.map((service) => (
                    <LandingHashLink
                      key={service.key}
                      locale={locale}
                      sectionId={SERVICE_SLUG_TO_SECTION_ID[service.slug]}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setMobilePortfolioOpen(false);
                      }}
                      onSamePageNavigate={handleSamePageSectionNav}
                      className="flex min-h-[44px] touch-manipulation items-center rounded-none px-5 py-3 text-sm font-medium text-secondary-200 hover:bg-white/5 hover:text-secondary-100"
                    >
                      {tServices(`${service.key}.title`)}
                    </LandingHashLink>
                  ))}
                </div>
              </div>
              <LandingHashLink
                locale={locale}
                sectionId={LANDING_SECTION_IDS.about}
                onClick={() => setIsMenuOpen(false)}
                onSamePageNavigate={handleSamePageSectionNav}
                className={cn(
                  'block rounded-none px-3 py-2 text-base font-medium',
                  isAboutNavActive
                    ? 'bg-primary-400/20 text-secondary-100'
                    : 'text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100'
                )}
              >
                {t('about')}
              </LandingHashLink>
              <LandingHashLink
                locale={locale}
                sectionId={LANDING_SECTION_IDS.contact}
                onClick={() => setIsMenuOpen(false)}
                onSamePageNavigate={handleSamePageSectionNav}
                className={cn(
                  'block rounded-none px-3 py-2 text-base font-medium',
                  isContactNavActive
                    ? 'bg-primary-400/20 text-secondary-100'
                    : 'text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100'
                )}
              >
                {t('contact')}
              </LandingHashLink>
              <a
                href={`/${locale}/compliance`}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block rounded-none px-3 py-2 text-base font-medium',
                  isComplianceActive
                    ? 'bg-primary-400/20 text-secondary-100'
                    : 'text-secondary-200 hover:bg-primary-400/10 hover:text-secondary-100'
                )}
              >
                {t('compliance')}
              </a>

              {isLoggedIn ? (
                <a
                  href="/backoffice"
                  onClick={() => setIsMenuOpen(false)}
                  className="pressable mt-8 block rounded-none bg-accent-500 px-3 py-2 text-center text-base font-medium text-white transition-colors hover:bg-accent-400"
                >
                  {t('backoffice')}
                </a>
              ) : (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setIsMobileSignInOpen((prev) => !prev)}
                    className="pressable flex items-center justify-start gap-2 rounded-none bg-accent-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-400"
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
