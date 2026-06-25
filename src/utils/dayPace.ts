import type { Day, ItineraryItem, PlanKind } from '../types/trip'

export type DayPace = {
  activityCount: number
  hasOpenBlock: boolean
  confirmedCount: number
  isFull: boolean
  overPacked: boolean
}

// A protected, intentionally-unplanned block. Plain, honest framing — no gimmicks.
export function makeOpenBlock(kind?: PlanKind): ItineraryItem {
  return {
    time: kind === 'event' ? 'Buffer' : 'Afternoon',
    title: kind === 'event' ? 'Host buffer and reset' : 'Open time — leave it unplanned',
    notes: 'Protected downtime. Keep it open so the day has room to breathe.',
    status: 'suggested',
    open: true,
    why: 'Unhurried downtime is what actually recharges you.',
  }
}

// "Plan the day, not the hour." A day is over-packed when it has several activities
// and no protected open block — unless it is genuinely full on purpose (a day built
// mostly of confirmed commitments, e.g. a wedding day).
export function assessDayPace(day: Day): DayPace {
  const items = day.items ?? []
  const hasOpenBlock = items.some((item) => item.open === true)
  const activityCount = items.filter((item) => item.open !== true).length
  const confirmedCount = items.filter((item) => item.status === 'confirmed').length
  const isFull = confirmedCount >= 3
  const overPacked = activityCount >= 4 && !hasOpenBlock && !isFull
  return { activityCount, hasOpenBlock, confirmedCount, isFull, overPacked }
}
