import type { SuitabilityFormData, SuitabilityResponse, SuitabilityAnswerOption } from '../types/suitability'

const FORMS_KEY = 'vanilla-suitability-forms'
const RESPONSES_KEY = 'vanilla-suitability-responses'
const DEFAULT_FORM_ID = 'default-suitability-form'

function migrateAnswers(answers: unknown): SuitabilityAnswerOption[] {
  if (!Array.isArray(answers)) return []
  return answers.map((a) => {
    if (typeof a === 'object' && a !== null && 'text' in a && 'weight' in a) {
      return { text: String((a as SuitabilityAnswerOption).text), weight: Number((a as SuitabilityAnswerOption).weight) || 0 }
    }
    return { text: String(a), weight: 0 }
  })
}

function migrateForm(form: SuitabilityFormData): SuitabilityFormData {
  return {
    ...form,
    questions: form.questions.map((q) => ({
      ...q,
      answers: migrateAnswers(q.answers),
    })),
  }
}

export function getForms(): SuitabilityFormData[] {
  try {
    const raw = localStorage.getItem(FORMS_KEY)
    const forms = raw ? JSON.parse(raw) : []
    return Array.isArray(forms) ? forms.map(migrateForm) : []
  } catch {
    return []
  }
}

export function saveForm(form: SuitabilityFormData): void {
  const forms = getForms()
  const idx = forms.findIndex((f) => f.id === form.id)
  if (idx >= 0) forms[idx] = form
  else forms.push(form)
  localStorage.setItem(FORMS_KEY, JSON.stringify(forms))
}

export function getForm(id: string): SuitabilityFormData | null {
  let form = getForms().find((f) => f.id === id) ?? null
  if (!form && id === DEFAULT_FORM_ID) {
    form = {
      id: DEFAULT_FORM_ID,
      questions: [],
      createdAt: new Date().toISOString(),
    }
    saveForm(form)
  }
  return form ? migrateForm(form) : null
}

export function getResponses(formId: string): SuitabilityResponse[] {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY)
    const all: SuitabilityResponse[] = raw ? JSON.parse(raw) : []
    return all.filter((r) => r.formId === formId)
  } catch {
    return []
  }
}

export function saveResponse(response: SuitabilityResponse): void {
  const raw = localStorage.getItem(RESPONSES_KEY)
  const all: SuitabilityResponse[] = raw ? JSON.parse(raw) : []
  all.push(response)
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(all))
}

export function removeResponse(responseId: string): void {
  const raw = localStorage.getItem(RESPONSES_KEY)
  const all: SuitabilityResponse[] = raw ? JSON.parse(raw) : []
  const filtered = all.filter((r) => r.id !== responseId)
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(filtered))
}
