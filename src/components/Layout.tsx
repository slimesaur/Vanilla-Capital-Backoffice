'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import clsx from 'clsx'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, mounted, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* proceed anyway */ }
    window.location.href = '/pt'
  }

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSidebar() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen, closeSidebar])

  const navItems = [
    { path: '/pt', label: t('nav.landingPage'), external: true },
    { path: '/backoffice/clients', label: t('nav.clients') },
    { path: '/backoffice/compliance', label: t('nav.compliance') },
    { path: '/backoffice/settings', label: t('nav.settings') },
  ]

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
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = !item.external && pathname?.startsWith(item.path)
            const className = clsx(
              'block px-4 py-3 rounded-lg text-sm font-interTight transition-colors',
              isActive
                ? 'bg-vanilla-secondary/20 text-[var(--text-accent)]'
                : 'text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
            )
            return (
              <li key={item.path}>
                {item.external ? (
                  <a href={item.path} className={className}>
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.path} className={className}>
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="px-4 py-3 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
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
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            aria-label={t('nav.logOut')}
            title={t('nav.logOut')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
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

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
