# Pacing & Human Experience — Design Spec

Status: Approved design (2026-06-25), pre-implementation. Next step: implementation plan (writing-plans). Ships as its own small slice, independent of the P1/P2 backend phases in `docs/AUDIT_AND_ELEVATION.md`.

## The principle

Plan the day, not the hour. **One anchor a day, the rest stays open.** The planner optimizes for the traveler's recharge, not the itinerary's density. Open time is *intentional*, not a gap to fill.

Grounded in real research (Selin Malkoç, Ohio State — scheduling leisure to exact times makes the brain treat it like work; Jeroen Nawijn, n=1,530 — only calm, unhurried time off recharges). *Limitations check: these findings are real but correlational; we frame pacing as a sensible default, not a promise.*

### Integrity rule (hard)

This is a durable-motivator improvement (reduces trip anxiety, protects the real experience), built through the build-integrity lens. It must stay fair and honest:
- No fabricated/viral stats ("426% per Harvard", "Bourdain rule") — ever.
- No fear, FOMO, guilt, streaks, or manufactured urgency.
- Every nudge is a gentle, dismissible *offer*, phrased as a question, never a warning of failure.

## Decisions locked

1. **Shape:** a guiding principle woven into generation + display + a gentle check — NOT a new feature/dial.
2. **Whose experience:** the travelers' experience ON the trip (not the planning UX).
3. **Approach B:** calm by default + one gentle, dismissible pace check that also catches hand-built days.
4. **Over-packed threshold:** a trip day with **≥4 timed items and no open block** triggers the nudge.
5. **Sequencing:** ship as its own slice next; independent of P1/P2 (touches only the planner + itinerary).

## Data model — zero migration

Add two optional fields to `ItineraryItem` in `src/types/trip.ts`:

```ts
export type ItineraryItem = PlannerAnnotated & {
  time?: string
  title: string
  notes?: string
  address?: string
  link?: string
  anchor?: boolean   // the day's one main thing
  open?: boolean     // a protected, intentionally-unplanned block (not a gap)
}
```

Trips are stored as JSONB, so these need **no Supabase migration**. Both default to absent → today's behavior. Markers are descriptive, not enforced (a wedding day may have zero open blocks and that's valid). `validateTripData` is unchanged except that the new fields are allowed; no new hard rules.

## Generation behavior (`tripGeneration.ts`, `tripAssist.ts`)

When building a trip day:
- Choose exactly one **anchor** and set `anchor: true`. Selection priority: the day's highest-priority must-do → else the main planned activity → else the signature meal. Exactly one per day.
- Cap timed blocks at ~3 for a `kind: 'trip'` day.
- **Loose (non-time-bound) generated items use coarse time words** (`'Morning'`/`'Afternoon'`/`'Evening'`) rather than fake-precise clock times. Time-bound items (flights, reservations, a scheduled anchor) keep their exact time. This keeps the *stored* data honest, so display never has to transform it.
- After the anchor, insert one explicit **open block** (`{ open: true, title: 'Open time — leave it unplanned', time: 'Afternoon', status: 'suggested', why: 'Unhurried downtime is what actually recharges you.' }`) instead of filling. This generalizes the existing `looser-day` downtime insertion (`tripAssist.ts` ~516-525) into the default path.

**Exemptions (no forced open block):**
- A day already composed mostly of `status: 'confirmed'` items (wedding, event run-of-show) — it's genuinely full on purpose.
- `kind: 'event'` days (run-of-show stays tight).
- Travel days keep their existing buffers (`tripGeneration.ts` ~1215).

The existing `tighter-day` action is unchanged (the owner can still deliberately pack a day). `looser-day` stays as the manual override and shares the open-block helper.

## Display behavior (`Trip.tsx`)

- An `open: true` item renders as a positive, distinct element — e.g. "Open afternoon · on purpose — keep it unplanned" — not a blank gap or an ordinary list row.
- The `anchor` item gets subtle emphasis ("the one thing today").
- Display renders stored times **faithfully** — it never rewrites or hides a real time. The "coarse time for loose items" choice lives in generation (above), so display simply shows whatever the item carries.
- No layout regressions to the existing itinerary list; reuse current wrapping conventions (`break-words` for prose).

## The gentle pace check

A pure, unit-testable function in a new `src/utils/dayPace.ts`:

```ts
export function assessDayPace(day: Day): {
  timedCount: number
  hasOpenBlock: boolean
  hasConfirmedAnchor: boolean
  overPacked: boolean   // timedCount >= 4 && !hasOpenBlock && not a confirmed-full/event day
}
```

Surface, in the itinerary/manage view, a soft, **dismissible** per-day note when `overPacked` is true:
> "Saturday looks full — want to keep an afternoon open?" [Keep it open] [Dismiss]

- "Keep it open" inserts an `open` block via the shared helper (the `looser-day` path).
- **Never blocks a save**; advisory only (consistent with the P7 "semantic validators as warnings" direction).
- At most one nudge per day. Dismiss hides it for the session (no persisted flag in this slice; persisted dismiss is a possible later refinement).

## Testing

- **TDD `assessDayPace`** (pure, no DOM): over-packed detection at ≥4 timed + no open; exemption for confirmed-full and event days; open-block presence detection.
- **TDD the generation change:** a generated trip day has exactly one `anchor` and one `open` block; a confirmed-full day gets neither forced on it; `kind: 'event'` days are untouched.
- **Display:** verified by `npm run build` + a manual visual check (no React-DOM test infra in the repo; noted, not faked).
- Full gate before done: `privacy:scan`, `validate:data`, `lint`, `test`, `build`.

## Out of scope (named)

- A pace dial / setting (Approach C), per-user pace preferences, analytics.
- Toddler-mode itself (P7) — though it reuses this slice's `open`-block + `assessDayPace` seam for nap-window protection.
- Persisted per-day dismiss state.
- The planning-UX psychology (organizer load, decision fatigue) — a separate, later thread.

## File-level change list

- `src/types/trip.ts` — add `anchor?` / `open?` to `ItineraryItem`.
- `src/utils/dayPace.ts` (new) + `src/utils/dayPace.test.ts` (new) — `assessDayPace`.
- `src/utils/tripGeneration.ts` — anchor + default open block in the day builder, with exemptions.
- `src/utils/tripAssist.ts` — share the open-block helper; tag anchors; `looser-day` reuses it.
- `src/pages/Trip.tsx` — render open blocks + anchor emphasis; soften non-load-bearing times.
- The per-day nudge UI (itinerary view) — soft, dismissible note wired to `assessDayPace`.
