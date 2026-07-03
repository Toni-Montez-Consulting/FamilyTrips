import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, BedDouble, MapPin, Users, ListChecks, Plane, type LucideIcon } from 'lucide-react'

type Item = { to: string; label: string; icon: LucideIcon; end?: boolean }

const tripItems: Item[] = [
  { to: '', label: 'Home', icon: Home, end: true },
  { to: 'travel', label: 'Travel', icon: Plane },
  { to: 'trip', label: 'Plan', icon: CalendarDays },
  { to: 'stay', label: 'Stay', icon: BedDouble },
  { to: 'people', label: 'People', icon: Users },
  { to: 'prep', label: 'Prep', icon: ListChecks },
]

const eventItems: Item[] = [
  { to: '', label: 'Home', icon: Home, end: true },
  { to: 'trip', label: 'Plan', icon: CalendarDays },
  { to: 'stay', label: 'Place', icon: MapPin },
  { to: 'people', label: 'People', icon: Users },
  { to: 'prep', label: 'Prep', icon: ListChecks },
]

export default function BottomNav({
  basePath,
  kind = 'trip',
}: {
  basePath: string
  kind?: 'trip' | 'event'
}) {
  const items = kind === 'event' ? eventItems : tripItems

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-t border-rule"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-2xl px-2">
        {items.map((item) => {
          const to = item.to ? `${basePath}/${item.to}`.replace(/\/+/g, '/') : basePath || '/'
          const Icon = item.icon
          return (
            <li key={item.label} className="flex-1">
              <NavLink
                to={to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 px-1 py-2 min-h-[60px] text-[0.68rem] sm:text-xs font-medium transition-colors ${
                    isActive ? 'text-live' : 'text-ink-soft'
                  }`
                }
              >
                <Icon aria-hidden size={22} strokeWidth={2} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
