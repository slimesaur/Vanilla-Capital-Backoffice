'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import clsx from 'clsx'

const ICON_CLASS = 'w-4 h-4 shrink-0 text-[var(--text-accent)]'

function ContactIcon({ type }: { type: 'phone' | 'whatsapp' | 'email' | 'link' | 'location' }) {
  switch (type) {
    case 'phone':
      return (
        <svg className={ICON_CLASS} fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg className={ICON_CLASS} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )
    case 'email':
      return (
        <svg className={ICON_CLASS} fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      )
    case 'link':
      return (
        <svg className={ICON_CLASS} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    case 'location':
      return (
        <svg className={ICON_CLASS} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      )
  }
}

function ContactRow({ type, href, wrap = false, children }: { type: 'phone' | 'whatsapp' | 'email' | 'link' | 'location'; href?: string; wrap?: boolean; children: React.ReactNode }) {
  const content = (
    <>
      <ContactIcon type={type} />
      <span className={`text-sm font-interTight text-[var(--text-accent)] ${wrap ? 'break-words' : 'truncate'}`}>{children}</span>
    </>
  )
  const className = "flex items-start gap-2 py-1.5"
  if (href) {
    return (
      <a href={href} className={`${className} hover:text-[var(--text-accent)] transition-colors`} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }
  return <div className={className}>{content}</div>
}

interface FormLayoutProps {
  children: React.ReactNode
  settings?: {
    phone?: string | null
    email?: string | null
    address?: string | null
    whatsapp?: string | null
  }
}

const DEFAULT_PHONE = '+5541988195090'
const DEFAULT_EMAIL = 'atendimento@vanillacapital.com.br'
const DEFAULT_ADDRESS = 'Rua Paulo Setuval, 5081 - 81750-190 Curitiba, PR'

export default function FormLayout({ children, settings }: FormLayoutProps) {
  const { theme, mounted, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const phone = settings?.phone || DEFAULT_PHONE
  const email = settings?.email || DEFAULT_EMAIL
  const address = settings?.address || DEFAULT_ADDRESS
  const whatsapp = settings?.whatsapp || phone
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, '').slice(0, 13)}`

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSidebar() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen, closeSidebar])

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-[var(--border-color)]">
        {mounted ? (
          <img
            src={theme === 'dark' ? '/logos/LOGO DARK VERSION.svg' : '/logos/LOGO LIGHT VERSION.svg'}
            alt="Vanilla Capital"
            className="h-20 w-auto object-contain"
          />
        ) : (
          <div className="h-20" />
        )}
      </div>
      <div className="p-4 border-b border-[var(--border-color)] space-y-1">
        <ContactRow type="phone" href={`tel:${phone.replace(/\D/g, '')}`}>{phone}</ContactRow>
        <ContactRow type="whatsapp" href={whatsappHref}>{whatsapp}</ContactRow>
        <ContactRow type="email" href={`mailto:${email}`}>{email}</ContactRow>
        <ContactRow type="link" href="https://vanillacapital.com.br">vanillacapital.com.br</ContactRow>
      </div>
      <div className="flex-1" />
      <div className="p-4 border-t border-[var(--border-color)]">
        <ContactRow type="location" wrap>{address}</ContactRow>
      </div>
      <div className="p-6 border-t border-[var(--border-color)] flex items-center gap-2">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-[var(--text-accent)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-vanilla-main" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        )}
        <LanguageSwitcher variant="sidebar" />
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)]">
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {mounted ? (
          <img
            src={theme === 'dark' ? '/logos/LOGO DARK VERSION.svg' : '/logos/LOGO LIGHT VERSION.svg'}
            alt="Vanilla Capital"
            className="h-8 w-auto object-contain"
          />
        ) : (
          <div className="h-8" />
        )}
        <div className="w-10" />
      </header>

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transform transition-transform duration-200 ease-in-out md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-end p-2">
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex-col">
        {sidebarContent}
      </aside>

      <main className="flex-1 min-h-screen overflow-auto form-page-bg-pattern">
        {children}
      </main>
    </div>
  )
}
