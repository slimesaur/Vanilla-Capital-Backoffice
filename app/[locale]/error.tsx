'use client';

import { useEffect } from 'react';

export default function LocaleSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[locale segment error]', error.message, error.digest ?? '');
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center bg-secondary-50 dark:bg-primary-800">
      <p className="font-avenir text-secondary-700 dark:text-secondary-100 mb-6 max-w-md mx-auto">
        This page could not be displayed. You can try again or refresh the browser.
      </p>
      <button
        type="button"
        onClick={reset}
        className="pressable inline-flex px-6 py-3 text-sm font-medium bg-accent-500 hover:bg-accent-400 text-white rounded-none transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
