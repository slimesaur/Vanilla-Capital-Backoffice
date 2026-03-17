'use client'

import { useTheme } from '@/contexts/ThemeContext'
import SignInForm from '@/landing/components/auth/SignInForm'

export default function LoginPage() {
  const { theme, mounted } = useTheme()

  const labels = {
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in...',
    networkError: 'Network error',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="text-center">
          {mounted ? (
            <img
              src={theme === 'dark' ? '/logos/LOGO DARK VERSION.svg' : '/logos/LOGO LIGHT VERSION.svg'}
              alt="Vanilla Capital"
              className="h-16 w-auto mx-auto mb-6"
            />
          ) : (
            <div className="h-16 mb-6" />
          )}
          <h1 className="font-canela text-2xl text-[var(--text-primary)]">Backoffice</h1>
          <p className="text-sm text-[var(--text-accent)] mt-1 font-interTight">Sign in to your account</p>
        </div>

        <SignInForm variant="page" labels={labels} />
      </div>
    </div>
  )
}
