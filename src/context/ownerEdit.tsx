// Owner inline-edit provider. Holds a session-only PIN unlock (in memory, never
// written to storage — matches ManageTrip's XSS hardening) and a saveField() that
// persists a Partial<Trip> patch through the existing owner-override endpoint with
// the same optimistic-concurrency (baseVersion) guard. Mounted once in Layout so an
// unlock persists across trip pages for the session. Context + hook live in
// ./ownerEditCore (keeps this file component-only for fast refresh).
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Trip } from '../types/trip'
import { editableFieldsFromTrip } from '../utils/tripOverrides'
import { isSupabaseConfigured } from '../lib/supabase'
import { OwnerEditContext, type OwnerEditValue } from './ownerEditCore'

type OwnerApiResult =
  | { ok: true; row?: { version: number }; mergedTrip?: Trip }
  | { ok: false; error: string }

async function ownerRequest(payload: Record<string, unknown>): Promise<OwnerApiResult> {
  const response = await fetch('/api/trip-overrides', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = (await response.json().catch(() => null)) as OwnerApiResult | null
  if (body) return body
  return { ok: false, error: response.ok ? 'Empty response.' : 'Owner request failed.' }
}

type ProviderProps = {
  trip: Trip
  // Only seed trips are override-backed today, so inline editing is scoped to them.
  canEdit: boolean
  version: number | undefined
  refresh: () => Promise<void>
  children: ReactNode
}

export function OwnerEditProvider({ trip, canEdit, version, refresh, children }: ProviderProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Latest version this client has confirmed via a save, so rapid sequential edits by
  // the SAME owner don't spuriously 409 while the background re-read catches up. A
  // DIFFERENT client's save still bumps the server past this, so real conflicts still
  // fail loud (never last-write-wins).
  const [savedVersion, setSavedVersion] = useState<number | undefined>(undefined)

  const enabled = canEdit && isSupabaseConfigured

  const unlock = useCallback(
    async (candidate: string) => {
      const trimmed = candidate.trim()
      if (!trimmed) {
        setError('Enter your owner PIN.')
        return false
      }
      setSaving(true)
      setError(null)
      // Validate the PIN with an owner-gated read (history) — no separate endpoint needed.
      const result = await ownerRequest({ action: 'history', tripSlug: trip.slug, pin: trimmed })
      setSaving(false)
      if (!result.ok) {
        setError(result.error || 'That PIN did not work.')
        return false
      }
      setPin(trimmed)
      setUnlocked(true)
      return true
    },
    [trip.slug],
  )

  const lock = useCallback(() => {
    setUnlocked(false)
    setPin('')
    setError(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const saveField = useCallback(
    async (patch: Partial<Trip>) => {
      if (!unlocked) throw new Error('Not unlocked.')
      setSaving(true)
      setError(null)
      const next = { ...trip, ...patch, slug: trip.slug }
      const baseVersion = Math.max(savedVersion ?? 0, version ?? 0)
      const result = await ownerRequest({
        action: 'save',
        tripSlug: trip.slug,
        pin,
        data: editableFieldsFromTrip(next),
        updatedBy: 'owner',
        baseVersion,
      })
      if (!result.ok) {
        // Fail loud: surface, re-read to resync, and throw so the field reverts.
        setSaving(false)
        setError(result.error || 'Could not save. Reverted.')
        void refresh()
        throw new Error(result.error || 'Save failed.')
      }
      if (result.row) setSavedVersion(result.row.version)
      // Broadcast so other open tabs re-read.
      window.dispatchEvent(
        new CustomEvent('familytrips:trip-overrides-changed', { detail: { tripSlug: trip.slug } }),
      )
      // Re-read the fresh trip BEFORE releasing the save lock so the next edit builds on
      // up-to-date data. With edit triggers gated on `saving`, this serializes an owner's
      // rapid multi-field edits and prevents a stale-snapshot clobber.
      try {
        await refresh()
      } catch {
        // Already persisted server-side; local state syncs on the next change event.
      }
      setSaving(false)
    },
    [unlocked, trip, pin, version, savedVersion, refresh],
  )

  const value = useMemo<OwnerEditValue>(
    () => ({ enabled, unlocked, saving, error, unlock, lock, saveField, clearError }),
    [enabled, unlocked, saving, error, unlock, lock, saveField, clearError],
  )

  return <OwnerEditContext.Provider value={value}>{children}</OwnerEditContext.Provider>
}
