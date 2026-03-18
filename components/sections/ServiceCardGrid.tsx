'use client';

import BrandIcon from '@/landing/components/ui/BrandIcon';
import type { ServiceKey } from '@/lib/servicesData';
import { CARD_ICONS } from '@/lib/servicesData';

interface Card {
  icon: string;
  title: string;
  description: string;
}

interface ServiceCardGridProps {
  serviceKey: ServiceKey;
  cardGridTitle: string;
  cards: Card[];
}

export default function ServiceCardGrid({
  serviceKey,
  cardGridTitle,
  cards,
}: ServiceCardGridProps) {
  const icons = CARD_ICONS[serviceKey] ?? ['08', '08', '08', '08'];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-secondary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-500 mb-8 md:mb-12">
          {cardGridTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-primary-600 rounded-xl p-8 lg:p-10 shadow-lg border border-primary-500/30 flex flex-col"
            >
              <div className="mb-7">
                <BrandIcon
                  name={icons[index] ?? '08'}
                  size={48}
                  variant="light"
                  className="flex-shrink-0"
                />
              </div>
              <h3 className="text-xl font-avenir font-thin text-accent-400 mb-6 line-clamp-2 min-h-[2.8em]">
                {card.title}
              </h3>
              <p className="text-sm text-secondary-100 font-avenir font-thin leading-relaxed flex-grow">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
