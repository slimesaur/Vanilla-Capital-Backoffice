'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

import { getWhatsAppLink } from '@/landing/lib/utils';
import BrandIcon from '@/landing/components/ui/BrandIcon';
import type { CompanySettingsData } from '@/lib/settings';
import LandingLogo from './LandingLogo';
import { services } from '@/lib/servicesData';

function formatPhoneDisplay(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const digits = (phone.match(/\d/g) ?? []).join('').slice(0, 13);
  if (digits.length < 10) return phone.trim();
  const cc = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const rest = digits.slice(4);
  if (rest.length <= 4) return `+${cc} (${area}) ${rest}`;
  if (rest.length <= 8) return `+${cc} (${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `+${cc} (${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

interface FooterProps {
  settings?: CompanySettingsData;
}

export default function Footer({ settings }: FooterProps) {
  const t = useTranslations('Footer');
  const locale = useLocale();

  const rawPhone = settings?.phone || '+5541988195090';
  const contactInfo = {
    phone: formatPhoneDisplay(rawPhone),
    email: settings?.email || 'atendimento@vanillacapital.com.br',
    address: settings?.address || 'Rua Paulo Setuval, 5081 - 81750-190 Curitiba, PR',
    whatsapp: getWhatsAppLink(
      settings?.whatsapp || rawPhone,
      t('whatsappMessage'),
    ),
  };

  const tServices = useTranslations('Home.services');

  return (
    <footer className="bg-[#1A2433] text-white font-avenir font-thin">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2 text-left">
            <div className="mb-4 overflow-visible md:-mt-[2.5%]">
              <LandingLogo size="footer" />
            </div>
            <p className="text-secondary-on-dark mb-4">{t('description')}</p>
            <a
              href={contactInfo.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-block mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent-500 hover:bg-accent-400 text-[#1A2433] transition-colors"
            >
              {t('startSuitability')}
            </a>
          </div>

          {/* Portfolio - all service pages */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('portfolio')}</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.key}>
                  <Link
                    href={`/${locale}/portfolio/${service.slug}`}
                    className="text-secondary-on-dark hover:text-white transition-colors"
                  >
                    {tServices(`${service.key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/compliance`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {t('compliance')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <BrandIcon name="17" size={24} variant="light" className="mt-0.5 flex-shrink-0" />
                <a
                  href={`tel:+${rawPhone.replace(/\D/g, '')}`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <BrandIcon name="16" size={24} variant="light" className="mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <BrandIcon name="15" size={24} variant="light" className="mt-0.5 flex-shrink-0" />
                <span className="text-secondary-on-dark">{contactInfo.address}</span>
              </li>
              <li className="flex items-start space-x-3">
                <BrandIcon name="18" size={24} variant="light" className="mt-0.5 flex-shrink-0" />
                <a
                  href={contactInfo.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-400/50 space-y-4">
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <span className="text-secondary-on-dark-muted text-xs">{t('regulatedBy')}</span>
            <a
              href="https://www.gov.br/cvm/pt-br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-on-dark hover:text-accent-300 text-sm font-medium transition-colors"
            >
              CVM
            </a>
            <a
              href="https://www.anbima.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-on-dark hover:text-accent-300 text-sm font-medium transition-colors"
            >
              Anbima
            </a>
          </div>
          <p className="text-center text-secondary-on-dark-muted text-sm">
            {t('copyright')} © {new Date().getFullYear()} Vanilla Capital. {t('rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
