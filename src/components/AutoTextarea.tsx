'use client'

import { useLayoutEffect, useRef } from 'react'
import clsx from 'clsx'

const MIN_HEIGHT_PX = 56
const MAX_HEIGHT_PX = 300

type AutoTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'rows' | 'style'
> & {
  value: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
}

export default function AutoTextarea({ value, onChange, className, ...rest }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    const next = Math.min(MAX_HEIGHT_PX, Math.max(MIN_HEIGHT_PX, el.scrollHeight))
    el.style.height = `${next}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={2}
      className={clsx(className)}
      style={{
        maxHeight: MAX_HEIGHT_PX,
        minHeight: MIN_HEIGHT_PX,
        overflowY: 'auto',
        resize: 'none',
        whiteSpace: 'pre-wrap',
        boxSizing: 'border-box',
      }}
      {...rest}
    />
  )
}
