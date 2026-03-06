'use client'

import { useState, useLayoutEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { updateClientStatus, deleteClient } from '../../data/clientsStore'
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
  anchorEl,
  currentStatus,
  clientId,
  onSelect,
  onDelete,
}: {
  anchorEl: HTMLElement
  currentStatus: ClientOnboardingStatus
  clientId: string
  onSelect: (status: ClientOnboardingStatus) => void
  onDelete?: () => void
}) {
  const { t } = useLanguage()
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = anchorEl.getBoundingClientRect()
      setPosition({ top: rect.bottom + 4, left: rect.left })
    }
    updatePosition()
    const observer = new ResizeObserver(updatePosition)
    observer.observe(anchorEl)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorEl])

  const handleSelect = async (status: ClientOnboardingStatus) => {
    await updateClientStatus(clientId, status)
    onSelect(status)
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (window.confirm(t('clients.deleteClientConfirm'))) {
      await deleteClient(clientId)
      onDelete()
    }
  }

  return (
    <div
      data-status-selector
      className="fixed z-[9999] py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg min-w-[180px]"
      style={{ top: position.top, left: position.left }}
    >
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => handleSelect(s)}
          className={`w-full text-left px-3 py-2 text-sm font-interTight hover:bg-black/5 dark:hover:bg-white/5 ${
            s === currentStatus ? 'bg-vanilla-secondary/20 text-[var(--text-accent)]' : 'text-[var(--text-primary)]'
          }`}
        >
          {t(getStatusKey(s))}
        </button>
      ))}
      {onDelete && (
        <>
          <div className="border-t border-[var(--border-color)] my-1" />
          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-left px-3 py-2 text-sm font-interTight text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            {t('clients.deleteClient')}
          </button>
        </>
      )}
    </div>
  )
}
