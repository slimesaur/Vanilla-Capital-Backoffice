'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

const PARTNERS: { logo: string; url: string }[] = [
  { logo: 'BTG.svg', url: 'https://www.btgpactual.com' },
  { logo: 'SAFRA.svg', url: 'https://www.safra.com.br' },
  { logo: 'MORGANSTANLEY.svg', url: 'https://www.morganstanley.com' },
  { logo: 'ITAU.svg', url: 'https://www.itau.com.br' },
  { logo: 'XP.svg', url: 'https://www.xpi.com.br' },
  { logo: 'INTER.svg', url: 'https://www.bancointer.com.br' },
  { logo: 'NOMAD.svg', url: 'https://www.nomad.com.br' },
  { logo: 'AVENUE.svg', url: 'https://www.avenue.us' },
  { logo: 'GENIAL.svg', url: 'https://www.genialinvestimentos.com.br' },
  { logo: 'AGORA.svg', url: 'https://www.agora.com.br' },
];

export default function StrategicPartners() {
  const t = useTranslations('Home.strategicPartners');

  return (
    <section
      className="w-full bg-secondary-100 py-16 md:py-20"
      aria-label={t('title')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-3">
          {t('title')}
        </h2>
        <p className="font-avenir font-thin text-secondary-700 text-base md:text-lg max-w-2xl mb-12">
          {t('description')}
        </p>
        <div className="grid grid-cols-5 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12 place-items-center">
          {PARTNERS.map(({ logo, url }) => (
            <a
              key={logo}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-10 md:h-12 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              <Image
                src={`/partners/${logo}`}
                alt=""
                width={120}
                height={48}
                className="h-10 md:h-12 w-auto object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
