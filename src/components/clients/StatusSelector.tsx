import { useLanguage } from '../../contexts/LanguageContext'
import { updateClientStatus } from '../../data/clientsStore'
import type { ClientOnboardingStatus } from '../../types/client'

const STATUSES: ClientOnboardingStatus[] = ['pending_suitability', 'pending_contract', 'approved']

function getStatusKey(s: ClientOnboardingStatus): string {
  const map: Record<ClientOnboardingStatus, string> = {
    pending_suitability: 'clients.statusPendingSuitability',
    pending_contract: 'clients.statusPendingContract',
    approved: 'clients.statusApproved',
  }
  return map[s] ?? 'clients.statusApproved'
}

export default function StatusSelector({
  currentStatus,
  clientId,
  onSelect,
}: {
  currentStatus: ClientOnboardingStatus
  clientId: string
  onSelect: (status: ClientOnboardingStatus) => void
}) {
  const { t } = useLanguage()

  const handleSelect = (status: ClientOnboardingStatus) => {
    updateClientStatus(clientId, status)
    onSelect(status)
  }

  return (
    <div className="absolute top-full left-0 mt-1 z-50 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg min-w-[180px]">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => handleSelect(s)}
          className={`w-full text-left px-3 py-2 text-sm font-interTight hover:bg-black/5 dark:hover:bg-white/5 ${
            s === currentStatus ? 'bg-vanilla-secondary/20 text-vanilla-secondary' : 'text-[var(--text-primary)]'
          }`}
        >
          {t(getStatusKey(s))}
        </button>
      ))}
    </div>
  )
}
