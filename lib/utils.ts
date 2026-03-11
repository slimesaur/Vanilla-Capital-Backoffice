import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const formatted = formatPhoneNumber(phone)
  const text = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${formatted}${text ? `?text=${text}` : ''}`
}
