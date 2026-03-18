export type ServiceSlug =
  | 'asset-allocation'
  | 'retirement-planning'
  | 'wealth-protection'
  | 'real-estate-auction'
  | 'ai-solutions'
  | 'business-advisory'

export const SLUG_TO_KEY: Record<ServiceSlug, string> = {
  'asset-allocation': 'assets',
  'retirement-planning': 'retirement',
  'wealth-protection': 'patrimonial',
  'real-estate-auction': 'auction',
  'ai-solutions': 'aiSolution',
  'business-advisory': 'consulting',
} as const

/** Card icon IDs from public/icons - map BRD descriptions to icon numbers */
export const CARD_ICONS = {
  assets: ['02', '08', '10', '09'] as const, // Bulb, Bars, Scope, Handshake
  retirement: ['09', '12', '12', '12'] as const, // Handshake, Map, Map, Map
  patrimonial: ['02', '07', '13', '19'] as const, // Bulb, Document, Shield, Globe
  auction: ['11', '07', '08', '22'] as const, // Eye chart, Document, Bars, Hammer
  aiSolution: ['07', '11', '19', '09'] as const, // Link, Eye, Globe, Handshake
  consulting: ['09', '22', '03', '12'] as const, // Handshake, Hammer, Pie, Map
} as const

export const services = [
  {
    key: 'assets',
    slug: 'asset-allocation' as ServiceSlug,
    icon: '08',
    bgColor: 'bg-primary-50',
    image: 'ASSET ALOCATION.png',
  },
  {
    key: 'retirement',
    slug: 'retirement-planning' as ServiceSlug,
    icon: '14',
    bgColor: 'bg-primary-50',
    image: 'RETIREMENT PLANNING.png',
  },
  {
    key: 'patrimonial',
    slug: 'wealth-protection' as ServiceSlug,
    icon: '13',
    bgColor: 'bg-primary-50',
    image: 'WEALTH PROTECTION.jpg',
  },
  {
    key: 'auction',
    slug: 'real-estate-auction' as ServiceSlug,
    icon: '22',
    bgColor: 'bg-primary-50',
    image: 'REAL ESTATE AUCTION.jpg',
  },
  {
    key: 'aiSolution',
    slug: 'ai-solutions' as ServiceSlug,
    icon: '01',
    bgColor: 'bg-primary-50',
    image: 'AI SOLUTIONS FOR BUSINESS.jpg',
  },
  {
    key: 'consulting',
    slug: 'business-advisory' as ServiceSlug,
    icon: '09',
    bgColor: 'bg-primary-50',
    image: 'BUSINESS FINANCIAL ADVISORY.png',
  },
] as const

export type ServiceKey = (typeof services)[number]['key']

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug)
}

export function getServiceByKey(key: string) {
  return services.find((s) => s.key === key)
}
