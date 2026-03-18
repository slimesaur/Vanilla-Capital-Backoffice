import { getTranslations } from 'next-intl/server';
import { getCompanySettings } from '@/lib/settings';
import { getWhatsAppLink } from '@/landing/lib/utils';

// Hero dimensions: 1409×793 (aspect ratio ~1.78)
const ASPECT_RATIO = 1409 / 793;

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
          poster="/hero/HERO001.png"
          className="w-full h-full object-cover object-center"
        >
          <source src="/hero/HERO002.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Tagline above button - button stays at original position */}
      <div className="absolute top-[42%] left-6 sm:left-8 z-10">
        <div className="absolute bottom-full left-0 mb-3 font-avenir font-thin text-primary text-lg sm:text-xl uppercase leading-snug tracking-[0.15em]">
          <span className="whitespace-nowrap block">{t('tagline1')}</span>
          <span className="whitespace-nowrap block">{t('tagline2')}</span>
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 text-sm font-avenir font-thin rounded-lg bg-accent-500 text-secondary-50 hover:bg-accent-400 transition-colors duration-200"
        >
          {t('knowMore')}
        </a>
      </div>
    </section>
  );
}
