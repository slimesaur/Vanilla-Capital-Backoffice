import { prisma } from './db'

export interface CompanySettingsData {
  phone: string | null
  email: string | null
  address: string | null
  whatsapp: string | null
  mission: string | null
  companySnapshot: string | null
  companyValues: string | null
  oneYearGoal: string | null
  longTermGoals: string | null
  currentMainProject: string | null
  toneAndLanguage: string | null
  glossary: string | null
  brandAndDeckHabits: string | null
  idealClientProfile: string | null
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
  companySnapshot: null,
  companyValues: null,
  oneYearGoal: null,
  longTermGoals: null,
  currentMainProject: null,
  toneAndLanguage: null,
  glossary: null,
  brandAndDeckHabits: null,
  idealClientProfile: null,
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
      mission: settings.mission ?? DEFAULTS.mission,
      companySnapshot: settings.companySnapshot ?? DEFAULTS.companySnapshot,
      companyValues: settings.companyValues ?? DEFAULTS.companyValues,
      oneYearGoal: settings.oneYearGoal ?? DEFAULTS.oneYearGoal,
      longTermGoals: settings.longTermGoals ?? DEFAULTS.longTermGoals,
      currentMainProject: settings.currentMainProject ?? DEFAULTS.currentMainProject,
      toneAndLanguage: settings.toneAndLanguage ?? DEFAULTS.toneAndLanguage,
      glossary: settings.glossary ?? DEFAULTS.glossary,
      brandAndDeckHabits: settings.brandAndDeckHabits ?? DEFAULTS.brandAndDeckHabits,
      idealClientProfile: settings.idealClientProfile ?? DEFAULTS.idealClientProfile,
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
