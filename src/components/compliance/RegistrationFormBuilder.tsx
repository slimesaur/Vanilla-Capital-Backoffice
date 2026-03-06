'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../contexts/ToastContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { getResponses, approveResponse } from '../../data/registrationStore'
import { getClients, saveClient } from '../../data/clientsStore'
import type { RegistrationResponse } from '../../types/registration'
import type { Client, Administrator, BeneficialOwner } from '../../types/client'
import { DOC_ID_TO_FORM_TYPE } from '../../data/complianceDocuments'
import { BRAZILIAN_BANKS } from '../../data/brazilianBanks'

const DOC_ID_TO_TRANSLATION_KEY: Record<string, string> = {
  name: 'clients.name',
  cpf: 'clients.cpf',
  idDocument: 'clients.id',
  issuingAuthority: 'clients.issuingAuthority',
  birthDate: 'clients.birthDate',
  civilStatus: 'clients.civilStatus',
  propertyRegime: 'clients.propertyRegime',
  spouseName: 'clients.spouseName',
  spouseCpf: 'clients.spouseCpf',
  spouseId: 'clients.spouseId',
  spouseIssuingAuthority: 'clients.spouseIssuingAuthority',
  spouseBirthDate: 'clients.spouseBirthDate',
  isPep: 'clients.isPep',
  phone: 'clients.phone',
  email: 'clients.email',
  postalCode: 'clients.postalCode',
  address: 'clients.address',
  addressNumber: 'clients.addressNumber',
  addressComplement: 'clients.addressComplement',
  uf: 'clients.uf',
  city: 'clients.city',
  bank: 'clients.bank',
  bankCode: 'clients.bank',
  accountType: 'clients.accountType',
  agency: 'clients.agency',
  accountNumber: 'clients.accountNumber',
  legalName: 'clients.legalName',
  tradeName: 'clients.tradeName',
  cnpj: 'CNPJ',
  administrators: 'clients.administrators',
  beneficialOwners: 'clients.beneficialOwners',
}

function responseToClient(r: RegistrationResponse): Client {
  const a = r.answers
  const client: Client = {
    id: crypto.randomUUID(),
    clientType: 'individual',
    name: String(a.name ?? ''),
    cpf: String(a.cpf ?? ''),
    idDocument: String(a.idDocument ?? ''),
    birthDate: String(a.birthDate ?? ''),
    civilStatus: (a.civilStatus as Client['civilStatus']) ?? 'single',
    phone: String(a.phone ?? ''),
    phoneCountry: 'BR',
    email: String(a.email ?? ''),
    postalCode: String(a.postalCode ?? ''),
    address: String(a.address ?? ''),
    addressNumber: a.addressNumber === '' || a.addressNumber === undefined ? '' : Number(a.addressNumber),
    addressComplement: String(a.addressComplement ?? ''),
    uf: String(a.uf ?? ''),
    city: String(a.city ?? ''),
    bank: (() => {
      const code = String(a.bankCode ?? '')
      const found = BRAZILIAN_BANKS.find((b) => b.code === code)
      return found ? `${found.code} - ${found.name}` : code
    })(),
    bankCode: String(a.bankCode ?? ''),
    accountType: (a.accountType as Client['accountType']) ?? 'checking',
    agency: String(a.agency ?? ''),
    accountNumber: String(a.accountNumber ?? ''),
    status: 'pending_suitability',
  }
  client.issuingAuthority = String(a.issuingAuthority ?? '')
  client.isPep = Boolean(a.isPep)
  if (client.civilStatus === 'married' && a.spouseName) {
    client.maritalInfo = {
      propertyRegime: (a.propertyRegime as Client['maritalInfo'] extends undefined ? never : NonNullable<Client['maritalInfo']>['propertyRegime']) ?? 'separate',
      spouseName: String(a.spouseName ?? ''),
      spouseCpf: String(a.spouseCpf ?? ''),
      spouseId: String(a.spouseId ?? ''),
      spouseBirthDate: String(a.spouseBirthDate ?? ''),
      spouseIssuingAuthority: String(a.spouseIssuingAuthority ?? ''),
    }
  }
  return client
}

function responseToClientPj(r: RegistrationResponse): Client {
  const a = r.answers
  const administrators = (a.administrators as Administrator[] | undefined) ?? []
  const beneficialOwners = (a.beneficialOwners as BeneficialOwner[] | undefined) ?? []
  return {
    id: crypto.randomUUID(),
    clientType: 'legal_entity',
    legalName: String(a.legalName ?? ''),
    tradeName: String(a.tradeName ?? ''),
    cnpj: String(a.cnpj ?? ''),
    phone: String(a.phone ?? ''),
    phoneCountry: 'BR',
    email: String(a.email ?? ''),
    postalCode: String(a.postalCode ?? ''),
    address: String(a.address ?? ''),
    addressNumber: a.addressNumber === '' || a.addressNumber === undefined ? '' : Number(a.addressNumber),
    addressComplement: String(a.addressComplement ?? ''),
    uf: String(a.uf ?? ''),
    city: String(a.city ?? ''),
    administrators,
    beneficialOwners,
    status: 'pending_suitability',
  }
}

export default function RegistrationFormBuilder({ docId }: { docId: string }) {
  const formType = DOC_ID_TO_FORM_TYPE[docId] ?? 'pf'
  const [responses, setResponses] = useState<RegistrationResponse[]>([])
  const { showToast } = useToast()
  const { t } = useLanguage()

  const refreshResponses = useCallback(async () => {
    const r = await getResponses(formType)
    setResponses(r)
  }, [formType])

  useEffect(() => {
    refreshResponses()
  }, [refreshResponses])

  const shareLink = `${window.location.origin}/registration/fill/${formType}`
  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    showToast(t('suitabilityBuilder.linkCopied'))
  }

  const handleApprove = async (r: RegistrationResponse) => {
    const existing = await getClients()
    if (formType === 'pf') {
      const cpfDigits = String(r.answers.cpf ?? '').replace(/\D/g, '')
      const duplicate = existing.find((c) => (c.cpf ?? '').replace(/\D/g, '') === cpfDigits)
      if (duplicate) {
        showToast(t('registration.duplicateCpf'))
        return
      }
      const client = responseToClient(r)
      await saveClient(client)
      await approveResponse(r.id, client.id)
      showToast(t('registration.approvedAndClientCreated'))
    } else if (formType === 'pj') {
      const cnpjDigits = String(r.answers.cnpj ?? '').replace(/\D/g, '')
      const duplicate = existing.find((c) => (c.cnpj ?? '').replace(/\D/g, '') === cnpjDigits)
      if (duplicate) {
        showToast(t('registration.duplicateCnpj'))
        return
      }
      const client = responseToClientPj(r)
      await saveClient(client)
      await approveResponse(r.id, client.id)
      showToast(t('registration.approvedAndClientCreated'))
    }
    await refreshResponses()
  }

  return (
    <div className="space-y-6">
      <h2 className="font-canela text-xl text-[var(--text-primary)]">
        {t(`compliance.${docId === 'form-pf' ? 'formPf' : 'formPj'}`)}
      </h2>

      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={copyLink}
          className="px-4 py-2 border border-vanilla-secondary text-[var(--text-accent)] rounded-lg font-interTight text-sm hover:bg-vanilla-secondary/10"
        >
          {t('suitabilityBuilder.copyFormLink')}
        </button>
      </div>
      <p className="text-sm text-[var(--text-accent)]">
        <code className="bg-black/5 dark:bg-white/5 px-2 py-1 rounded">{shareLink}</code>
      </p>

      <section className="mt-6 pt-6 border-t border-[var(--border-color)]">
        <h3 className="font-canela text-lg text-[var(--text-primary)] mb-4">{t('suitabilityBuilder.submittedResponses')}</h3>
        {responses.filter((r) => !r.approvedClientId).length === 0 ? (
          <p className="text-[var(--text-accent)]/70 font-interTight">{t('suitabilityBuilder.noResponsesYet')}</p>
        ) : (
          <div className="space-y-4">
            {responses
              .filter((r) => !r.approvedClientId)
              .map((r) => (
                <div key={r.id} className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="text-xs text-[var(--text-accent)]">{new Date(r.submittedAt).toLocaleString()}</div>
                    <button
                      onClick={() => handleApprove(r)}
                      className="px-3 py-1.5 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight text-sm hover:opacity-90"
                    >
                      {t('suitabilityBuilder.approve')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm font-interTight">
                    {Object.entries(r.answers)
                      .filter(([key]) => key !== 'administrators' && key !== 'beneficialOwners')
                      .map(([key, val]) => {
                        let displayVal = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val ?? '-')
                        if (key === 'bankCode' && val) {
                          const found = BRAZILIAN_BANKS.find((b) => b.code === String(val))
                          displayVal = found ? `${found.code} - ${found.name}` : displayVal
                        }
                        return (
                          <div key={key}>
                            <span className="font-semibold text-[var(--text-primary)]">{t(DOC_ID_TO_TRANSLATION_KEY[key] ?? key)}:</span>{' '}
                            <span className="font-light text-[var(--text-primary)]">{displayVal}</span>
                          </div>
                        )
                      })}
                    {Array.isArray(r.answers.administrators) && (r.answers.administrators as Administrator[]).length > 0 && (
                      <div className="col-span-2 md:col-span-3">
                        <span className="font-semibold text-[var(--text-primary)] block mb-1">{t('registration.sectionAdministratorInformation')}</span>
                        {(r.answers.administrators as Administrator[]).map((adm, i) => (
                          <div key={i} className="font-light text-[var(--text-primary)] text-sm">
                            {adm.name} - {adm.cpf} {adm.isPep && '(PEP)'}
                          </div>
                        ))}
                      </div>
                    )}
                    {Array.isArray(r.answers.beneficialOwners) && (r.answers.beneficialOwners as BeneficialOwner[]).length > 0 && (
                      <div className="col-span-2 md:col-span-3">
                        <span className="font-semibold text-[var(--text-primary)] block mb-1">{t('registration.sectionBeneficialOwnerInformation')}</span>
                        {(r.answers.beneficialOwners as BeneficialOwner[]).map((bo, i) => (
                          <div key={i} className="font-light text-[var(--text-primary)] text-sm">
                            {bo.kind === 'individual'
                              ? `${bo.name} - ${bo.cpf} ${bo.isPep ? '(PEP)' : ''}`
                              : `${bo.legalName} - ${bo.cnpj}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
