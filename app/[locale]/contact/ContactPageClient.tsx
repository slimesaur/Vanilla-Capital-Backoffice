'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { getWhatsAppLink, formatPhoneDisplay } from '@/landing/lib/utils';
import BrandIcon from '@/landing/components/ui/BrandIcon';
import Button from '@/landing/components/ui/Button';
import ServiceHero from '@/landing/components/sections/ServiceHero';
import type { CompanySettingsData } from '@/lib/settings';

const CONTACT_HERO_IMAGE = 'BUSINESS FINANCIAL ADVISORY.png';

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
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const rawPhone = settings?.phone || '+5541988195090';
  const rawWhatsApp = settings?.whatsapp || rawPhone;
  const contactInfo = {
    phone: formatPhoneDisplay(rawPhone),
    email: settings?.email || 'atendimento@vanillacapital.com.br',
    address: settings?.address || 'Rua Paulo Setuval, 5081 - 81750-190 Curitiba, PR',
    whatsapp: getWhatsAppLink(rawWhatsApp, t('whatsappMessage')),
    whatsappDisplay: formatPhoneDisplay(rawWhatsApp),
  };

  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    contactInfo.address
  )}&output=embed`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitStatus('error');
        return;
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fieldClass =
    'w-full px-4 py-3 border border-secondary-300 rounded-none bg-white font-avenir font-thin focus:ring-2 focus:ring-accent-500 focus:border-transparent';

  return (
    <>
      <ServiceHero title={t('title')} image={CONTACT_HERO_IMAGE} />

      <section className="pt-6 md:pt-8 pb-12 md:pb-16 bg-gradient-to-b from-secondary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-8">
                {t('info.title')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <BrandIcon name="17" size={36} variant="dark" className="flex-shrink-0" />
                  <div>
                    <h3 className="font-avenir font-bold text-ink mb-1">
                      {t('info.phone')}
                    </h3>
                    <a
                      href={`tel:+${rawPhone.replace(/\D/g, '')}`}
                      className="font-avenir font-thin text-secondary-600 hover:text-accent-600 transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <BrandIcon name="16" size={36} variant="dark" className="flex-shrink-0" />
                  <div>
                    <h3 className="font-avenir font-bold text-ink mb-1">
                      {t('info.email')}
                    </h3>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="font-avenir font-thin text-secondary-600 hover:text-accent-600 transition-colors break-all"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <BrandIcon name="15" size={36} variant="dark" className="flex-shrink-0" />
                  <div>
                    <h3 className="font-avenir font-bold text-ink mb-1">
                      {t('info.address')}
                    </h3>
                    <p className="font-avenir font-thin text-secondary-600">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <BrandIcon name="18" size={36} variant="dark" className="flex-shrink-0" />
                  <div>
                    <h3 className="font-avenir font-bold text-ink mb-1">
                      {t('info.whatsappLabel')}
                    </h3>
                    <a
                      href={contactInfo.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-avenir font-thin text-secondary-600 hover:text-accent-600 transition-colors"
                      aria-label={`${t('info.whatsappLabel')}: ${contactInfo.whatsappDisplay}`}
                    >
                      {contactInfo.whatsappDisplay}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 overflow-hidden clip-cut-corners-all border border-primary-500/20 shadow-lg">
                <iframe
                  src={mapEmbedSrc}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                  title={t('info.mapIframeTitle')}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <div className="bg-white rounded-none clip-cut-corners-all p-8 shadow-lg border border-primary-500/10">
                <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-6">
                  {t('form.title')}
                </h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 rounded-none bg-green-50 border border-green-200 text-green-800 text-sm font-avenir font-thin">
                    {t('form.success')}
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 rounded-none bg-red-50 border border-red-200 text-red-800 text-sm font-avenir font-thin">
                    {t('form.error')}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-avenir font-bold text-ink mb-2"
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
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-avenir font-bold text-ink mb-2"
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
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-avenir font-bold text-ink mb-2"
                    >
                      {t('form.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-avenir font-bold text-ink mb-2"
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
                      className={fieldClass}
                    />
                  </div>

                  <p className="text-xs text-secondary-500 font-avenir font-thin">
                    {t('form.privacy')}
                  </p>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full pressable bg-accent-500 hover:bg-accent-400 text-white font-avenir font-medium"
                  >
                    {isSubmitting ? (
                      t('form.submitting')
                    ) : (
                      <>
                        <Send className="inline h-5 w-5 mr-2 align-text-bottom" />
                        {t('form.submit')}
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-secondary-200">
                  <h3 className="font-avenir font-bold text-ink mb-2">{t('form.nextSteps')}</h3>
                  <p className="text-sm text-secondary-600 font-avenir font-thin leading-relaxed">
                    {t('form.nextStepsDescription')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
