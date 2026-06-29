import { useTrip } from '../context/tripContextCore'
import Section from '../components/Section'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import { formatPerson } from '../utils/formatters'
import { buildRoster, formatRoster, rsvpOf, rsvpDisplay } from '../utils/roster'

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

export default function People() {
  const trip = useTrip()
  const { groups, counts } = buildRoster(trip)
  const householdCount = groups.filter((g) => g.household).length

  const summaryBits = [`${counts.going} going`]
  if (counts.maybe) summaryBits.push(`${counts.maybe} maybe`)
  if (counts.unknown) summaryBits.push(`${counts.unknown} no reply`)
  if (counts.expected) summaryBits.push(`~${counts.expected} more to be named`)

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">People</h1>
        <p className="text-ink-soft">Who’s coming and who to call.</p>
      </header>

      <div className="rounded-[8px] border border-rule border-l-4 border-l-live bg-surface p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Roster</p>
            <p className="mt-1 text-3xl font-semibold leading-none text-ink">
              ~{counts.headcount}{' '}
              <span className="text-base font-normal text-ink-soft">coming</span>
            </p>
          </div>
          <CopyButton text={formatRoster(trip)} label="Copy roster" />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {summaryBits.join(' · ')}
          {householdCount > 0 && (
            <>
              {' '}across {householdCount} household{householdCount === 1 ? '' : 's'}.
            </>
          )}
        </p>
      </div>

      <Section title="Who’s coming" icon="👪">
        {groups.length === 0 ? (
          <EmptyState icon="👪" title="No one added yet" body="Add the people coming on this trip." />
        ) : (
          <div className="space-y-6">
            {groups.map((g, gi) => {
              const groupCount = g.members.length + (g.household?.expectedCount ?? 0)
              return (
                <div key={g.household?.id ?? `ungrouped-${gi}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold text-ink">
                      {g.household ? g.household.name : 'Everyone else'}
                    </h3>
                    <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-soft">
                      {groupCount} {groupCount === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  {g.household?.notes && (
                    <p className="mt-1 text-sm text-ink-soft">{g.household.notes}</p>
                  )}

                  {g.members.length > 0 && (
                    <ul className="mt-2 divide-y divide-rule">
                      {g.members.map((p) => {
                        const d = rsvpDisplay(rsvpOf(p))
                        return (
                          <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <p className="font-semibold text-ink">{p.name}</p>
                                <span className={`font-mono text-[0.62rem] uppercase tracking-[0.1em] ${d.tone}`}>
                                  {d.label}
                                </span>
                              </div>
                              {p.role && <p className="text-sm text-ink-soft">{p.role}</p>}
                              {p.phone && (
                                <a
                                  href={telHref(p.phone)}
                                  className="text-live underline underline-offset-2 break-all"
                                >
                                  {p.phone}
                                </a>
                              )}
                            </div>
                            <CopyButton text={formatPerson(p)} label="Copy" />
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {g.household?.expectedCount ? (
                    <p className="mt-2 text-sm text-ink-soft">
                      + about {g.household.expectedCount} more at the condo, names added as RSVPs firm up.
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Important contacts" icon="☎️">
        {trip.contacts.length === 0 && (
          <EmptyState icon="☎️" title="No contacts yet" body="Emergency numbers, venue contacts, etc. will live here." />
        )}
        <ul className="divide-y divide-rule">
          {trip.contacts.map((c) => {
            const href =
              c.kind === 'url' ? c.value :
              c.kind === 'text' ? undefined :
              telHref(c.value)
            return (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{c.label}</p>
                  {href ? (
                    <a
                      href={href}
                      target={c.kind === 'url' ? '_blank' : undefined}
                      rel={c.kind === 'url' ? 'noopener noreferrer' : undefined}
                      className="text-live underline underline-offset-2 break-all"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className="text-ink">{c.value}</span>
                  )}
                  {c.notes && <p className="text-sm text-ink-soft mt-1">{c.notes}</p>}
                </div>
                <CopyButton text={`${c.label}: ${c.value}`} label="Copy" />
              </li>
            )
          })}
        </ul>
      </Section>
    </div>
  )
}
