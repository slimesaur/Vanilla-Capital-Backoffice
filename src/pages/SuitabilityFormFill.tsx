import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getForm, saveResponse } from '../data/suitabilityStore'
import type { SuitabilityFormData } from '../types/suitability'

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function SuitabilityFormFill() {
  const { formId } = useParams<{ formId: string }>()
  const { t } = useLanguage()
  const [form, setForm] = useState<SuitabilityFormData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({
    name: '',
    cpf: '',
    email: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (formId) {
      const f = getForm(formId)
      setForm(f ?? null)
      if (f) {
        const initial: Record<string, string> = { name: '', cpf: '', email: '' }
        f.questions.forEach((q) => { initial[q.id] = '' })
        setAnswers(initial)
      }
    }
  }, [formId])

  const handleChange = (key: string, value: string) => {
    if (key === 'cpf') value = formatCpf(value)
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!answers.name?.trim()) e.name = t('suitabilityFill.nameRequired')
    if (!answers.cpf?.trim()) e.cpf = t('suitabilityFill.cpfRequired')
    else if (answers.cpf.replace(/\D/g, '').length !== 11) e.cpf = t('suitabilityFill.cpfInvalid')
    if (!answers.email?.trim()) e.email = t('suitabilityFill.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) e.email = t('suitabilityFill.emailInvalid')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form || !validate()) return

    saveResponse({
      id: crypto.randomUUID(),
      formId: form.id,
      answers: { ...answers },
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
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="font-canela text-2xl text-vanilla-secondary mb-4">{t('suitabilityFill.thankYou')}</h1>
          <p className="font-interTight text-[var(--text-primary)] mb-2">
            {t('suitabilityFill.submittedSuccess')}
          </p>
          <p className="font-interTight text-[var(--text-secondary)] text-sm">
            {t('suitabilityFill.confirmationEmail')} {answers.email}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="font-canela text-2xl text-[var(--text-primary)] mb-2">{t('suitabilityFill.formTitle')}</h1>
        <p className="font-interTight text-[var(--text-secondary)] mb-8">{t('suitabilityFill.formSubtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('suitabilityFill.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={answers.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {form.questions.map((q) => {
            const options = q.answers.filter((opt) => opt.text?.trim())
            return (
              <div key={q.id}>
                <label className="block font-interTight text-sm text-[var(--text-primary)] mb-2">
                  {q.title || `${t('suitabilityFill.questionPrefix')} ${q.id.slice(0, 8)}`}
                </label>
                <div className="space-y-2">
                  {options.length > 0 ? (
                    options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.text}
                          checked={answers[q.id] === opt.text}
                          onChange={() => handleChange(q.id, opt.text)}
                          className="rounded"
                        />
                        <span className="font-interTight text-[var(--text-primary)]">{opt.text}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-[var(--text-secondary)]/70 text-sm">{t('suitabilityFill.noOptionsConfigured')}</p>
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
