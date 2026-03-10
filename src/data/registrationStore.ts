import type { RegistrationResponse, RegistrationFormType } from '../types/registration'

const API_BASE = '/api/registration/responses'

export async function getResponses(formType: RegistrationFormType): Promise<RegistrationResponse[]> {
  try {
    const res = await fetch(`${API_BASE}?formType=${formType}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getResponseById(id: string): Promise<RegistrationResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function saveResponse(response: RegistrationResponse): Promise<void> {
  try {
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    })
  } catch {
    // silent fail
  }
}

export async function approveResponse(responseId: string, clientId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/${responseId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })
  } catch {
    // silent fail
  }
}
