'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/landing/lib/utils'

interface SignInFormProps {
  variant?: 'page' | 'dropdown'
  labels: {
    email: string
    password: string
    submit: string
    submitting: string
    networkError: string
    showPassword: string
    hidePassword: string
  }
  onSuccess?: () => void
}

export default function SignInForm({ variant = 'page', labels, onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isDropdown = variant === 'dropdown'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Login failed')
        return
      }

      onSuccess?.()
      router.push('/backoffice')
      router.refresh()
    } catch {
      setError(labels.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', isDropdown && 'space-y-2.5')}>
      <div>
        <label
          htmlFor={`signin-email-${variant}`}
          className={cn(
            'block text-sm mb-1',
            isDropdown
              ? 'text-secondary-200 font-medium'
              : 'font-interTight text-[var(--text-primary)]'
          )}
        >
          {labels.email}
        </label>
        <input
          id={`signin-email-${variant}`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus={!isDropdown}
          autoComplete="email"
          className={cn(
            'w-full rounded-none border outline-none transition',
            isDropdown
              ? 'px-3 py-2 text-sm bg-white/5 border-white/10 text-secondary-100 placeholder:text-secondary-300 focus:ring-2 focus:ring-accent-400/50 focus:border-accent-400'
              : 'px-4 py-2.5 border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-interTight focus:ring-2 focus:ring-vanilla-secondary/50 focus:border-vanilla-secondary'
          )}
          placeholder="email@company.com"
        />
      </div>

      <div>
        <label
          htmlFor={`signin-password-${variant}`}
          className={cn(
            'block text-sm mb-1',
            isDropdown
              ? 'text-secondary-200 font-medium'
              : 'font-interTight text-[var(--text-primary)]'
          )}
        >
          {labels.password}
        </label>
        <div className="relative isolate">
          <input
            id={`signin-password-${variant}`}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={cn(
              'w-full rounded-none border outline-none transition',
              isDropdown
                ? 'px-3 py-2 pr-12 text-sm bg-white/5 border-white/10 text-secondary-100 placeholder:text-secondary-300 focus:ring-2 focus:ring-accent-400/50 focus:border-accent-400'
                : 'px-4 py-2.5 pr-12 border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-interTight focus:ring-2 focus:ring-vanilla-secondary/50 focus:border-vanilla-secondary'
            )}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? labels.hidePassword : labels.showPassword}
            aria-pressed={showPassword}
            className={cn(
              'absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-none transition-colors sm:h-10 sm:w-10',
              isDropdown
                ? 'text-secondary-300 hover:text-secondary-100'
                : 'text-[var(--text-accent)] hover:text-[var(--text-primary)]'
            )}
          >
            {showPassword ? <EyeOff size={18} className="shrink-0" /> : <Eye size={18} className="shrink-0" />}
          </button>
        </div>
      </div>

      {error && (
        <p className={cn(
          'text-sm',
          isDropdown ? 'text-red-400' : 'text-red-500 font-interTight'
        )}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full rounded-none font-medium transition disabled:opacity-50',
          isDropdown
            ? 'px-3 py-2 text-sm bg-accent-500 text-white hover:bg-accent-400'
            : 'px-4 py-2.5 bg-vanilla-secondary text-vanilla-main font-interTight hover:opacity-90'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            {labels.submitting}
          </span>
        ) : (
          labels.submit
        )}
      </button>
    </form>
  )
}
