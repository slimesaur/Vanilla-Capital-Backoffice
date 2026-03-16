export const services = [
  { key: 'patrimonial', icon: '13', bgColor: 'bg-accent-50' },
  { key: 'assets', icon: '08', bgColor: 'bg-accent-50' },
  { key: 'auction', icon: '22', bgColor: 'bg-accent-50' },
  { key: 'consulting', icon: '09', bgColor: 'bg-accent-50' },
] as const

export type ServiceKey = (typeof services)[number]['key']
