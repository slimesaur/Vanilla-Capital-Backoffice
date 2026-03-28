'use client';

import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import BrandIcon from '@/landing/components/ui/BrandIcon';
import ServiceHero from '@/landing/components/sections/ServiceHero';

const COMPLIANCE_HERO_IMAGE = 'WEALTH PROTECTION.jpg';

const documents = [
  {
    key: 'compliance',
    backofficeKey: 'compliance-manual',
    titleKey: 'compliance.title',
    descriptionKey: 'compliance.description',
    brandIcon: '07',
  },
  {
    key: 'ethics',
    backofficeKey: 'ethics-code',
    titleKey: 'ethics.title',
    descriptionKey: 'ethics.description',
    brandIcon: '13',
  },
  {
    key: 'trading',
    backofficeKey: 'investment-policies',
    titleKey: 'trading.title',
    descriptionKey: 'trading.description',
    brandIcon: '08',
  },
  {
    key: 'reference',
    backofficeKey: 'reference-form',
    titleKey: 'reference.title',
    descriptionKey: 'reference.description',
    brandIcon: '12',
  },
] as const;

export default function ComplianceClient() {
  const t = useTranslations('Compliance');
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/compliance/documents')
      .then((r) => r.json())
      .then((data) => {
        if (data.documents) {
          const urls: Record<string, string> = {};
          for (const [key, val] of Object.entries(
            data.documents as Record<string, { url: string }>
          )) {
            urls[key] = val.url;
          }
          setDocUrls(urls);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <ServiceHero
        title={t('title')}
        image={COMPLIANCE_HERO_IMAGE}
        disableScrollFade
      />

      <section className="relative z-10 bg-gradient-to-b from-secondary-50 to-white pt-6 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12 bg-secondary-50 rounded-none clip-cut-corners-all p-8 lg:p-10 border border-secondary-200">
            <p className="text-sm font-avenir font-thin text-secondary-500 mb-3 tracking-wide uppercase">
              {t('info.label')}
            </p>
            <div className="h-px w-full max-w-md bg-secondary-300 mb-8" aria-hidden="true" />
            <h3 className="font-avenir font-bold text-xl md:text-2xl text-ink mb-4">
              {t('info.title')}
            </h3>
            <p className="text-secondary-600 font-avenir font-thin leading-relaxed text-base">
              {t('info.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {documents.map((doc) => (
              <div key={doc.key}>
                <div className="bg-primary-600 rounded-none clip-cut-corners-all p-8 lg:p-10 shadow-lg border border-primary-500/30 h-full flex flex-col">
                  <div className="mb-8">
                    <BrandIcon
                      name={doc.brandIcon}
                      size={48}
                      variant="light"
                      className="flex-shrink-0"
                    />
                  </div>
                  <h2 className="text-xl font-avenir font-bold text-accent-400 mb-8 min-h-[2.8em] leading-snug">
                    {t(doc.titleKey)}
                  </h2>
                  <p className="text-sm text-secondary-100 font-avenir font-thin leading-relaxed flex-grow text-justify mb-8">
                    {t(doc.descriptionKey)}
                  </p>
                  {docUrls[doc.backofficeKey] ? (
                    <a
                      href={docUrls[doc.backofficeKey]}
                      download
                      className="pressable inline-flex items-center justify-center px-6 py-3 bg-accent-500 hover:bg-accent-400 text-white font-avenir font-medium rounded-none transition-colors mt-auto"
                    >
                      <Download className="h-5 w-5 mr-2 shrink-0" />
                      {t('download')}
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center px-6 py-3 bg-secondary-700/40 text-secondary-on-dark-muted font-avenir font-medium rounded-none cursor-not-allowed mt-auto border border-primary-500/20">
                      <Download className="h-5 w-5 mr-2 shrink-0 opacity-60" />
                      {t('download')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
