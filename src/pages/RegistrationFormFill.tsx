import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import BankSelect from '../components/BankSelect'
import { saveResponse } from '../data/registrationStore'
import { REGISTRATION_FORM_PF } from '../data/registrationFormDefinitions'
import type { RegistrationFormType } from '../types/registration'
import { formatCpf, formatCep, formatPhone, formatDate, formatRg } from '../utils/masks'

const FORM_DEFINITIONS: Record<string, typeof REGISTRATION_FORM_PF> = {
  pf: REGISTRATION_FORM_PF,
}

const SECTIONS = [
  { key: 'basic', labelKey: 'registration.sectionBasicInformation', fields: ['name', 'cpf', 'idDocument', 'birthDate', 'civilStatus'] },
  { key: 'marital', labelKey: 'registration.sectionMaritalInformation', fields: ['propertyRegime', 'spouseName', 'spouseCpf', 'spouseId', 'spouseBirthDate'] },
  { key: 'contact', labelKey: 'registration.sectionContactInformation', fields: ['phone', 'email', 'postalCode', 'address', 'addressNumber', 'addressComplement', 'uf', 'city'] },
  { key: 'banking', labelKey: 'registration.sectionBankingInformation', fields: ['bankCode', 'accountType', 'agency', 'accountNumber'] },
] as const

function getFormDefinition(formType: string) {
  return FORM_DEFINITIONS[formType] ?? null
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
    case 'rg':
      return mask === 'rg' ? formatRg(value) : formatDate(value)
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

export default function RegistrationFormFill() {
  const { formType } = useParams<{ formType: string }>()
  const { t } = useLanguage()
  const def = useMemo(() => getFormDefinition(formType ?? ''), [formType])

  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [cepLoading, setCepLoading] = useState(false)

  useEffect(() => {
    if (def) {
      const init: Record<string, string | number> = {}
      def.fields.forEach((f) => {
        init[f.key] = f.type === 'number' ? '' : ''
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

  const handleChange = (key: string, value: string | number, mask?: string) => {
    let val: string | number = value
    if (typeof value === 'string' && mask) val = applyMask(value, mask)
    setAnswers((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    visibleFields.forEach((f) => {
      if (!f.required) return
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!def || !validate()) return

    saveResponse({
      id: crypto.randomUUID(),
      formType: def.formType as RegistrationFormType,
      answers: { ...answers },
      submittedAt: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  if (!formType || !def) {
    return (
      <div className="min-h-full flex items-center justify-center text-[var(--text-primary)] p-8">
        <p>{t('registration.invalidFormLink')}</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-canela text-2xl text-vanilla-secondary">{t('registration.thankYou')}</h1>
          <p className="font-interTight text-[var(--text-primary)]">{t('registration.submittedSuccess')}</p>
          <p className="font-interTight text-[var(--text-secondary)] text-sm">{t('registration.checkEmailNextSteps')}</p>
        </div>
      </div>
    )
  }

  const isMarried = answers.civilStatus === 'married'

  const renderField = (field: (typeof def.fields)[number]) => {
    const visible = !field.conditional || answers[field.conditional.field] === field.conditional.value
    if (!visible) return null

    return (
      <div key={field.key}>
        <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
          {t(field.labelKey)} {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.key === 'bankCode' ? (
          <BankSelect
            value={String(answers[field.key] ?? '')}
            onChange={(v) => handleChange(field.key, v)}
            placeholder={t('registration.bankSearchPlaceholder')}
            error={errors[field.key]}
          />
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
                      : field.mask === 'rg'
                        ? '00.000.000-0'
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
    <div className="py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="font-canela text-2xl text-[var(--text-primary)] mb-2">{t('registration.formTitle')}</h1>
        <p className="font-interTight text-[var(--text-secondary)] mb-8">{t('registration.formSubtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {SECTIONS.map((section) => {
            if (section.key === 'marital' && !isMarried) return null

            return (
              <section
                key={section.key}
                className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50"
              >
                <h2 className="font-canela text-lg text-vanilla-secondary mb-4">{t(section.labelKey)}</h2>
                <div className="space-y-4">
                  {def.fields
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
