import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ClientOnboardingStatus } from '../../types/client'
import StatusSelector from './StatusSelector'

function getStatusKey(s: ClientOnboardingStatus): string {
  const map: Record<ClientOnboardingStatus, string> = {
    pending_suitability: 'clients.statusPendingSuitability',
    pending_contract: 'clients.statusPendingContract',
    approved: 'clients.statusApproved',
  }
  return map[s] ?? 'clients.statusApproved'
}

const STATUS_COLORS: Record<ClientOnboardingStatus, string> = {
  pending_suitability: '#7C3AED',
  pending_contract: '#EAB308',
  approved: '#22C55E',
}

export default function StatusCircle({
  status,
  clientId,
  onStatusChange,
}: {
  status: ClientOnboardingStatus
  clientId: string
  onStatusChange: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const color = STATUS_COLORS[status] ?? '#94a3b8'

  return (
    <div ref={wrapperRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-3 h-3 rounded-full shrink-0 border border-[var(--border-color)] flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-vanilla-secondary/50"
        style={{ backgroundColor: color }}
        aria-label={t(getStatusKey(status))}
        title={t(getStatusKey(status))}
      />
      {open && (
        <StatusSelector
          currentStatus={status}
          clientId={clientId}
          onSelect={() => {
            onStatusChange()
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
