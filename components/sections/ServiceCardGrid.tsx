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

/**
 * Portfolio “why invest” grid — secondary-100 cards (same cream as deliverables section) on navy band.
 * Extra bottom padding on md+: the next block’s ServiceHero uses md:-mt-20, which would otherwise
 * pull the hero image up over the bottom of this grid.
 */
export default function ServiceCardGrid({
  serviceKey,
  cardGridTitle,
  cards,
}: ServiceCardGridProps) {
  const icons = CARD_ICONS[serviceKey] ?? ['08', '08', '08', '08'];

  return (
    <section className="bg-gradient-to-b from-primary-900 to-primary-800 pt-16 pb-16 md:pt-20 md:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-avenir font-bold text-2xl md:text-3xl text-accent-400 mb-10 md:mb-14">
          {cardGridTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <article
              key={index}
              className="flex flex-col bg-secondary-100 border border-secondary-200 border-l-4 border-l-accent-400 rounded-none shadow-md p-6 lg:p-8"
            >
              <div className="mb-4 shrink-0">
                <BrandIcon
                  name={icons[index] ?? '08'}
                  size={40}
                  variant="dark"
                  className="flex-shrink-0"
                />
              </div>
              <h3 className="text-lg md:text-xl font-avenir font-bold text-accent-500 mb-3 line-clamp-3">
                {card.title}
              </h3>
              <p className="text-sm text-ink/90 font-avenir font-thin leading-relaxed flex-grow text-left text-pretty">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
