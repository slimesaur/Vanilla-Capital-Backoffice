import type { SuitabilityFormData, SuitabilityResponse, SuitabilityAnswerOption } from '../types/suitability'

const FORMS_API = '/api/suitability/forms'
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
      multipleSelection: q.multipleSelection ?? false,
    })),
  }
}

export async function getForms(): Promise<SuitabilityFormData[]> {
  try {
    const res = await fetch(FORMS_API)
    if (!res.ok) return []
    const forms = await res.json()
    return Array.isArray(forms) ? forms.map(migrateForm) : []
  } catch {
    return []
  }
}

export async function saveForm(form: SuitabilityFormData): Promise<void> {
  try {
    await fetch(`${FORMS_API}/${form.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: form.questions }),
    })
  } catch {
    // silent fail
  }
}

export async function getForm(id: string): Promise<SuitabilityFormData | null> {
  try {
    const res = await fetch(`${FORMS_API}/${id}`)
    if (res.ok) {
      const form = await res.json()
      return migrateForm(form)
    }

    if (id === DEFAULT_FORM_ID) {
      const form: SuitabilityFormData = {
        id: DEFAULT_FORM_ID,
        questions: [],
        createdAt: new Date().toISOString(),
      }
      await saveForm(form)
      return form
    }

    return null
  } catch {
    return null
  }
}

export async function getResponses(formId: string): Promise<SuitabilityResponse[]> {
  try {
    const res = await fetch(`${FORMS_API}/${formId}/responses`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function saveResponse(response: SuitabilityResponse): Promise<void> {
  try {
    await fetch(`${FORMS_API}/${response.formId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    })
  } catch {
    // silent fail
  }
}

export async function removeResponse(responseId: string): Promise<void> {
  try {
    await fetch(`/api/suitability/responses/${responseId}`, { method: 'DELETE' })
  } catch {
    // silent fail
  }
}
