export type RegistrationFormType = 'pf' | 'pj' | 'family'

export interface RegistrationResponse {
  id: string
  formType: RegistrationFormType
  answers: Record<string, string | number | boolean | unknown[] | object>
  submittedAt: string
  approvedClientId?: string
}

export interface RegistrationFieldDefinition {
  key: string
  type: 'string' | 'number' | 'select' | 'date' | 'checkbox'
  mask?: 'cpf' | 'cnpj' | 'cep' | 'phone' | 'rg' | 'date'
  required?: boolean
  options?: { value: string; labelKey?: string; label?: string }[]
  conditional?: { field: string; value: string }
  labelKey: string
}

export interface RegistrationFormDefinition {
  formType: RegistrationFormType
  fields: RegistrationFieldDefinition[]
}
