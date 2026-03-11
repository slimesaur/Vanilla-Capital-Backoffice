'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import Link from 'next/link';

const documents = [
  {
    key: 'compliance',
    titleKey: 'compliance.title',
    descriptionKey: 'compliance.description',
  },
  {
    key: 'ethics',
    titleKey: 'ethics.title',
    descriptionKey: 'ethics.description',
  },
  {
    key: 'trading',
    titleKey: 'trading.title',
    descriptionKey: 'trading.description',
  },
  {
    key: 'reference',
    titleKey: 'reference.title',
    descriptionKey: 'reference.description',
  },
];

export default function ComplianceClient() {
  const t = useTranslations('Compliance');

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-secondary-100 h-full flex flex-col">
                <div className="bg-accent-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-accent-600" />
                </div>
                <h2 className="text-2xl font-semibold text-ink mb-4 font-title">
                  {t(doc.titleKey)}
                </h2>
                <p className="text-secondary-600 mb-6 flex-grow">
                  {t(doc.descriptionKey)}
                </p>
                <Link
                  href={`/documents/${doc.key}.pdf`}
                  download
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {t('download')}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-secondary-50 rounded-xl p-8"
        >
          <h3 className="text-xl font-semibold text-ink mb-4 font-title">
            {t('info.title')}
          </h3>
          <p className="text-secondary-600 leading-relaxed">
            {t('info.description')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
