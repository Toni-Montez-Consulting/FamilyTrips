# FamilyTrips Overhaul Plan

Make the app **way better — more intuitive, easier to read, better UI.**
Ambition (locked): **bolder layout/IA restructure** — keep the design grammar + tokens,
but substantially rethink navigation and screens. All four workstreams approved.
Process (locked): **research → detailed plan → review along the way**; build phase by
phase with a review checkpoint after each. Nothing ships to prod without a go.

## Non-negotiables carried through every phase
- Keep the FamilyTrips tokens (`paper/ink/rule/live/held/open`) + two-font discipline
  (Fraunces + DM Mono). This is a restructure, not a reskin.
- Stay at **0 axe violations** and keep the `jsx-a11y` lint gate green.
- Keep the "copy-for-the-group" thesis (every section pasteable into the chat).
- Keep 105 tests green; add tests for new logic.

## Principles (from the two research passes)
- **One primary thing per screen**; single column; **≤2 taps** to anything.
- **Progressive disclosure**: collapsible sections + **sticky section nav** for long lists.
- Lists for homogeneous items, cards for grouped concepts, tables rare.
- **Fewer nav destinations** (5, not 7); strong hierarchy; calm over dense.
- **Inline editing** = tap-to-edit rows, autosave + optimistic UI + a visible sync state,
  add-row at section end, deliberate delete (undo), drag-handle reorder, semantic inputs
  (not `contenteditable`), announce changes for screen readers. Libs: dnd-kit, React Aria.

---

## Phase 1 — IA & Navigation restructure (the skeleton)
**Why:** the 7-tab bar is cramped (labels ~11px), labels disagree across the bar/pager/titles,
and Checklist vs Packing overlap so users can't predict which tab holds "straw cup."

**Proposed 5-tab IA** (trip kind): **Home · Plan · Stay · People · Prep**
- **Home** — orientation (re-ranked in Phase 3).
- **Plan** — the day-by-day itinerary (today's "Trip" tab, renamed for clarity).
- **Stay** — lodging + bookings.
- **People** — roster.
- **Prep** — **Checklist + Packing merged** behind one segmented control: **To-do / To-pack**.
  One mental model: "what we need to do, and what we need to bring."
- **Budget** — leaves the tab bar; becomes a **summary card on Home** (tracked total + per-share)
  that links to a full Budget view at `/budget`. *(Open decision — see below.)*

**Label discipline:** one name per route, used in the tab, the prev/next pager, and the `<h1>`.

**Files:** `BottomNav.tsx`, `App.tsx` (routes), `Layout.tsx` (pager `navOrder`), page `<h1>`s.
Event-kind trips get the parallel 5-tab set (Home · Plan · Place · People · Prep).

**Risk:** merging two routes into `/prep` changes URLs people may have. Mitigate: keep
`/checklist` and `/packing` as redirects into `/prep` with the right segment preselected.

**Review checkpoint:** nav + routing only, no visual list work yet — confirm the 5-tab model
and Budget placement before Phase 2.

---

## Phase 2 — Long-list readability (the Prep page)
**Why:** the single biggest "intuitive/readable" win. Packing is 79 items across ~10 groups;
Checklist is 27 across 9. Today both are one un-collapsible wall.

**What:**
- Make `Section` **collapsible** — a disclosure toggle in the header it already owns, plus a
  per-section progress count ("12/15 packed", "3/6 done") in the header.
- **Sticky category chip-nav** under the page header (reuse the pattern `Trip.tsx` already has),
  one chip per group, tap to jump.
- **Auto-collapse 100%-done sections**; expand the rest.
- **Louder state**: unchecked control gets a real `border-ink-soft` edge (not the near-invisible
  `held`), done rows get a row-level treatment (tint + strikethrough), so done/not-done reads at a glance.

**Files:** `Section.tsx` (add `collapsible`, `progress` props), the merged Prep page
(from `Checklist.tsx` + `Packing.tsx`), small shared `Disclosure` + `SectionChips` helpers.

**Review checkpoint:** screenshot the Prep page (collapsed/expanded, chip-jump, progress) before moving on.

---

## Phase 3 — Home re-rank + trip-hero unify + itinerary collapse
**Why:** Home orients you to a number then hands you six equal doors; the same trip is drawn
three different ways (Landing record vs TripCard vs Home hero); the itinerary never collapses.

**What:**
- **Re-rank Home:** lead with the most time-relevant thing — *before* the trip, the next action
  ("3 bookings to confirm · 12 to pack"); *during*, Today. Demote the countdown to a line near the
  title. Give the quick-link grid one clear **primary** (e.g. Plan, `border-l-live`) instead of six equals.
- **One trip-hero treatment**, tokenized, reused on Landing / list / Home (kill `rounded-3xl`/`shadow-sm`/`slate`).
- **Collapse non-today itinerary days** to a header (date · title · item count); expand today by default.
- **People roster legibility:** headline "**3 named · ~14 more to confirm**" (not "~16 coming"),
  going/maybe/no-reply as small stat chips, not a run-on sentence.
- **Color the public status pills:** `needs-confirmation`/`needs-booking` get a `live`-tint; confirmed stays quiet.

**Files:** `Home.tsx`, `Landing.tsx`, `TripCard.tsx` (shared hero), `Trip.tsx` (day collapse + StatusPill), `People.tsx`.

**Review checkpoint:** screenshots of Home (pre-trip vs during), the collapsed itinerary, the roster.

---

## Phase 4 — Stay on-system + consistency + UI polish
**Why:** Stay is a core tab that looks like a different product; assorted polish gaps remain.

**What:**
- **Port `Stay.tsx` onto the tokens** — `slate-*`→`ink/ink-soft`, `blue-700`→`live`,
  `border-slate-*`→`border-rule`, `rounded-2xl`→`rounded-[8px]`, amber box → `border-l-live` paper callout.
  Same fix for the `Layout.tsx` error state.
- **Bottom nav icons**: replace emoji with a consistent **lucide** icon set; with 5 tabs the labels
  can be full words at a readable size.
- **Touch targets**: Edit/Delete get real tap padding; Delete moves to `ink-soft` + keeps the confirm.
- **Copy chrome**: per-section copy buttons become icon-only to reduce header weight (keep the
  full-page "Copy all" once at the bottom).
- **Type scale + vertical rhythm** pass for readability (line-length, heading steps, spacing).

**Files:** `Stay.tsx`, `Layout.tsx`, `BottomNav.tsx`, `Section.tsx`, `CopyButton.tsx`, `index.css`.

**Review checkpoint:** before/after screenshots of Stay + the new nav.

---

## Phase 5 — Inline editing (retire the form editor for common edits)
**Why:** you don't like the modal/form editor; you want to edit in place. Done last, on top of
the restructured pages, because it's the highest-risk and depends on the new layouts.

**Design (to be detailed + reviewed on its own before building):**
- **Two backends already exist** — user-added checklist items use the realtime `checklist_items`
  table (already add/toggle inline); seed content (packing, itinerary, stay, people) uses the
  full-snapshot **override** model (`/api/trip-overrides`, PIN-gated, optimistic-concurrency).
- **Interaction:** tap a row → inline input → autosave on blur/Enter with a "Saving…/Saved" chip;
  optimistic update + rollback on failure. **Add row** at each section's end. **Delete** =
  swipe-with-undo or trash + confirm. **Reorder** = drag handle (dnd-kit).
- **Auth seam:** "unlock editing" once per session with the PIN (not per edit), then edit freely;
  a clear locked/unlocked affordance. ManageTrip stays for advanced/bulk + history/restore.
- **Persistence for seed content:** each inline edit writes an override snapshot through the
  existing action (carry `baseVersion` for the 409 guard); debounce to avoid a write per keystroke.

**Risk:** the override path is snapshot-based, so per-item inline edits need careful
debounce + concurrency handling. This phase gets its own mini design doc + review before code.

**Review checkpoint:** the design doc first; then a vertical slice (inline-edit one list) before rolling out.

---

## Sequencing rationale
1 (skeleton) → 2 (the most-used pages become readable) → 3 (the front door + itinerary) →
4 (consistency + polish so it all feels one piece) → 5 (editing, on top of the finished structure).
Each phase is independently shippable and independently reviewable.

## Open decisions to lock at the Phase 1 review
- **Budget placement** — Home card + `/budget` (recommended) vs keep it a 6th tab.
- **Tab labels** — "Plan" vs "Trip" vs "Itinerary"; "Prep" vs "Lists".
- **Prep merge** — one tab with a To-do/To-pack toggle (recommended) vs keep them separate but cross-linked.
- **`/checklist` + `/packing` redirects** — confirm we preserve old links.

## Out of scope (named, not silently dropped)
- ManageTrip full tokenization (owner-only, PIN-gated) — lower priority; revisit after Phase 5.
- P2 security (auth/tokens), real PII privacy — still parked.
