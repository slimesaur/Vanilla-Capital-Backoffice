import type { ServiceSlug } from '@/lib/servicesData'

/** Stable fragment IDs for the long-scroll home (URLs and redirects must stay stable). */
export const LANDING_SECTION_IDS = {
  home: 'home',
  partners: 'partners',
  services: 'services',
  assetOnboarding: 'asset-onboarding',
  assetDeliverables: 'asset-deliverables',
  about: 'about',
  aboutManifesto: 'about-manifesto',
  aboutTeam: 'about-team',
  aboutCta: 'about-cta',
  contact: 'contact',
  contactInfo: 'contact-info',
  contactForm: 'contact-form',
  footer: 'footer',
} as const

export type LandingSectionId =
  (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS]

/** Hero anchor for each portfolio service — matches `ServiceSlug` for middleware redirects. */
export const SERVICE_SLUG_TO_SECTION_ID: Record<ServiceSlug, string> = {
  'asset-allocation': 'asset-allocation',
  'retirement-planning': 'retirement-planning',
  'wealth-protection': 'wealth-protection',
  'real-estate-auction': 'real-estate-auction',
  'ai-solutions': 'ai-solutions',
  'business-advisory': 'business-advisory',
}

/** Tailwind: matches fixed header `h-20` (5rem). */
export const LANDING_SCROLL_MARGIN_CLASS = 'scroll-mt-20'

/**
 * Mobile-only vertical scroll-snap targets for the long-scroll home.
 * Pairs with `html.vanilla-home-scroll-snap` from HomeScrollSnapRoot.
 */
export const LANDING_SCROLL_SNAP_CLASS = 'max-lg:snap-start'
