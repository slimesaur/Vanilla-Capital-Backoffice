'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { theme, mounted } = useTheme()

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

      router.push('/backoffice')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-interTight text-[var(--text-primary)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-interTight focus:ring-2 focus:ring-vanilla-secondary/50 focus:border-vanilla-secondary outline-none transition"
              placeholder="email@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-interTight text-[var(--text-primary)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-interTight focus:ring-2 focus:ring-vanilla-secondary/50 focus:border-vanilla-secondary outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-interTight">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
