import { useCallback, useId, useOptimistic, useRef, useState, useTransition } from 'react'
import { useOwnerEdit } from '../context/ownerEditCore'

type Props = {
  value: string
  onSave: (next: string) => Promise<void>
  // Accessible name for the field, e.g. 'Item name' or 'Start time'.
  label: string
  multiline?: boolean
  // Allow saving an empty value (true for optional fields like notes/time).
  allowEmpty?: boolean
  placeholder?: string
  // Classes for the displayed text (applied in both read and owner-view states).
  className?: string
  // Muted prompt shown when the value is empty and the field is editable.
  emptyText?: string
}

// Tap-to-edit text field. For family / locked owner it renders plain text. For an
// unlocked owner it swaps to a real input on tap (right mobile keyboard, paste, SR
// semantics), saving optimistically with automatic revert + a loud error on failure.
export default function InlineText({
  value,
  onSave,
  label,
  multiline = false,
  allowEmpty = false,
  placeholder,
  className = '',
  emptyText = 'Add…',
}: Props) {
  const { enabled, unlocked } = useOwnerEdit()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [optimistic, setOptimistic] = useOptimistic(value)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const committedRef = useRef(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const errorId = useId()
  // Stable callback ref: move focus into the field (and select) once on mount, without
  // the banned autoFocus prop and without re-focusing on every keystroke.
  const focusAndSelect = useCallback((el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (el) {
      el.focus()
      el.select()
    }
  }, [])

  const editable = enabled && unlocked

  if (!editable) {
    return <span className={className}>{value}</span>
  }

  function begin() {
    setDraft(value)
    setError(null)
    committedRef.current = false
    setEditing(true)
  }

  function refocusTrigger() {
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function cancel() {
    committedRef.current = true // suppress the blur-triggered commit
    setEditing(false)
    setError(null)
    refocusTrigger()
  }

  function commit() {
    if (committedRef.current) return // guard the Enter-then-blur double fire
    committedRef.current = true
    const next = draft.trim()
    setEditing(false)
    if (next === value.trim() || (!allowEmpty && next === '')) {
      refocusTrigger()
      return
    }
    startTransition(async () => {
      setOptimistic(next)
      try {
        await onSave(next)
      } catch {
        // useOptimistic auto-reverts to `value` on the next render; surface it loudly.
        setError('Could not save. Reverted.')
      }
      refocusTrigger()
    })
  }

  if (editing) {
    const shared =
      'w-full rounded-lg border border-live bg-surface px-2 py-1 text-[16px] leading-snug focus:outline-none focus:ring-2 focus:ring-live'
    return multiline ? (
      <textarea
        ref={focusAndSelect}
        aria-label={label}
        value={draft}
        rows={2}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            commit()
          }
        }}
        className={shared}
      />
    ) : (
      <input
        ref={focusAndSelect}
        type="text"
        aria-label={label}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          }
        }}
        className={shared}
      />
    )
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={begin}
        aria-label={`Edit ${label}`}
        aria-describedby={error ? errorId : undefined}
        className={`text-left rounded underline decoration-dotted decoration-rule underline-offset-4 hover:decoration-live focus:outline-none focus-visible:ring-2 focus-visible:ring-live ${
          pending ? 'opacity-60' : ''
        } ${className}`}
      >
        {optimistic ? optimistic : <span className="text-held">{emptyText}</span>}
        <span aria-hidden className="ml-1 text-xs text-ink-soft">
          ✎
        </span>
      </button>
      {error && (
        <span id={errorId} role="alert" className="ml-2 text-xs text-live">
          {error}
        </span>
      )}
    </>
  )
}
