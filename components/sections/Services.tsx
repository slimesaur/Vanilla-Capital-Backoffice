'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { services } from '@/lib/servicesData';
import BrandIcon from '@/landing/components/ui/BrandIcon';

export default function Services() {
  const t = useTranslations('Home.services');
  const locale = useLocale();

  return (
    <section className="pt-16 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4 font-title">
            {t('title')}
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto font-subtitle">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            return (
              <motion.div
                key={service.key}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-secondary-100 h-full flex flex-col">
                  <div className={`${service.bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                    <BrandIcon name={service.icon} size={48} variant="dark" />
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-2 font-title">
                    {t(`${service.key}.title`)}
                  </h3>
                  <p className="text-secondary-600 mb-4 flex-grow">
                    {t(`${service.key}.description`)}
                  </p>
                  <Link
                    href={`/${locale}/portfolio`}
                    className="inline-flex items-center text-accent-600 hover:text-accent-700 font-medium text-sm"
                  >
                    {t('learnMore')}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
