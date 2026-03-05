import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  onDelete,
}: {
  status: ClientOnboardingStatus
  clientId: string
  onStatusChange: () => void
  onDelete?: () => void
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        !(document.querySelector('[data-status-selector]')?.contains(target))
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const color = STATUS_COLORS[status] ?? '#94a3b8'

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-3 h-3 rounded-full shrink-0 border border-[var(--border-color)] flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-vanilla-secondary/50"
        style={{ backgroundColor: color }}
        aria-label={t(getStatusKey(status))}
        title={t(getStatusKey(status))}
      />
      {open &&
        buttonRef.current &&
        createPortal(
          <StatusSelector
            anchorEl={buttonRef.current}
            currentStatus={status}
            clientId={clientId}
            onSelect={() => {
              onStatusChange()
              setOpen(false)
            }}
            onDelete={
              onDelete
                ? () => {
                    onDelete()
                    setOpen(false)
                  }
                : undefined
            }
          />,
          document.body
        )}
    </div>
  )
}
