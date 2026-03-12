import { prisma } from './db'

export interface CompanySettingsData {
  phone: string | null
  email: string | null
  address: string | null
  whatsapp: string | null
  mission: string | null
  teamMembers: {
    id: string
    photo: string | null
    position: string | null
    order: number
  }[]
}

const DEFAULTS: CompanySettingsData = {
  phone: '+5541988195090',
  email: 'atendimento@vanillacapital.com.br',
  address: 'Rua Paulo Setuval, 5081 - 81750-190 Curitiba, PR',
  whatsapp: '+5541988195090',
  mission: null,
  teamMembers: [],
}

export async function getCompanySettings(): Promise<CompanySettingsData> {
  try {
    const settings = await prisma.companySettings.findFirst({
      include: { teamMembers: { orderBy: { order: 'asc' } } },
    })

    if (!settings) return DEFAULTS

    return {
      phone: settings.phone || DEFAULTS.phone,
      email: settings.email || DEFAULTS.email,
      address: settings.address || DEFAULTS.address,
      whatsapp: settings.whatsapp || DEFAULTS.whatsapp,
      mission: settings.mission || DEFAULTS.mission,
      teamMembers: settings.teamMembers.map((m) => ({
        id: m.id,
        photo: m.photo,
        position: m.position,
        order: m.order,
      })),
    }
  } catch {
    return DEFAULTS
  }
}
