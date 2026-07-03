import { createContext, useContext } from 'react'
import type { Trip } from '../types/trip'

export type OwnerEditValue = {
  enabled: boolean
  unlocked: boolean
  saving: boolean
  error: string | null
  unlock: (pin: string) => Promise<boolean>
  lock: () => void
  saveField: (patch: Partial<Trip>) => Promise<void>
  clearError: () => void
}

// Safe default so any surface using InlineText outside a provider (e.g. a standalone
// page) renders read-only instead of crashing. saveField/unlock are unreachable when
// enabled=false (no edit affordances render), but throw loudly if ever forced.
const DISABLED: OwnerEditValue = {
  enabled: false,
  unlocked: false,
  saving: false,
  error: null,
  unlock: async () => false,
  lock: () => {},
  saveField: async () => {
    throw new Error('Editing is not available here.')
  },
  clearError: () => {},
}

export const OwnerEditContext = createContext<OwnerEditValue>(DISABLED)

export function useOwnerEdit(): OwnerEditValue {
  return useContext(OwnerEditContext)
}
