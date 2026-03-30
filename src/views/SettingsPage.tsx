'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import AutoTextarea from '../components/AutoTextarea'

interface SettingsForm {
  phone: string
  email: string
  address: string
  whatsapp: string
  mission: string
  companySnapshot: string
  companyValues: string
  oneYearGoal: string
  longTermGoals: string
  currentMainProject: string
  toneAndLanguage: string
  glossary: string
  brandAndDeckHabits: string
  idealClientProfile: string
}

function phoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `+${digits}`
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`
  const rest = digits.slice(4)
  if (rest.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${rest}`
  if (rest.length <= 8) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${rest.slice(0, 5)}-${rest.slice(5)}`
}

const LEGACY_DEFAULT_ADDRESS = 'Rua Paulo Setuval, 5081 - 81750-190 Curitiba, PR'

function normalizeAddress(addr: string | null | undefined): string {
  const s = typeof addr === 'string' ? addr.trim() : ''
  if (!s || s === LEGACY_DEFAULT_ADDRESS) return ''
  return s
}

const emptyForm = (): SettingsForm => ({
  phone: '',
  email: '',
  address: '',
  whatsapp: '',
  mission: '',
  companySnapshot: '',
  companyValues: '',
  oneYearGoal: '',
  longTermGoals: '',
  currentMainProject: '',
  toneAndLanguage: '',
  glossary: '',
  brandAndDeckHabits: '',
  idealClientProfile: '',
})

export default function SettingsPage() {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<SettingsForm>(emptyForm)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings
          setForm({
            phone: phoneMask(s.phone || '') || '',
            email: s.email || '',
            address: normalizeAddress(s.address),
            whatsapp: s.whatsapp || '',
            mission: s.mission || '',
            companySnapshot: s.companySnapshot || '',
            companyValues: s.companyValues || '',
            oneYearGoal: s.oneYearGoal || '',
            longTermGoals: s.longTermGoals || '',
            currentMainProject: s.currentMainProject || '',
            toneAndLanguage: s.toneAndLanguage || '',
            glossary: s.glossary || '',
            brandAndDeckHabits: s.brandAndDeckHabits || '',
            idealClientProfile: s.idealClientProfile || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateField = (field: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const digits = form.phone.replace(/\D/g, '')
      const phoneForStorage = digits ? `+${digits}` : ''
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          phone: phoneForStorage,
          email: form.email,
          address: form.address || null,
          whatsapp: form.whatsapp ? `+${form.whatsapp.replace(/\D/g, '')}` : '',
          mission: form.mission,
          companySnapshot: form.companySnapshot,
          companyValues: form.companyValues,
          oneYearGoal: form.oneYearGoal,
          longTermGoals: form.longTermGoals,
          currentMainProject: form.currentMainProject,
          toneAndLanguage: form.toneAndLanguage,
          glossary: form.glossary,
          brandAndDeckHabits: form.brandAndDeckHabits,
          idealClientProfile: form.idealClientProfile,
        }),
      })
      const text = await res.text()
      let data: { error?: string; code?: string; settings?: Record<string, unknown> }
      try {
        data = text ? JSON.parse(text) : { error: 'Empty response' }
      } catch {
        const excerpt = text.slice(0, 100).replace(/\n/g, ' ')
        console.error('Settings save: non-JSON response', res.status, excerpt)
        data = { error: `Server error (${res.status}). Try again or check the console.` }
      }
      if (!res.ok) {
        const msg = data?.error || `HTTP ${res.status}`
        const code = data?.code ? ` (${data.code})` : ''
        console.error('Settings save failed:', res.status, data)
        throw new Error(msg + code)
      }
      const s = data.settings as Partial<SettingsForm> & { phone?: string; address?: string | null } | undefined
      if (s) {
        setForm({
          phone: phoneMask(s.phone || '') || '',
          email: s.email || '',
          address: normalizeAddress(s.address),
          whatsapp: s.whatsapp || '',
          mission: s.mission || '',
          companySnapshot: s.companySnapshot || '',
          companyValues: s.companyValues || '',
          oneYearGoal: s.oneYearGoal || '',
          longTermGoals: s.longTermGoals || '',
          currentMainProject: s.currentMainProject || '',
          toneAndLanguage: s.toneAndLanguage || '',
          glossary: s.glossary || '',
          brandAndDeckHabits: s.brandAndDeckHabits || '',
          idealClientProfile: s.idealClientProfile || '',
        })
      }
      showToast(t('settings.saved'))
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('settings.saveFailed')
      showToast(msg)
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

  const textareaClass = `${inputClass} block`

  type AiField = {
    key: keyof SettingsForm
    labelKey: string
    placeholderKey: string
  }

  const aiFields: AiField[] = [
    { key: 'companySnapshot', labelKey: 'settings.companySnapshot', placeholderKey: 'settings.companySnapshotPlaceholder' },
    { key: 'mission', labelKey: 'settings.mission', placeholderKey: 'settings.missionPlaceholder' },
    { key: 'companyValues', labelKey: 'settings.companyValues', placeholderKey: 'settings.companyValuesPlaceholder' },
    { key: 'oneYearGoal', labelKey: 'settings.oneYearGoal', placeholderKey: 'settings.oneYearGoalPlaceholder' },
    { key: 'longTermGoals', labelKey: 'settings.longTermGoals', placeholderKey: 'settings.longTermGoalsPlaceholder' },
    { key: 'currentMainProject', labelKey: 'settings.currentMainProject', placeholderKey: 'settings.currentMainProjectPlaceholder' },
    { key: 'toneAndLanguage', labelKey: 'settings.toneAndLanguage', placeholderKey: 'settings.toneAndLanguagePlaceholder' },
    { key: 'glossary', labelKey: 'settings.glossary', placeholderKey: 'settings.glossaryPlaceholder' },
    { key: 'brandAndDeckHabits', labelKey: 'settings.brandAndDeckHabits', placeholderKey: 'settings.brandAndDeckHabitsPlaceholder' },
    { key: 'idealClientProfile', labelKey: 'settings.idealClientProfile', placeholderKey: 'settings.idealClientProfilePlaceholder' },
  ]

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
              placeholder="Complete address"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-2">
          {t('settings.aiContextSection')}
        </h2>
        <p className="text-sm text-[var(--text-accent)]/80 font-interTight mb-6 max-w-3xl">
          {t('settings.aiContextHelper')}
        </p>
        <div className="space-y-5 max-w-3xl">
          {aiFields.map(({ key, labelKey, placeholderKey }) => (
            <div key={key}>
              <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-1">
                {t(labelKey)}
              </div>
              <AutoTextarea
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                placeholder={t(placeholderKey)}
                className={textareaClass}
                aria-label={t(labelKey)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
