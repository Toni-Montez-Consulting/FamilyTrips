import { describe, expect, it } from 'vitest'
import type { Trip } from '../types/trip'
import {
  addItineraryItem,
  addPackingItem,
  allItemIds,
  findPackingSource,
  removeItineraryItem,
  removePackingItem,
  updateItineraryItem,
  updatePackingItem,
} from './inlineEdit'

function baseTrip(): Trip {
  return {
    slug: 'test',
    name: 'Test Trip',
    location: 'Somewhere',
    startDate: '2026-07-04',
    endDate: '2026-07-07',
    currency: '$',
    stay: { name: 'Condo', address: '1 Main', checkIn: '4 PM', checkOut: '10 AM', amenities: [] },
    bookings: [{ id: 'b-1', kind: 'flight', title: 'Flight' }],
    itinerary: [
      { date: '2026-07-04', title: 'Arrive', items: [{ time: '4 PM', title: 'Check in' }, { title: 'Dinner' }] },
      { date: '2026-07-05', items: [{ title: 'Beach' }] },
    ],
    thingsToDo: [],
    people: [{ id: 'p-1', name: 'Toni' }],
    contacts: [{ id: 'c-1', label: 'ER', value: '911' }],
    checklist: [{ id: 'chk-1', title: 'Book car', category: 'Admin', done: false }],
    packing: [
      { id: 'pack-sunscreen', title: 'Sunscreen', category: 'Beach' },
      { id: 'pack-charger', title: 'Charger', category: 'Tech' },
    ],
    budget: [],
  }
}

describe('itinerary edits', () => {
  it('updates one item without mutating the source or clobbering siblings', () => {
    const trip = baseTrip()
    const patch = updateItineraryItem(trip, '2026-07-04', 0, { title: 'Self check-in' })
    expect(patch.itinerary?.[0].items[0].title).toBe('Self check-in')
    // Sibling item + other day untouched.
    expect(patch.itinerary?.[0].items[1].title).toBe('Dinner')
    expect(patch.itinerary?.[1].items[0].title).toBe('Beach')
    // Source trip is not mutated (immutability).
    expect(trip.itinerary[0].items[0].title).toBe('Check in')
  })

  it('adds an item to the right day', () => {
    const trip = baseTrip()
    const patch = addItineraryItem(trip, '2026-07-05', { title: 'Boardwalk' })
    expect(patch.itinerary?.[1].items.map((i) => i.title)).toEqual(['Beach', 'Boardwalk'])
    expect(trip.itinerary[1].items).toHaveLength(1)
  })

  it('removes an item by index', () => {
    const trip = baseTrip()
    const patch = removeItineraryItem(trip, '2026-07-04', 0)
    expect(patch.itinerary?.[0].items.map((i) => i.title)).toEqual(['Dinner'])
    expect(trip.itinerary[0].items).toHaveLength(2)
  })

  it('throws on an unknown day or out-of-range index (fail loud, no silent no-op)', () => {
    const trip = baseTrip()
    expect(() => updateItineraryItem(trip, '1999-01-01', 0, { title: 'x' })).toThrow()
    expect(() => removeItineraryItem(trip, '2026-07-04', 9)).toThrow()
  })
})

describe('packing edits', () => {
  it('renames one item without touching siblings and keeps its id (check-state stable)', () => {
    const trip = baseTrip()
    const patch = updatePackingItem(trip, 'pack-sunscreen', { title: 'SPF 50' })
    expect(patch.packing?.find((i) => i.id === 'pack-sunscreen')?.title).toBe('SPF 50')
    expect(patch.packing?.find((i) => i.id === 'pack-charger')?.title).toBe('Charger')
    expect(trip.packing?.[0].title).toBe('Sunscreen')
  })

  it('adds an item with a collision-free id', () => {
    const trip = baseTrip()
    const patch = addPackingItem(trip, 'Beach', 'Sunscreen', 'packing')
    const ids = patch.packing?.map((i) => i.id) ?? []
    // New id must not collide with the existing pack-sunscreen.
    expect(new Set(ids).size).toBe(ids.length)
    expect(patch.packing?.at(-1)?.title).toBe('Sunscreen')
    expect(patch.packing?.at(-1)?.category).toBe('Beach')
  })

  it('removes an item', () => {
    const trip = baseTrip()
    const patch = removePackingItem(trip, 'pack-charger')
    expect(patch.packing?.map((i) => i.id)).toEqual(['pack-sunscreen'])
    expect(trip.packing).toHaveLength(2)
  })

  it('locates the source array and throws for an unknown id', () => {
    const trip = baseTrip()
    expect(findPackingSource(trip, 'pack-charger')).toBe('packing')
    expect(findPackingSource(trip, 'nope')).toBeNull()
    expect(() => updatePackingItem(trip, 'nope', { title: 'x' })).toThrow()
  })
})

describe('allItemIds', () => {
  it('collects ids across every id-bearing array', () => {
    const ids = allItemIds(baseTrip())
    expect(ids).toContain('pack-sunscreen')
    expect(ids).toContain('chk-1')
    expect(ids).toContain('b-1')
    expect(ids).toContain('c-1')
  })
})
