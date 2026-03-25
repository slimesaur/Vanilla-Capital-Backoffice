'use client';

import type { ReactNode } from 'react';
import ClientRenderErrorBoundary from '@/landing/components/ClientRenderErrorBoundary';

/**
 * Wraps all locale `main` content so a client render/hydration failure shows recovery UI
 * instead of a silent white column (Chrome/Arc + next-intl client navigations).
 */
export default function LocaleMainShell({ children }: { children: ReactNode }) {
  return <ClientRenderErrorBoundary>{children}</ClientRenderErrorBoundary>;
}
