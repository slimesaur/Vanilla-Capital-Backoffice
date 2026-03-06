'use client'

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { ONBOARDING_STEPS, COMPLIANCE_GROUPS } from '../data/complianceDocuments'
import SuitabilityFormBuilder from '../components/SuitabilityFormBuilder'
import RegistrationFormBuilder from '../components/compliance/RegistrationFormBuilder'
import clsx from 'clsx'

type DocItem = { id: string; type: 'pdf' | 'suitability' | 'form' }

const DOC_ID_TO_TRANSLATION_KEY: Record<string, string> = {
  'suitability-form': 'compliance.suitabilityForm',
  'suitability-policies': 'compliance.suitabilityPolicies',
  'form-pf': 'compliance.formPf',
  'form-pj': 'compliance.formPj',
  'contract-family': 'compliance.contractFamily',
  'contract-pf': 'compliance.contractPf',
  'contract-pj': 'compliance.contractPj',
  'client-contract': 'compliance.clientContract',
  'ethics-code': 'compliance.ethicsCode',
  'reference-form': 'compliance.referenceForm',
  'compliance-manual': 'compliance.complianceManual',
  'internal-rules': 'compliance.internalRules',
  'investment-policies': 'compliance.investmentPolicies',
  'aml-policy': 'compliance.amlPolicy',
}

export default function CompliancePage() {
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null)
  const [docPdfs, setDocPdfs] = useState<Record<string, string>>({})
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([]))
  const { t } = useLanguage()

  const getDocName = (docId: string) => {
    const key = DOC_ID_TO_TRANSLATION_KEY[docId]
    return key ? t(key) : docId
  }

  const handleDocClick = (doc: DocItem) => {
    setSelectedDoc(doc)
  }

  const toggleStep = (stepNum: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepNum)) next.delete(stepNum)
      else next.add(stepNum)
      return next
    })
  }

  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file)
      setDocPdfs((prev) => {
        if (prev[docId]) URL.revokeObjectURL(prev[docId])
        return { ...prev, [docId]: url }
      })
      setSelectedDoc({ id: docId, type: 'pdf' })
    }
  }

  const allCorporateItems = COMPLIANCE_GROUPS.corporate
  const selectedDocId = selectedDoc?.id

  return (
    <div className="flex h-[calc(100vh-0px)]">
      <aside className="w-72 shrink-0 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
        <div className="p-4 border-b border-[var(--border-color)]">
          <h2 className="font-canela text-lg text-[var(--text-primary)]">{t('compliance.title')}</h2>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scrollbar-vanilla">
          <section>
            <h3 className="font-canela text-base text-[var(--text-accent)] mb-3">{t('compliance.onboarding').toUpperCase()}</h3>
            <div className="relative pl-6 space-y-0 border-l-2 border-[var(--border-color)] ml-[7px]">
              {ONBOARDING_STEPS.map((step) => (
                <div key={step.stepNumber} className="relative flex items-start">
                  <div
                    className="absolute w-3 h-3 rounded-full bg-vanilla-secondary shrink-0 -translate-x-1/2"
                    style={{ left: '-23px', top: '0.75rem' }}
                  />
                  <div className="pb-2 pt-0.5 pl-2 flex-1 min-w-0">
                    <button
                      onClick={() =>
                        step.expandable
                          ? toggleStep(step.stepNumber)
                          : step.items.length > 0 && handleDocClick({ id: step.items[0].id, type: step.items[0].type })
                      }
                      className={clsx(
                        'w-full text-left px-3 py-2 rounded-lg text-base font-arpona capitalize transition-colors flex items-center justify-between gap-2',
                        !step.expandable && step.items[0] && selectedDocId === step.items[0].id
                          ? 'bg-vanilla-secondary/20 text-[var(--text-accent)]'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                      )}
                    >
                      <span>
                        {t(step.labelKey)}
                      </span>
                      {step.expandable && (
                        <span className="text-[var(--text-accent)]">
                          {expandedSteps.has(step.stepNumber) ? '▼' : '▶'}
                        </span>
                      )}
                    </button>
                    {step.expandable && expandedSteps.has(step.stepNumber) && (
                      <ul className="mt-1 space-y-1">
                        {step.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => handleDocClick({ id: item.id, type: item.type })}
                              className={clsx(
                                'w-full text-left px-3 py-2 rounded-lg text-xs font-arpona capitalize transition-colors',
                                selectedDocId === item.id
                                  ? 'bg-vanilla-secondary/20 text-[var(--text-accent)]'
                                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                              )}
                            >
                              {t(item.translationKey)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="font-canela text-base text-[var(--text-accent)] mb-3">{t('compliance.corporate').toUpperCase()}</h3>
            <ul className="space-y-1">
              {allCorporateItems.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => handleDocClick({ id: doc.id, type: doc.type })}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-sm font-interTight transition-colors',
                      selectedDocId === doc.id
                        ? 'bg-vanilla-secondary/20 text-[var(--text-accent)]'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                    )}
                  >
                    {getDocName(doc.id)}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>

      <div className="flex-1 overflow-auto p-6 border-l border-[var(--border-color)] scrollbar-vanilla">
        {!selectedDoc ? (
          <div className="flex items-center justify-center h-full text-[var(--text-accent)]/70 font-interTight">
            {t('compliance.selectDocument')}
          </div>
        ) : selectedDoc.type === 'suitability' ? (
          <SuitabilityFormBuilder />
        ) : selectedDoc.type === 'form' ? (
          <RegistrationFormBuilder docId={selectedDoc.id} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-canela text-xl text-[var(--text-primary)]">{getDocName(selectedDoc.id)}</h2>
              <label className="px-4 py-2 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight text-sm cursor-pointer hover:opacity-90">
                {docPdfs[selectedDoc.id] ? t('compliance.changePdf') : t('compliance.uploadPdf')}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(selectedDoc.id, e)}
                />
              </label>
            </div>
            {docPdfs[selectedDoc.id] ? (
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-center text-[var(--text-accent)] min-h-[400px]">
                <p className="font-interTight">{t('compliance.pdfLoadedPlaceholder')}</p>
                <a
                  href={docPdfs[selectedDoc.id]}
                  download={`${getDocName(selectedDoc.id)}.pdf`}
                  className="mt-4 inline-block px-4 py-2 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight text-sm hover:opacity-90"
                >
                  {t('clients.download')}
                </a>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-12 text-center text-[var(--text-accent)]/70 font-interTight">
                <p className="mb-4">{t('compliance.noDocumentLoaded')}</p>
                <label className="px-4 py-2 bg-vanilla-secondary/30 text-[var(--text-accent)] rounded-lg cursor-pointer hover:bg-vanilla-secondary/40 inline-block">
                  {t('compliance.uploadPdf')}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(selectedDoc.id, e)}
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
