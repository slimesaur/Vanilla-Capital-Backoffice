'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

const PARTNERS: { logo: string; url: string; alt: string }[] = [
  { logo: 'BTG.svg', url: 'https://www.btgpactual.com', alt: 'BTG Pactual' },
  { logo: 'SAFRA.svg', url: 'https://www.safra.com.br', alt: 'Safra' },
  { logo: 'MORGANSTANLEY.svg', url: 'https://www.morganstanley.com', alt: 'Morgan Stanley' },
  { logo: 'ITAU.svg', url: 'https://www.itau.com.br', alt: 'Itaú' },
  { logo: 'XP.svg', url: 'https://www.xpi.com.br', alt: 'XP Investimentos' },
  { logo: 'INTER.svg', url: 'https://www.bancointer.com.br', alt: 'Banco Inter' },
  { logo: 'NOMAD.svg', url: 'https://www.nomad.com.br', alt: 'Nomad' },
  { logo: 'AVENUE.svg', url: 'https://www.avenue.us', alt: 'Avenue' },
  { logo: 'GENIAL.svg', url: 'https://www.genialinvestimentos.com.br', alt: 'Genial Investimentos' },
  { logo: 'AGORA.svg', url: 'https://www.agora.com.br', alt: 'Agora' },
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
        <p className="font-avenir font-thin text-secondary-700 text-base md:text-lg mb-8">
          {t('description')}
        </p>
        <div className="grid grid-cols-5 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12 place-items-center">
          {PARTNERS.map(({ logo, url, alt }) => (
            <a
              key={logo}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center h-16 md:h-20 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ${logo === 'GENIAL.svg' ? 'bg-secondary-100' : ''}`}
            >
              <Image
                src={`/partners/${logo}`}
                alt={alt}
                width={160}
                height={64}
                className={`h-16 md:h-20 w-auto object-contain ${logo === 'GENIAL.svg' ? 'mix-blend-multiply' : ''}`}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
