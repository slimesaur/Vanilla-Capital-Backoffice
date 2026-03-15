'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export default function UsersPage() {
  const { t } = useLanguage()
  const { showToast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const validate = (): string | null => {
    if (!name.trim()) return t('users.nameRequired')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return t('users.emailInvalid')
    if (!password || password.length < 6) return t('users.passwordTooShort')
    return null
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const err = validate()
    if (err) { setFormError(err); return }

    setCreating(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 409) {
          setFormError(t('users.emailAlreadyExists'))
        } else {
          setFormError(data.error || t('users.createFailed'))
        }
        return
      }

      showToast(t('users.created'))
      setName('')
      setEmail('')
      setPassword('')
      await fetchUsers()
    } catch {
      setFormError(t('users.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-interTight focus:outline-none focus:ring-2 focus:ring-vanilla-secondary/50'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-2 border-vanilla-secondary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-canela text-[var(--text-primary)] mb-6">
        {t('users.title')}
      </h1>

      {/* Create User Form */}
      <section className="mb-8">
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-4">
          {t('users.createUser')}
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
              {t('users.name')}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={inputClass}
            />
          </div>
          <div>
            <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
              {t('users.email')}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@company.com"
              className={inputClass}
            />
          </div>
          <div>
            <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
              {t('users.password')}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-accent)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={creating}
              className="w-full px-5 py-2.5 rounded-lg bg-vanilla-secondary text-vanilla-main font-interTight text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? t('users.creating') : t('users.createUser')}
            </button>
          </div>
        </form>
        {formError && (
          <p className="mt-2 text-red-500 text-sm font-interTight">{formError}</p>
        )}
      </section>

      {/* Users Table */}
      <section>
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-4">
          {t('users.userList')}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
          <table className="w-full text-sm font-interTight">
            <thead>
              <tr className="bg-[var(--bg-secondary)]">
                <th className="text-left px-4 py-3 text-[var(--text-accent)]/70 text-xs font-arpona uppercase">
                  {t('users.name')}
                </th>
                <th className="text-left px-4 py-3 text-[var(--text-accent)]/70 text-xs font-arpona uppercase">
                  {t('users.email')}
                </th>
                <th className="text-left px-4 py-3 text-[var(--text-accent)]/70 text-xs font-arpona uppercase">
                  {t('users.createdAt')}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50 transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--text-primary)]">{user.name}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{user.email}</td>
                  <td className="px-4 py-3 text-[var(--text-accent)]/70">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[var(--text-accent)]/70">
                    {t('users.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
