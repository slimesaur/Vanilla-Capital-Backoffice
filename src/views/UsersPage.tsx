'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import { Eye, EyeOff } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)
  const [creating, setCreating] = useState(false)
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
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-accent)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
