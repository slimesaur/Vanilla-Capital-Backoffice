import type { Client, ClientOnboardingStatus } from '../types/client'
import { mockClients } from './mockClients'

const CLIENTS_KEY = 'vanilla-clients'

function ensureStatus(client: unknown): Client {
  const c = client as Client
  if (!c.status) return { ...c, status: 'approved' as const }
  return c
}

function loadClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const list = Array.isArray(parsed) ? parsed : mockClients
      return list.map((c: Record<string, unknown>) => ensureStatus(c))
    }
  } catch {
    // fallthrough
  }
  return [...mockClients]
}

export function getClients(): Client[] {
  return loadClients()
}

export function getClientById(id: string): Client | null {
  return loadClients().find((c) => c.id === id) ?? null
}

export function getClientsByCpf(cpf: string): Client[] {
  const digits = String(cpf).replace(/\D/g, '')
  return loadClients().filter((c) => c.cpf.replace(/\D/g, '') === digits)
}

export function saveClient(client: Client): void {
  const list = loadClients()
  const idx = list.findIndex((c) => c.id === client.id)
  if (idx >= 0) list[idx] = client
  else list.push(client)
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(list))
}

export function updateClient(id: string, updates: Partial<Client>): void {
  const list = loadClients()
  const idx = list.findIndex((c) => c.id === id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates }
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(list))
  }
}

export function updateClientStatus(id: string, status: ClientOnboardingStatus): void {
  updateClient(id, { status })
}
