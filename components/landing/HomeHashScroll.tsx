'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/routing';
import { scrollToSectionId } from '@/lib/scrollToSection';
import { isMarketingHomePath } from '@/lib/marketingHomePath';

const HASH_RETRY_MS = [0, 100, 400, 900];

/**
 * On the long-scroll home: scroll to `location.hash` after navigation or on load
 * (dynamic sections may shift layout — short retries).
 */
export default function HomeHashScroll() {
  const pathname = usePathname();
  const locale = useLocale();
  const lastHandledHash = useRef<string>('');
  const onHome = isMarketingHomePath(pathname, locale);

  useEffect(() => {
    if (!onHome) {
      lastHandledHash.current = '';
      return;
    }

    const run = () => {
      const raw = window.location.hash.replace(/^#/, '');
      if (!raw) {
        lastHandledHash.current = '';
        return;
      }
      if (lastHandledHash.current === raw) return;
      try {
        const ok = scrollToSectionId(raw, { focus: true });
        if (ok) lastHandledHash.current = raw;
      } catch {
        /* focus/scroll must never tear down the tree */
      }
    };

    run();
    const tids = HASH_RETRY_MS.map((ms) => window.setTimeout(run, ms));
    return () => tids.forEach((id) => window.clearTimeout(id));
  }, [pathname, locale, onHome]);

  useEffect(() => {
    if (!onHome) return;

    const onHashChange = () => {
      lastHandledHash.current = '';
      const raw = window.location.hash.replace(/^#/, '');
      if (!raw) return;
      window.requestAnimationFrame(() => {
        try {
          scrollToSectionId(raw, { focus: true });
          lastHandledHash.current = raw;
        } catch {
          /* ignore */
        }
      });
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname, locale, onHome]);

  return null;
}
