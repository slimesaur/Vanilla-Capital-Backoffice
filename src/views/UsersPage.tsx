'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import { Eye, EyeOff, Trash2 } from 'lucide-react'

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.id) setCurrentUserId(data.user.id)
      })
      .catch(() => {})
  }, [])

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
    if (err) {
      setFormError(err)
      return
    }

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

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    if (userToDelete.id === currentUserId) {
      showToast(t('users.cannotDeleteSelf'))
      setUserToDelete(null)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' })
      if (res.status === 204) {
        showToast(t('users.deleted'))
        setUserToDelete(null)
        await fetchUsers()
        return
      }
      let msg = t('users.deleteFailed')
      try {
        const data = await res.json()
        if (data?.error) msg = data.error
      } catch {
        /* ignore */
      }
      showToast(msg)
    } catch {
      showToast(t('users.deleteFailed'))
    } finally {
      setDeleting(false)
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
                <th className="text-right px-4 py-3 text-[var(--text-accent)]/70 text-xs font-arpona uppercase w-28">
                  {t('users.actions')}
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
                  <td className="px-4 py-3 text-right">
                    {user.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => setUserToDelete(user)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-500/40 p-2 text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15 transition-colors"
                        aria-label={t('users.deleteUser')}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-accent)]/70">
                    {t('users.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {userToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => !deleting && setUserToDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            className="w-full max-w-md rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="delete-user-title"
              className="font-arpona text-lg uppercase text-[var(--text-accent)] mb-2"
            >
              {t('users.confirmDeleteTitle')}
            </h3>
            <p className="text-sm text-[var(--text-primary)] font-interTight mb-1">
              <span className="font-medium">{userToDelete.name}</span>
              <span className="text-[var(--text-accent)]"> ({userToDelete.email})</span>
            </p>
            <p className="text-sm text-[var(--text-accent)]/80 font-interTight mb-6">
              {t('users.confirmDeleteDescription')}
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] font-interTight text-sm hover:bg-[var(--bg-primary)] transition-colors disabled:opacity-50"
              >
                {t('users.cancel')}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-interTight text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? t('users.deleting') : t('users.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
