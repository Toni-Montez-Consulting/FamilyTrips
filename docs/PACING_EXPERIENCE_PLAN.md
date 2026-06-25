# Pacing & Human Experience — Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans (inline, recommended for this slice — the files are tightly coupled) or subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Weave "plan the day, not the hour — one anchor a day, the rest stays open" into the planner so trips optimize for the traveler's recharge, not itinerary density.

**Architecture:** Two zero-migration optional markers on `ItineraryItem` (`anchor`, `open`); a pure `assessDayPace` heuristic; the generator defaults to calm days (anchor + an open block); the public itinerary renders open/anchor intentionally; and the owner's itinerary panel shows a gentle, dismissible over-packed nudge that reuses the existing open-block helper.

**Tech Stack:** Vite + React 19 + TS + Tailwind v4, vitest. Trips stored as Supabase JSONB (so new optional `ItineraryItem` fields need no DB migration).

## Global Constraints

- **Integrity (hard):** no fabricated stats, no fear/FOMO/guilt/streaks; every nudge is a gentle, dismissible *offer* phrased as a question. (`docs/PACING_EXPERIENCE_SPEC.md`)
- **Over-packed threshold:** a non-event day with **≥4 non-open items and no open block and fewer than 3 confirmed items**.
- **Markers are descriptive, not enforced** — `validateTripData` adds no hard rules; a wedding day may have zero open blocks.
- Full gate before "done": `npm run privacy:scan && npm run validate:data && npm run lint && npm run test && npm run build`.
- Spec: `docs/PACING_EXPERIENCE_SPEC.md`.

---

### Task 1: `assessDayPace` heuristic + `ItineraryItem` markers

**Files:**
- Modify: `src/types/trip.ts` (`ItineraryItem`, ~lines 135-141)
- Create: `src/utils/dayPace.ts`
- Test: `src/utils/dayPace.test.ts`

**Interfaces:**
- Produces: `assessDayPace(day: Day): DayPace`; `makeOpenBlock(kind?: PlanKind): ItineraryItem`; `type DayPace = { activityCount: number; hasOpenBlock: boolean; confirmedCount: number; isFull: boolean; overPacked: boolean }`.

- [ ] **Step 1: Add the markers to the type.** In `src/types/trip.ts`, extend `ItineraryItem`:

```ts
export type ItineraryItem = PlannerAnnotated & {
  time?: string
  title: string
  notes?: string
  address?: string
  link?: string
  anchor?: boolean
  open?: boolean
}
```

- [ ] **Step 2: Write the failing test** (`src/utils/dayPace.test.ts`):

```ts
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
    const result = assessDayPace(day([
      { title: 'Aquarium' }, { title: 'Boardwalk' }, { title: 'Mini golf' }, { title: 'Dinner' },
    ]))
    expect(result.activityCount).toBe(4)
    expect(result.overPacked).toBe(true)
  })

  it('is not over-packed when an open block is present', () => {
    const result = assessDayPace(day([
      { title: 'Aquarium' }, { title: 'Boardwalk' }, { title: 'Mini golf' }, makeOpenBlock('trip'),
    ]))
    expect(result.hasOpenBlock).toBe(true)
    expect(result.overPacked).toBe(false)
  })

  it('exempts a confirmed-full day (e.g. a wedding day)', () => {
    const result = assessDayPace(day([
      { title: 'Get ready', status: 'confirmed' },
      { title: 'Ceremony', status: 'confirmed' },
      { title: 'Reception', status: 'confirmed' },
      { title: 'After-party' },
    ]))
    expect(result.isFull).toBe(true)
    expect(result.overPacked).toBe(false)
  })

  it('makeOpenBlock produces a protected open item', () => {
    const block = makeOpenBlock('trip')
    expect(block.open).toBe(true)
    expect(block.status).toBe('suggested')
  })
})
```

- [ ] **Step 3: Run it, verify it fails.** `cd /c/Users/tonimontez/FamilyTrips && npx vitest run src/utils/dayPace.test.ts` → FAIL ("assessDayPace is not a function").

- [ ] **Step 4: Implement** (`src/utils/dayPace.ts`):

```ts
import type { Day, ItineraryItem, PlanKind } from '../types/trip'

export type DayPace = {
  activityCount: number
  hasOpenBlock: boolean
  confirmedCount: number
  isFull: boolean
  overPacked: boolean
}

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

export function assessDayPace(day: Day): DayPace {
  const items = day.items ?? []
  const hasOpenBlock = items.some((item) => item.open === true)
  const activityCount = items.filter((item) => item.open !== true).length
  const confirmedCount = items.filter((item) => item.status === 'confirmed').length
  const isFull = confirmedCount >= 3
  const overPacked = activityCount >= 4 && !hasOpenBlock && !isFull
  return { activityCount, hasOpenBlock, confirmedCount, isFull, overPacked }
}
```

- [ ] **Step 5: Run tests, verify pass.** `npx vitest run src/utils/dayPace.test.ts` → PASS. Then `npx tsc -b` → exit 0.

- [ ] **Step 6: Commit** (hold for owner approval — see handoff): `git add src/types/trip.ts src/utils/dayPace.ts src/utils/dayPace.test.ts && git commit -m "feat(pacing): add assessDayPace heuristic + anchor/open item markers"`

---

### Task 2: Share the open-block helper with `looser-day`

**Files:**
- Modify: `src/utils/tripAssist.ts` (looser-day branch, ~lines 516-525)

**Interfaces:**
- Consumes: `makeOpenBlock` from Task 1.

- [ ] **Step 1: Failing test** — add to `src/server/tripOverrideActions.test.ts` (the existing assistPreview harness) a case asserting `looser-day` produces an item with `open === true`. Use the existing dynamic-trip pattern; call `assistAction: 'looser-day'` and assert `result.body.assist.mergedTrip.itinerary.some(d => d.items.some(i => i.open === true))`.

- [ ] **Step 2: Run, verify fail** (`open` not yet set). `npx vitest run src/server/tripOverrideActions.test.ts`.

- [ ] **Step 3: Implement.** In `tripAssist.ts`, import `makeOpenBlock` and replace the `looser-day` inserted object (lines 517-523) so it spreads `makeOpenBlock(next.kind)` (preserving the existing splice position and summary push). Keep the `/buffer|downtime|reset/i` guard but also treat an existing `open` item as "already loose":

```ts
if (action === 'looser-day' && !day.items.some((item) => item.open === true || /buffer|downtime|reset/i.test(item.title))) {
  day.items.splice(Math.min(day.items.length, 2), 0, makeOpenBlock(next.kind))
  summary.push(`Added open time to ${day.date}.`)
}
```

- [ ] **Step 4: Run tests, verify pass.** `npx vitest run src/server/tripOverrideActions.test.ts` → PASS.

- [ ] **Step 5: Commit** (hold): `git add src/utils/tripAssist.ts src/server/tripOverrideActions.test.ts && git commit -m "refactor(pacing): looser-day reuses shared open-block helper"`

---

### Task 3: Calm-by-default generation (anchor + open block)

**Files:**
- Modify: `src/utils/tripGeneration.ts` (`makeItinerary`, ~lines 1303-1380)
- Test: `src/utils/tripGeneration.test.ts` (mirror existing setup in that file)

**Interfaces:**
- Consumes: `makeOpenBlock` from Task 1.

- [ ] **Step 1: Failing test.** In `tripGeneration.test.ts`, using the file's existing public generation entrypoint and a multi-day trip brief, assert that a middle day (not first/last) contains exactly one item with `anchor === true` and at least one item with `open === true`, and that the first and last days contain no `open` block.

- [ ] **Step 2: Run, verify fail.** `npx vitest run src/utils/tripGeneration.test.ts`.

- [ ] **Step 3: Implement** in `makeItinerary` (`src/utils/tripGeneration.ts`):
  - After the per-day `items` array is fully built (after the must-dos loop and dinner), for **middle days only** (`!isFirst && !isLast`):
    - Tag the anchor: set `anchor: true` on the first must-do item if one was placed, else on the first non-open item.
    - If `next`/the day is not confirmed-full (`items.filter(i => i.status === 'confirmed').length < 3`) and has no open block yet, `items.push(makeOpenBlock('trip'))`.
  - Leave first/last days (arrival/departure) and `kind: 'event'` generation untouched (they are intentionally light or tight).

```ts
// after the day's items are assembled, before days.push({...}):
if (!isFirst && !isLast) {
  const anchorTarget = items.find((item) => item.open !== true)
  if (anchorTarget) anchorTarget.anchor = true
  const confirmed = items.filter((item) => item.status === 'confirmed').length
  if (confirmed < 3 && !items.some((item) => item.open === true)) {
    items.push(makeOpenBlock('trip'))
  }
}
```

- [ ] **Step 4: Run tests, verify pass.** `npx vitest run src/utils/tripGeneration.test.ts` → PASS.

- [ ] **Step 5: Commit** (hold): `git add src/utils/tripGeneration.ts src/utils/tripGeneration.test.ts && git commit -m "feat(pacing): generator defaults to anchor-per-day + protected open block"`

---

### Task 4: Render open + anchor intentionally (public itinerary)

**Files:**
- Modify: `src/pages/Trip.tsx` (itinerary item render, ~lines 78-109)

- [ ] **Step 1:** No unit test (presentational; repo has no React-DOM test infra — verify via build + visual check, per spec). Implement: in the `day.items.map` `<li>`, branch on `item.open` and `item.anchor`:
  - `item.open`: render a distinct, calm style (e.g. dashed border / muted background) with the title and a one-line "on purpose" cue; suppress the `StatusPill`.
  - `item.anchor`: subtle emphasis on the title (e.g. an "Anchor" chip or bolder weight).
  - Keep all existing fields (time, address, notes, why, link) rendering for non-open items.

```tsx
<li key={i} className={`px-4 py-3 flex gap-4 ${item.open ? 'bg-slate-50' : ''}`}>
  {item.time && <span className="text-slate-500 font-mono text-sm w-20 shrink-0">{item.time}</span>}
  <div className="flex-1 min-w-0">
    <p className="font-medium text-slate-900">
      {item.anchor && <span className="mr-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 align-middle">Anchor</span>}
      {item.title}
    </p>
    {item.open
      ? <p className="text-sm text-slate-600 mt-1">Kept open on purpose — leave room to breathe.</p>
      : <StatusPill value={item.status} />}
    {/* existing address / notes / why / nextStep / link rendering unchanged for all items */}
  </div>
</li>
```

- [ ] **Step 2:** `npx tsc -b` → exit 0; `npm run build` → success. Visual check: a generated trip shows the open block styled and the anchor chip.

- [ ] **Step 3: Commit** (hold): `git add src/pages/Trip.tsx && git commit -m "feat(pacing): render open blocks and the day anchor intentionally"`

---

### Task 5: Gentle over-packed nudge in the owner itinerary panel

**Files:**
- Modify: `src/pages/ManageTrip.tsx` (`TripCommandPanel`, `activePanel === 'itinerary'` branch, ~line 1413, which has `onPatchTrip`)

**Interfaces:**
- Consumes: `assessDayPace`, `makeOpenBlock` from Task 1; `trip.kind` to skip events; `onPatchTrip(patch)` to write back.

- [ ] **Step 1:** No unit test (presentational + no DOM infra); verify via build + behavior check. Implement: in the itinerary panel's per-day render, when `trip.kind !== 'event'` and `assessDayPace(day).overPacked` and the day is not dismissed (local `Set<string>` of dismissed dates in component state), show a soft, dismissible note:

```tsx
{trip.kind !== 'event' && assessDayPace(day).overPacked && !dismissedPace.has(day.date) && (
  <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 flex items-center justify-between gap-3">
    <span>{formatLongDate(day.date)} looks full. Want to keep an afternoon open?</span>
    <span className="flex gap-2 shrink-0">
      <button type="button" className={COMPACT_BUTTON}
        onClick={() => onPatchTrip?.({ itinerary: trip.itinerary.map((d) => d.date === day.date ? { ...d, items: [...d.items, makeOpenBlock(trip.kind)] } : d) })}>
        Keep it open
      </button>
      <button type="button" className={COMPACT_BUTTON} onClick={() => setDismissedPace((prev) => new Set(prev).add(day.date))}>
        Dismiss
      </button>
    </span>
  </div>
)}
```

  - Add `const [dismissedPace, setDismissedPace] = useState<Set<string>>(new Set())` to `TripCommandPanel`.
  - "Keep it open" appends an open block to that day via `onPatchTrip`; "Dismiss" hides for the session.

- [ ] **Step 2:** `npx tsc -b` → exit 0; `npm run build` → success.

- [ ] **Step 3: Commit** (hold): `git add src/pages/ManageTrip.tsx && git commit -m "feat(pacing): gentle dismissible over-packed nudge in the itinerary panel"`

---

### Task 6: Full verification gate

- [ ] **Step 1:** `cd /c/Users/tonimontez/FamilyTrips && npm run privacy:scan && npm run validate:data && npm run lint && npm run test && npm run build` → all green.
- [ ] **Step 2:** Report implemented vs verified vs manual (the two presentational tasks are build-verified, not unit-tested — stated plainly).

## Self-review notes

- **Spec coverage:** principle (Tasks 3-4 copy) ✓; markers (Task 1) ✓; generation default + exemptions (Task 3) ✓; display (Task 4) ✓; pace check ≥4 (Task 1 + Task 5) ✓; integrity copy (Tasks 1,4,5) ✓; testing (Tasks 1-3 unit, 4-5 build/visual) ✓; out-of-scope respected (no dial, no toddler-mode, dismiss is session-only) ✓.
- **Threshold coherence:** generation caps middle days at anchor + open block, so generated days won't trip the ≥4 nudge — it mostly catches hand-built days, as intended.
