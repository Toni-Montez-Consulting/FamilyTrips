import { useCallback, useState } from 'react'
import { useOwnerEdit } from '../context/ownerEditCore'

// Session unlock for owner inline editing. Hidden entirely unless editing is enabled
// (seed trip + Supabase). Once unlocked it flips to a "Done editing" toggle; the
// unlock is global for the session, so tapping into edit on one page reveals the
// tap-to-edit affordances everywhere.
export default function OwnerUnlockControl({ className = '' }: { className?: string }) {
  const { enabled, unlocked, unlock, lock, saving, error, clearError } = useOwnerEdit()
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const focusInput = useCallback((el: HTMLInputElement | null) => el?.focus(), [])

  if (!enabled) return null

  if (unlocked) {
    return (
      <button
        type="button"
        onClick={() => {
          lock()
          setOpen(false)
          setPin('')
        }}
        className={`min-h-9 rounded-full border border-live bg-live px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-surface ${className}`}
      >
        Done editing
      </button>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          clearError()
        }}
        className={`min-h-9 rounded-full border border-rule px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-soft hover:text-ink ${className}`}
      >
        ✎ Edit
      </button>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await unlock(pin)
    if (ok) {
      setOpen(false)
      setPin('')
    }
  }

  return (
    <form onSubmit={submit} className={`flex flex-wrap items-center gap-2 ${className}`}>
      <input
        ref={focusInput}
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Owner PIN"
        aria-label="Owner PIN"
        aria-invalid={error ? true : undefined}
        className="w-28 rounded-lg border border-rule px-2 py-1 text-[16px] focus:outline-none focus:ring-2 focus:ring-live"
      />
      <button
        type="submit"
        disabled={saving}
        className="min-h-9 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper disabled:bg-held"
      >
        {saving ? '…' : 'Unlock'}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false)
          setPin('')
          clearError()
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
