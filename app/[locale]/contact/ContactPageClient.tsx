'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { getWhatsAppLink } from '@/landing/lib/utils';
import BrandIcon from '@/landing/components/ui/BrandIcon';
import Button from '@/landing/components/ui/Button';
import type { CompanySettingsData } from '@/lib/settings';

interface ContactPageClientProps {
  settings?: CompanySettingsData;
}

export default function ContactPageClient({ settings }: ContactPageClientProps) {
  const t = useTranslations('Contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implement actual form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert(t('form.success'));
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-ink mb-6 font-title">
              {t('info.title')}
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <BrandIcon name="17" size={24} variant="light" className="flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink mb-1">
                    {t('info.phone')}
                  </h3>
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="text-secondary-600 hover:text-accent-600 transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <BrandIcon name="16" size={24} variant="light" className="flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink mb-1">
                    {t('info.email')}
                  </h3>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-secondary-600 hover:text-accent-600 transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <BrandIcon name="15" size={24} variant="light" className="flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink mb-1">
                    {t('info.address')}
                  </h3>
                  <p className="text-secondary-600">{contactInfo.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <BrandIcon name="18" size={24} variant="light" className="flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink mb-1">
                    WhatsApp
                  </h3>
                  <a
                    href={contactInfo.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-600 hover:text-accent-600 transition-colors"
                  >
                    {t('info.whatsapp')}
                  </a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.5!2d-49.3!3d-25.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dce8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sRua%20Paulo%20Set%C3%BAbal%2C%205081%20-%20Boqueir%C3%A3o%2C%20Curitiba%20-%20PR%2C%2081750-190!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                title="Vanilla Capital Location"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-ink mb-6 font-title">
                {t('form.title')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-ink mb-2"
                  >
                    {t('form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-ink mb-2"
                  >
                    {t('form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-ink mb-2"
                  >
                    {t('form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-ink mb-2"
                  >
                    {t('form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    t('form.submitting')
                  ) : (
                    <>
                      <Send className="inline h-5 w-5 mr-2" />
                      {t('form.submit')}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
