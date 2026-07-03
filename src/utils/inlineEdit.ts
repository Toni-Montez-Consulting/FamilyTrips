// Pure builders that turn a single inline edit into a Partial<Trip> patch for the
// owner-override save path (/api/trip-overrides). Each returns ONLY the changed
// top-level field(s); the save layer merges the whole editable trip, so returning
// the full (cloned) array for the touched field preserves everything else and never
// clobbers a sibling field. Kept pure + framework-free so they are unit-testable and
// reusable by any surface (Packing, Itinerary, and future ones).
import type { ItineraryItem, PackingItem, Trip } from '../types/trip'
import { makeStableIdFromLabel } from './tripOverrides'

// --- Itinerary (items are position-indexed within a Day; they carry no id) ---

function cloneItinerary(trip: Trip): Trip['itinerary'] {
  return trip.itinerary.map((day) => ({ ...day, items: day.items.map((item) => ({ ...item })) }))
}

function dayForDate(itinerary: Trip['itinerary'], dayDate: string) {
  const day = itinerary.find((d) => d.date === dayDate)
  if (!day) throw new Error(`Itinerary day not found: ${dayDate}`)
  return day
}

export function updateItineraryItem(
  trip: Trip,
  dayDate: string,
  itemIndex: number,
  patch: Partial<ItineraryItem>,
): Partial<Trip> {
  const itinerary = cloneItinerary(trip)
  const day = dayForDate(itinerary, dayDate)
  if (itemIndex < 0 || itemIndex >= day.items.length) {
    throw new Error(`Itinerary item out of range: ${dayDate}[${itemIndex}]`)
  }
  day.items[itemIndex] = { ...day.items[itemIndex], ...patch }
  return { itinerary }
}

export function addItineraryItem(trip: Trip, dayDate: string, item: ItineraryItem): Partial<Trip> {
  const itinerary = cloneItinerary(trip)
  dayForDate(itinerary, dayDate).items.push({ ...item })
  return { itinerary }
}

export function removeItineraryItem(trip: Trip, dayDate: string, itemIndex: number): Partial<Trip> {
  const itinerary = cloneItinerary(trip)
  const day = dayForDate(itinerary, dayDate)
  if (itemIndex < 0 || itemIndex >= day.items.length) {
    throw new Error(`Itinerary item out of range: ${dayDate}[${itemIndex}]`)
  }
  day.items.splice(itemIndex, 1)
  return { itinerary }
}

// --- Packing / supplies (items carry a stable id; live in one of two arrays) ---

export type PackingSource = 'packing' | 'supplies'

export function findPackingSource(trip: Trip, itemId: string): PackingSource | null {
  if ((trip.packing ?? []).some((it) => it.id === itemId)) return 'packing'
  if ((trip.supplies ?? []).some((it) => it.id === itemId)) return 'supplies'
  return null
}

// Every id already used anywhere on the trip — so a generated id can never collide
// with a sibling and trip validation (unique-id) stays green. (Fail Loud alignment.)
export function allItemIds(trip: Trip): string[] {
  const ids: string[] = []
  const collect = (arr?: readonly { id?: string }[]) => {
    for (const entry of arr ?? []) if (entry.id) ids.push(entry.id)
  }
  collect(trip.bookings)
  collect(trip.people)
  collect(trip.contacts)
  collect(trip.thingsToDo)
  collect(trip.checklist)
  collect(trip.eventTasks)
  collect(trip.packing)
  collect(trip.supplies)
  collect(trip.food)
  collect(trip.budget)
  collect(trip.copyBlocks)
  return ids
}

export function updatePackingItem(
  trip: Trip,
  itemId: string,
  patch: Partial<PackingItem>,
): Partial<Trip> {
  const source = findPackingSource(trip, itemId)
  if (!source) throw new Error(`Packing item not found: ${itemId}`)
  const list = (trip[source] ?? []).map((it) =>
    it.id === itemId ? { ...it, ...patch, id: it.id } : { ...it },
  )
  return { [source]: list }
}

export function addPackingItem(
  trip: Trip,
  category: string,
  title: string,
  source: PackingSource,
): Partial<Trip> {
  const list = (trip[source] ?? []).map((it) => ({ ...it }))
  const id = makeStableIdFromLabel(source === 'supplies' ? 'sup' : 'pack', title, allItemIds(trip))
  list.push({ id, title, category })
  return { [source]: list }
}

export function removePackingItem(trip: Trip, itemId: string): Partial<Trip> {
  const source = findPackingSource(trip, itemId)
  if (!source) throw new Error(`Packing item not found: ${itemId}`)
  const list = (trip[source] ?? []).filter((it) => it.id !== itemId).map((it) => ({ ...it }))
  return { [source]: list }
}
