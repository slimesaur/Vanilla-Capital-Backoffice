import { Shield, TrendingUp, Gavel, Briefcase } from 'lucide-react'

export const services = [
  { key: 'patrimonial', icon: Shield, color: 'text-accent-600', bgColor: 'bg-accent-50' },
  { key: 'assets', icon: TrendingUp, color: 'text-accent-600', bgColor: 'bg-accent-50' },
  { key: 'auction', icon: Gavel, color: 'text-accent-600', bgColor: 'bg-accent-50' },
  { key: 'consulting', icon: Briefcase, color: 'text-accent-600', bgColor: 'bg-accent-50' },
] as const

export type ServiceKey = (typeof services)[number]['key']
