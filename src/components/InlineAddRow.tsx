import { useCallback, useState } from 'react'
import { useOwnerEdit } from '../context/ownerEditCore'

type Props = {
  // Accessible label, e.g. 'Add packing item to Beach'.
  label: string
  addLabel?: string
  placeholder?: string
  onAdd: (text: string) => Promise<void>
  className?: string
}

// Owner-only "+ add" affordance: a button that reveals a real input, adds on Enter,
// closes on Escape. Renders nothing for family / a locked owner.
export default function InlineAddRow({
  label,
  addLabel = '+ Add item',
  placeholder = 'Add item',
  onAdd,
  className = '',
}: Props) {
  const { enabled, unlocked } = useOwnerEdit()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const focusInput = useCallback((el: HTMLInputElement | null) => el?.focus(), [])

  if (!enabled || !unlocked) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = text.trim()
    if (!next || saving) return
    setSaving(true)
    setError(null)
    try {
      await onAdd(next)
      setText('')
      setOpen(false)
    } catch {
      setError('Could not add. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`min-h-9 text-sm text-live hover:underline underline-offset-4 ${className}`}
      >
        {addLabel}
      </button>
    )
  }

  return (
    <form onSubmit={submit} className={`flex items-center gap-2 ${className}`}>
      <input
        ref={focusInput}
        type="text"
        value={text}
        aria-label={label}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            setText('')
            setError(null)
          }
        }}
        className="flex-1 rounded-lg border border-live bg-surface px-2 py-1 text-[16px] focus:outline-none focus:ring-2 focus:ring-live"
      />
      <button
        type="submit"
        disabled={saving}
        className="min-h-9 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper disabled:bg-held"
      >
        {saving ? '…' : 'Add'}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false)
          setText('')
          setError(null)
        }}
        className="min-h-9 px-1 text-xs text-ink-soft hover:text-ink"
      >
        Cancel
      </button>
      {error && (
        <span role="alert" className="text-xs text-live">
          {error}
        </span>
      )}
    </form>
  )
}
