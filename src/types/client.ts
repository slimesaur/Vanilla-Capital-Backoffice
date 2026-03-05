export type CivilStatus = 'single' | 'married' | 'divorced' | 'widow'
export type SuitabilityProfile = 'conservative' | 'moderate' | 'aggressive'
export type PropertyRegime = 'separate' | 'community' | 'partial_community' | 'participation_in_acquets'
export type AccountType = 'checking' | 'saving'
export type ClientOnboardingStatus = 'pending_suitability' | 'pending_contract' | 'approved'
export type ClientType = 'individual' | 'legal_entity' | 'family_group'

export interface MaritalInfo {
  propertyRegime: PropertyRegime
  spouseName: string
  spouseCpf: string
  spouseId: string
  spouseBirthDate: string
  spouseIssuingAuthority?: string
}

export interface Administrator {
  name: string
  cpf: string
  isPep: boolean
  isPrincipal?: boolean
}

export type BeneficialOwnerPerson = { kind: 'individual'; name: string; cpf: string; isPep: boolean }
export type BeneficialOwnerCompany = { kind: 'legal_entity'; legalName: string; cnpj: string }
export type BeneficialOwner = (BeneficialOwnerPerson | BeneficialOwnerCompany) & { isPrincipal?: boolean }

export interface Client {
  id: string
  clientType: ClientType
  name?: string
  cpf?: string
  idDocument?: string
  issuingAuthority?: string
  birthDate?: string
  civilStatus?: CivilStatus
  maritalInfo?: MaritalInfo
  spouseIssuingAuthority?: string
  isPep?: boolean
  legalName?: string
  tradeName?: string
  cnpj?: string
  administrators?: Administrator[]
  beneficialOwners?: BeneficialOwner[]
  phone?: string
  phoneCountry?: string
  email?: string
  postalCode?: string
  address?: string
  addressNumber?: number | ''
  addressComplement?: string
  uf?: string
  city?: string
  bank?: string
  bankCode?: string
  accountType?: AccountType
  agency?: string
  accountNumber?: string
  idDocumentFile?: string
  proofOfAddressFile?: string
  marriageCertificateFile?: string
  spouseIdDocumentFile?: string
  suitabilityScore?: number
  suitabilityProfile?: SuitabilityProfile
  status: ClientOnboardingStatus
  suitabilityAnswers?: Record<string, number>
  totalSuitabilityWeight?: number
}

export const CIVIL_STATUS_OPTIONS: { value: CivilStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widow', label: 'Widow' },
]

export const PROPERTY_REGIME_OPTIONS = [
  { value: 'separate', label: 'Separate Property' },
  { value: 'community', label: 'Community Property' },
  { value: 'partial_community', label: 'Partial Community Property' },
  { value: 'participation_in_acquets', label: 'Participation in Acquests' },
]

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'saving', label: 'Saving Account' },
]

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
]
