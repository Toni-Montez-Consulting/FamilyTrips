import { describe, expect, it } from 'vitest'
import type { Day } from '../types/trip'
import { assessDayPace, makeOpenBlock } from './dayPace'

function day(items: Day['items']): Day {
  return { date: '2026-07-05', items }
}

describe('assessDayPace', () => {
  it('is not over-packed for an empty or light day', () => {
    expect(assessDayPace(day([])).overPacked).toBe(false)
    expect(assessDayPace(day([{ title: 'Beach' }, { title: 'Dinner' }])).overPacked).toBe(false)
  })

  it('flags a day with 4+ non-open items and no open block', () => {
    const result = assessDayPace(
      day([{ title: 'Aquarium' }, { title: 'Boardwalk' }, { title: 'Mini golf' }, { title: 'Dinner' }]),
    )
    expect(result.activityCount).toBe(4)
    expect(result.overPacked).toBe(true)
  })

  it('is not over-packed when an open block is present', () => {
    const result = assessDayPace(
      day([{ title: 'Aquarium' }, { title: 'Boardwalk' }, { title: 'Mini golf' }, makeOpenBlock('trip')]),
    )
    expect(result.hasOpenBlock).toBe(true)
    expect(result.overPacked).toBe(false)
  })

  it('exempts a confirmed-full day (e.g. a wedding day)', () => {
    const result = assessDayPace(
      day([
        { title: 'Get ready', status: 'confirmed' },
        { title: 'Ceremony', status: 'confirmed' },
        { title: 'Reception', status: 'confirmed' },
        { title: 'After-party' },
      ]),
    )
    expect(result.isFull).toBe(true)
    expect(result.overPacked).toBe(false)
  })

  it('makeOpenBlock produces a protected open item', () => {
    const block = makeOpenBlock('trip')
    expect(block.open).toBe(true)
    expect(block.status).toBe('suggested')
  })
})
