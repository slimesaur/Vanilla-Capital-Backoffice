import { getRequestConfig } from 'next-intl/server'
import type { AbstractIntlMessages } from 'next-intl'
import { routing } from './routing'
import ptMessages from './messages/pt.json'
import enMessages from './messages/en.json'

export const locales = routing.locales
export const defaultLocale = routing.defaultLocale
export type Locale = (typeof locales)[number]

const messages: Record<Locale, AbstractIntlMessages> = {
  pt: ptMessages as AbstractIntlMessages,
  en: enMessages as AbstractIntlMessages,
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale | undefined

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: messages[locale],
  }
})
