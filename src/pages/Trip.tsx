import { useState } from 'react'
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
  todayLocalISO,
} from '../utils/formatters'
import InlineText from '../components/InlineText'
import InlineAddRow from '../components/InlineAddRow'
import OwnerUnlockControl from '../components/OwnerUnlockControl'
import { useOwnerEdit } from '../context/ownerEditCore'
import { addItineraryItem, removeItineraryItem, updateItineraryItem } from '../utils/inlineEdit'

function StatusPill({ value }: { value?: string }) {
  if (!value) return null
  const attention = value === 'needs-booking' || value === 'needs-confirmation'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        attention ? 'border border-live bg-surface text-live' : 'bg-paper text-ink-soft'
      }`}
    >
      {value}
    </span>
  )
}

export default function Trip() {
  const trip = useTrip()
  const isEvent = trip.kind === 'event'
  const scheduleLabel = isEvent ? 'Schedule' : 'Itinerary'
  const thingsLabel = isEvent ? 'Ideas' : 'Things to do'
  const { unlocked, saving, saveField } = useOwnerEdit()

  async function handleRemoveItem(dayDate: string, index: number, title: string) {
    if (!window.confirm(`Remove "${title}"?`)) return
    try {
      await saveField(removeItineraryItem(trip, dayDate, index))
    } catch {
      // saveField already surfaced the error + reverted; nothing to do here.
    }
  }

  // Collapse the itinerary to the day that matters: today during the trip, else the
  // first day. Seeded once (async-safe), then it's purely user-controlled.
  const today = todayLocalISO()
  const primaryDay = trip.itinerary.some((d) => d.date === today) ? today : trip.itinerary[0]?.date
  const [openDays, setOpenDays] = useState<Record<string, boolean> | null>(null)
  if (openDays === null && trip.itinerary.length) {
    setOpenDays(Object.fromEntries(trip.itinerary.map((d) => [d.date, d.date === primaryDay])))
  }
  const isDayOpen = (date: string) => openDays?.[date] ?? date === primaryDay
  const toggleDay = (date: string) =>
    setOpenDays((m) => ({ ...(m ?? {}), [date]: !(m?.[date] ?? date === primaryDay) }))

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{isEvent ? 'Schedule' : 'Plan'}</h1>
          <p className="text-ink-soft">
            {isEvent ? 'The plan for the gathering.' : 'Day-by-day plan and things to do.'}
          </p>
        </div>
        <OwnerUnlockControl className="shrink-0 mt-1" />
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
          {trip.itinerary.map((day) => {
            const open = isDayOpen(day.date)
            return (
              <article key={day.date} className="rounded-[8px] border border-rule overflow-hidden">
                <div className="flex items-stretch bg-paper">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => toggleDay(day.date)}
                    className="flex flex-1 items-center justify-between gap-3 px-4 py-3 text-left min-h-11"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink-soft">{formatLongDate(day.date)}</p>
                      {day.title && <h3 className="font-semibold text-ink">{day.title}</h3>}
                    </div>
                    <span className="flex items-center gap-2 text-ink-soft shrink-0">
                      {!open && (
                        <span className="font-mono text-xs">
                          {day.items.length} {day.items.length === 1 ? 'item' : 'items'}
                        </span>
                      )}
                      <span aria-hidden className={`text-lg leading-none transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
                    </span>
                  </button>
                  <div className="flex items-center pr-3">
                    <CopyButton text={formatDay(day)} label="Copy day" />
                  </div>
                </div>
                {open && (
                  <>
                  <ul className="divide-y divide-rule border-t border-rule">
                    {day.items.map((item, i) => (
                      <li key={`${day.date}-${i}`} className={`px-4 py-3 flex gap-4 ${item.open ? 'bg-paper' : ''}`}>
                        {unlocked ? (
                          <span className="text-ink-soft font-mono text-sm w-20 shrink-0">
                            <InlineText
                              value={item.time ?? ''}
                              onSave={(t) => saveField(updateItineraryItem(trip, day.date, i, { time: t || undefined }))}
                              label="Start time"
                              allowEmpty
                              emptyText="+ time"
                              placeholder="9:00 AM"
                            />
                          </span>
                        ) : (
                          item.time && <span className="text-ink-soft font-mono text-sm w-20 shrink-0">{item.time}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink">
                            {item.anchor && (
                              <span className="mr-2 rounded-full bg-surface border border-live px-2 py-0.5 text-xs font-semibold text-live align-middle">
                                Anchor
                              </span>
                            )}
                            <InlineText
                              value={item.title}
                              onSave={(t) => saveField(updateItineraryItem(trip, day.date, i, { title: t }))}
                              label="Item title"
                            />
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
                              className="block text-sm text-live underline decoration-rule underline-offset-2 break-words"
                            >
                              {item.address}
                            </a>
                          )}
                          {unlocked ? (
                            <p className="text-sm text-ink-soft mt-1">
                              <InlineText
                                value={item.notes ?? ''}
                                onSave={(t) => saveField(updateItineraryItem(trip, day.date, i, { notes: t || undefined }))}
                                label="Notes"
                                multiline
                                allowEmpty
                                emptyText="+ notes"
                              />
                            </p>
                          ) : (
                            item.notes && <p className="text-sm text-ink-soft mt-1">{item.notes}</p>
                          )}
                          {item.why && <p className="text-xs text-ink-soft mt-1">Why: {item.why}</p>}
                          {item.nextStep && <p className="text-xs text-ink-soft mt-1">Next: {item.nextStep}</p>}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-live underline underline-offset-2 break-all"
                            >
                              {item.link}
                            </a>
                          )}
                        </div>
                        {unlocked && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(day.date, i, item.title)}
                            disabled={saving}
                            aria-label={`Remove "${item.title}"`}
                            className="flex-shrink-0 min-h-9 px-1 text-sm text-ink-soft hover:text-live disabled:opacity-50"
                          >
                            ✕
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <InlineAddRow
                    label={`Add item to ${formatLongDate(day.date)}`}
                    addLabel="+ Add to this day"
                    onAdd={(t) => saveField(addItineraryItem(trip, day.date, { title: t }))}
                    className="px-4 py-3 border-t border-rule"
                  />
                  </>
                )}
              </article>
            )
          })}
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
