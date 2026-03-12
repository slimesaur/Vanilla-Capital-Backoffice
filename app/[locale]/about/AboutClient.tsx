'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { CompanySettingsData } from '@/lib/settings';

interface AboutClientProps {
  settings?: CompanySettingsData;
}

export default function AboutClient({ settings }: AboutClientProps) {
  const t = useTranslations('About');

  const missionText = settings?.mission || t('mission.description');

  const teamMembers =
    settings?.teamMembers && settings.teamMembers.length > 0
      ? settings.teamMembers.map((m) => ({
          id: m.id,
          name: '',
          role: m.position || '',
          bio: '',
          image: m.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        }))
      : [
          {
            id: 'placeholder',
            name: t('team.placeholder.name'),
            role: t('team.placeholder.role'),
            bio: t('team.placeholder.bio'),
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          },
        ];

  return (
    <>
      {/* Hero Section */}
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
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-ink mb-6 font-title">
                {t('mission.title')}
              </h2>
              <p className="text-secondary-600 leading-relaxed mb-4">
                {missionText}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-64 lg:h-96 rounded-lg overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop"
                alt="Team"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4 font-title">
              {t('team.title')}
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto font-subtitle">
              {t('team.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="relative w-36 h-48 mx-auto mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-ink text-center mb-2 font-title">
                  {member.name}
                </h3>
                <p className="text-accent-600 text-center font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-secondary-600 text-center text-sm">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
