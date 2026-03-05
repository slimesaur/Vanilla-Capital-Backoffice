export interface ComplianceDocument {
  id: string
  name: string
  group: 'onboarding' | 'corporate'
  type: 'pdf' | 'suitability' | 'form'
  pdfUrl?: string
}

export interface OnboardingStep {
  stepNumber: number
  labelKey: string
  expandable: boolean
  items: { id: string; translationKey: string; type: 'pdf' | 'suitability' | 'form' }[]
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    stepNumber: 1,
    labelKey: 'compliance.registrationForm',
    expandable: true,
    items: [
      { id: 'form-pf', translationKey: 'compliance.formPf', type: 'form' },
      { id: 'form-pj', translationKey: 'compliance.formPj', type: 'form' },
    ],
  },
  {
    stepNumber: 2,
    labelKey: 'compliance.suitabilityForm',
    expandable: false,
    items: [{ id: 'suitability-form', translationKey: 'compliance.suitabilityForm', type: 'suitability' }],
  },
  {
    stepNumber: 3,
    labelKey: 'compliance.serviceAgreement',
    expandable: true,
    items: [
      { id: 'contract-pf', translationKey: 'compliance.contractPf', type: 'pdf' },
      { id: 'contract-pj', translationKey: 'compliance.contractPj', type: 'pdf' },
      { id: 'contract-family', translationKey: 'compliance.contractFamily', type: 'pdf' },
    ],
  },
]

export const COMPLIANCE_GROUPS = {
  onboarding: ONBOARDING_STEPS.flatMap((s) => s.items),
  corporate: [
    { id: 'suitability-policies', type: 'pdf' as const },
    { id: 'client-contract', type: 'pdf' as const },
    { id: 'ethics-code', type: 'pdf' as const },
    { id: 'reference-form', type: 'pdf' as const },
    { id: 'compliance-manual', type: 'pdf' as const },
    { id: 'internal-rules', type: 'pdf' as const },
    { id: 'investment-policies', type: 'pdf' as const },
    { id: 'aml-policy', type: 'pdf' as const },
  ],
}

export const DOC_ID_TO_FORM_TYPE: Record<string, 'pf' | 'pj'> = {
  'form-pf': 'pf',
  'form-pj': 'pj',
}

export function getDocById(id: string): { id: string; type: 'pdf' | 'suitability' | 'form' } | undefined {
  for (const step of ONBOARDING_STEPS) {
    for (const item of step.items) {
      if (item.id === id) return { id: item.id, type: item.type }
    }
  }
  const corp = COMPLIANCE_GROUPS.corporate.find((c) => c.id === id)
  if (corp) return { id: corp.id, type: corp.type }
  return undefined
}
