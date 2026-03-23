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

const SETTINGS_QUERY_MS = 4000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('settings-query-timeout')), ms)
    promise.then(
      (v) => {
        clearTimeout(id)
        resolve(v)
      },
      (e) => {
        clearTimeout(id)
        reject(e)
      }
    )
  })
}

export async function getCompanySettings(): Promise<CompanySettingsData> {
  try {
    const settings = await withTimeout(
      prisma.companySettings.findFirst({
        include: { teamMembers: { orderBy: { order: 'asc' } } },
      }),
      SETTINGS_QUERY_MS
    )

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
