'use client';

import { useEffect } from 'react';

/**
 * Required when errors occur in root `app/layout.tsx` or root `template.tsx`.
 * Must define its own <html> and <body> (replaces the root layout when active).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
          background: '#1A2433',
          color: '#F8F6F0',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <p style={{ fontSize: 18, marginBottom: 12 }}>Something went wrong.</p>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 24 }}>
            Try again or restart the dev server. If the problem persists, check the terminal for errors.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: '#a89158',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
