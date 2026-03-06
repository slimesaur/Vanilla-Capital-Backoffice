'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useLanguage } from '../contexts/LanguageContext'
import { getForm, saveResponse } from '../data/suitabilityStore'
import { formatCpf, formatCnpj, normalizeLegalName } from '../utils/masks'
import type { SuitabilityFormData } from '../types/suitability'
import type { SuitabilityProfile } from '../types/client'

type EntityType = 'individual' | 'legal_entity'

function getSelectedTexts(val: string | string[] | undefined): string[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val.startsWith('[')) {
    try {
      const arr = JSON.parse(val) as unknown
      return Array.isArray(arr) ? arr.map(String) : []
    } catch {
      return val ? [val] : []
    }
  }
  return typeof val === 'string' ? (val ? [val] : []) : []
}

function calculateTotalWeight(form: SuitabilityFormData, answers: Record<string, string | string[]>): number {
  let total = 0
  for (const q of form.questions) {
    const selected = getSelectedTexts(answers[q.id])
    for (const text of selected) {
      const opt = q.answers.find((a) => a.text === text)
      if (opt) total += opt.weight
    }
  }
  return total
}

function getSuitabilityProfile(totalWeight: number): SuitabilityProfile {
  if (totalWeight <= 26) return 'conservative'
  if (totalWeight <= 44) return 'moderate'
  return 'aggressive'
}

export default function SuitabilityFormFill({ formId }: { formId?: string }) {
  const { t } = useLanguage()
  const [form, setForm] = useState<SuitabilityFormData | null>(null)
  const [entityType, setEntityType] = useState<EntityType>('individual')
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    name: '',
    cpf: '',
    legalName: '',
    cnpj: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (formId) {
      getForm(formId).then((f) => {
        setForm(f ?? null)
        if (f) {
          const initial: Record<string, string | string[]> = { name: '', cpf: '', legalName: '', cnpj: '' }
          f.questions.forEach((q) => { initial[q.id] = q.multipleSelection ? [] : '' })
          setAnswers(initial)
        }
      })
    }
  }, [formId])

  const handleChange = (key: string, value: string) => {
    if (key === 'cpf') value = formatCpf(value)
    else if (key === 'cnpj') value = formatCnpj(value)
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleLegalNameBlur = () => {
    const val = typeof answers.legalName === 'string' ? answers.legalName : ''
    if (val.trim()) handleChange('legalName', normalizeLegalName(val))
  }

  const handleMultiChange = (qId: string, optText: string, checked: boolean) => {
    setAnswers((prev) => {
      const arr = Array.isArray(prev[qId]) ? [...(prev[qId] as string[])] : []
      const next = checked ? (arr.includes(optText) ? arr : [...arr, optText]) : arr.filter((t) => t !== optText)
      return { ...prev, [qId]: next }
    })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (entityType === 'individual') {
      const name = typeof answers.name === 'string' ? answers.name : ''
      const cpf = typeof answers.cpf === 'string' ? answers.cpf : ''
      if (!name.trim()) e.name = t('suitabilityFill.nameRequired')
      if (!cpf.trim()) e.cpf = t('suitabilityFill.cpfRequired')
      else if (cpf.replace(/\D/g, '').length !== 11) e.cpf = t('suitabilityFill.cpfInvalid')
    } else {
      const legalName = typeof answers.legalName === 'string' ? answers.legalName : ''
      const cnpj = typeof answers.cnpj === 'string' ? answers.cnpj : ''
      if (!legalName.trim()) e.legalName = t('suitabilityFill.legalNameRequired')
      if (!cnpj.trim()) e.cnpj = t('suitabilityFill.cnpjRequired')
      else if (cnpj.replace(/\D/g, '').length !== 14) e.cnpj = t('suitabilityFill.cnpjInvalid')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form || !validate()) return

    const answersToSave: Record<string, string> = {
      entityType,
      ...(entityType === 'individual'
        ? {
            name: (typeof answers.name === 'string' ? answers.name : '').trim(),
            cpf: typeof answers.cpf === 'string' ? answers.cpf : '',
          }
        : {
            legalName: normalizeLegalName(typeof answers.legalName === 'string' ? answers.legalName : ''),
            cnpj: typeof answers.cnpj === 'string' ? answers.cnpj : '',
          }),
    }
    for (const [key, val] of Object.entries(answers)) {
      if (key === 'name' || key === 'cpf' || key === 'legalName' || key === 'cnpj') continue
      if (Array.isArray(val)) {
        answersToSave[key] = JSON.stringify(val)
      } else {
        answersToSave[key] = val ?? ''
      }
    }
    await saveResponse({
      id: crypto.randomUUID(),
      formId: form.id,
      answers: answersToSave,
      submittedAt: new Date().toISOString(),
    })

    setSubmitted(true)
  }

  if (!formId) {
    return (
      <div className="min-h-full flex items-center justify-center text-[var(--text-primary)] p-8">
        <p>{t('suitabilityFill.invalidFormLink')}</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-full flex items-center justify-center text-[var(--text-primary)] p-8">
        <p>{t('suitabilityFill.formNotFound')}</p>
      </div>
    )
  }

  if (submitted) {
    const totalWeight = calculateTotalWeight(form, answers)
    const profile = getSuitabilityProfile(totalWeight)
    const profileLabel =
      profile === 'conservative'
        ? t('clients.suitabilityProfileConservative')
        : profile === 'moderate'
          ? t('clients.suitabilityProfileModerate')
          : t('clients.suitabilityProfileAggressive')

    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="font-canela text-2xl text-[var(--text-accent)] mb-4">{t('suitabilityFill.thankYou')}</h1>
          <p className="font-interTight text-[var(--text-primary)] mb-2">
            {t('suitabilityFill.submittedSuccess')}
          </p>
          <p className="font-interTight text-vanilla-secondary font-medium">
            {t('suitabilityFill.investorProfileFeedback')} {profileLabel}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="font-canela text-2xl text-[var(--text-primary)] mb-2">{t('suitabilityFill.formTitle')}</h1>
        <p className="font-interTight text-[var(--text-accent)] mb-8">{t('suitabilityFill.formSubtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-2">
              {t('suitabilityFill.entityType')}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-interTight text-[var(--text-accent)]">{t('suitabilityFill.individual')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={entityType === 'legal_entity'}
                onClick={() => setEntityType((prev) => (prev === 'individual' ? 'legal_entity' : 'individual'))}
                className={clsx(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-vanilla-secondary/50',
                  entityType === 'legal_entity' ? 'bg-vanilla-secondary' : 'bg-[var(--border-color)]'
                )}
              >
                <span
                  className={clsx(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
                    entityType === 'legal_entity' ? 'translate-x-5' : 'translate-x-1'
                  )}
                />
              </button>
              <span className="text-sm font-interTight text-[var(--text-accent)]">{t('suitabilityFill.legalEntity')}</span>
            </div>
          </div>

          {entityType === 'individual' ? (
            <>
              <div>
                <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
                  {t('suitabilityFill.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={answers.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
                  {t('suitabilityFill.cpf')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={answers.cpf}
                  onChange={(e) => handleChange('cpf', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
                  {t('suitabilityFill.legalName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={answers.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  onBlur={handleLegalNameBlur}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
                {errors.legalName && <p className="text-red-500 text-sm mt-1">{errors.legalName}</p>}
              </div>
              <div>
                <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
                  {t('suitabilityFill.cnpj')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={answers.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
                {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
              </div>
            </>
          )}

          {form.questions.map((q, idx) => {
            const options = q.answers.filter((opt) => opt.text?.trim())
            const isMulti = q.multipleSelection ?? false
            const selectedArr = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : []
            const selectedStr = typeof answers[q.id] === 'string' ? answers[q.id] : ''
            return (
              <div key={q.id} className="pt-6 border-t border-[var(--border-color)] first:pt-0 first:border-t-0">
                <div className="text-xs font-arpona uppercase tracking-wider text-vanilla-secondary mb-2">
                  {t('suitabilityFill.questionPrefix')} {String(idx + 1).padStart(2, '0')}
                </div>
                <label className="block font-interTight text-sm text-[var(--text-primary)] mb-2">
                  {q.title || q.id.slice(0, 8)}
                </label>
                <div className="space-y-2">
                  {options.length > 0 ? (
                    options.map((opt, i) =>
                      isMulti ? (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedArr.includes(opt.text)}
                            onChange={(e) => handleMultiChange(q.id, opt.text, e.target.checked)}
                            className="rounded"
                          />
                          <span className="font-interTight text-[var(--text-primary)]">{opt.text}</span>
                        </label>
                      ) : (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.text}
                            checked={selectedStr === opt.text}
                            onChange={() => handleChange(q.id, opt.text)}
                            className="rounded"
                          />
                          <span className="font-interTight text-[var(--text-primary)]">{opt.text}</span>
                        </label>
                      )
                    )
                  ) : (
                    <p className="text-[var(--text-accent)]/70 text-sm">{t('suitabilityFill.noOptionsConfigured')}</p>
                  )}
                </div>
              </div>
            )
          })}

          <button
            type="submit"
            className="w-full px-4 py-3 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight font-medium hover:opacity-90"
          >
            {t('suitabilityFill.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
