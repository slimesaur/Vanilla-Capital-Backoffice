import type { Client, ClientOnboardingStatus } from '../types/client'

const API_BASE = '/api/clients'

export async function getClients(): Promise<Client[]> {
  try {
    const res = await fetch(API_BASE)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getClientsByCpf(cpf: string): Promise<Client[]> {
  try {
    const digits = String(cpf).replace(/\D/g, '')
    const res = await fetch(`${API_BASE}?cpf=${digits}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getClientsByCnpj(cnpj: string): Promise<Client[]> {
  try {
    const digits = String(cnpj).replace(/\D/g, '')
    const res = await fetch(`${API_BASE}?cnpj=${digits}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function saveClient(client: Client): Promise<void> {
  try {
    const existing = await getClientById(client.id)
    if (existing) {
      await fetch(`${API_BASE}/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
    } else {
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
    }
  } catch {
    // silent fail
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
  try {
    await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
  } catch {
    // silent fail
  }
}

export async function updateClientStatus(id: string, status: ClientOnboardingStatus): Promise<void> {
  await updateClient(id, { status })
}

export async function deleteClient(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  } catch {
    // silent fail
  }
}
