import { useTrip } from '../context/tripContextCore'
import Section from '../components/Section'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import {
  formatCopyBlocks,
  formatDay,
  formatEventFoodList,
  formatItinerary,
  formatLongDate,
  mapsLink,
} from '../utils/formatters'

function StatusPill({ value }: { value?: string }) {
  if (!value) return null
  return <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-ink-soft">{value}</span>
}

export default function Trip() {
  const trip = useTrip()
  const isEvent = trip.kind === 'event'
  const scheduleLabel = isEvent ? 'Schedule' : 'Itinerary'
  const thingsLabel = isEvent ? 'Ideas' : 'Things to do'

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{isEvent ? 'Schedule' : 'Plan'}</h1>
        <p className="text-ink-soft">
          {isEvent ? 'The plan for the gathering.' : 'Day-by-day plan and things to do.'}
        </p>
      </header>

      <nav aria-label="On this page" className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        <a href="#itinerary" className="px-4 py-2 rounded-full bg-surface border border-rule text-ink text-sm font-medium">🗓️ {scheduleLabel}</a>
        {trip.food?.length ? (
          <a href="#food" className="px-4 py-2 rounded-full bg-surface border border-rule text-ink text-sm font-medium">🍽️ Food</a>
        ) : null}
        {trip.copyBlocks?.length ? (
          <a href="#messages" className="px-4 py-2 rounded-full bg-surface border border-rule text-ink text-sm font-medium">📋 Messages</a>
        ) : null}
        <a href="#things" className="px-4 py-2 rounded-full bg-surface border border-rule text-ink text-sm font-medium">📍 {thingsLabel}</a>
        {trip.planner?.sourceRefs.length ? (
          <a href="#sources" className="px-4 py-2 rounded-full bg-surface border border-rule text-ink text-sm font-medium">🔎 Sources</a>
        ) : null}
      </nav>

      <Section
        id="itinerary"
        title={scheduleLabel}
        icon="🗓️"
        copyText={trip.itinerary.length ? formatItinerary(trip) : undefined}
        copyLabel={isEvent ? 'Copy schedule' : 'Copy full itinerary'}
      >
        {trip.itinerary.length === 0 && (
          <EmptyState
            icon="🗓️"
            title={isEvent ? 'Schedule TBD' : 'Itinerary TBD'}
            body={isEvent ? 'The day-of plan will appear here as it gets set.' : 'Day-by-day plans will appear here as they’re locked in.'}
          />
        )}
        <div className="space-y-4">
          {trip.planner?.warnings.length ? (
            <div className="rounded-[8px] border border-rule border-l-4 border-l-live bg-surface p-4 text-sm text-ink-soft">
              {trip.planner.warnings[0]}
            </div>
          ) : null}
          {trip.itinerary.map((day) => (
            <article key={day.date} className="rounded-[8px] border border-rule overflow-hidden">
              <header className="flex items-center justify-between gap-3 px-4 py-3 bg-paper">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-soft">{formatLongDate(day.date)}</p>
                  {day.title && <h3 className="font-semibold text-ink">{day.title}</h3>}
                </div>
                <CopyButton text={formatDay(day)} label="Copy day" />
              </header>
              <ul className="divide-y divide-rule">
                {day.items.map((item, i) => (
                  <li key={i} className={`px-4 py-3 flex gap-4 ${item.open ? 'bg-paper' : ''}`}>
                    {item.time && <span className="text-ink-soft font-mono text-sm w-20 shrink-0">{item.time}</span>}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink">
                        {item.anchor && (
                          <span className="mr-2 rounded-full bg-surface border border-live px-2 py-0.5 text-xs font-semibold text-live align-middle">
                            Anchor
                          </span>
                        )}
                        {item.title}
                      </p>
                      {item.open ? (
                        <p className="text-sm text-ink-soft mt-1">Kept open on purpose — leave room to breathe.</p>
                      ) : (
                        <StatusPill value={item.status} />
                      )}
                      {item.address && (
                        <a
                          href={mapsLink(item.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-live underline decoration-rule underline-offset-2 break-words"
                        >
                          {item.address}
                        </a>
                      )}
                      {item.notes && <p className="text-sm text-ink-soft mt-1">{item.notes}</p>}
                      {item.why && <p className="text-xs text-ink-soft mt-1">Why: {item.why}</p>}
                      {item.nextStep && <p className="text-xs text-ink-soft mt-1">Next: {item.nextStep}</p>}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-live underline underline-offset-2 break-all"
                        >
                          {item.link}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {trip.food && trip.food.length > 0 && (
        <Section
          id="food"
          title="Food & Drinks"
          icon="🍽️"
          copyText={formatEventFoodList(trip.food, `${trip.name} Food & Drinks`)}
          copyLabel="Copy food list"
        >
          <ul className="space-y-3">
            {trip.food.map((item) => (
              <li key={item.id} className="rounded-[8px] border border-rule p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="text-xs text-ink-soft">{item.category}</p>
                    {(item.quantity || item.assignedTo || item.notes) && (
                      <p className="text-sm text-ink-soft mt-1">
                        {[item.quantity, item.assignedTo ? `From ${item.assignedTo}` : null, item.notes]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <CopyButton
                    text={[item.title, item.quantity, item.assignedTo, item.notes].filter(Boolean).join('\n')}
                    label="Copy"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {trip.copyBlocks && trip.copyBlocks.length > 0 && (
        <Section
          id="messages"
          title="Copyable Messages"
          icon="📋"
          copyText={formatCopyBlocks(trip.copyBlocks)}
          copyLabel="Copy all"
        >
          <ul className="space-y-3">
            {trip.copyBlocks.map((block) => (
              <li key={block.id} className="rounded-[8px] border border-rule p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{block.title}</p>
                    <p className="text-sm text-ink-soft whitespace-pre-line mt-1">{block.body}</p>
                  </div>
                  <CopyButton text={block.body} label="Copy" />
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="things" title={thingsLabel} icon="📍">
        {trip.thingsToDo.length === 0 && (
          <EmptyState icon="📍" title="Nothing listed yet" body={isEvent ? 'Ideas and nearby notes can go here if they matter.' : 'Ideas go here once we start picking activities.'} />
        )}
        <ul className="space-y-3">
          {trip.thingsToDo.map((a) => (
            <li key={a.id} className="rounded-[8px] border border-rule p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{a.name}</p>
                  <StatusPill value={a.status} />
                  {a.category && <p className="text-xs text-ink-soft">{a.category}</p>}
                  {a.notes && <p className="text-sm text-ink-soft mt-1">{a.notes}</p>}
                  {a.why && <p className="text-xs text-ink-soft mt-1">Why: {a.why}</p>}
                  {a.nextStep && <p className="text-xs text-ink-soft mt-1">Next: {a.nextStep}</p>}
                  {a.address && (
                    <a
                      href={mapsLink(a.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-live underline underline-offset-2 break-words mt-1 inline-block"
                    >
                      {a.address}
                    </a>
                  )}
                  {a.url && (
                    <div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-live underline underline-offset-2 break-all"
                      >
                        {a.url}
                      </a>
                    </div>
                  )}
                </div>
                <CopyButton
                  text={[a.name, a.category, a.address, a.url, a.notes].filter(Boolean).join('\n')}
                  label="Copy"
                />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {trip.planner?.sourceRefs.length ? (
        <Section id="sources" title="Sources & Confidence" icon="🔎">
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              Draft strength: <span className="font-semibold">{trip.planner.draftStrength}</span>. Confirm anything marked as booking-sensitive before relying on it.
            </p>
            <ul className="space-y-2">
              {trip.planner.sourceRefs.map((source) => (
                <li key={source.id} className="rounded-[8px] border border-rule p-3 text-sm">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-live underline underline-offset-2">
                      {source.title}
                    </a>
                  ) : (
                    <span className="font-semibold text-ink">{source.title}</span>
                  )}
                  <span className="ml-2 text-xs text-ink-soft">{source.kind}</span>
                  {source.note && <p className="mt-1 text-ink-soft">{source.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}
    </div>
  )
}
