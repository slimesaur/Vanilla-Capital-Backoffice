'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'

interface TeamMemberForm {
  id?: string
  photo: string
  position: string
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

const ACCEPTED_IMAGE_TYPES = '.png, .jpg, .jpeg, .webp'

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
    'w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-interTight focus:outline-none focus:ring-2 focus:ring-vanilla-secondary/50'

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-canela text-[var(--text-primary)]">
          {t('settings.title')}
        </h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-vanilla-secondary text-vanilla-main font-interTight text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? t('settings.saving') : t('settings.save')}
        </button>
      </div>

      {/* Contact Section */}
      <section className="mb-8">
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-4">
          {t('settings.contactSection')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
              {t('settings.phone')}
            </div>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => updateField('phone', phoneMask(e.target.value))}
              placeholder="+55 (41) 98819-5090"
              className={inputClass}
            />
          </div>
          <div>
            <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
              {t('settings.email')}
            </div>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
              {t('settings.whatsapp')}
            </div>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => updateField('whatsapp', phoneMask(e.target.value))}
              placeholder="+55 (41) 98819-5090"
              className={inputClass}
            />
          </div>
          <div>
            <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
              {t('settings.address')}
            </div>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Rua Paulo Setuval, 5081 - 81750-190 Curitiba, PR"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="mb-8">
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-4">
          {t('settings.aboutSection')}
        </h2>

        <div className="mb-6">
          <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
            {t('settings.mission')}
          </div>
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
            <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase">
              {t('settings.teamMembers')}
            </div>
            <button
              type="button"
              onClick={addMember}
              className="px-3 py-1.5 text-sm rounded-lg bg-vanilla-secondary text-vanilla-main hover:opacity-90 transition-opacity font-interTight"
            >
              + {t('settings.addMember')}
            </button>
          </div>

          {form.teamMembers.length === 0 && (
            <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-8 text-center">
              <p className="text-sm text-[var(--text-accent)]/70 font-interTight">
                {t('settings.addMember')}...
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.teamMembers.map((member, index) => (
              <div
                key={member.id || `new-${index}`}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden"
              >
                {/* Clickable photo area */}
                <label className="block cursor-pointer">
                  <div className="w-full aspect-[3/4] bg-[var(--bg-primary)] relative overflow-hidden">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.position}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] font-interTight text-[var(--text-accent)]/50">
                          {ACCEPTED_IMAGE_TYPES}
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(index, file)
                    }}
                  />
                </label>

                {/* Fields */}
                <div className="p-3 space-y-2">
                  <div>
                    <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
                      {t('settings.position')}
                    </div>
                    <input
                      type="text"
                      value={member.position}
                      onChange={(e) => updateMember(index, 'position', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="w-full text-center py-1.5 text-xs font-interTight text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    {t('settings.removeMember')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
