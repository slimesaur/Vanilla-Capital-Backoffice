'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import LandingHashLink from '@/landing/components/landing/LandingHashLink';
import { User } from 'lucide-react';
import ServiceHero from '@/landing/components/sections/ServiceHero';
import type { CompanySettingsData } from '@/lib/settings';
import {
  LANDING_SCROLL_MARGIN_CLASS,
  LANDING_SCROLL_SNAP_CLASS,
  LANDING_SECTION_IDS,
} from '@/lib/landingSections';

const ABOUT_HERO_IMAGE = 'WEALTH PROTECTION.jpg';

const MANIFESTO_IMG =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80';

const DEFAULT_TEAM_MEMBERS = [
  {
    id: 'default-1',
    name: 'Guilherme R Silva',
    role: '',
    description: '',
    image: '/images/team/team-member-1.png',
  },
  {
    id: 'default-2',
    name: 'Fabricio A S Queiroz',
    role: '',
    description: '',
    image: '/images/team/fabricio.png',
  },
] as const;

interface AboutClientProps {
  settings?: CompanySettingsData;
  /** `home`: anchor IDs + in-page CTA to #contact for the long-scroll landing. */
  variant?: 'page' | 'home';
}

export default function AboutClient({
  settings,
  variant = 'page',
}: AboutClientProps) {
  const t = useTranslations('About');
  const locale = useLocale();

  const fromSettings =
    settings?.teamMembers && settings.teamMembers.length > 0
      ? settings.teamMembers.map((m) => ({
          id: m.id,
          name: '',
          role: m.position || '',
          description: '',
          image: m.photo || null,
        }))
      : [
          {
            ...DEFAULT_TEAM_MEMBERS[0],
            role: t('team.guilhermeRole'),
            description: t('team.defaultDescription'),
          },
          {
            ...DEFAULT_TEAM_MEMBERS[1],
            role: t('team.fabricioRole'),
            description: t('team.fabricioDescription'),
          },
        ];

  const teamMembers = fromSettings;
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => {
      const narrow = mq.matches;
      setIsNarrowViewport(narrow);
      if (!narrow) setMobileExpandedId(null);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const isHome = variant === 'home';

  const heroBlock = (
    <ServiceHero title={t('title')} image={ABOUT_HERO_IMAGE} />
  );

  return (
    <>
      {isHome ? (
        <div
          id={LANDING_SECTION_IDS.about}
          className={`${LANDING_SCROLL_MARGIN_CLASS} ${LANDING_SCROLL_SNAP_CLASS}`}
          tabIndex={-1}
        >
          {heroBlock}
        </div>
      ) : (
        heroBlock
      )}

      <section
        id={isHome ? LANDING_SECTION_IDS.aboutManifesto : undefined}
        className={`relative z-10 bg-secondary-50 py-20 md:pt-40 md:pb-20${isHome ? ` ${LANDING_SCROLL_MARGIN_CLASS}` : ''}`}
        tabIndex={isHome ? -1 : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:gap-12">
            <div className="relative w-full overflow-hidden aspect-[21/9] min-h-[11rem] sm:min-h-[13rem] md:min-h-[15rem]">
              <img
                src={MANIFESTO_IMG}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-8">
                {t('manifesto.label')}
              </h2>
              <div className="space-y-6 text-primary font-montserrat font-thin leading-[1.8] text-lg tracking-[0.02em] text-left">
                <p>
                  {t('manifesto.p1')}
                  <br />
                  {t('manifesto.p2')}
                </p>
                <p>
                  {t('manifesto.p3')}
                  <br />
                  {t('manifesto.p4')}
                </p>
                <p>
                  {t('manifesto.p5')}
                  <br />
                  {t('manifesto.p6')}
                  <br />
                  {t('manifesto.p7')}
                </p>
                <p>
                  {t('manifesto.p8')}
                  <br />
                  {t('manifesto.p9')}
                  <br />
                  {t('manifesto.p10')}
                </p>
                <p>
                  {t('manifesto.p11')}
                  <br />
                  {t('manifesto.p12')}
                </p>
                <p>
                  {t('manifesto.p13')}
                  <br />
                  {t('manifesto.p14')}
                </p>
                <p>
                  {t('manifesto.p15')}
                  <br />
                  {t('manifesto.p16')}
                </p>
                <p className="font-avenir font-thin text-primary text-lg uppercase leading-snug tracking-[0.15em] text-left pt-2">
                  {t('manifesto.closing')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id={isHome ? LANDING_SECTION_IDS.aboutTeam : undefined}
        className={`py-12 md:py-16 bg-gradient-to-b from-secondary-50 to-white${isHome ? ` ${LANDING_SCROLL_MARGIN_CLASS}` : ''}`}
        tabIndex={isHome ? -1 : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-12">
            <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500">
              {t('team.title')}
            </h2>
          </div>

          {teamMembers.length > 0 ? (
            <div
              className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto overflow-y-hidden -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              role="region"
              aria-label={t('team.title')}
              tabIndex={0}
            >
              {teamMembers.map((member) => {
                const mobileOpen = isNarrowViewport && mobileExpandedId === member.id;
                return (
                  <div
                    key={member.id}
                    className="w-52 flex-shrink-0 md:flex-shrink md:w-auto mx-auto flex flex-col items-center snap-center"
                  >
                    <div
                      role={isNarrowViewport ? 'button' : undefined}
                      tabIndex={isNarrowViewport ? 0 : undefined}
                      aria-expanded={isNarrowViewport ? mobileOpen : undefined}
                      aria-label={
                        isNarrowViewport
                          ? `${member.name}. ${mobileOpen ? t('team.tapToCollapse') : t('team.tapToExpand')}`
                          : undefined
                      }
                      onClick={() => {
                        if (!isNarrowViewport) return;
                        setMobileExpandedId((prev) =>
                          prev === member.id ? null : member.id
                        );
                      }}
                      onKeyDown={(e) => {
                        if (!isNarrowViewport) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setMobileExpandedId((prev) =>
                            prev === member.id ? null : member.id
                          );
                        }
                      }}
                      className="relative w-52 flex flex-col items-center text-left group max-md:cursor-pointer md:cursor-default outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-50"
                    >
                      <div className="relative w-52 h-72 overflow-hidden rounded-none clip-cut-corners-four shadow-lg border border-primary-500/30 bg-primary-600">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name || ''}
                            className="absolute inset-0 h-full w-full object-cover object-top"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-primary-700 flex items-center justify-center">
                            <User className="w-20 h-20 text-accent-500/50" />
                          </div>
                        )}
                        <div
                          className={`absolute inset-0 z-10 flex flex-col justify-center p-4 bg-[rgba(26,36,51,0.85)] transition-opacity duration-300 ease-out opacity-0 pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto ${
                            mobileOpen ? 'max-md:opacity-100 max-md:pointer-events-auto' : ''
                          }`}
                        >
                          <h4 className="font-avenir font-bold text-accent-400 text-sm mb-2">
                            {member.role || ''}
                          </h4>
                          <p className="font-avenir font-thin text-xs text-secondary-on-dark leading-relaxed">
                            {member.description || ''}
                          </p>
                        </div>
                      </div>
                      <div className="relative -mt-8 w-[calc(100%+24px)] px-4 py-3 bg-primary-600 border border-primary-500/30 rounded-none clip-v-cut-sides flex items-center justify-center min-h-[3.5rem]">
                        <h3 className="font-avenir font-thin text-base text-accent-400 text-center tracking-widest">
                          {member.name || ''}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-52 h-72 rounded-none clip-cut-corners-four bg-primary-600 border border-primary-500/30 flex items-center justify-center">
                <User className="w-16 h-16 text-accent-500/50" />
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        id={isHome ? LANDING_SECTION_IDS.aboutCta : undefined}
        className={`bg-gradient-to-b from-white to-secondary-50 ${
          isHome
            ? `pt-20 pb-32 md:pb-40 lg:pb-48 ${LANDING_SCROLL_MARGIN_CLASS}`
            : 'py-20'
        }`}
        tabIndex={isHome ? -1 : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mb-8 font-avenir">
            {t('ctaSubtitle')}
          </p>
          {isHome ? (
            <LandingHashLink
              locale={locale}
              sectionId={LANDING_SECTION_IDS.contact}
              className="pressable inline-flex items-center px-8 py-3 text-base font-medium bg-accent-500 hover:bg-accent-400 text-white rounded-none transition-colors"
            >
              {t('ctaButton')}
            </LandingHashLink>
          ) : (
            <a
              href={`/${locale}/contact`}
              className="pressable inline-flex items-center px-8 py-3 text-base font-medium bg-accent-500 hover:bg-accent-400 text-white rounded-none transition-colors"
            >
              {t('ctaButton')}
            </a>
          )}
        </div>
      </section>
    </>
  );
}
