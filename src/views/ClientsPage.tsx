'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useToast } from '../contexts/ToastContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getClients } from '../data/clientsStore'
import type { Client } from '../types/client'
import type { Locale } from '../i18n/translations'
import clsx from 'clsx'
import StatusCircle from '../components/clients/StatusCircle'

type ListColumnKey = keyof Client | 'status' | 'principalAdministrator' | 'isPep'
type ColumnDef = { key: ListColumnKey; labelKey: string; isPdf?: boolean; isStatus?: boolean }
type ViewMode = 'list' | 'profile'
type SortKey = ListColumnKey | ''
type SortDir = 'asc' | 'desc'

const COLUMN_DEFAULT_WIDTHS: Record<string, number> = {
  status: 70,
  name: 160,
  legalName: 180,
  tradeName: 160,
  cnpj: 150,
  principalAdministrator: 180,
  cpf: 130,
  idDocument: 120,
  birthDate: 130,
  civilStatus: 120,
  email: 180,
  phone: 140,
  city: 120,
  uf: 60,
  bank: 160,
  suitabilityProfile: 170,
  isPep: 80,
  idDocumentFile: 140,
  proofOfAddressFile: 150,
}

function getColumnDefaultsForLocale(_locale: Locale): Record<string, number> {
  return { ...COLUMN_DEFAULT_WIDTHS }
}

const LIST_COLUMNS_INDIVIDUAL: ColumnDef[] = [
  { key: 'status', labelKey: 'clients.status', isStatus: true },
  { key: 'name', labelKey: 'clients.name' },
  { key: 'cpf', labelKey: 'clients.cpf' },
  { key: 'idDocument', labelKey: 'clients.id' },
  { key: 'birthDate', labelKey: 'clients.birthDate' },
  { key: 'civilStatus', labelKey: 'clients.civilStatus' },
  { key: 'email', labelKey: 'clients.email' },
  { key: 'phone', labelKey: 'clients.phone' },
  { key: 'city', labelKey: 'clients.city' },
  { key: 'uf', labelKey: 'clients.uf' },
  { key: 'bank', labelKey: 'clients.bank' },
  { key: 'suitabilityProfile', labelKey: 'clients.suitabilityProfile' },
  { key: 'isPep', labelKey: 'clients.isPep' },
  { key: 'idDocumentFile', labelKey: 'clients.idDocument', isPdf: true },
  { key: 'proofOfAddressFile', labelKey: 'clients.proofOfAddress', isPdf: true },
]

const LIST_COLUMNS_LEGAL_ENTITY: ColumnDef[] = [
  { key: 'status', labelKey: 'clients.status', isStatus: true },
  { key: 'legalName', labelKey: 'clients.legalName' },
  { key: 'tradeName', labelKey: 'clients.tradeName' },
  { key: 'cnpj', labelKey: 'CNPJ' },
  { key: 'principalAdministrator', labelKey: 'clients.principalAdministrator' },
  { key: 'email', labelKey: 'clients.email' },
  { key: 'phone', labelKey: 'clients.phone' },
  { key: 'city', labelKey: 'clients.city' },
  { key: 'uf', labelKey: 'clients.uf' },
]

function getDisplayValue(client: Client, key: ListColumnKey, t: (k: string) => string): string {
  if (key === 'status') return ''
  if (key === 'principalAdministrator') {
    const admins = client.administrators ?? []
    const principal = admins.find((a) => a.isPrincipal) ?? admins[0]
    return principal?.name ?? '-'
  }
  if (key === 'isPep') return client.isPep ? t('clients.yes') : t('clients.no')
  if (key === 'suitabilityProfile') {
    const profile = client.suitabilityProfile ?? (() => {
      const w = client.totalSuitabilityWeight ?? client.suitabilityScore
      if (w == null) return undefined
      if (w <= 26) return 'conservative'
      if (w <= 44) return 'moderate'
      return 'aggressive'
    })()
    const map: Record<string, string> = {
      conservative: t('clients.suitabilityProfileConservative'),
      moderate: t('clients.suitabilityProfileModerate'),
      aggressive: t('clients.suitabilityProfileAggressive'),
    }
    return profile ? map[profile] ?? '-' : '-'
  }
  const v = client[key as keyof Client]
  if (v === undefined || v === null) return '-'
  if (typeof v === 'object') return '-'
  if (key === 'civilStatus') {
    const map: Record<string, string> = {
      single: t('clients.single'),
      married: t('clients.married'),
      divorced: t('clients.divorced'),
      widow: t('clients.widow'),
    }
    return map[String(v)] ?? String(v)
  }
  return String(v)
}

const MAX_COL_WIDTH = 400

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { showToast } = useToast()
  const { t, locale } = useLanguage()

  const columnDefaults = useMemo(() => getColumnDefaultsForLocale(locale), [locale])
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => getColumnDefaultsForLocale(locale))
  const [resizingKey, setResizingKey] = useState<string | null>(null)
  const resizeStartX = useRef(0)
  const resizeStartWidth = useRef(0)
  const measureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setColumnWidths(columnDefaults)
  }, [locale, columnDefaults])

  const getColumnWidth = useCallback((key: string) => columnWidths[key] ?? columnDefaults[key] ?? 120, [columnWidths, columnDefaults])
  const getMinColumnWidth = useCallback((key: string) => columnDefaults[key] ?? 100, [columnDefaults])

  const handleResizeStart = useCallback((key: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingKey(key)
    resizeStartX.current = e.clientX
    resizeStartWidth.current = getColumnWidth(key)
  }, [getColumnWidth])

  const [allClients, setAllClients] = useState<Client[]>([])

  useEffect(() => {
    getClients().then(setAllClients)
  }, [refreshKey])
  const filteredClients = useMemo(() => {
    let list = allClients
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => {
        const name = c.name ?? c.legalName ?? ''
        const principalAdmin = c.administrators?.[0]?.name ?? ''
        return name.toLowerCase().includes(q) || principalAdmin.toLowerCase().includes(q)
      })
    }
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const aVal = getDisplayValue(a, sortKey, t)
        const bVal = getDisplayValue(b, sortKey, t)
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return list
  }, [allClients, search, sortKey, sortDir, t])

  const clientsByType = useMemo(() => {
    const individual = filteredClients.filter((c) => (c.clientType ?? 'individual') === 'individual')
    const legalEntity = filteredClients.filter((c) => c.clientType === 'legal_entity')
    return { individual, legalEntity }
  }, [filteredClients])

  const handleAutoFitColumn = useCallback((key: string, col: ColumnDef, clients: Client[]) => {
    if (!measureRef.current) return
    const el = measureRef.current
    el.style.fontSize = '0.875rem'
    el.style.visibility = 'hidden'
    el.style.whiteSpace = 'nowrap'

    let maxW = 0
    const headerText = col.isStatus ? t(col.labelKey) : t(col.labelKey).toUpperCase()
    el.textContent = headerText
    maxW = Math.max(maxW, el.offsetWidth + 2)

    if (col.isStatus) {
      maxW = Math.max(maxW, 50)
    } else {
      for (const client of clients) {
        const val = getDisplayValue(client, col.key, t)
        const cellText = col.isPdf ? (val === '-' ? val : t('clients.viewDownload')) : val
        el.textContent = cellText
        maxW = Math.max(maxW, el.offsetWidth + 2)
      }
    }

    const padding = 48
    const buffer = Math.max(24, maxW * 0.12)
    const newWidth = Math.max(getMinColumnWidth(key), Math.min(MAX_COL_WIDTH, maxW + padding + buffer))
    setColumnWidths((prev) => ({ ...prev, [key]: newWidth }))
  }, [t, getMinColumnWidth])

  useEffect(() => {
    if (!resizingKey) return
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current
      const minW = getMinColumnWidth(resizingKey)
      const newWidth = Math.max(minW, Math.min(MAX_COL_WIDTH, resizeStartWidth.current + delta))
      setColumnWidths((prev) => ({ ...prev, [resizingKey]: newWidth }))
    }
    const onUp = () => setResizingKey(null)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizingKey, getMinColumnWidth])

  const allFilteredFlat = [...clientsByType.individual, ...clientsByType.legalEntity]
  const selectedClient = selectedClientId
    ? allFilteredFlat.find((c) => c.id === selectedClientId) ?? allFilteredFlat[0]
    : allFilteredFlat[0]

  useEffect(() => {
    if (viewMode === 'profile' && allFilteredFlat.length > 0 && !selectedClientId) {
      setSelectedClientId(allFilteredFlat[0].id)
    }
  }, [viewMode, allFilteredFlat.length, selectedClientId])

  const handleSort = (key: ListColumnKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc')
      } else {
        setSortKey('')
        setSortDir('asc')
      }
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleCopy = (value: string, isPdf?: boolean) => {
    if (isPdf) return
    if (!value || value === '-') return
    navigator.clipboard.writeText(value)
    showToast(t('clients.copiedToClipboard'))
  }

  const handlePdfClick = (url: string | undefined) => {
    if (!url) return
    setPdfPreview(url)
  }

  return (
    <div className="p-6">
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-[-9999px] top-0 text-sm font-interTight"
        style={{ visibility: 'hidden' as const }}
      />
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-canela text-[var(--text-primary)]">{t('clients.title')}</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={t('clients.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-primary)]/60 w-64 font-interTight"
          />
          <div className="flex rounded-lg border border-[var(--border-color)] overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'px-4 py-2 text-sm font-interTight',
                viewMode === 'list'
                  ? 'bg-vanilla-secondary/30 text-[var(--text-accent)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {t('clients.list')}
            </button>
            <button
              onClick={() => setViewMode('profile')}
              className={clsx(
                'px-4 py-2 text-sm font-interTight',
                viewMode === 'profile'
                  ? 'bg-vanilla-secondary/30 text-[var(--text-accent)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {t('clients.profile')}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-8">
          {([
            { key: 'individual' as const, titleKey: 'clients.clientTypeIndividual', clients: clientsByType.individual, columns: LIST_COLUMNS_INDIVIDUAL },
            { key: 'legal_entity' as const, titleKey: 'clients.clientTypeLegalEntity', clients: clientsByType.legalEntity, columns: LIST_COLUMNS_LEGAL_ENTITY },
          ] as const).map(({ key, titleKey, clients, columns }) => (
            <div key={key}>
              <h2 className="font-canela text-lg text-[var(--text-accent)] mb-3">{t(titleKey)}</h2>
              <div className="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] scrollbar-vanilla">
                <table className="w-full text-sm table-fixed" style={{ minWidth: columns.reduce((a, col) => a + (columnWidths[String(col.key)] ?? 120), 0) }}>
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      {columns.map((col) => (
                        <th
                          key={String(col.key)}
                          style={{ width: getColumnWidth(String(col.key)), minWidth: getColumnWidth(String(col.key)), maxWidth: getColumnWidth(String(col.key)) }}
                          onClick={() => !col.isPdf && !col.isStatus && handleSort(col.key)}
                          className={clsx(
                            'px-4 py-3 text-left font-arpona uppercase tracking-wider text-[var(--text-accent)] relative overflow-hidden',
                            !col.isPdf && !col.isStatus && 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5'
                          )}
                        >
                          <span className="inline-flex items-center gap-1 truncate pr-2 min-w-0">
                            {t(col.labelKey)}
                            {sortKey === col.key && (
                              <span className="shrink-0">{sortDir === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </span>
                          <div
                            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-vanilla-secondary/50 transition-colors flex-shrink-0"
                            onMouseDown={(e) => handleResizeStart(String(col.key), e)}
                            onDoubleClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAutoFitColumn(String(col.key), col, clients)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            role="separator"
                            aria-orientation="vertical"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="px-4 py-6 text-center text-[var(--text-accent)] font-interTight">
                          {t('clients.noClientsInCategory')}
                        </td>
                      </tr>
                    ) : (
                      clients.map((client) => (
                        <tr key={client.id} className="border-b border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5">
                          {columns.map((col) => {
                            if (col.isStatus) {
                              return (
                                <td key={String(col.key)} className="px-4 py-3 overflow-hidden" style={{ width: getColumnWidth(String(col.key)), minWidth: getColumnWidth(String(col.key)), maxWidth: getColumnWidth(String(col.key)) }}>
                                  <div className="flex items-center gap-2">
                                    <StatusCircle
                                      status={client.status}
                                      clientId={client.id}
                                      onStatusChange={() => setRefreshKey((k) => k + 1)}
                                      onDelete={() => setRefreshKey((k) => k + 1)}
                                    />
                                  </div>
                                </td>
                              )
                            }
                            const val = getDisplayValue(client, col.key, t)
                            const hasPdf = col.isPdf ? (client[col.key as keyof Client] as string | undefined) : undefined
                            return (
                              <td key={String(col.key)} className="px-4 py-3 font-interTight overflow-hidden" style={{ width: getColumnWidth(String(col.key)), minWidth: getColumnWidth(String(col.key)), maxWidth: getColumnWidth(String(col.key)) }}>
                                {col.isPdf ? (
                                  <button
                                    onClick={() => handlePdfClick(hasPdf ?? undefined)}
                                    disabled={!hasPdf}
                                    className={clsx(
                                      'text-[var(--text-accent)] hover:underline truncate block w-full text-left',
                                      !hasPdf && 'opacity-50 cursor-not-allowed'
                                    )}
                                  >
                                    {hasPdf ? t('clients.viewDownload') : '-'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCopy(val, col.isPdf)}
                                    className="w-full text-left hover:bg-vanilla-secondary/10 rounded px-1 -mx-1 py-0.5 transition-colors truncate block min-w-0"
                                  >
                                    {val}
                                  </button>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6 min-h-[600px]">
          {/* Left: client list */}
          <div className="w-56 shrink-0 flex flex-col gap-4">
            <div className="font-arpona uppercase text-sm text-[var(--text-accent)]">{t('clients.title')}</div>
            <ul className="space-y-1 overflow-y-auto max-h-[500px]">
              {allFilteredFlat.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedClientId(c.id)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-sm font-interTight truncate flex items-center gap-2',
                      selectedClientId === c.id
                        ? 'bg-vanilla-secondary/20 text-[var(--text-accent)]'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                    )}
                  >
<StatusCircle
                        status={c.status}
                        clientId={c.id}
                        onStatusChange={() => setRefreshKey((k) => k + 1)}
                        onDelete={() => setRefreshKey((k) => k + 1)}
                      />
                    <span className="truncate">{c.name ?? c.legalName ?? '-'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: filter bar placeholder - per BRD "filter bar on the right" */}
          <div className="w-40 shrink-0">
            <div className="font-arpona uppercase text-sm text-[var(--text-accent)] mb-2">{t('clients.filter')}</div>
            <div className="text-sm text-[var(--text-accent)]/70 font-interTight">{t('clients.filtersComingSoon')}</div>
          </div>

          {/* Center: one-pager profile */}
          <div className="flex-1 overflow-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 scrollbar-vanilla">
            {selectedClient && (
              <ClientProfileOnePager client={selectedClient} t={t} onRefresh={() => setRefreshKey((k) => k + 1)} />
            )}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPdfPreview(null)}
        >
          <div
            className="bg-[var(--bg-secondary)] rounded-lg max-w-4xl max-h-[90vh] overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-canela">{t('clients.documentPreview')}</h3>
              <div className="flex gap-2">
                <a
                  href={pdfPreview}
                  download
                  className="px-4 py-2 bg-vanilla-secondary text-vanilla-main rounded-lg font-interTight text-sm hover:opacity-90"
                >
                  {t('clients.download')}
                </a>
                <button
                  onClick={() => setPdfPreview(null)}
                  className="px-4 py-2 border border-[var(--border-color)] rounded-lg font-interTight text-sm hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {t('clients.close')}
                </button>
              </div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded p-8 text-center text-[var(--text-accent)]">
              {t('clients.pdfViewerPlaceholder')} {pdfPreview}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getPropertyRegimeLabel(value: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    separate: t('clients.separateProperty'),
    community: t('clients.communityProperty'),
    partial_community: t('clients.partialCommunityProperty'),
    participation_in_acquets: t('clients.participationInAcquets'),
  }
  return map[value] ?? value
}

function getAccountTypeLabel(value: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    checking: t('clients.checkingAccount'),
    saving: t('clients.savingAccount'),
  }
  return map[value] ?? value
}

function ClientProfileOnePager({ client, t, onRefresh }: { client: Client; t: (k: string) => string; onRefresh: () => void }) {
  if (client.clientType === 'legal_entity') {
    return (
      <div className="space-y-6 font-interTight text-sm">
        <section>
          <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('registration.sectionBasicInformation')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AttrRow label={t('clients.legalName')} value={client.legalName} />
            <AttrRow label={t('clients.tradeName')} value={client.tradeName} />
            <AttrRow label="CNPJ" value={client.cnpj} />
            <AttrRow label={t('clients.phone')} value={client.phone} />
            <AttrRow label={t('clients.email')} value={client.email} />
          </div>
        </section>
        <section>
          <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('registration.sectionAddressInformation')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AttrRow label={t('clients.postalCode')} value={client.postalCode} />
            <AttrRow label={t('clients.address')} value={client.address} />
            <AttrRow label={t('clients.addressNumber')} value={String(client.addressNumber)} />
            <AttrRow label={t('clients.addressComplement')} value={client.addressComplement} />
            <AttrRow label={t('clients.uf')} value={client.uf} />
            <AttrRow label={t('clients.city')} value={client.city} />
          </div>
        </section>
        {(client.administrators?.length ?? 0) > 0 && (
          <section>
            <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('registration.sectionAdministratorInformation')}</h2>
            <div className="space-y-3">
              {client.administrators!.map((adm, i) => (
                <div key={i} className="p-3 border border-[var(--border-color)] rounded-lg">
                  <AttrRow label={t('clients.administratorName')} value={adm.name} />
                  <AttrRow label="CPF" value={adm.cpf} />
                  <AttrRow label={t('clients.isPep')} value={adm.isPep ? t('clients.yes') : t('clients.no')} />
                </div>
              ))}
            </div>
          </section>
        )}
        {(client.beneficialOwners?.length ?? 0) > 0 && (
          <section>
            <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('registration.sectionBeneficialOwnerInformation')}</h2>
            <div className="space-y-3">
              {client.beneficialOwners!.map((bo, i) => (
                <div key={i} className="p-3 border border-[var(--border-color)] rounded-lg">
                  {bo.kind === 'individual' ? (
                    <>
                      <AttrRow label={t('clients.beneficialOwnerName')} value={bo.name} />
                      <AttrRow label="CPF" value={bo.cpf} />
                      <AttrRow label={t('clients.isPep')} value={bo.isPep ? t('clients.yes') : t('clients.no')} />
                    </>
                  ) : (
                    <>
                      <AttrRow label={t('clients.legalName')} value={bo.legalName} />
                      <AttrRow label="CNPJ" value={bo.cnpj} />
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        <section>
          <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.compliance')}</h2>
          <div className="flex items-center gap-2">
            <StatusCircle status={client.status} clientId={client.id} onStatusChange={onRefresh} onDelete={onRefresh} />
            <span className="text-sm text-[var(--text-accent)]">
              {t(client.status === 'pending_suitability' ? 'clients.statusPendingSuitability' : client.status === 'pending_contract' ? 'clients.statusPendingContract' : 'clients.statusApproved')}
            </span>
          </div>
        </section>
      </div>
    )
  }

  if (client.clientType === 'family_group') {
    return (
      <div className="space-y-6 font-interTight text-sm">
        <section>
          <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.clientTypeFamilyGroup')}</h2>
          <p className="text-[var(--text-accent)]">{t('clients.familyGroupPlaceholder')}</p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-interTight text-sm">
      <section>
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.personalInformation')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AttrRow label={t('clients.name')} value={client.name} />
          <AttrRow label={t('clients.cpf')} value={client.cpf} />
          <AttrRow label={t('clients.id')} value={client.idDocument} />
          <AttrRow label={t('clients.issuingAuthority')} value={client.issuingAuthority} />
          <AttrRow label={t('clients.birthDate')} value={client.birthDate} />
          <AttrRow
            label={t('clients.civilStatus')}
            value={
              client.civilStatus
                ? { single: t('clients.single'), married: t('clients.married'), divorced: t('clients.divorced'), widow: t('clients.widow') }[client.civilStatus] ?? client.civilStatus
                : '-'
            }
          />
        </div>
      </section>

      {client.civilStatus === 'married' && client.maritalInfo && (
        <section>
          <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.maritalInformation')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AttrRow
              label={t('clients.propertyRegime')}
              value={getPropertyRegimeLabel(client.maritalInfo.propertyRegime, t)}
            />
            <AttrRow label={t('clients.spouseName')} value={client.maritalInfo.spouseName} />
            <AttrRow label={t('clients.spouseCpf')} value={client.maritalInfo.spouseCpf} />
            <AttrRow label={t('clients.spouseId')} value={client.maritalInfo.spouseId} />
            <AttrRow label={t('clients.spouseIssuingAuthority')} value={client.maritalInfo.spouseIssuingAuthority} />
            <AttrRow label={t('clients.spouseBirthDate')} value={client.maritalInfo.spouseBirthDate} />
          </div>
        </section>
      )}

      <section>
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.contactInformation')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AttrRow label={t('clients.phone')} value={client.phone} />
          <AttrRow label={t('clients.email')} value={client.email} />
          <AttrRow label={t('clients.postalCode')} value={client.postalCode} />
          <AttrRow label={t('clients.address')} value={client.address} />
          <AttrRow label={t('clients.addressNumber')} value={String(client.addressNumber)} />
          <AttrRow label={t('clients.addressComplement')} value={client.addressComplement} />
          <AttrRow label={t('clients.uf')} value={client.uf} />
          <AttrRow label={t('clients.city')} value={client.city} />
        </div>
      </section>

      <section>
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.bankingInformation')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AttrRow label={t('clients.bank')} value={client.bank} />
          <AttrRow label={t('clients.accountType')} value={getAccountTypeLabel(client.accountType ?? '', t)} />
          <AttrRow label={t('clients.agency')} value={client.agency} />
          <AttrRow label={t('clients.accountNumber')} value={client.accountNumber} />
        </div>
      </section>

      {client.clientType === 'individual' && (
        <section>
          <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('registration.sectionComplianceInformation')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AttrRow label={t('clients.isPep')} value={client.isPep ? t('clients.yes') : t('clients.no')} />
          </div>
        </section>
      )}

      <section>
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.documents')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AttrRow label={t('clients.idDocument')} value={client.idDocumentFile ? t('clients.uploaded') : '-'} />
          <AttrRow label={t('clients.proofOfAddress')} value={client.proofOfAddressFile ? t('clients.uploaded') : '-'} />
          {client.civilStatus === 'married' && (
            <>
              <AttrRow label={t('clients.marriageCertificate')} value={client.marriageCertificateFile ? t('clients.uploaded') : '-'} />
              <AttrRow label={t('clients.spouseIdDocument')} value={client.spouseIdDocumentFile ? t('clients.uploaded') : '-'} />
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.compliance')}</h2>
        <div className="flex items-center gap-2 mb-4">
          <StatusCircle
            status={client.status}
            clientId={client.id}
            onStatusChange={onRefresh}
            onDelete={onRefresh}
          />
          <span className="text-sm text-[var(--text-accent)]">
            {t(
              client.status === 'pending_suitability'
                ? 'clients.statusPendingSuitability'
                : client.status === 'pending_contract'
                  ? 'clients.statusPendingContract'
                  : 'clients.statusApproved'
            )}
          </span>
        </div>
        <AttrRow
          label={t('clients.suitabilityProfile')}
          value={getDisplayValue(client, 'suitabilityProfile', t)}
        />
      </section>

      {(client.suitabilityAnswers || client.totalSuitabilityWeight != null) && (
        <section>
          <h2 className="font-arpona uppercase text-[var(--text-accent)] mb-3">{t('clients.suitabilityAnswers')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {client.suitabilityAnswers &&
              Object.entries(client.suitabilityAnswers).map(([qId, weight], idx) => (
                <AttrRow key={qId} label={`${t('clients.questionWeight')} ${idx + 1}`} value={String(weight)} />
              ))}
            <AttrRow
              label={t('clients.totalSuitabilityWeight')}
              value={client.totalSuitabilityWeight != null ? String(client.totalSuitabilityWeight) : '-'}
            />
          </div>
        </section>
      )}
    </div>
  )
}

function AttrRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[var(--text-accent)]/70 text-xs font-arpona uppercase mb-0.5">{label}</div>
      <div className="text-[var(--text-primary)] font-interTight">{value ?? '-'}</div>
    </div>
  )
}
