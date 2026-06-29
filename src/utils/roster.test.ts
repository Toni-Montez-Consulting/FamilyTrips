import { describe, it, expect } from 'vitest'
import type { Trip, Person } from '../types/trip'
import { buildRoster, formatRoster, rsvpOf, rsvpDisplay } from './roster'

function makeTrip(overrides: Partial<Trip>): Trip {
  return {
    slug: 'test',
    name: 'Test Trip',
    location: 'Somewhere',
    startDate: '2026-07-04',
    endDate: '2026-07-07',
    currency: 'USD',
    stay: { name: '', address: '', checkIn: '', checkOut: '', amenities: [] },
    bookings: [],
    itinerary: [],
    thingsToDo: [],
    people: [],
    contacts: [],
    checklist: [],
    budget: [],
    ...overrides,
  }
}

const person = (id: string, p: Partial<Person> = {}): Person => ({ id, name: id, ...p })

describe('rsvpOf', () => {
  it('defaults a missing rsvp to unknown', () => {
    expect(rsvpOf(person('a'))).toBe('unknown')
    expect(rsvpOf(person('b', { rsvp: 'going' }))).toBe('going')
  })
})

describe('rsvpDisplay', () => {
  it('maps each status to a label + token tone', () => {
    expect(rsvpDisplay('going')).toEqual({ label: 'Going', tone: 'text-open' })
    expect(rsvpDisplay('maybe').label).toBe('Maybe')
    expect(rsvpDisplay('not-going').label).toBe('Not going')
    expect(rsvpDisplay('unknown').label).toBe('No reply yet')
  })
})

describe('buildRoster grouping', () => {
  it('groups people under their household in household order', () => {
    const trip = makeTrip({
      households: [
        { id: 'h1', name: 'One' },
        { id: 'h2', name: 'Two' },
      ],
      people: [
        person('a', { household_id: 'h2' }),
        person('b', { household_id: 'h1' }),
        person('c', { household_id: 'h2' }),
      ],
    })
    const { groups } = buildRoster(trip)
    expect(groups.map((g) => g.household?.id)).toEqual(['h1', 'h2'])
    expect(groups[0].members.map((p) => p.id)).toEqual(['b'])
    expect(groups[1].members.map((p) => p.id)).toEqual(['a', 'c'])
  })

  it('puts people with no household into a trailing "Everyone else" group', () => {
    const trip = makeTrip({
      households: [{ id: 'h1', name: 'One' }],
      people: [person('a', { household_id: 'h1' }), person('b')],
    })
    const { groups } = buildRoster(trip)
    expect(groups).toHaveLength(2)
    expect(groups[1].household).toBeNull()
    expect(groups[1].members.map((p) => p.id)).toEqual(['b'])
  })

  it('never silently drops a person whose household_id does not resolve', () => {
    const trip = makeTrip({
      households: [{ id: 'h1', name: 'One' }],
      people: [person('ghost', { household_id: 'does-not-exist' })],
    })
    const { groups } = buildRoster(trip)
    const allMembers = groups.flatMap((g) => g.members.map((p) => p.id))
    expect(allMembers).toContain('ghost')
    // surfaced in the null/"everyone else" group, not under h1
    expect(groups.find((g) => g.household?.id === 'h1')!.members).toHaveLength(0)
  })

  it('keeps an empty household (expectedCount only) as a group with no members', () => {
    const trip = makeTrip({
      households: [{ id: 'h1', name: 'Family', expectedCount: 14 }],
      people: [],
    })
    const { groups } = buildRoster(trip)
    expect(groups).toHaveLength(1)
    expect(groups[0].members).toHaveLength(0)
    expect(groups[0].household?.expectedCount).toBe(14)
  })
})

describe('buildRoster counts', () => {
  it('tallies rsvp buckets and headcount including expected guests', () => {
    const trip = makeTrip({
      households: [{ id: 'h1', name: 'Fam', expectedCount: 14 }],
      people: [
        person('a', { household_id: 'h1', rsvp: 'going' }),
        person('b', { household_id: 'h1', rsvp: 'going' }),
        person('c', { household_id: 'h1', rsvp: 'maybe' }),
        person('d', { household_id: 'h1', rsvp: 'not-going' }),
        person('e', { household_id: 'h1' }), // unknown
      ],
    })
    const { counts } = buildRoster(trip)
    expect(counts.going).toBe(2)
    expect(counts.maybe).toBe(1)
    expect(counts.notGoing).toBe(1)
    expect(counts.unknown).toBe(1)
    expect(counts.named).toBe(5)
    expect(counts.expected).toBe(14)
    // 5 named - 1 not-going + 14 expected
    expect(counts.headcount).toBe(18)
  })

  it('handles an empty trip without throwing', () => {
    const { groups, counts } = buildRoster(makeTrip({}))
    expect(groups).toHaveLength(0)
    expect(counts).toMatchObject({ going: 0, named: 0, expected: 0, headcount: 0 })
  })
})

describe('formatRoster', () => {
  const trip = makeTrip({
    name: 'Myrtle',
    households: [
      { id: 'h1', name: 'The Montez family' },
      { id: 'h2', name: "Morgan's family", expectedCount: 14 },
    ],
    people: [
      person('p-toni', { name: 'Toni', household_id: 'h1', rsvp: 'going' }),
      person('p-mo', { name: 'Morgan', household_id: 'h1', rsvp: 'maybe' }),
    ],
  })

  it('renders a household-grouped plain-text roster', () => {
    const out = formatRoster(trip)
    expect(out).toContain('THE MONTEZ FAMILY')
    expect(out).toContain('- Toni')
    expect(out).toContain('(maybe)') // non-going status is tagged
    expect(out).toContain('plus about 14 more, names TBD')
    expect(out).toContain('about 16 of us total') // 2 named - 0 not-going + 14
  })

  it('strips fancy punctuation so it pastes cleanly into a chat', () => {
    const dashy = makeTrip({
      name: 'Trip',
      people: [person('x', { name: 'Kid', role: 'Daughter · 18 months — lap infant' })],
    })
    const out = formatRoster(dashy)
    expect(out).not.toMatch(/[—–·…“”‘’]/)
  })
})
