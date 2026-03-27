'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/routing';
import { isMarketingHomePath } from '@/lib/marketingHomePath';

const HTML_CLASS = 'vanilla-home-scroll-snap';

/** Below Tailwind `lg` (1024px). */
const MOBILE_MQ = '(max-width: 1023px)';

/**
 * Toggles document scroll-snap on `<html>` for mobile marketing home only.
 * `useLayoutEffect` runs before paint (avoids `:has()` / WebKit quirks with root scroll snap).
 */
export default function HomeScrollSnapRoot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();

  useLayoutEffect(() => {
    const sync = () => {
      const mobile = window.matchMedia(MOBILE_MQ).matches;
      const home = isMarketingHomePath(pathname, locale);
      document.documentElement.classList.toggle(HTML_CLASS, mobile && home);
    };

    sync();
    const mql = window.matchMedia(MOBILE_MQ);
    mql.addEventListener('change', sync);
    return () => {
      mql.removeEventListener('change', sync);
      document.documentElement.classList.remove(HTML_CLASS);
    };
  }, [pathname, locale]);

  return <div className="relative min-w-0">{children}</div>;
}
