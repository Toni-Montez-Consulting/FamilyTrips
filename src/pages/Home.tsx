import { Link } from 'react-router-dom'
import {
  CalendarDays,
  BedDouble,
  Users,
  ListChecks,
  UtensilsCrossed,
  Wallet,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { useTrip } from '../context/tripContextCore'
import CopyButton from '../components/CopyButton'
import {
  daysUntil,
  formatDateRange,
  formatDay,
  formatLongDate,
  formatTripOverview,
} from '../utils/formatters'

function todaysDay(trip: ReturnType<typeof useTrip>) {
  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return trip.itinerary.find((day) => day.date === today)
}

export default function Home() {
  const trip = useTrip()
  const isEvent = trip.kind === 'event'
  const basePath = `/${trip.slug}`
  const left = daysUntil(trip.startDate)
  const tripStarted = left <= 0
  const tripEnded = daysUntil(trip.endDate) < 0
  const today = todaysDay(trip)

  const quickLinks: { to: string; label: string; icon: LucideIcon; hint: string }[] = isEvent
    ? [
        { to: 'trip', label: 'Schedule', icon: CalendarDays, hint: 'Day-of plan' },
        ...(trip.food?.length ? [{ to: 'trip#food', label: 'Food', icon: UtensilsCrossed, hint: 'What we’re eating' }] : []),
        { to: 'prep', label: 'Prep', icon: ListChecks, hint: 'Just us — packing + to-dos' },
        { to: 'people', label: 'People', icon: Users, hint: 'Who’s coming' },
      ]
    : [
        { to: 'trip', label: 'Itinerary', icon: CalendarDays, hint: 'Day-by-day plan' },
        { to: 'stay', label: 'Stay & Bookings', icon: BedDouble, hint: 'Address, codes, flights' },
        { to: 'people', label: 'People', icon: Users, hint: 'Who’s coming' },
        { to: 'prep', label: 'Prep', icon: ListChecks, hint: 'Just us — packing + to-dos' },
      ]

  return (
    <div className="space-y-6">
      {trip.heroImage && (
        <div className="relative rounded-[8px] overflow-hidden border border-rule">
          <img src={trip.heroImage} alt="" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h1 className="text-2xl font-bold leading-tight">{trip.name}</h1>
            <p className="text-white/90">📍 {trip.location}</p>
            <p className="text-white/80 text-sm">{formatDateRange(trip.startDate, trip.endDate)}</p>
          </div>
        </div>
      )}

      {!trip.heroImage && (
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-semibold text-ink">{trip.name}</h1>
          <p className="text-ink-soft text-lg">📍 {trip.location}</p>
          <p className="text-ink-soft">{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
      )}

      <div className="rounded-[8px] border border-rule border-l-4 border-l-live bg-surface p-6 text-center">
        {tripEnded ? (
          <p className="text-3xl font-semibold text-ink">{isEvent ? 'Event wrapped 🎉' : 'Trip wrapped 🎉'}</p>
        ) : tripStarted ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-live">Happening now</p>
            <p className="text-4xl font-semibold mt-1 text-ink">{isEvent ? 'It’s happening' : 'We’re here'}</p>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-soft">
              {isEvent ? 'Event starts in' : 'Trip starts in'}
            </p>
            <p className="text-6xl font-semibold leading-none mt-2 text-live">{left}</p>
            <p className="text-ink-soft mt-1">day{left === 1 ? '' : 's'}</p>
          </>
        )}
      </div>

      {today && (
        <section className="rounded-[8px] bg-surface border border-rule p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Today</p>
              <h2 className="text-lg font-semibold text-ink">{today.title ?? formatLongDate(today.date)}</h2>
            </div>
            <CopyButton text={formatDay(today)} label="Copy today" />
          </div>
          <ul className="space-y-2">
            {today.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                {item.time && <span className="text-ink-soft font-mono text-sm w-20 shrink-0">{item.time}</span>}
                <span className="text-ink">{item.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickLinks.map((q) => {
          const Icon = q.icon
          return (
            <Link
              key={q.to}
              to={`${basePath}/${q.to}`.replace(/\/+/g, '/')}
              className="flex items-center gap-4 bg-surface border border-rule rounded-[8px] p-4 hover:border-live active:scale-[0.98] transition"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-ink-soft">
                <Icon aria-hidden size={20} strokeWidth={2} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-ink">{q.label}</span>
                <span className="block text-sm text-ink-soft">{q.hint}</span>
              </span>
              <ChevronRight aria-hidden size={18} className="text-held shrink-0" />
            </Link>
          )
        })}
      </div>

      {(!isEvent || trip.budget.length > 0) && (
        <Link
          to={`${basePath}/budget`}
          className="flex items-center gap-3 text-sm text-ink-soft hover:text-ink"
        >
          <Wallet aria-hidden size={16} className="shrink-0" />
          <span className="flex-1">Budget</span>
          <ChevronRight aria-hidden size={16} className="text-held shrink-0" />
        </Link>
      )}

      <div className="flex justify-center pt-2">
        <CopyButton
          text={formatTripOverview(trip)}
          label={isEvent ? 'Share event summary' : 'Share trip summary'}
          size="md"
        />
      </div>

      <div className="flex justify-center">
        <Link
          to={`${basePath}/manage`}
          className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          Edit this trip
        </Link>
      </div>
    </div>
  )
}
