'use client'

import { useState, useCallback, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { saveResponse } from '../data/registrationStore'
import type { Administrator, BeneficialOwner } from '../types/client'
import type { RegistrationFormType } from '../types/registration'
import { formatCpf, formatCep, formatPhone, formatCnpj, normalizeLegalName } from '../utils/masks'
import { BRAZILIAN_STATES } from '../types/client'

interface IbgeMunicipio {
  id: number
  nome: string
}

interface IbgeEstado {
  id: number
  sigla: string
}

interface ViaCepResponse {
  cep: string
  logradouro: string
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

async function fetchMunicipiosByUf(uf: string): Promise<IbgeMunicipio[]> {
  try {
    const estadosRes = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    const estados: IbgeEstado[] = await estadosRes.json()
    const estado = estados.find((e) => e.sigla === uf)
    if (!estado) return []
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios`)
    return res.json()
  } catch {
    return []
  }
}

const emptyAdmin: Administrator = { name: '', cpf: '', isPep: false }
const emptyBeneficialOwnerIndividual: BeneficialOwner = {
  kind: 'individual',
  name: '',
  cpf: '',
  isPep: false,
}

export default function RegistrationFormPJ({ onSubmitted }: { onSubmitted: () => void }) {
  const { t } = useLanguage()
  const [legalName, setLegalName] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [address, setAddress] = useState('')
  const [addressNumber, setAddressNumber] = useState<number | ''>('')
  const [addressComplement, setAddressComplement] = useState('')
  const [uf, setUf] = useState('')
  const [city, setCity] = useState('')
  const [administrators, setAdministrators] = useState<Administrator[]>([{ ...emptyAdmin }])
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([{ ...emptyBeneficialOwnerIndividual, isPrincipal: true }])
  const [municipios, setMunicipios] = useState<IbgeMunicipio[]>([])
  const [cepLoading, setCepLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCepBlur = useCallback(async () => {
    const digits = postalCode.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    const data = await fetchAddressByCep(postalCode)
    setCepLoading(false)
    if (data) {
      setAddress(data.logradouro || address)
      setCity(data.localidade || city)
      setUf(data.uf || uf)
    }
  }, [postalCode, address, city, uf])

  useEffect(() => {
    if (!uf) {
      setMunicipios([])
      setCity('')
      return
    }
    fetchMunicipiosByUf(uf).then((munis) => {
      setMunicipios(munis)
      setCity((currentCity) => {
        if (!currentCity) return ''
        const normalized = (s: string) =>
          s
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        const found = munis.find((m) => normalized(m.nome) === normalized(currentCity))
        return found ? found.nome : ''
      })
    })
  }, [uf])

  const addAdmin = () => setAdministrators((prev) => [...prev, { ...emptyAdmin }])
  const removeAdmin = (idx: number) => {
    if (administrators.length <= 1) return
    setAdministrators((prev) => prev.filter((_, i) => i !== idx))
  }
  const updateAdmin = (idx: number, updates: Partial<Administrator>) => {
    setAdministrators((prev) => prev.map((a, i) => (i === idx ? { ...a, ...updates } : a)))
  }

  const addBeneficialOwner = () =>
    setBeneficialOwners((prev) => [...prev, { ...emptyBeneficialOwnerIndividual }])
  const removeBeneficialOwner = (idx: number) => {
    if (beneficialOwners.length <= 1) return
    setBeneficialOwners((prev) => prev.filter((_, i) => i !== idx))
  }
  const updateBeneficialOwner = (idx: number, updates: Partial<BeneficialOwner>) => {
    setBeneficialOwners((prev) =>
      prev.map((b, i): BeneficialOwner => {
        if (i !== idx) return b
        if ('kind' in updates && updates.kind) {
          if (updates.kind === 'individual') {
            return { kind: 'individual', name: '', cpf: '', isPep: false, isPrincipal: b.isPrincipal }
          }
          return { kind: 'legal_entity', legalName: '', cnpj: '', isPrincipal: b.isPrincipal }
        }
        return { ...b, ...updates } as BeneficialOwner
      })
    )
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!legalName.trim()) e.legalName = t('registration.fieldRequired')
    if (!tradeName.trim()) e.tradeName = t('registration.fieldRequired')
    if (cnpj.replace(/\D/g, '').length !== 14) e.cnpj = t('registration.cnpjInvalid')
    if (!phone.trim()) e.phone = t('registration.fieldRequired')
    if (!email.trim()) e.email = t('registration.fieldRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('suitabilityFill.emailInvalid')
    if (!postalCode.trim()) e.postalCode = t('registration.fieldRequired')
    if (!address.trim()) e.address = t('registration.fieldRequired')
    if (addressNumber === '' || addressNumber === null) e.addressNumber = t('registration.fieldRequired')
    if (!uf) e.uf = t('registration.fieldRequired')
    if (!city) e.city = t('registration.fieldRequired')
    administrators.forEach((a, i) => {
      if (!a.name.trim()) e[`adminName_${i}`] = t('registration.fieldRequired')
      if (a.cpf.replace(/\D/g, '').length !== 11) e[`adminCpf_${i}`] = t('suitabilityFill.cpfInvalid')
    })
    beneficialOwners.forEach((b, i) => {
      if (b.kind === 'individual') {
        if (!b.name.trim()) e[`boName_${i}`] = t('registration.fieldRequired')
        if (b.cpf.replace(/\D/g, '').length !== 11) e[`boCpf_${i}`] = t('suitabilityFill.cpfInvalid')
      } else {
        if (!b.legalName?.trim()) e[`boLegalName_${i}`] = t('registration.fieldRequired')
        if ((b.cnpj ?? '').replace(/\D/g, '').length !== 14) e[`boCnpj_${i}`] = t('registration.cnpjInvalid')
      }
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const adminsWithPrincipal = administrators.map((a, i) => ({ ...a, isPrincipal: i === 0 }))
    const bosWithPrincipal = beneficialOwners.map((b, i) => ({
      ...b,
      isPrincipal: i === 0,
      ...(b.kind === 'legal_entity' && b.legalName ? { legalName: normalizeLegalName(b.legalName) } : {}),
    }))
    await saveResponse({
      id: crypto.randomUUID(),
      formType: 'pj' as RegistrationFormType,
      answers: {
        legalName: normalizeLegalName(legalName),
        tradeName,
        cnpj,
        phone,
        email,
        postalCode,
        address,
        addressNumber: addressNumber === '' ? 0 : addressNumber,
        addressComplement,
        uf,
        city,
        administrators: adminsWithPrincipal,
        beneficialOwners: bosWithPrincipal,
      },
      submittedAt: new Date().toISOString(),
    })
    onSubmitted()
  }

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-interTight'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
        <h2 className="font-canela text-lg text-[var(--text-accent)] mb-4">{t('registration.sectionBasicInformation')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.legalName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              onBlur={(e) => setLegalName(normalizeLegalName(e.target.value))}
              className={inputClass}
            />
            {errors.legalName && <p className="text-red-500 text-sm mt-1">{errors.legalName}</p>}
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.tradeName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              className={inputClass}
            />
            {errors.tradeName && <p className="text-red-500 text-sm mt-1">{errors.tradeName}</p>}
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              CNPJ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              placeholder="00.000.000/0001-00"
              className={inputClass}
            />
            {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              className={inputClass}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>
      </section>

      <section className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
        <h2 className="font-canela text-lg text-[var(--text-accent)] mb-4">{t('registration.sectionAddressInformation')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.postalCode')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(formatCep(e.target.value))}
              onBlur={handleCepBlur}
              disabled={cepLoading}
              placeholder="00000-000"
              className={inputClass}
            />
            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.address')} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.addressNumber')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={addressNumber === '' ? '' : addressNumber}
              onChange={(e) => setAddressNumber(e.target.value ? Number(e.target.value) : '')}
              className={inputClass}
            />
            {errors.addressNumber && <p className="text-red-500 text-sm mt-1">{errors.addressNumber}</p>}
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.addressComplement')}
            </label>
            <input
              type="text"
              value={addressComplement}
              onChange={(e) => setAddressComplement(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.uf')} <span className="text-red-500">*</span>
            </label>
            <select value={uf} onChange={(e) => setUf(e.target.value)} className={inputClass}>
              <option value="">{t('registration.selectOption')}</option>
              {BRAZILIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.uf && <p className="text-red-500 text-sm mt-1">{errors.uf}</p>}
          </div>
          <div>
            <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">
              {t('clients.city')} <span className="text-red-500">*</span>
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
              disabled={!uf || municipios.length === 0}
            >
              <option value="">{t('registration.selectOption')}</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.nome}>{m.nome}</option>
              ))}
            </select>
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
        </div>
      </section>

      <section className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
        <h2 className="font-canela text-lg text-[var(--text-accent)] mb-4">{t('registration.sectionAdministratorInformation')}</h2>
        <p className="text-sm text-[var(--text-accent)] mb-4">{t('registration.administratorHint')}</p>
        <div className="space-y-4">
          {administrators.map((admin, idx) => (
            <div key={idx} className="p-4 border border-[var(--border-color)] rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-interTight text-sm text-[var(--text-accent)]">
                  {idx === 0 ? t('registration.administratorPrincipal') : `${t('registration.administrator')} ${idx + 1}`}
                </span>
                {administrators.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAdmin(idx)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    {t('suitabilityBuilder.remove')}
                  </button>
                )}
              </div>
              <div>
                <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">{t('clients.administratorName')}</label>
                <input
                  type="text"
                  value={admin.name}
                  onChange={(e) => updateAdmin(idx, { name: e.target.value })}
                  className={inputClass}
                />
                {errors[`adminName_${idx}`] && <p className="text-red-500 text-sm mt-1">{errors[`adminName_${idx}`]}</p>}
              </div>
              <div>
                <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">CPF</label>
                <input
                  type="text"
                  value={admin.cpf}
                  onChange={(e) => updateAdmin(idx, { cpf: formatCpf(e.target.value) })}
                  placeholder="000.000.000-00"
                  className={inputClass}
                />
                {errors[`adminCpf_${idx}`] && <p className="text-red-500 text-sm mt-1">{errors[`adminCpf_${idx}`]}</p>}
              </div>
              <div className="space-y-1">
                <div className="font-interTight text-sm text-[var(--text-primary)]">{t('clients.isPepQuestionThirdPerson')}</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={admin.isPep}
                    onChange={(e) => updateAdmin(idx, { isPep: e.target.checked })}
                    className="rounded border-[var(--border-color)] text-[var(--text-accent)]"
                  />
                  <span className="font-interTight text-sm">{t('clients.yes')}</span>
                </label>
              </div>
            </div>
          ))}
          <button type="button" onClick={addAdmin} className="text-[var(--text-accent)] text-sm font-interTight hover:underline">
            + {t('registration.addAdministrator')}
          </button>
        </div>
      </section>

      <section className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
        <h2 className="font-canela text-lg text-[var(--text-accent)] mb-4">{t('registration.sectionBeneficialOwnerInformation')}</h2>
        <p className="text-sm text-[var(--text-accent)] mb-4">{t('registration.beneficialOwnerHint')}</p>
        <div className="space-y-4">
          {beneficialOwners.map((bo, idx) => (
            <div key={idx} className="p-4 border border-[var(--border-color)] rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-interTight text-sm text-[var(--text-accent)]">
                  {idx === 0 ? t('registration.beneficialOwnerPrincipal') : `${t('registration.beneficialOwner')} ${idx + 1}`}
                </span>
                {beneficialOwners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBeneficialOwner(idx)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    {t('suitabilityBuilder.remove')}
                  </button>
                )}
              </div>
              <div className="inline-flex rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-0.5">
                <button
                  type="button"
                  onClick={() => updateBeneficialOwner(idx, { kind: 'individual' })}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    bo.kind === 'individual'
                      ? 'bg-[var(--vanilla-secondary)] text-[var(--vanilla-main)] font-medium'
                      : 'text-[var(--text-accent)] hover:bg-[var(--bg-primary)]/50'
                  }`}
                >
                  {t('registration.beneficialOwnerIndividual')}
                </button>
                <button
                  type="button"
                  onClick={() => updateBeneficialOwner(idx, { kind: 'legal_entity' })}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    bo.kind === 'legal_entity'
                      ? 'bg-[var(--vanilla-secondary)] text-[var(--vanilla-main)] font-medium'
                      : 'text-[var(--text-accent)] hover:bg-[var(--bg-primary)]/50'
                  }`}
                >
                  {t('registration.beneficialOwnerLegalEntity')}
                </button>
              </div>
              {bo.kind === 'individual' ? (
                <>
                  <div>
                    <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">{t('clients.beneficialOwnerName')}</label>
                    <input
                      type="text"
                      value={bo.name}
                      onChange={(e) => updateBeneficialOwner(idx, { name: e.target.value })}
                      className={inputClass}
                    />
                    {errors[`boName_${idx}`] && <p className="text-red-500 text-sm mt-1">{errors[`boName_${idx}`]}</p>}
                  </div>
                  <div>
                    <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">CPF</label>
                    <input
                      type="text"
                      value={bo.cpf}
                      onChange={(e) => updateBeneficialOwner(idx, { cpf: formatCpf(e.target.value) })}
                      placeholder="000.000.000-00"
                      className={inputClass}
                    />
                    {errors[`boCpf_${idx}`] && <p className="text-red-500 text-sm mt-1">{errors[`boCpf_${idx}`]}</p>}
                  </div>
                  <div className="space-y-1">
                    <div className="font-interTight text-sm text-[var(--text-primary)]">{t('clients.isPepQuestionThirdPerson')}</div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bo.isPep}
                        onChange={(e) => updateBeneficialOwner(idx, { isPep: e.target.checked })}
                        className="rounded border-[var(--border-color)] text-[var(--text-accent)]"
                      />
                      <span className="font-interTight text-sm">{t('clients.yes')}</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">{t('clients.legalName')}</label>
                    <input
                      type="text"
                      value={bo.legalName ?? ''}
                      onChange={(e) => updateBeneficialOwner(idx, { legalName: e.target.value })}
                      onBlur={(e) => updateBeneficialOwner(idx, { legalName: normalizeLegalName(e.target.value) })}
                      className={inputClass}
                    />
                    {errors[`boLegalName_${idx}`] && <p className="text-red-500 text-sm mt-1">{errors[`boLegalName_${idx}`]}</p>}
                  </div>
                  <div>
                    <label className="block font-interTight text-sm text-[var(--text-primary)] mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={bo.cnpj ?? ''}
                      onChange={(e) => updateBeneficialOwner(idx, { cnpj: formatCnpj(e.target.value) })}
                      placeholder="00.000.000/0001-00"
                      className={inputClass}
                    />
                    {errors[`boCnpj_${idx}`] && <p className="text-red-500 text-sm mt-1">{errors[`boCnpj_${idx}`]}</p>}
                  </div>
                </>
              )}
            </div>
          ))}
          <button type="button" onClick={addBeneficialOwner} className="text-[var(--text-accent)] text-sm font-interTight hover:underline">
            + {t('registration.addBeneficialOwner')}
          </button>
        </div>
      </section>

      <button type="submit" className="w-full px-4 py-3 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight font-medium hover:opacity-90">
        {t('registration.submit')}
      </button>
    </form>
  )
}
