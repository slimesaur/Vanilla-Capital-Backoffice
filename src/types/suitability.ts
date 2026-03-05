export interface SuitabilityAnswerOption {
  text: string
  weight: number
}

export interface SuitabilityQuestion {
  id: string
  title: string
  answers: SuitabilityAnswerOption[]
}

export interface SuitabilityFormData {
  id: string
  questions: SuitabilityQuestion[]
  createdAt: string
}

export interface SuitabilityResponse {
  id: string
  formId: string
  answers: Record<string, string>
  submittedAt: string
}
