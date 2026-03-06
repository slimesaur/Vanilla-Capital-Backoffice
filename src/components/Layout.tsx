'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import clsx from 'clsx'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const pathname = usePathname()

  const navItems = [
    { path: '/', label: t('nav.mainPage') },
    { path: '/clients', label: t('nav.clients') },
    { path: '/compliance', label: t('nav.compliance') },
  ]

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      <aside className="w-56 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col">
        <div className="p-6 border-b border-[var(--border-color)]">
          <img
            src={theme === 'dark' ? '/logos/LOGO DARK VERSION.svg' : '/logos/LOGO LIGHT VERSION.svg'}
            alt="Vanilla Capital"
            className="h-20 w-auto object-contain"
          />
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.path === '/' ? pathname === '/' : pathname?.startsWith(item.path)
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={clsx(
                      'block px-4 py-3 rounded-lg text-sm font-interTight transition-colors',
                      isActive
                        ? 'bg-vanilla-secondary/20 text-[var(--text-accent)]'
                        : 'text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-6 border-t border-[var(--border-color)] flex items-center gap-2">
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
          <LanguageSwitcher variant="sidebar" />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
