'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import BankSelect from '../components/BankSelect'
import { saveResponse } from '../data/registrationStore'
import { REGISTRATION_FORM_PF } from '../data/registrationFormDefinitions'
import type { RegistrationFormType } from '../types/registration'
import { formatCpf, formatCep, formatPhone, formatDate } from '../utils/masks'
import RegistrationFormPJ from './RegistrationFormPJ'

const SECTIONS_PF = [
  { key: 'basic', labelKey: 'registration.sectionBasicInformation', fields: ['name', 'cpf', 'idDocument', 'issuingAuthority', 'birthDate', 'civilStatus'] },
  { key: 'marital', labelKey: 'registration.sectionMaritalInformation', fields: ['propertyRegime', 'spouseName', 'spouseCpf', 'spouseId', 'spouseIssuingAuthority', 'spouseBirthDate'] },
  { key: 'contact', labelKey: 'registration.sectionContactInformation', fields: ['phone', 'email', 'postalCode', 'address', 'addressNumber', 'addressComplement', 'uf', 'city'] },
  { key: 'banking', labelKey: 'registration.sectionBankingInformation', fields: ['bankCode', 'accountType', 'agency', 'accountNumber'] },
  { key: 'compliance', labelKey: 'registration.sectionComplianceInformation', fields: ['isPep'] },
] as const

function getFormDefinition(formType: string): typeof REGISTRATION_FORM_PF | null {
  return formType === 'pf' ? REGISTRATION_FORM_PF : null
}

function applyMask(value: string, mask?: string): string {
  switch (mask) {
    case 'cpf':
      return formatCpf(value)
    case 'cep':
      return formatCep(value)
    case 'phone':
      return formatPhone(value)
    case 'date':
      return formatDate(value)
    default:
      return value
  }
}

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    const data: ViaCepResponse = await res.json()
    if (data.erro) return null
    return data
  } catch {
    return null
  }
}

export default function RegistrationFormFill({ formType }: { formType?: string }) {
  const { t } = useLanguage()
  const def = useMemo(() => getFormDefinition(formType ?? ''), [formType])
  const isPj = formType === 'pj'

  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({})
  const [cepLoading, setCepLoading] = useState(false)

  useEffect(() => {
    if (def) {
      const init: Record<string, string | number | boolean> = {}
      def.fields.forEach((f) => {
        if (f.type === 'number') init[f.key] = ''
        else if (f.type === 'checkbox') init[f.key] = false
        else init[f.key] = ''
      })
      setAnswers(init)
    }
  }, [def])
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCepBlur = useCallback(async () => {
    const cep = String(answers.postalCode ?? '').replace(/\D/g, '')
    if (cep.length !== 8) return
    setCepLoading(true)
    const data = await fetchAddressByCep(cep)
    setCepLoading(false)
    if (data) {
      setAnswers((prev) => ({
        ...prev,
        address: data.logradouro || prev.address,
        city: data.localidade || prev.city,
        uf: data.uf || prev.uf,
      }))
    }
  }, [answers.postalCode])

  const visibleFields = useMemo(() => {
    if (!def) return []
    return def.fields.filter((f) => {
      if (!f.conditional) return true
      return answers[f.conditional.field] === f.conditional.value
    })
  }, [def, answers])

  const handleChange = (key: string, value: string | number | boolean, mask?: string) => {
    let val: string | number | boolean = value
    if (typeof value === 'string' && mask) val = applyMask(value, mask)
    setAnswers((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    visibleFields.forEach((f) => {
      if (!f.required || f.type === 'checkbox') return
      const v = answers[f.key]
      if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) {
        e[f.key] = t('registration.fieldRequired')
      } else if (f.key === 'cpf' && typeof v === 'string' && v.replace(/\D/g, '').length !== 11) {
        e[f.key] = t('suitabilityFill.cpfInvalid')
      } else if (f.key === 'email' && typeof v === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        e[f.key] = t('suitabilityFill.emailInvalid')
      }
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!def || !validate()) return

    await saveResponse({
      id: crypto.randomUUID(),
      formType: def.formType as RegistrationFormType,
      answers: { ...answers },
      submittedAt: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  if (!formType || (!def && !isPj)) {
    return (
      <div className="min-h-full flex items-center justify-center text-[var(--text-primary)] p-8">
        <p>{t('registration.invalidFormLink')}</p>
      </div>
    )
  }

  if (isPj) {
    return (
      <div className="py-8 sm:py-12 px-4">
        <div className="max-w-xl mx-auto">
          {!submitted && (
            <>
              <h1 className="font-canela text-2xl text-[var(--text-primary)] mb-2">{t('registration.formTitleLegalEntity')}</h1>
              <p className="font-interTight text-[var(--text-accent)] mb-8">{t('registration.formSubtitle')}</p>
            </>
          )}
          {submitted ? (
            <div className="min-h-full flex flex-col items-center justify-center p-8">
              <div className="max-w-md text-center space-y-4">
                <h1 className="font-canela text-2xl text-[var(--text-accent)]">{t('registration.thankYou')}</h1>
                <p className="font-interTight text-[var(--text-primary)]">{t('registration.submittedSuccess')}</p>
                <p className="font-interTight text-[var(--text-accent)] text-sm">{t('registration.checkEmailNextSteps')}</p>
              </div>
            </div>
          ) : (
            <RegistrationFormPJ onSubmitted={() => setSubmitted(true)} />
          )}
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-canela text-2xl text-[var(--text-accent)]">{t('registration.thankYou')}</h1>
          <p className="font-interTight text-[var(--text-primary)]">{t('registration.submittedSuccess')}</p>
          <p className="font-interTight text-[var(--text-accent)] text-sm">{t('registration.checkEmailNextSteps')}</p>
        </div>
      </div>
    )
  }

  const isMarried = answers.civilStatus === 'married'
  const pfDef = def!

  const renderField = (field: (typeof pfDef.fields)[number]) => {
    const visible = !field.conditional || answers[field.conditional.field] === field.conditional.value
    if (!visible) return null

    return (
      <div key={field.key}>
        {field.type !== 'checkbox' && (
          <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
            {t(field.labelKey)} {field.required && <span className="text-red-500">*</span>}
          </label>
        )}
        {field.key === 'bankCode' ? (
          <BankSelect
            value={String(answers[field.key] ?? '')}
            onChange={(v) => handleChange(field.key, v)}
            placeholder={t('registration.bankSearchPlaceholder')}
            error={errors[field.key]}
          />
        ) : field.type === 'checkbox' ? (
          <div className="space-y-1">
            <div className="font-interTight text-sm text-[var(--text-primary)]">{t(field.labelKey)}</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(answers[field.key])}
                onChange={(e) => handleChange(field.key, e.target.checked)}
                className="rounded border-[var(--border-color)] text-[var(--text-accent)] focus:ring-vanilla-secondary"
              />
              <span className="font-interTight text-sm text-[var(--text-primary)]">{t('clients.yes')}</span>
            </label>
          </div>
        ) : field.type === 'select' ? (
          <select
            value={String(answers[field.key] ?? '')}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-interTight"
          >
            <option value="">{t('registration.selectOption')}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label ?? (opt.labelKey && opt.labelKey.length === 2 ? opt.labelKey : t(opt.labelKey ?? ''))}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            placeholder={
              field.mask === 'cpf'
                ? '000.000.000-00'
                : field.mask === 'cep'
                  ? '00000-000'
                  : field.mask === 'date'
                    ? 'DD/MM/YYYY'
                    : field.mask === 'phone'
                      ? '(00) 00000-0000'
                      : ''
            }
            value={String(answers[field.key] ?? '')}
            onChange={(e) =>
              handleChange(
                field.key,
                field.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value,
                field.mask
              )
            }
            onBlur={field.key === 'postalCode' ? handleCepBlur : undefined}
            disabled={field.key === 'postalCode' && cepLoading}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
          />
        )}
        {errors[field.key] && <p className="text-red-500 text-sm mt-1">{errors[field.key]}</p>}
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="font-canela text-2xl text-[var(--text-primary)] mb-2">{t('registration.formTitleIndividual')}</h1>
        <p className="font-interTight text-[var(--text-accent)] mb-8">{t('registration.formSubtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {(formType === 'pf' ? SECTIONS_PF : []).map((section) => {
            if (section.key === 'marital') {
              return (
                <div
                  key={section.key}
                  className={isMarried ? 'collapse-reveal expanded' : 'collapse-reveal'}
                  aria-hidden={!isMarried}
                >
                  <div className="collapse-reveal-inner">
                    <section className="p-4 sm:p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                      <h2 className="font-canela text-lg text-[var(--text-accent)] mb-4">{t(section.labelKey)}</h2>
                      <div className="space-y-4">
                        {pfDef.fields
                          .filter((f) => (section.fields as readonly string[]).includes(f.key))
                          .map(renderField)}
                      </div>
                    </section>
                  </div>
                </div>
              )
            }
            return (
              <section
                key={section.key}
                className="p-4 sm:p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50"
              >
                <h2 className="font-canela text-lg text-[var(--text-accent)] mb-4">{t(section.labelKey)}</h2>
                <div className="space-y-4">
                  {pfDef.fields
                    .filter((f) => (section.fields as readonly string[]).includes(f.key))
                    .map(renderField)}
                </div>
              </section>
            )
          })}

          <button
            type="submit"
            className="w-full px-4 py-3 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight font-medium hover:opacity-90"
          >
            {t('registration.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
