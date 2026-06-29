import type { Trip, Person, Household, RsvpStatus } from '../types/trip'

export type RosterGroup = {
  household: Household | null // null = people with no (or an unresolved) household
  members: Person[]
}

export type RosterCounts = {
  going: number
  maybe: number
  notGoing: number
  unknown: number
  named: number // total people entered by name
  expected: number // sum of household.expectedCount (coming but not yet named)
  headcount: number // named who haven't said no, plus expected
}

export function rsvpOf(p: Person): RsvpStatus {
  return p.rsvp ?? 'unknown'
}

export function rsvpDisplay(r: RsvpStatus): { label: string; tone: string } {
  switch (r) {
    case 'going':
      return { label: 'Going', tone: 'text-open' }
    case 'maybe':
      return { label: 'Maybe', tone: 'text-ink-soft' }
    case 'not-going':
      return { label: 'Not going', tone: 'text-ink-soft' }
    default:
      return { label: 'No reply yet', tone: 'text-ink-soft' }
  }
}

// Group people under their household (preserving household order), with anyone
// whose household_id is missing or unresolved collected into a trailing group so
// they are never silently dropped.
export function buildRoster(trip: Trip): { groups: RosterGroup[]; counts: RosterCounts } {
  const households = trip.households ?? []
  const people = trip.people ?? []
  const byId = new Map(households.map((h) => [h.id, h]))

  const grouped = new Map<string, Person[]>()
  const ungrouped: Person[] = []
  for (const p of people) {
    if (p.household_id && byId.has(p.household_id)) {
      const arr = grouped.get(p.household_id) ?? []
      arr.push(p)
      grouped.set(p.household_id, arr)
    } else {
      ungrouped.push(p)
    }
  }

  const groups: RosterGroup[] = households.map((h) => ({
    household: h,
    members: grouped.get(h.id) ?? [],
  }))
  if (ungrouped.length > 0) groups.push({ household: null, members: ungrouped })

  const counts: RosterCounts = {
    going: 0,
    maybe: 0,
    notGoing: 0,
    unknown: 0,
    named: people.length,
    expected: households.reduce((sum, h) => sum + (h.expectedCount ?? 0), 0),
    headcount: 0,
  }
  for (const p of people) {
    switch (rsvpOf(p)) {
      case 'going':
        counts.going++
        break
      case 'maybe':
        counts.maybe++
        break
      case 'not-going':
        counts.notGoing++
        break
      default:
        counts.unknown++
    }
  }
  counts.headcount = people.length - counts.notGoing + counts.expected
  return { groups, counts }
}

// Strip fancy punctuation so the copied roster reads plainly in a group chat.
function plain(s: string): string {
  return s
    .replace(/[—–]/g, '-')
    .replace(/·/g, ', ')
    .replace(/…/g, '...')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
}

// Plain-text, household-grouped roster for the "Copy roster" button.
export function formatRoster(trip: Trip): string {
  const { groups, counts } = buildRoster(trip)
  const lines: string[] = [`${trip.name}: who's coming`]

  for (const g of groups) {
    lines.push('')
    lines.push((g.household ? g.household.name : 'Everyone else').toUpperCase())
    for (const p of g.members) {
      const r = rsvpOf(p)
      const tag = r === 'going' ? '' : ` (${rsvpDisplay(r).label.toLowerCase()})`
      lines.push(`- ${p.name}${p.role ? `, ${p.role}` : ''}${tag}`)
    }
    if (g.household?.expectedCount) {
      lines.push(`- plus about ${g.household.expectedCount} more, names TBD`)
    }
  }

  lines.push('')
  const summary = [`about ${counts.headcount} of us total`]
  if (counts.maybe) summary.push(`${counts.maybe} maybe`)
  if (counts.unknown) summary.push(`${counts.unknown} no reply yet`)
  lines.push(summary.join(', '))

  return plain(lines.join('\n'))
}
