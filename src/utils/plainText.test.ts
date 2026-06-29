import { describe, it, expect } from 'vitest'
import { toPlainText } from './plainText'

describe('toPlainText', () => {
  it('normalizes em dashes to spaced hyphens', () => {
    expect(toPlainText('AA — traveling with children')).toBe('AA - traveling with children')
  })

  it('normalizes en-dash ranges to hyphens', () => {
    expect(toPlainText('Jul 4–7')).toBe('Jul 4-7')
    expect(toPlainText('4:00 PM–8:30 PM')).toBe('4:00 PM-8:30 PM')
  })

  it('turns middot separators into commas', () => {
    expect(toPlainText('Daughter · 18 months · lap infant')).toBe('Daughter, 18 months, lap infant')
  })

  it('flattens smart quotes and ellipsis', () => {
    expect(toPlainText('“who’s coming…”')).toBe('"who\'s coming..."')
  })

  it('leaves already-plain text untouched (urls, phones)', () => {
    expect(toPlainText('https://www.aa.com/')).toBe('https://www.aa.com/')
    expect(toPlainText('+1 555-123-4567')).toBe('+1 555-123-4567')
  })
})
