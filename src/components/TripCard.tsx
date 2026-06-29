import { Link } from 'react-router-dom'
import type { Trip } from '../types/trip'
import { daysUntil, formatDateRange } from '../utils/formatters'
import type { TripProgress } from '../hooks/useAllTripsProgress'

function statusLabel(trip: Trip): { label: string; tone: string } {
  const startIn = daysUntil(trip.startDate)
  const endIn = daysUntil(trip.endDate)
  if (endIn < 0) return { label: 'Wrapped', tone: 'text-held' }
  if (startIn <= 0) return { label: 'Happening now', tone: 'text-live' }
  if (startIn === 1) return { label: 'In 1 day', tone: 'text-live' }
  return { label: `In ${startIn} days`, tone: 'text-live' }
}

export default function TripCard({
  trip,
  progress,
}: {
  trip: Trip
  progress?: TripProgress
}) {
  const status = statusLabel(trip)
  const pct = progress && progress.total > 0
    ? Math.round((progress.done / progress.total) * 100)
    : null

  return (
    <Link
      to={`/${trip.slug}`}
      className="block overflow-hidden rounded-[8px] border border-rule border-l-4 border-l-live bg-surface transition hover:border-l-live hover:bg-paper active:scale-[0.99]"
    >
      {trip.heroImage && (
        <div className="relative h-32">
          <img src={trip.heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-ink">{trip.name}</h3>
            <p className="truncate text-sm text-ink-soft">{trip.location}</p>
          </div>
          <span className={`shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.1em] ${status.tone}`}>
            {status.label}
          </span>
        </div>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-soft">
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        {trip.tagline && <p className="text-sm text-ink">{trip.tagline}</p>}
        {progress && progress.total > 0 && pct !== null && (
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-rule">
              <div className="h-1.5 rounded-full bg-open transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-ink-soft">
              {progress.done}/{progress.total} done ({pct}%)
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
