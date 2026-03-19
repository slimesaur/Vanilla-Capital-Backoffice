'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { LogIn } from 'lucide-react'
import SignInForm from './SignInForm'
import { cn } from '@/landing/lib/utils'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface SignInDropdownProps {
  triggerLabel: string
  labels: {
    email: string
    password: string
    submit: string
    submitting: string
    networkError: string
  }
}

export default function SignInDropdown({ triggerLabel, labels }: SignInDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, close])

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        const input = dialogRef.current?.querySelector<HTMLInputElement>('input[type="email"]')
        input?.focus()
      })
    }
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="pressable clip-cut-corners flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-none bg-accent-500 text-white hover:bg-accent-400 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <LogIn size={16} />
        {triggerLabel}
      </button>

      <div
        ref={dialogRef}
        className={cn(
          'absolute right-0 mt-3 w-72 rounded-none shadow-2xl ring-1 ring-white/10 border border-white/10 bg-[#1A2433] p-4 transition-all origin-top-right',
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        )}
        role="dialog"
        aria-label="Sign in"
      >
        <SignInForm
          variant="dropdown"
          labels={labels}
          onSuccess={close}
        />
      </div>
    </div>
  )
}
