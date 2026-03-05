import { useState, useRef, useEffect } from 'react'
import { BRAZILIAN_BANKS } from '../data/brazilianBanks'
import type { BrazilianBank } from '../data/brazilianBanks'

function normalizeSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function filterBanks(query: string): BrazilianBank[] {
  if (!query.trim()) return []
  const digits = query.replace(/\D/g, '')
  const q = normalizeSearch(query)
  return BRAZILIAN_BANKS.filter((b) => {
    if (digits.length > 0 && b.code.startsWith(digits)) return true
    if (q.length >= 2 && (normalizeSearch(b.name).includes(q) || normalizeSearch(`${b.code} ${b.name}`).includes(q))) return true
    return false
  }).slice(0, 12)
}

interface BankSelectProps {
  value: string
  onChange: (bankCode: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
}

export default function BankSelect({ value, onChange, placeholder, error, disabled }: BankSelectProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedBank = BRAZILIAN_BANKS.find((b) => b.code === value)
  const displayValue = selectedBank ? `${selectedBank.code} - ${selectedBank.name}` : value

  const filteredBanks = filterBanks(isOpen ? inputValue : '')

  useEffect(() => {
    if (!isOpen) {
      setInputValue('')
      setHighlightedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const len = filteredBanks.length
    setHighlightedIndex((i) => (i >= len ? Math.max(0, len - 1) : i))
  }, [filteredBanks.length, isOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (bank: BrazilianBank) => {
    onChange(bank.code)
    setIsOpen(false)
  }

  const handleInputChange = (v: string) => {
    setInputValue(v)
    setIsOpen(true)
    if (v.trim()) {
      const matches = filterBanks(v)
      if (matches.length === 1 && (matches[0].code === v.replace(/\D/g, '') || normalizeSearch(matches[0].name).startsWith(normalizeSearch(v)))) {
        // Don't auto-select on partial match; let user confirm
      }
    } else {
      onChange('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault()
        setIsOpen(true)
        setInputValue(displayValue)
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((i) => (i + 1) % Math.max(1, filteredBanks.length))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((i) => (i - 1 + filteredBanks.length) % Math.max(1, filteredBanks.length))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredBanks[highlightedIndex]) handleSelect(filteredBanks[highlightedIndex])
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setInputValue(displayValue)
        break
    }
  }

  const showDropdown = isOpen

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={isOpen ? inputValue : displayValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          setIsOpen(true)
          setInputValue(displayValue)
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-interTight"
      />
      {showDropdown && (
        <ul
          className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1 shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {filteredBanks.length === 0 ? (
            <li className="px-4 py-2 text-sm text-[var(--text-secondary)]">No banks found</li>
          ) : (
            filteredBanks.map((bank, i) => (
              <li
                key={bank.code}
                role="option"
                aria-selected={i === highlightedIndex}
                className={`cursor-pointer px-4 py-2 text-sm font-interTight ${
                  i === highlightedIndex ? 'bg-vanilla-secondary/20 text-vanilla-secondary' : 'text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                onMouseEnter={() => setHighlightedIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(bank)
                }}
              >
                {bank.code} - {bank.name}
              </li>
            ))
          )}
        </ul>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
