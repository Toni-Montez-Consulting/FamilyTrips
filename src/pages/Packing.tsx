import { useEffect, useMemo, useState } from 'react'
import { useTrip } from '../context/tripContextCore'
import Section from '../components/Section'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import PrepChipNav from '../components/PrepChipNav'
import SyncStatusChip from '../components/SyncStatusChip'
import { categorySlugs } from '../utils/slug'
import { formatPackingList } from '../utils/formatters'
import { packingStateKey, suppliesStateKey } from '../utils/packing'
import { useChecklistState } from '../hooks/useChecklistState'
import { useActor } from '../hooks/useActor'
import type { PackingItem } from '../types/trip'

const CATEGORY_ICONS: Record<string, string> = {
  'Travel docs': '🪪',
  Clothes: '👕',
  Toiletries: '🧴',
  Baby: '👶',
  'Beach / Pool': '🏖️',
  'Wedding / Event': '💒',
  Tech: '🔌',
  'Car / Road trip': '🚗',
  Dogs: '🐶',
  Food: '🍎',
  Golf: '⛳',
  Other: '🎒',
}

type MergedPackingItem = PackingItem & {
  packed: boolean
  stateKey: string
}

export function PackingView() {
  const trip = useTrip()
  const isEvent = trip.kind === 'event'
  const { actorId } = useActor(trip.slug)
  const { dbRows, status, toggle } = useChecklistState(trip.slug, actorId)

  const items = useMemo<MergedPackingItem[]>(
    () => {
      const packableItems = [
        ...(trip.packing ?? []).map((item) => ({ item, stateKey: packingStateKey(item.id) })),
        ...(trip.supplies ?? []).map((item) => ({ item, stateKey: suppliesStateKey(item.id) })),
      ]

      return packableItems.map(({ item, stateKey }) => {
        const row = dbRows.get(stateKey)
        return {
          ...item,
          packed: row ? row.done : item.packed ?? false,
          stateKey,
        }
      })
    },
    [trip.packing, trip.supplies, dbRows],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, MergedPackingItem[]>()
    for (const item of items) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return [...map.entries()]
  }, [items])

  const packed = items.filter((item) => item.packed).length
  const total = items.length
  const pct = total ? Math.round((packed / total) * 100) : 0

  // Collision-checked anchor ids for each category (Fail Loud: no silent dup ids).
  const slugMap = useMemo(() => categorySlugs(grouped.map(([c]) => c)), [grouped])

  // Per-category progress, derived from the same merged data as the page total.
  const sections = useMemo(
    () =>
      grouped.map(([cat, list]) => {
        const d = list.filter((i) => i.packed).length
        return {
          cat,
          list,
          id: slugMap.get(cat)!,
          done: d,
          total: list.length,
          fullyDone: list.length > 0 && d === list.length,
        }
      }),
    [grouped, slugMap],
  )

  // Fail Loud: per-section sums must reconcile with the page total.
  if (import.meta.env.DEV) {
    const sum = sections.reduce((a, s) => a + s.done, 0)
    if (sum !== packed) {
      console.error('Prep progress mismatch: per-section sum', sum, 'page', packed)
    }
  }

  // Auto-collapse is an INITIAL-SEED affordance only. We seed open-state once (on the
  // first render that has sections) and never re-derive it on toggle — otherwise
  // checking the last item in a section would yank it shut under the user's finger
  // mid-task. A section the user (or a chip) opened stays open even if later completed;
  // it only starts collapsed on a fresh load. Do not "fix" this into live collapse.
  // Seeded during render (React's "adjust state while rendering" pattern, not an
  // effect): when openMap is still null and sections have arrived, set it once. React
  // re-renders immediately with no intermediate DOM paint, so panels never flash
  // wide-open before collapsing, and the react-hooks set-state-in-effect rule stays
  // satisfied. Toggling only ever calls setOpen; the seed branch never runs again.
  const [openMap, setOpenMap] = useState<Record<string, boolean> | null>(null)
  if (openMap === null && sections.length) {
    // Default to a COLLAPSED directory: 79 items across ~10 groups is a wall when
    // expanded, so first paint is just the headers + counts + chip-nav. The user
    // opens the group they're working on, or "Expand all" for a single pass.
    setOpenMap(Object.fromEntries(sections.map((s) => [s.id, false])))
  }
  const isOpen = (id: string) => openMap?.[id] ?? false
  const setOpen = (id: string, next: boolean) =>
    setOpenMap((m) => ({ ...(m ?? {}), [id]: next }))
  const allOpen = sections.length > 0 && sections.every((s) => isOpen(s.id))
  const setAllOpen = (next: boolean) =>
    setOpenMap(Object.fromEntries(sections.map((s) => [s.id, next])))

  // Active chip tracking via IntersectionObserver against the section anchors.
  const [activeId, setActiveId] = useState<string | null>(null)
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActiveId(top.target.id)
      },
      { rootMargin: '-72px 0px -55% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  // Chip jump: force the section open, scroll to it, then move focus to its toggle.
  function jump(id: string) {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setOpen(id, true)
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
      el?.querySelector<HTMLElement>('button[aria-expanded]')?.focus?.()
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-ink-soft">
          {isEvent ? 'What to bring' : 'What to bring'} — {packed} of {total} packed ({pct}%).
        </p>
        <p className="text-sm text-ink-soft">
          Tap any item as it goes in the bag. Supabase syncs when configured; otherwise changes stay in this browser session.
        </p>
      </div>

      {total > 0 && (
        <div className="rounded-[8px] bg-surface border border-rule p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-soft">{isEvent ? 'Supply progress' : 'Packing progress'}</span>
            <div className="flex items-center gap-2">
              <SyncStatusChip status={status} />
              <span className="font-semibold">{pct}%</span>
            </div>
          </div>
          <div className="w-full bg-paper rounded-full h-3 overflow-hidden">
            <div
              className="bg-open h-3 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {total === 0 && (
        <EmptyState
          icon="🎒"
          title={isEvent ? 'Supply list TBD' : 'Packing list TBD'}
          body={isEvent ? 'Add supplies to this event file when the list is ready.' : 'Add packing items to this trip file when the list is ready.'}
        />
      )}

      {sections.length > 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setAllOpen(!allOpen)}
            className="min-h-11 px-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      )}

      {sections.length > 0 && (
        <PrepChipNav
          chips={sections.map((s) => ({ cat: s.cat, id: s.id, icon: CATEGORY_ICONS[s.cat] ?? '🎒' }))}
          activeId={activeId}
          onJump={jump}
        />
      )}

      {sections.map((s) => (
        <Section
          key={s.id}
          id={s.id}
          title={s.cat}
          icon={CATEGORY_ICONS[s.cat] ?? '🎒'}
          copyText={formatPackingList(s.list, `${trip.name} ${isEvent ? 'Supplies' : 'Packing'}`)}
          copyLabel="Copy section"
          collapsible
          open={isOpen(s.id)}
          onOpenChange={(next) => setOpen(s.id, next)}
          progress={{ done: s.done, total: s.total }}
        >
          <ul className="divide-y divide-rule">
            {s.list.map((item) => (
              <li key={item.id} className={`py-3 -mx-5 px-5 ${item.packed ? 'bg-paper' : ''}`}>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.packed}
                    aria-label={`Mark "${item.title}" ${item.packed ? 'unpacked' : 'packed'}`}
                    onClick={() => toggle(item.stateKey, !item.packed)}
                    className={`flex-shrink-0 mt-0.5 w-8 h-8 -m-0.5 p-0.5 rounded-full flex items-center justify-center text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-open active:scale-95 ${
                      item.packed
                        ? 'bg-open text-paper border-2 border-open hover:bg-open'
                        : 'bg-surface border-2 border-ink-soft hover:border-ink'
                    }`}
                  >
                    {item.packed ? '✓' : ''}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={item.packed ? 'text-ink-soft line-through' : 'text-ink'}>
                      {item.title}
                      {item.quantity && (
                        <span className="text-sm text-ink-soft"> · {item.quantity}</span>
                      )}
                    </p>
                    {(item.assignedTo || item.notes) && (
                      <p className="text-sm text-ink-soft mt-0.5">
                        {[item.assignedTo ? `For ${item.assignedTo}` : null, item.notes]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      {total > 0 && (
        <div className="flex justify-center">
          <CopyButton
            text={formatPackingList(items, `${trip.name} ${isEvent ? 'Supplies' : 'Packing'}`)}
            label={isEvent ? 'Copy full supply list' : 'Copy full packing list'}
            size="md"
          />
        </div>
      )}
    </div>
  )
}

export default function Packing() {
  const trip = useTrip()
  const isEvent = trip.kind === 'event'
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{isEvent ? 'Supplies' : 'Packing'}</h1>
      </header>
      <PackingView />
    </div>
  )
}
