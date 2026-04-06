'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { ONBOARDING_STEPS, COMPLIANCE_GROUPS } from '../data/complianceDocuments'
import SuitabilityFormBuilder from '../components/SuitabilityFormBuilder'
import RegistrationFormBuilder from '../components/compliance/RegistrationFormBuilder'
import clsx from 'clsx'

type DocItem = { id: string; type: 'pdf' | 'suitability' | 'form' }

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

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
  const [asideOpen, setAsideOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOverPdfPreview, setDragOverPdfPreview] = useState(false)
  const [dragOverEmptyZone, setDragOverEmptyZone] = useState(false)
  const pdfDropZoneRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

  const closeAside = useCallback(() => setAsideOpen(false), [])

  useEffect(() => {
    fetch('/api/compliance/documents')
      .then((r) => r.json())
      .then((data) => {
        if (data.documents) {
          const urls: Record<string, string> = {}
          for (const [key, val] of Object.entries(data.documents as Record<string, { url: string }>)) {
            urls[key] = val.url
          }
          setDocPdfs(urls)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!asideOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAside() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [asideOpen, closeAside])

  const getDocName = (docId: string) => {
    const key = DOC_ID_TO_TRANSLATION_KEY[docId]
    return key ? t(key) : docId
  }

  const handleDocClick = (doc: DocItem) => {
    setSelectedDoc(doc)
    closeAside()
  }

  const toggleStep = (stepNum: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepNum)) next.delete(stepNum)
      else next.add(stepNum)
      return next
    })
  }

  const uploadPdfForDoc = useCallback(async (docId: string, file: File) => {
    if (!isPdfFile(file)) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('docKey', docId)
      const res = await fetch('/api/compliance/documents', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      setDocPdfs((prev) => ({ ...prev, [docId]: url }))
      setSelectedDoc({ id: docId, type: 'pdf' })
    } catch {
      // upload failed silently
    } finally {
      setUploading(false)
    }
  }, [])

  const handleFileInputChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) void uploadPdfForDoc(docId, file)
  }

  const allCorporateItems = COMPLIANCE_GROUPS.corporate
  const selectedDocId = selectedDoc?.id
  const selectedPdfUrl = selectedDocId && selectedDoc?.type === 'pdf' ? docPdfs[selectedDocId] : undefined

  useEffect(() => {
    if (!selectedPdfUrl || !selectedDocId) {
      setDragOverPdfPreview(false)
      return
    }
    const onWindowDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes('Files')) return
      const zone = pdfDropZoneRef.current
      if (!zone) return
      const rect = zone.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      setDragOverPdfPreview(inside)
    }
    const clearDrag = () => setDragOverPdfPreview(false)
    window.addEventListener('dragover', onWindowDragOver)
    window.addEventListener('drop', clearDrag)
    window.addEventListener('dragend', clearDrag)
    return () => {
      window.removeEventListener('dragover', onWindowDragOver)
      window.removeEventListener('drop', clearDrag)
      window.removeEventListener('dragend', clearDrag)
    }
  }, [selectedPdfUrl, selectedDocId])

  const asideContent = (
    <>
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h2 className="font-canela text-lg text-[var(--text-primary)]">{t('compliance.title')}</h2>
        <button
          onClick={closeAside}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors md:hidden"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
    </>
  )

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-53px)] md:h-[calc(100vh-0px)]">
      {/* Mobile toggle bar */}
      <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <button
          onClick={() => setAsideOpen(true)}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Open documents panel"
        >
          <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-canela text-lg text-[var(--text-primary)]">{t('compliance.title')}</span>
      </div>

      {/* Mobile aside backdrop */}
      {asideOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeAside}
        />
      )}

      {/* Mobile aside drawer */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transform transition-transform duration-200 ease-in-out md:hidden',
          asideOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {asideContent}
      </aside>

      {/* Desktop aside */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
        {asideContent}
      </aside>

      <div className="flex-1 overflow-auto p-4 sm:p-6 border-l border-[var(--border-color)] scrollbar-vanilla">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="font-canela text-xl text-[var(--text-primary)]">{getDocName(selectedDoc.id)}</h2>
              <label
                className={clsx(
                  'px-4 py-2 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight text-sm cursor-pointer hover:opacity-90',
                  uploading && 'pointer-events-none opacity-60'
                )}
              >
                {docPdfs[selectedDoc.id] ? t('compliance.changePdf') : t('compliance.uploadPdf')}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleFileInputChange(selectedDoc.id, e)}
                />
              </label>
            </div>
            {docPdfs[selectedDoc.id] ? (
              <div
                ref={pdfDropZoneRef}
                className={clsx(
                  'relative flex flex-col min-h-[400px] rounded-lg overflow-hidden border-2 transition-colors bg-gray-200/90 dark:bg-gray-800/90',
                  dragOverPdfPreview ? 'border-vanilla-secondary ring-2 ring-vanilla-secondary/40' : 'border-transparent'
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragOverPdfPreview(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) void uploadPdfForDoc(selectedDoc.id, file)
                }}
              >
                {uploading && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
                    <span className="rounded-lg bg-[var(--bg-secondary)] px-4 py-2 text-sm font-interTight text-[var(--text-primary)] shadow">
                      {t('compliance.uploadingPdf')}
                    </span>
                  </div>
                )}
                {dragOverPdfPreview && (
                  <div
                    className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-vanilla-secondary bg-vanilla-secondary/15"
                    aria-hidden
                  >
                    <span className="font-interTight text-base text-[var(--text-primary)]">{t('compliance.dropPdfHint')}</span>
                  </div>
                )}
                <iframe
                  key={docPdfs[selectedDoc.id]}
                  src={docPdfs[selectedDoc.id]}
                  title={getDocName(selectedDoc.id)}
                  className={clsx(
                    'h-[min(70vh,720px)] w-full min-h-[400px] flex-1 border-0 bg-white dark:bg-gray-900',
                    dragOverPdfPreview && 'pointer-events-none'
                  )}
                />
                <div className="flex shrink-0 justify-center border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/60 p-3">
                  <a
                    href={docPdfs[selectedDoc.id]}
                    download={`${getDocName(selectedDoc.id)}.pdf`}
                    className="inline-block rounded-lg bg-vanilla-secondary px-4 py-2 font-interTight text-sm text-vanilla-main hover:opacity-90"
                  >
                    {t('clients.download')}
                  </a>
                </div>
              </div>
            ) : (
              <div
                ref={pdfDropZoneRef}
                className={clsx(
                  'rounded-lg border-2 border-dashed p-6 text-center font-interTight transition-colors sm:p-12',
                  dragOverEmptyZone
                    ? 'border-vanilla-secondary bg-vanilla-secondary/10 text-[var(--text-primary)]'
                    : 'border-[var(--border-color)] text-[var(--text-accent)]/70',
                  uploading && 'pointer-events-none opacity-60'
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragOverEmptyZone(true)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverEmptyZone(false)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragOverEmptyZone(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) void uploadPdfForDoc(selectedDoc.id, file)
                }}
              >
                <p className="mb-2">{t('compliance.noDocumentLoaded')}</p>
                <p className="mb-4 text-sm text-[var(--text-accent)]/80">{t('compliance.dropPdfZoneHint')}</p>
                <label className="inline-block cursor-pointer rounded-lg bg-vanilla-secondary/30 px-4 py-2 text-[var(--text-accent)] hover:bg-vanilla-secondary/40">
                  {t('compliance.uploadPdf')}
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => handleFileInputChange(selectedDoc.id, e)}
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
