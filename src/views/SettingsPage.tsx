'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import clsx from 'clsx'

interface TeamMemberForm {
  id?: string
  photo: string
  position: string
  _file?: File
}

interface SettingsForm {
  phone: string
  email: string
  address: string
  whatsapp: string
  mission: string
  teamMembers: TeamMemberForm[]
}

function phoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `+${digits}`
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`
  if (digits.length <= 9)
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
}

export default function SettingsPage() {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<SettingsForm>({
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    mission: '',
    teamMembers: [],
  })

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings
          setForm({
            phone: s.phone || '',
            email: s.email || '',
            address: s.address || '',
            whatsapp: s.whatsapp || '',
            mission: s.mission || '',
            teamMembers: (s.teamMembers || []).map((m: any) => ({
              id: m.id,
              photo: m.photo || '',
              position: m.position || '',
            })),
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateField = (field: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateMember = (index: number, field: keyof TeamMemberForm, value: string) => {
    setForm((prev) => {
      const members = [...prev.teamMembers]
      members[index] = { ...members[index], [field]: value }
      return { ...prev, teamMembers: members }
    })
  }

  const addMember = () => {
    setForm((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { photo: '', position: '' }],
    }))
  }

  const removeMember = (index: number) => {
    setForm((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }))
  }

  const handlePhotoUpload = async (index: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/settings/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      updateMember(index, 'photo', url)
    } catch {
      showToast(t('settings.saveFailed'))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.phone,
          email: form.email,
          address: form.address,
          whatsapp: form.whatsapp,
          mission: form.mission,
          teamMembers: form.teamMembers.map((m) => ({
            id: m.id,
            photo: m.photo,
            position: m.position,
          })),
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.settings) {
        setForm({
          phone: data.settings.phone || '',
          email: data.settings.email || '',
          address: data.settings.address || '',
          whatsapp: data.settings.whatsapp || '',
          mission: data.settings.mission || '',
          teamMembers: (data.settings.teamMembers || []).map((m: any) => ({
            id: m.id,
            photo: m.photo || '',
            position: m.position || '',
          })),
        })
      }
      showToast(t('settings.saved'))
    } catch {
      showToast(t('settings.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-2 border-vanilla-secondary border-t-transparent rounded-full" />
      </div>
    )
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-vanilla-secondary/50'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-8 font-interTight">
        {t('settings.title')}
      </h1>

      {/* Contact Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 font-interTight">
          {t('settings.contactSection')}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {t('settings.phone')}
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => updateField('phone', phoneMask(e.target.value))}
              placeholder="+55 (41) 98819-5090"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {t('settings.email')}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {t('settings.address')}
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Rua Paulo Setuval, 5081 - 81750-190 Curitiba, PR"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {t('settings.whatsapp')}
            </label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => updateField('whatsapp', phoneMask(e.target.value))}
              placeholder="+55 (41) 98819-5090"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 font-interTight">
          {t('settings.aboutSection')}
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {t('settings.mission')}
            </label>
            <textarea
              value={form.mission}
              onChange={(e) => updateField('mission', e.target.value)}
              placeholder={t('settings.missionPlaceholder')}
              rows={5}
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                {t('settings.teamMembers')}
              </label>
              <button
                type="button"
                onClick={addMember}
                className="px-3 py-1.5 text-sm rounded-lg bg-vanilla-secondary text-vanilla-main hover:opacity-90 transition-opacity font-interTight"
              >
                + {t('settings.addMember')}
              </button>
            </div>

            {form.teamMembers.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)] italic">
                {t('settings.addMember')}...
              </p>
            )}

            <div className="space-y-4">
              {form.teamMembers.map((member, index) => (
                <div
                  key={member.id || `new-${index}`}
                  className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]"
                >
                  <div className="flex items-start gap-4">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-28 rounded-lg overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-color)] relative">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.position}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <label className="mt-1 block text-center">
                        <span className="text-xs text-vanilla-secondary cursor-pointer hover:underline">
                          {t('settings.photo')}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handlePhotoUpload(index, file)
                          }}
                        />
                      </label>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                          {t('settings.position')}
                        </label>
                        <input
                          type="text"
                          value={member.position}
                          onChange={(e) => updateMember(index, 'position', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="flex-shrink-0 p-1 text-red-500 hover:text-red-600 transition-colors"
                      title={t('settings.removeMember')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-vanilla-secondary text-vanilla-main font-interTight font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? t('settings.saving') : t('settings.save')}
        </button>
      </div>
    </div>
  )
}
