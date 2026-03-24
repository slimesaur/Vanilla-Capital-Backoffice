'use client';

import { useEffect } from 'react';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Avoid useParams() here — router context can be incomplete when this boundary runs,
  // which would throw again and break the dev error UI in browsers like Arc.
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const locale = pathname.startsWith('/en') ? 'en' : 'pt';

  useEffect(() => {
    console.error(error);
  }, [error]);

  const copy =
    locale === 'en'
      ? {
          title: 'This page could not be loaded.',
          hint: 'Refresh or try again. If it keeps happening, allow local storage for this site (some browsers block it in strict or “web” modes).',
          cta: 'Try again',
        }
      : {
          title: 'Não foi possível carregar esta página.',
          hint: 'Atualize ou tente novamente. Se o problema continuar, permita armazenamento local para este site (alguns navegadores bloqueiam no modo restrito).',
          cta: 'Tentar de novo',
        };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#1A2433] px-6 text-center text-secondary-100">
      <p className="font-avenir text-lg">{copy.title}</p>
      <p className="max-w-md text-sm text-secondary-200/90">{copy.hint}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="bg-accent-500 px-6 py-2 text-sm font-medium text-white hover:bg-accent-400 rounded-none"
      >
        {copy.cta}
      </button>
    </div>
  );
}
