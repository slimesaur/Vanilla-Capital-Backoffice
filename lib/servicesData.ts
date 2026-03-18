export const services = [
  { key: 'retirement', icon: '14', bgColor: 'bg-primary-50', image: 'RETIREMENT PLANNING.png' },
  { key: 'patrimonial', icon: '13', bgColor: 'bg-primary-50', image: 'WEALTH PROTECTION.jpg' },
  { key: 'auction', icon: '22', bgColor: 'bg-primary-50', image: 'REAL ESTATE AUCTION.jpg' },
  { key: 'assets', icon: '08', bgColor: 'bg-primary-50', image: 'ASSET ALOCATION.png' },
  { key: 'aiSolution', icon: '01', bgColor: 'bg-primary-50', image: 'AI SOLUTIONS FOR BUSINESS.jpg' },
  { key: 'consulting', icon: '09', bgColor: 'bg-primary-50', image: 'BUSINESS FINANCIAL ADVISORY.png' },
] as const

export type ServiceKey = (typeof services)[number]['key']
