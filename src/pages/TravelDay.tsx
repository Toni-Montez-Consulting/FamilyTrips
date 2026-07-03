import { useSearchParams } from 'react-router-dom'
import { useTrip } from '../context/tripContextCore'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import SyncStatusChip from '../components/SyncStatusChip'
import { useChecklistState } from '../hooks/useChecklistState'
import { useActor } from '../hooks/useActor'
import type { TravelSegment } from '../types/trip'

function travelStateKey(itemId: string) {
  return `travel:${itemId}`
}

// Plain-text of the whole day for the "Copy the day" -> group chat handoff.
function formatSegment(seg: TravelSegment): string {
  const lines: string[] = [`${seg.label}${seg.route ? ` — ${seg.route}` : ''}`]
  if (seg.beforeYouLeave?.length) {
    lines.push('', 'BEFORE WE LEAVE')
    for (const b of seg.beforeYouLeave) lines.push(`- ${b.text}`)
  }
  lines.push('', 'RUN OF SHOW')
  for (const s of seg.runOfShow) {
    lines.push(`${s.time ? `${s.time} — ` : ''}${s.title}`)
    if (s.detail) lines.push(`  ${s.detail}`)
  }
  if (seg.carrying?.length) {
    lines.push('', 'CARRYING')
    for (const c of seg.carrying) lines.push(`- ${c}`)
  }
  if (seg.note) lines.push('', seg.note)
  return lines.join('\n')
}

export default function TravelDay() {
  const trip = useTrip()
  const segments = trip.travelPlan ?? []
  const { actorId } = useActor(trip.slug)
  const { dbRows, status, toggle } = useChecklistState(trip.slug, actorId)

  const [searchParams, setSearchParams] = useSearchParams()
  const rawSeg = searchParams.get('seg')
  const active = segments.find((s) => s.id === rawSeg) ?? segments[0]

  function select(id: string) {
    const next = new URLSearchParams(searchParams)
    next.set('seg', id)
    setSearchParams(next, { replace: true })
  }

  if (!active) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold">Travel Day</h1>
        </header>
        <EmptyState icon="✈️" title="No travel days set" body="Flights and travel-day plans will show up here." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold">Travel Day</h1>
          <span className="rounded-full bg-live px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-surface">
            Just us
          </span>
        </div>
        <p className="text-ink-soft">The run-of-show + the checklist for each travel day.</p>
      </header>

      {segments.length > 1 && (
        <div role="tablist" aria-label="Travel day" className="inline-flex rounded-full border border-rule p-1">
          {segments.map((seg) => {
            const isActive = seg.id === active.id
            return (
              <button
                key={seg.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => select(seg.id)}
                className={`min-h-11 px-4 rounded-full text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {seg.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="rounded-[8px] border border-rule border-l-4 border-l-live bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-live">{active.label}</p>
            {active.route && <p className="mt-1 text-xl font-semibold text-ink">{active.route}</p>}
          </div>
          <CopyButton text={formatSegment(active)} label="Copy the day" />
        </div>
        {active.note && <p className="mt-2 text-sm text-ink-soft">{active.note}</p>}
      </div>

      {active.beforeYouLeave?.length ? (
        <section className="bg-surface rounded-[8px] border border-rule overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-rule">
            <h2 className="text-xl font-semibold text-ink">Before we leave</h2>
            <SyncStatusChip status={status} />
          </header>
          <ul className="divide-y divide-rule">
            {active.beforeYouLeave.map((item) => {
              const key = travelStateKey(item.id)
              const done = dbRows.get(key)?.done ?? false
              return (
                <li key={item.id} className={`px-5 py-3 ${done ? 'bg-paper' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      aria-label={`Mark "${item.text}" ${done ? 'not done' : 'done'}`}
                      onClick={() => toggle(key, !done)}
                      className={`flex-shrink-0 mt-0.5 w-8 h-8 -m-0.5 p-0.5 rounded-full flex items-center justify-center text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-open active:scale-95 ${
                        done
                          ? 'bg-open text-paper border-2 border-open'
                          : 'bg-surface border-2 border-ink-soft hover:border-ink'
                      }`}
                    >
                      {done ? '✓' : ''}
                    </button>
                    <span className={done ? 'text-ink-soft line-through' : 'text-ink'}>{item.text}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <section className="bg-surface rounded-[8px] border border-rule overflow-hidden">
        <header className="px-5 py-4 border-b border-rule">
          <h2 className="text-xl font-semibold text-ink">Run of show</h2>
        </header>
        <ol className="divide-y divide-rule">
          {active.runOfShow.map((step, i) => (
            <li key={i} className="px-5 py-3 flex gap-4">
              <span className="text-live font-mono text-sm w-24 shrink-0">{step.time ?? ''}</span>
              <div className="min-w-0">
                <p className="font-medium text-ink">{step.title}</p>
                {step.detail && <p className="text-sm text-ink-soft mt-0.5">{step.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {active.carrying?.length ? (
        <section className="bg-surface rounded-[8px] border border-rule overflow-hidden">
          <header className="px-5 py-4 border-b border-rule">
            <h2 className="text-xl font-semibold text-ink">What we’re carrying</h2>
          </header>
          <ul className="p-5 space-y-2">
            {active.carrying.map((c, i) => (
              <li key={i} className="flex gap-2 text-ink">
                <span aria-hidden className="text-ink-soft">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
