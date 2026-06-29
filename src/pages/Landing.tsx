import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listTrips } from '../data/trips'
import { useTripsWithOverrides } from '../hooks/useTripOverrides'
import { todayLocalISO, formatShortDate } from '../utils/formatters'
import CopyButton from '../components/CopyButton'

function daysUntil(dateIso: string): number {
  const start = new Date(`${todayLocalISO()}T00:00:00`)
  const target = new Date(`${dateIso}T00:00:00`)
  return Math.round((target.getTime() - start.getTime()) / 86_400_000)
}

function countdownLabel(startIso: string, endIso: string): string {
  const today = todayLocalISO()
  if (endIso < today) return 'WRAPPED'
  const d = daysUntil(startIso)
  if (d > 1) return `DEPARTS IN ${d} DAYS`
  if (d === 1) return 'DEPARTS TOMORROW'
  if (d === 0) return 'DEPARTS TODAY'
  return 'ON THE TRIP'
}

// The dominant "trip record" — the one trip the group is about to take.
function ActiveTripRecord({ trip }: { trip: ReturnType<typeof listTrips>[number] }) {
  const names = trip.people.map((p) => p.name.split(' ')[0])
  const shownNames = names.slice(0, 8).join(', ')
  const moreNames = names.length > 8 ? ` +${names.length - 8} more` : ''
  const shareText =
    `${trip.name} — ${formatShortDate(trip.startDate)}–${formatShortDate(trip.endDate)}, ${trip.location}. ` +
    `Open the plan: /${trip.slug}`

  return (
    <section className="border border-rule border-l-4 border-l-live bg-surface p-5 sm:p-6">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-live">
        Next trip · {countdownLabel(trip.startDate, trip.endDate)}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
        {trip.name}
      </h2>
      <p className="mt-1 text-ink-soft">
        {trip.location} · {formatShortDate(trip.startDate)}–{formatShortDate(trip.endDate)}
      </p>

      <p className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft">
        Who&apos;s coming · {trip.people.length}
      </p>
      <p className="mt-1 leading-relaxed text-ink">
        {shownNames}
        {moreNames}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          to={`/${trip.slug}`}
          className="inline-flex min-h-12 items-center rounded-[6px] bg-ink px-5 font-mono text-xs uppercase tracking-[0.12em] text-paper shadow-sm transition active:scale-[0.98]"
        >
          Open the trip →
        </Link>
        <CopyButton text={shareText} label="Copy for the group" />
      </div>
    </section>
  )
}

// A quiet line for every other trip — held, not lifted.
function TripLine({ trip }: { trip: ReturnType<typeof listTrips>[number] }) {
  const wrapped = trip.endDate < todayLocalISO()
  return (
    <li>
      <Link
        to={`/${trip.slug}`}
        className="flex items-baseline justify-between gap-4 border-b border-rule py-3 transition hover:text-live"
      >
        <span className="font-display text-lg">{trip.name}</span>
        <span className={`shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft ${wrapped ? 'line-through' : ''}`}>
          {formatShortDate(trip.startDate)}
        </span>
      </Link>
    </li>
  )
}

export default function Landing() {
  const seedTrips = useMemo(() => listTrips(), [])
  const { trips } = useTripsWithOverrides(seedTrips)
  const navigate = useNavigate()
  const [openSlug, setOpenSlug] = useState('')

  const today = todayLocalISO()
  const active = trips.find((t) => t.endDate >= today) ?? trips[0]
  const others = trips.filter((t) => t.slug !== active?.slug)

  function handleOpen(event: FormEvent) {
    event.preventDefault()
    const slug = openSlug
      .trim()
      .replace(/^https?:\/\/[^/]+\//i, '')
      .replace(/^\/+|\/+$/g, '')
      .split(/[/?#]/)[0]
    if (slug) navigate(`/${slug}`)
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:border focus:border-rule focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <main id="main" className="mx-auto w-full max-w-2xl px-5 pb-16 pt-10 sm:px-6">
        <header>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
            One link the whole group opens
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
            Family Trips
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
            The plan, who&apos;s coming, where you&apos;re staying, and what to bring — in one place,
            with clean blocks to paste straight into the group chat.
          </p>
        </header>

        {active && (
          <div className="mt-9">
            <ActiveTripRecord trip={active} />
          </div>
        )}

        {others.length > 0 && (
          <section className="mt-10">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft">
              The rest of the trips
            </p>
            <ul className="mt-2">
              {others.map((trip) => (
                <TripLine key={trip.slug} trip={trip} />
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 border-t border-rule pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/trips/new"
              className="inline-flex min-h-12 items-center rounded-[6px] border border-ink px-5 font-mono text-xs uppercase tracking-[0.12em] text-ink transition hover:bg-ink hover:text-paper active:scale-[0.98]"
            >
              Start a trip
            </Link>
            <Link
              to="/trips"
              className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft underline-offset-4 hover:underline"
            >
              All trips
            </Link>
          </div>

          <form onSubmit={handleOpen} className="mt-6">
            <label htmlFor="open-shared" className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft">
              Got a shared link?
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="open-shared"
                value={openSlug}
                onChange={(e) => setOpenSlug(e.target.value)}
                placeholder="paste the link or trip name"
                className="min-h-12 w-full rounded-[6px] border border-rule bg-surface px-3 text-ink placeholder:text-ink-soft focus:border-ink focus:outline-none"
              />
              <button
                type="submit"
                className="min-h-12 shrink-0 rounded-[6px] bg-ink px-4 font-mono text-xs uppercase tracking-[0.12em] text-paper active:scale-[0.98]"
              >
                Open
              </button>
            </div>
          </form>

          <p className="mt-10 font-display text-base italic text-ink-soft">
            Plan the day, not the hour. One anchor a day, the rest stays open.
          </p>
        </section>
      </main>
    </div>
  )
}
