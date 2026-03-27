'use client';

import { usePathname } from '@/routing';
import {
  emitLandingHashNavigation,
  scrollToSectionId,
} from '@/lib/scrollToSection';
import { isMarketingHomePath } from '@/lib/marketingHomePath';

type LandingHashLinkProps = {
  locale: string;
  sectionId: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  /** Called when already on the long-scroll home before scrolling (e.g. show header, close menus). */
  onSamePageNavigate?: (sectionId: string) => void;
};

/**
 * Always a real `<a href="/{locale}#…">`. Off-home: full navigation (reliable in Chromium).
 * On the long-scroll home: preventDefault + scroll + history so we never use next-intl/App Router
 * Link for hash targets (that stack has correlated with blank `main` after navigations).
 */
export default function LandingHashLink({
  locale,
  sectionId,
  className,
  children,
  onClick,
  onSamePageNavigate,
}: LandingHashLinkProps) {
  const pathname = usePathname();
  const onHome = isMarketingHomePath(pathname, locale);
  const href = `/${locale}#${sectionId}`;

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        onClick?.();
        if (!onHome) return;
        e.preventDefault();
        onSamePageNavigate?.(sectionId);
        scrollToSectionId(sectionId, { focus: true });
        window.history.pushState(null, '', href);
        emitLandingHashNavigation(sectionId);
      }}
    >
      {children}
    </a>
  );
}
