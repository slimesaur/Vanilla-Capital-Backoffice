'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Locale } from '../i18n/translations'

function getNested(obj: object, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : undefined
}

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'vanilla-locale'

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'pt'
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved === 'en' || saved === 'pt') return saved
  } catch {
    /* storage blocked */
  }
  return 'pt'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Match SSR default; sync from storage after mount to avoid server/client state mismatch on hydrate.
  const [locale, setLocaleState] = useState<Locale>('pt')

  useEffect(() => {
    setLocaleState(readStoredLocale())
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (newLocale: Locale) => setLocaleState(newLocale)

  const t = (key: string): string => {
    const value = getNested(translations[locale], key)
    return value ?? key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
