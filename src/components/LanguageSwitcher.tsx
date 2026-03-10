'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import clsx from 'clsx'

type Locale = 'en' | 'pt'

const LOCALES: { value: Locale; flag: string; labelKey: string }[] = [
  { value: 'en', flag: 'https://flagcdn.com/w40/us.png', labelKey: 'language.en' },
  { value: 'pt', flag: 'https://flagcdn.com/w40/br.png', labelKey: 'language.pt' },
]

interface LanguageSwitcherProps {
  variant?: 'sidebar' | 'standalone'
}

export default function LanguageSwitcher({ variant = 'sidebar' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentLocale = LOCALES.find((l) => l.value === locale) ?? LOCALES[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative" role="group" aria-label="Select language">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={t(currentLocale.labelKey)}
        aria-label={t(currentLocale.labelKey)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={clsx(
          'flex items-center transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-vanilla-secondary focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-secondary)]',
          variant === 'sidebar' ? 'p-2 justify-start hover:bg-black/5 dark:hover:bg-white/5' : 'p-2 justify-center hover:bg-black/5 dark:hover:bg-white/5'
        )}
      >
        <img
          src={currentLocale.flag}
          alt=""
          className={clsx(
            'object-cover rounded-[2px]',
            variant === 'sidebar' ? 'w-6 h-4' : 'w-6 h-4'
          )}
          width={24}
          height={16}
          loading="lazy"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className={clsx(
            'absolute left-0 min-w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1 shadow-lg z-50',
            variant === 'sidebar' ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {LOCALES.map(({ value, flag, labelKey }) => (
            <li key={value} role="option" aria-selected={locale === value}>
              <button
                type="button"
                onClick={() => {
                  setLocale(value)
                  setIsOpen(false)
                }}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-interTight transition-colors',
                  locale === value
                    ? 'bg-vanilla-secondary/20 text-[var(--text-accent)]'
                    : 'text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <img
                  src={flag}
                  alt=""
                  className="w-5 h-[14px] object-cover rounded-[2px] shrink-0"
                  width={20}
                  height={14}
                  loading="lazy"
                />
                <span>{t(labelKey)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
