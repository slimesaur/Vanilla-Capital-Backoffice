'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/landing/lib/utils';
import type { CompanySettingsData } from '@/lib/settings';

interface FooterProps {
  settings?: CompanySettingsData;
}

export default function Footer({ settings }: FooterProps) {
  const t = useTranslations('Footer');
  const locale = useLocale();

  const rawPhone = settings?.phone || '+5541988195090';
  const contactInfo = {
    phone: rawPhone,
    email: settings?.email || 'atendimento@vanillacapital.com.br',
    address: settings?.address || 'Rua Paulo Setuval, 5081 - 81750-190 Curitiba, PR',
    whatsapp: getWhatsAppLink(
      settings?.whatsapp || rawPhone,
      t('whatsappMessage'),
    ),
  };

  return (
    <footer className="bg-[#1A2433] text-white font-subtitle-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 text-left">
            <Link href={`/${locale}`} className="block w-fit mb-6">
              <Image
                src="/images/VANILLA%20LOGO%20WHITE.svg"
                alt="Vanilla Capital"
                width={400}
                height={100}
                className="h-20 w-auto object-contain object-left"
                unoptimized
              />
            </Link>
            <p className="text-secondary-on-dark mb-4">{t('description')}</p>
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
                  href={`/${locale}/portfolio`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {t('portfolio')}
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
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-secondary-on-dark">{contactInfo.address}</span>
              </li>
              <li className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <a
                  href={contactInfo.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-on-dark hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-400/50">
          <p className="text-center text-secondary-on-dark-muted text-sm">
            {t('copyright')} © {new Date().getFullYear()} Vanilla Capital. {t('rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
