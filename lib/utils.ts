import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

/** Display format: +00 (00) 0000-0000 or +00 (00) 00000-0000 for 9-digit local */
export function formatPhoneDisplay(phone: string): string {
  if (!phone || typeof phone !== 'string') return ''
  const digits = (phone.match(/\d/g) ?? []).join('').slice(0, 13)
  if (digits.length < 10) return phone.trim() // Fallback to input if too short
  const cc = digits.slice(0, 2)
  const area = digits.slice(2, 4)
  const rest = digits.slice(4)
  if (rest.length <= 4) return `+${cc} (${area}) ${rest}`
  if (rest.length <= 8) return `+${cc} (${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  return `+${cc} (${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const formatted = formatPhoneNumber(phone)
  const text = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${formatted}${text ? `?text=${text}` : ''}`
}
