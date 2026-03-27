import { getTranslations } from 'next-intl/server';
import { getCompanySettings } from '@/lib/settings';
import { getWhatsAppLink } from '@/landing/lib/utils';

// Hero dimensions: 1409×793 (aspect ratio ~1.78)
const ASPECT_RATIO = 1409 / 793;
const HERO_VERSION = '5';

export default async function Hero() {
  const t = await getTranslations('Home.hero');
  const tFooter = await getTranslations('Footer');
  const settings = await getCompanySettings();
  const whatsappHref = getWhatsAppLink(
    settings.whatsapp || settings.phone || '+5541988195090',
    tFooter('whatsappMessage')
  );

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${ASPECT_RATIO}` }}
    >
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center"
          aria-label="Vanilla Capital investment consultancy background"
        >
          <source src={`/hero/HERO002.mp4?v=${HERO_VERSION}`} type="video/mp4" />
        </video>
      </div>

      {/* Tagline and button: mobile left-6/sm:left-8, desktop same container as Strategic Partners */}
      <div className="absolute top-[35%] left-6 sm:left-8 md:left-0 md:right-0 z-10">
        <div className="relative md:mx-auto md:max-w-7xl md:px-6 lg:px-8">
          <h1 className="sr-only">{t('title')}</h1>
          <div
            className="mb-3 font-avenir font-thin text-secondary-50 text-2xl sm:text-3xl md:text-4xl uppercase leading-snug tracking-[0.15em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
            aria-hidden="true"
          >
            <span className="whitespace-nowrap block">{t('tagline1')}</span>
            <span className="whitespace-nowrap block">{t('tagline2')}</span>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us via WhatsApp"
            className="pressable inline-block px-6 py-3 text-base font-avenir font-thin rounded-none bg-accent-500 text-secondary-50 hover:bg-accent-400 transition-colors duration-200"
          >
            {t('knowMore')}
          </a>
        </div>
      </div>
    </section>
  );
}
