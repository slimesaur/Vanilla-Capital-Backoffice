'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { services } from '@/lib/servicesData';
import BrandIcon from '@/landing/components/ui/BrandIcon';

export default function PortfolioClient() {
  const t = useTranslations('Portfolio');

  return (
    <section className="py-20 bg-gradient-to-b from-secondary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 font-title">
            {t('title')}
          </h1>
          <p className="text-lg text-secondary-600 max-w-3xl mx-auto font-subtitle">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-secondary-100">
                  <div className={`${service.bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                    <BrandIcon name={service.icon} size={48} variant="dark" />
                  </div>
                  <h2 className="text-2xl font-semibold text-ink mb-4 font-title">
                    {t(`${service.key}.title`)}
                  </h2>
                  <p className="text-secondary-600 leading-relaxed mb-4">
                    {t(`${service.key}.description`)}
                  </p>
                  <ul className="space-y-2 text-secondary-600">
                    {[1, 2, 3].map((item) => {
                      const feature = t(`${service.key}.features.${item}`, { returnObjects: true });
                      if (typeof feature === 'string' && feature) {
                        return (
                          <li key={item} className="flex items-start">
                            <span className="text-accent-600 mr-2">•</span>
                            <span>{feature}</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
