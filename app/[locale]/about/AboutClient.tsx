'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User } from 'lucide-react';
import ServiceHero from '@/landing/components/sections/ServiceHero';
import type { CompanySettingsData } from '@/lib/settings';

const ABOUT_HERO_IMAGE = 'WEALTH PROTECTION.jpg';

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
}

export default function AboutClient({ settings }: AboutClientProps) {
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

  return (
    <>
      <ServiceHero title={t('title')} image={ABOUT_HERO_IMAGE} />

      {/* Brand Manifesto */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-0 items-stretch min-h-[28rem]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center pr-8 lg:pr-16 py-12 lg:py-0 order-2 lg:order-1"
            >
              <p className="text-sm font-avenir font-thin text-secondary-500 mb-3 tracking-wide uppercase">
                {t('manifesto.label')}
              </p>
              <div className="h-px w-full max-w-md bg-secondary-300 mb-10" aria-hidden="true" />
              <div className="space-y-6 text-secondary-600 font-montserrat font-thin leading-[1.8] text-lg tracking-[0.02em] text-left">
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
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-64 lg:h-auto lg:min-h-[28rem] overflow-hidden order-1 lg:order-2"
            >
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-secondary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-12"
          >
            <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500">
              {t('team.title')}
            </h2>
          </motion.div>

          {teamMembers.length > 0 ? (
            <div
              className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto overflow-y-hidden -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              role="region"
              aria-label={t('team.title')}
              tabIndex={0}
            >
              {teamMembers.map((member, index) => {
                const mobileOpen = isNarrowViewport && mobileExpandedId === member.id;
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="w-52 flex-shrink-0 md:flex-shrink md:w-auto mx-auto flex flex-col items-center snap-center"
                  >
                    <div
                      role={isNarrowViewport ? 'button' : undefined}
                      tabIndex={isNarrowViewport ? 0 : undefined}
                      aria-expanded={isNarrowViewport ? mobileOpen : undefined}
                      aria-label={isNarrowViewport ? `${member.name}. ${mobileOpen ? t('team.tapToCollapse') : t('team.tapToExpand')}` : undefined}
                      onClick={() => {
                        if (!isNarrowViewport) return;
                        setMobileExpandedId((prev) => (prev === member.id ? null : member.id));
                      }}
                      onKeyDown={(e) => {
                        if (!isNarrowViewport) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setMobileExpandedId((prev) => (prev === member.id ? null : member.id));
                        }
                      }}
                      className="relative w-52 flex flex-col items-center text-left group max-md:cursor-pointer md:cursor-default outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-50"
                    >
                      <div className="relative w-52 h-72 overflow-hidden rounded-none clip-cut-corners-four shadow-lg border border-primary-500/30 bg-primary-600">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name || ''}
                            fill
                            className="object-cover object-top"
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
                  </motion.div>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mb-8 font-avenir">
              {t('ctaSubtitle')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="pressable clip-cut-corners inline-flex items-center px-8 py-3 text-base font-medium bg-accent-500 hover:bg-accent-400 text-white rounded-none transition-colors"
            >
              {t('ctaButton')}
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
