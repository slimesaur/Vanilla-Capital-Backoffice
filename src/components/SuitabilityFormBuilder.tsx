import { useState, useEffect } from 'react'
import { useToast } from '../contexts/ToastContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getForm, saveForm, getResponses, removeResponse } from '../data/suitabilityStore'
import { getClientsByCpf, updateClient } from '../data/clientsStore'
import type { SuitabilityFormData, SuitabilityQuestion } from '../types/suitability'
import type { SuitabilityResponse } from '../types/suitability'
import type { SuitabilityProfile } from '../types/client'

const DEFAULT_FORM_ID = 'default-suitability-form'

function calculateSuitabilityWeights(
  response: SuitabilityResponse,
  form: SuitabilityFormData
): { suitabilityAnswers: Record<string, number>; totalSuitabilityWeight: number } {
  const suitabilityAnswers: Record<string, number> = {}
  for (const [qId, selectedText] of Object.entries(response.answers)) {
    if (qId === 'name' || qId === 'cpf' || qId === 'email') continue
    const question = form.questions.find((q) => q.id === qId)
    const option = question?.answers.find((a) => a.text === selectedText)
    if (option) suitabilityAnswers[qId] = option.weight
  }
  const totalSuitabilityWeight = Object.values(suitabilityAnswers).reduce((a, b) => a + b, 0)
  return { suitabilityAnswers, totalSuitabilityWeight }
}

function getSuitabilityProfile(totalWeight: number): SuitabilityProfile {
  if (totalWeight <= 26) return 'conservative'
  if (totalWeight <= 44) return 'moderate'
  return 'aggressive'
}

function createQuestion(): SuitabilityQuestion {
  return {
    id: crypto.randomUUID(),
    title: '',
    answers: [
      { text: '', weight: 0 },
      { text: '', weight: 0 },
      { text: '', weight: 0 },
      { text: '', weight: 0 },
    ],
  }
}

export default function SuitabilityFormBuilder() {
  const [form, setForm] = useState<SuitabilityFormData | null>(null)
  const [responses, setResponses] = useState<ReturnType<typeof getResponses>>([])
  const [, setRefreshKey] = useState(0)
  const { showToast } = useToast()
  const { t } = useLanguage()

  const refreshResponses = () => {
    setResponses(getResponses(DEFAULT_FORM_ID))
    setRefreshKey((k) => k + 1)
  }

  useEffect(() => {
    let f = getForm(DEFAULT_FORM_ID)
    if (!f) {
      f = {
        id: DEFAULT_FORM_ID,
        questions: [],
        createdAt: new Date().toISOString(),
      }
      saveForm(f)
    }
    setForm(f)
    setResponses(getResponses(DEFAULT_FORM_ID))
  }, [])

  const handleApprove = (r: SuitabilityResponse) => {
    if (!form) return
    const cpf = String(r.answers.cpf ?? '').replace(/\D/g, '')
    const matches = getClientsByCpf(cpf)
    if (matches.length === 0) {
      showToast(t('suitabilityBuilder.noClientMatch'))
      return
    }
    if (matches.length > 1) {
      showToast(t('suitabilityBuilder.multipleClientsMatch'))
      return
    }
    const client = matches[0]
    const { suitabilityAnswers, totalSuitabilityWeight } = calculateSuitabilityWeights(r, form)
    updateClient(client.id, {
      suitabilityAnswers,
      totalSuitabilityWeight,
      suitabilityProfile: getSuitabilityProfile(totalSuitabilityWeight),
      status: 'pending_contract',
      suitabilityScore: totalSuitabilityWeight,
    })
    removeResponse(r.id)
    showToast(t('suitabilityBuilder.approvedAndLinked'))
    refreshResponses()
  }

  const addQuestion = () => {
    if (!form) return
    const next = { ...form, questions: [...form.questions, createQuestion()] }
    setForm(next)
    saveForm(next)
  }

  const updateQuestion = (qId: string, updates: Partial<SuitabilityQuestion>) => {
    if (!form) return
    const next = {
      ...form,
      questions: form.questions.map((q) =>
        q.id === qId ? { ...q, ...updates } : q
      ),
    }
    setForm(next)
    saveForm(next)
  }

  const removeQuestion = (qId: string) => {
    if (!form) return
    const next = { ...form, questions: form.questions.filter((q) => q.id !== qId) }
    setForm(next)
    saveForm(next)
  }

  const copyLink = () => {
    const url = `${window.location.origin}/suitability/fill/${DEFAULT_FORM_ID}`
    navigator.clipboard.writeText(url)
    showToast(t('suitabilityBuilder.linkCopied'))
  }

  if (!form) return null

  const shareLink = `${window.location.origin}/suitability/fill/${DEFAULT_FORM_ID}`

  return (
    <div className="space-y-6">
      <h2 className="font-canela text-xl text-[var(--text-primary)]">{t('suitabilityBuilder.title')}</h2>

      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight text-sm hover:opacity-90"
        >
          {t('suitabilityBuilder.addQuestion')}
        </button>
        <button
          onClick={copyLink}
          className="px-4 py-2 border border-vanilla-secondary text-vanilla-secondary rounded-lg font-interTight text-sm hover:bg-vanilla-secondary/10"
        >
          {t('suitabilityBuilder.copyFormLink')}
        </button>
      </div>

      <div className="text-sm text-[var(--text-secondary)]">
        <p>{t('suitabilityBuilder.shareLink')} <code className="bg-black/5 dark:bg-white/5 px-2 py-1 rounded">{shareLink}</code></p>
        <p className="mt-1">{t('suitabilityBuilder.mandatoryFieldsNote')}</p>
      </div>

      <div className="space-y-4">
        {form.questions.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]"
          >
            <div className="flex justify-between items-start gap-4 mb-3">
              <input
                type="text"
                placeholder={t('suitabilityBuilder.questionTitlePlaceholder')}
                value={q.title}
                onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                className="flex-1 px-3 py-2 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-interTight"
              />
              <button
                onClick={() => removeQuestion(q.id)}
                className="text-red-500 hover:text-red-600 px-2 py-1 text-sm"
              >
                {t('suitabilityBuilder.remove')}
              </button>
            </div>
            <div className="space-y-2">
              {q.answers.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder={`${t('suitabilityBuilder.answerPlaceholder')} ${i + 1}`}
                    value={opt.text}
                    onChange={(e) => {
                      const next = [...q.answers]
                      next[i] = { ...next[i], text: e.target.value }
                      updateQuestion(q.id, { answers: next })
                    }}
                    className="flex-1 px-3 py-2 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-interTight text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder={t('suitabilityBuilder.weightPlaceholder')}
                    value={opt.weight || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                      const next = [...q.answers]
                      next[i] = { ...next[i], weight: isNaN(val) ? 0 : val }
                      updateQuestion(q.id, { answers: next })
                    }}
                    className="w-20 px-3 py-2 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-interTight text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {form.questions.length === 0 && (
        <p className="text-[var(--text-secondary)]/70 font-interTight">{t('suitabilityBuilder.addOneQuestion')}</p>
      )}

      <section className="mt-8 pt-6 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-canela text-lg text-[var(--text-primary)]">{t('suitabilityBuilder.submittedResponses')}</h3>
          <button
            onClick={refreshResponses}
            className="text-sm text-vanilla-secondary hover:underline font-interTight"
          >
            {t('suitabilityBuilder.refresh')}
          </button>
        </div>
        {responses.length === 0 ? (
          <p className="text-[var(--text-secondary)]/70 font-interTight">{t('suitabilityBuilder.noResponsesYet')}</p>
        ) : (
          <div className="space-y-4">
            {responses.map((r) => {
              const labelMap: Record<string, string> = { name: t('suitabilityFill.name'), cpf: t('suitabilityFill.cpf'), email: t('suitabilityFill.email') }
              form.questions.forEach((q) => { labelMap[q.id] = q.title || q.id })
              return (
                <div
                  key={r.id}
                  className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="text-xs text-[var(--text-secondary)]">
                      {new Date(r.submittedAt).toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleApprove(r)}
                      className="px-3 py-1.5 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight text-sm hover:opacity-90"
                    >
                      {t('suitabilityBuilder.approve')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm font-interTight">
                    {Object.entries(r.answers).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-[var(--text-secondary)]/70">{labelMap[key] ?? key}:</span>{' '}
                        <span className="text-[var(--text-primary)]">{String(val || '-')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
