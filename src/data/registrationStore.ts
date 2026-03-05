import type { RegistrationResponse, RegistrationFormType } from '../types/registration'

const RESPONSES_KEY = 'vanilla-registration-responses'

function loadAllResponses(): RegistrationResponse[] {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getResponses(formType: RegistrationFormType): RegistrationResponse[] {
  return loadAllResponses().filter((r) => r.formType === formType)
}

export function getResponseById(id: string): RegistrationResponse | null {
  return loadAllResponses().find((r) => r.id === id) ?? null
}

export function saveResponse(response: RegistrationResponse): void {
  const all = loadAllResponses()
  all.push(response)
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(all))
}

export function approveResponse(responseId: string, clientId: string): void {
  const all = loadAllResponses()
  const idx = all.findIndex((r) => r.id === responseId)
  if (idx >= 0) {
    all[idx] = { ...all[idx], approvedClientId: clientId }
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(all))
  }
}
