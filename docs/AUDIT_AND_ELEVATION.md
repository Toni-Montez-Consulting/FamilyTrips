# Family Trips — Audit & Elevation Program

**Status:** Supersedes `docs/AUDIT_PROMPT.md` for the consumer pivot. The old prompt audits against a "casual family tool, simplicity is a feature, do not recommend heavy auth / DB redesign" bar. **That bar has been raised.** This document audits against a new bar: a polished, shareable **consumer** product with real security, data contracts, and governance — without becoming a login wall.

**Provenance:** Generated 2026-06-24 from a grounded multi-agent audit (8 dimensions, 83 verified findings, every finding cited to `file:line`, each adversarially re-checked against the real files). This is a planning + execution artifact, not a one-shot prompt.

**Core discipline:** Foundation before surface. No new user-facing feature ships until the data contract, security floor, and data-loss fixes underneath it are in place. Phase 0 closes the bleed; features come last.

---

## How to use this document

1. **Resolve the Decision Locks first** (next section). They are load-bearing and a few are yours, not mine. The phase prompts below assume the *recommended* answers — if you override a lock, adjust the affected phase prompt before running it.
2. **Run phases in order, one at a time.** Each phase has a self-contained **Runnable Prompt** (copy it into a fresh Claude Code / Codex session in this repo) and **Acceptance Gates**. A phase is "done" only when its gates are demonstrated — tests green, CI gate passing, governance scripts passing, a11y score met, real-device check. Report implemented vs verified vs still-manual plainly.
3. **Do not skip the dependency chain.** P0 → P1 → P2 are the foundation; P3–P5 are the surface; P6–P7 are features and hardening. Pulling a feature forward over a missing contract is the exact trap this program exists to prevent.
4. **Every UI phase must pass the Mobile & Accessibility Bar** and every data path must obey the Data Governance Contract — they are standing gates, not one-time passes.

---

## Executive assessment

FamilyTrips today is a genuinely well-built **casual** family tool, not a consumer product yet. The bones are good and should not be thrown away: a clean Vite/React 19/TS SPA, a static-seed-plus-Supabase-override data model with versioned history, graceful degradation when Supabase is absent, mobile-first large-touch-target UI, copy-for-group-chat sharing, and tests over the core trip-creation path.

The honest gap: **every load-bearing access, identity, and privacy decision is built around one trusted operator holding a shared PIN** — and the docs say so plainly. That was correct for the old bar. It is not correct the moment you share a trip with ~16–17 people across multiple households, with a toddler whose safety prep matters. Three "fine because it's just family" choices become real risks:

1. **PII ships in the public JS bundle.** Static trip data — family names, addresses, bed assignments, host contact — is in the built bundle regardless of `visibility: 'unlisted'` (`src/data/trips/stpete.ts`; `README` line 122). That is privacy-by-obscurity, not privacy.
2. **One shared PIN = identical full-edit power for everyone.** No per-trip ownership, no roles (`api/_requestGuards.ts`, `src/server/tripOverrideActions.ts:198-203`). One accidental or malicious holder can overwrite or delete anything.
3. **A partial edit silently deletes data.** `applyTripOverride` *replaces* arrays instead of merging by id (`src/utils/tripOverrides.ts:88-90`), so editing one person drops everyone else. A real data-loss bug that only bites once multiple people coordinate.

So the casual→consumer gap is **not "add features."** It is: install a data-governance floor and a real (still low-friction) identity/sharing model *under* the good UI you already have, then elevate the surface on top of that floor. Foundation and safety first, features last.

### The casual → consumer gap, concretely
- Identity is per-device `localStorage` only; no stable person identity to attribute or govern anything.
- Sharing is a raw copied URL; no invite, no scope, no revocation.
- Supabase is explicitly "not an access-control boundary" — anon read/write by slug.
- `/` is the trips list; a shared link lands a stranger on a bare task list that reads as broken.
- No data classification, no ownership/tenancy, no audit log, no soft-delete.
- Mobile/a11y is good-not-pristine: sub-44px targets, ~11.5px nav labels, marginal contrast, missing focus rings.

---

## Decision Locks (resolve before P0/P1)

These are the reversible-expensive decisions. **Locked 2026-06-24:** DL1 = token **+ magic-link, both built now**; DL4 = branded landing at `/`, trips at `/trips`; DL6 = family & friends only, generic schema. DL2 / DL3 / DL5 accepted as the recommended engineering defaults. The phase prompts below reflect these locks.

| # | Decision | Recommendation | Why it's load-bearing |
|---|----------|----------------|------------------------|
| **DL1 — LOCKED** | How does a person become "known" to a trip, and how is a trip shared? | **Token + magic-link, both built now.** Per-trip unguessable **share token** grants scoped access and preserves no-login viewing; **plus** optional email **magic-link** sign-in built now (not deferred) for cross-device identity and co-owners. Canonical `person_id`; a person optionally claims their roster slot via magic-link. **Login is never required to view.** _Tradeoff the owner accepted: pulls Supabase Auth + email delivery into the foundation earlier — a new failure surface to test._ | Every feature (RSVP, assignment, who-did-what, roles) needs stable per-person identity. Most reversible-expensive call in the program. |
| **DL2** | Keep shared PIN for editing, or capability tokens with roles? | **B:** owner keeps a root PIN/magic-link; everyone else gets a **scoped per-trip token** tied to a `person_id` (owner / editor / household-lead / viewer), enforced **server-side**. Move rate-limit state to Supabase keyed on attempts (not IP); enforce 6+ digit PINs. Defer full account RBAC. | With 16–17 holders the PIN *will* leak; today both PINs grant identical power. Roles let a household lead manage only their own people without being able to delete the itinerary. |
| **DL3** | How is "whose trip is this" / "which household" represented? | **B:** `trip_id` UUID PK (slug → non-unique route alias, resolved deterministically), nullable `owner_household_id` + `jsonb` metadata, a `Household` entity, optional `household_id` on `Person`, a `trip_members` table. Generic seam, minimal surface. Reject C (premature multi-tenant SaaS). | Today `trip_overrides` is keyed by slug alone, `created_by` is discarded to the string `"owner"`, slug collisions let a seed silently shadow a user trip. This is the schema backbone — wrong now = painful migration. |
| **DL4 — LOCKED** | Distinct consumer home/brand, or trips-list-as-homepage? | **B:** branded landing at `/` (name, value prop, "create" / "open a shared trip" CTAs, example preview); trips list moves to `/trips`. Derive the look from the object model (trip/household/roster/lodging/prep), **not** generic travel tropes. `MothersDay2026` proves a higher aesthetic ceiling already exists in-repo. | The home is the first impression and the credibility surface for "this is a real, trustworthy place to put my family's plans." |
| **DL5** | What may ship client-side vs. live server-side behind the token? | **B (highest-severity fix):** two-tier — **PUBLIC** metadata stays client-side; **PRIVATE/PII** (host info, Wi-Fi, addresses, confirmations, bed assignments, phones, budget detail, child notes) moves to a Supabase-only table gated by the share token via RLS. Enforce with `privacy-scan.mjs` upgraded to **fail the build**. | This is what makes "unlisted" actually mean private. Today it's breach-class exposure, not a casual tradeoff. |
| **DL6 — LOCKED** | How far does "beyond family" go for v1? | **A surface / B-capable schema:** build for the concrete multi-household family-and-friends trip in front of you; keep terms (household/person/role) generic so opening to broader groups later is config, not migration. **Explicitly not building:** billing, public discovery, org tenancy, marketplace. | Naming the stopping point prevents over-sharpening the schema into generic SaaS and stalling the real near-term trip. |

---

## Cross-cutting principles (standing gates on every phase)

1. **Foundation-before-surface** — no user-facing feature ships until the data contract, security floor, and data-loss/merge fixes under it are in place. Scale the foundation now; build minimal surface now.
2. **Preserve casual no-login entry** — every phase keeps "just open the link and read it," copy-for-group-chat, large touch targets, older-relative readability. Any change forcing an account for basic viewing is rejected.
3. **Fail-Loud everywhere** — PII in the bundle fails the build; slug collisions resolve deterministically and visibly; partial edits never drop unreferenced records; corrupted Supabase JSONB surfaces an error, not an empty trip; every two-input join (token→trip, person_id→roster, household_id) is validated at the boundary with unmatched keys reported.
4. **Mobile-first & accessible by default** — the Mobile/A11y Bar is an acceptance gate on every UI-touching phase. New components ship with focus-visible, ≥44px targets, AA contrast, and aria from the start.
5. **Real-content mandate** — design and test against the actual ~16–17 person multi-household toddler trip and the real seed trips (`stpete`, `myrtle-beach`); never lorem/placeholder.
6. **Server-side enforcement of trust** — all access/capability/PII decisions are enforced in `api/` server routes with the service-role key, never trusted from the client. The client is hostile; RLS + server guards are the boundary.
7. **Verify-before-done with evidence** — a phase closes only when its gates are demonstrated; report implemented vs verified vs still-manual, no overclaiming.
8. **Design from the object model, not the domain** — IA and visuals derive from trip/household/roster/lodging/prep/role objects, not travel-app convergence.
9. **Name what is NOT being built each phase** — explicitly defer billing, public discovery, org tenancy, full account RBAC, real-time presence, so "designed to scale" never silently becomes "built everything."

---

## Data Governance Contract

> Ship this as `docs/DATA_CONTRACTS.md` in Phase 0 and enforce it in CI.

- **Classification (four tiers).** **PUBLIC** = non-identifying trip metadata safe in the bundle (destination, public dates, public resort name, tagline, hero). **SHARED** = visible to anyone holding the trip's share token (itinerary, must-dos, packing, checklist state, roster first-names). **PRIVATE/PII** = host name/phone, residential addresses, Wi-Fi SSID/password, confirmation numbers, bed/room assignments, per-person phone, budget detail, child/toddler notes — **never** client-side, **never** anon-readable. **INTERNAL** = audit logs, tokens, history.
- **Public-bundle rule (hard, CI-enforced).** Nothing PRIVATE/PII may exist in `src/data/trips/*.ts` or any client bundle. `privacy-scan.mjs` is upgraded to **non-zero exit** on phone / address / Wi-Fi password / confirmation / bed-assignment patterns, wired into `ci.yml`. Today `stpete.ts` violates this; migrating it is a Phase 0 gate.
- **Ownership & tenancy.** Every trip has a UUID `trip_id` (PK) and nullable `owner_household_id`; `trip_slug` becomes a non-unique route alias resolved deterministically (dynamic-over-seed, then most-recent `updated_at`). `Person` carries optional `household_id`; a `trip_members` table (trip_id, person_id, household_id, role) is the authority for who can do what.
- **Access / RLS.** Supabase becomes a real access boundary. Replace `using(true) / with check(true)` anon policies with token-scoped RLS: SHARED tables readable/writable only with a valid trip token; PRIVATE reads require token **and** editor/owner capability; the service-role key stays server-only (never `VITE_`-prefixed). **RLS now IS authentication for this app.**
- **Capabilities (server-enforced).** owner = full edit/delete/manage-members/restore; editor = edit SHARED; household-lead = edit own household's people/packing/RSVP only; viewer = read SHARED + set own RSVP. `ADMIN_PIN` and `TRIP_EDITOR_PIN` must stop granting identical power.
- **Retention & history.** `trip_override_history` stays append-only. Add `deleted_at` soft-delete to trips/overrides/checklist_items; replace hard cascading delete with soft-delete + a ≥7-day recovery window and a second confirmation before purge. Owner-initiated delete path (not limited to UAT rows). Document in `docs/DATA_RETENTION.md`.
- **Audit.** Add an `audit_log` table (trip_id, person_id, action, target, before/after summary, timestamp), populated on every override save and PIN/token edit; surface a read-only change log to the owner. Required before multi-household editing so "who changed what" is answerable.
- **Data-merge integrity.** `applyTripOverride` deep-merges array fields **by id** (people, bookings, checklist, packing) instead of whole-array replace. Partial edits never delete unreferenced records.
- **Runtime validation.** Supabase JSONB reads validate against a schema before render; corrupted data surfaces a visible error, not a silent empty trip. Add a `schema_version` field for forward-compatible migrations.
- **Never ship client-side (deny-list).** `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `ADMIN_PIN`, `TRIP_EDITOR_PIN`, share-token secrets, audit logs, any PRIVATE/PII field. Enforced by CI secret-scan + the upgraded privacy-scan. No PIN persisted across browser sessions.

---

## Mobile & Accessibility Bar (acceptance gate on every UI phase)

- **Touch targets** ≥44×44px (primary nav/actions ≥48px), verified at 320 / 360 / 390px. Fixes the Checklist switch (~34px) and ActorPicker/CopyButton min-heights.
- **Readable text** — no interactive/body text below 14px on mobile; raise BottomNav labels from ~11.5px; apply responsive type (`text-3xl → sm:text-4xl`) the way `MothersDay2026.tsx` already does.
- **Contrast** — AA (4.5:1 / 3:1 large); upgrade `text-slate-500` → `600/700`; never status by color alone (pair with text/icon).
- **Keyboard & focus** — visible `focus-visible` ring on every interactive element, on light and dark backgrounds.
- **Screen-reader meaning** — emoji are decorative only; icon-only controls get accessible names.
- **No horizontal-scroll surprises** — scrollable pill rows show an edge-fade affordance; page never scrolls horizontally.
- **Forms on mobile** — single-column <640px, ≥py-3 tap height, required indicators, inline validation, disabled/error states; consistent long-value wrapping (`break-all` for codes/URLs, `break-words` for names).
- **Empty/loading/error states are designed** — skeleton/spinner, reassuring offline message, error state with retry. Targets: `Layout` `TripRouteStatus`, `TripsIndex` error alert.
- **Automated a11y gate in CI** — Lighthouse/axe on Home, TripsIndex, a Trip, Checklist, ManageTrip with a ≥90 floor wired into `ci.yml`; below floor fails the build.
- **Real-device sign-off** — before any phase is "done," changed screens checked on ≥1 real iOS and ≥1 real Android at default zoom, including safe-area on a notched device and one-handed reach of primary actions.

---

## The Phases

Dependency chain: **P0 → P1 → P2** (foundation) → **P3 → P4 → P5** (surface) → **P6 → P7** (features + hardening).

Each phase's **Runnable Prompt** is self-contained — paste it into a fresh session in this repo. Findings counts by dimension (verified/adjusted): Architecture 10 · Data 14 · Security 13 · Routing/IA 7 · UI 8 · Mobile 7 · Features 13 · Code quality 11.

---

### P0 — Governance & Safety Floor (stop the bleed)
**Goal:** Close the highest-severity governance and data-loss issues and establish CI confidence *before* any new surface. After P0, "unlisted" starts meaning private, partial edits stop deleting data, and the build refuses to ship PII.
**Depends on:** none.

**Acceptance gates**
- `npm run build` fails if any PII pattern exists in `src/data/trips` (proven with a deliberate fixture).
- A unit test proves `applyTripOverride({people:[oneEditedPerson]})` preserves all other people.
- CSP + security headers verified present on a deployed preview response.
- No PIN value survives a browser-session close.
- Soft-delete: a deleted trip is recoverable within the window; no hard cascade by default.
- vitest suite green incl. new tripOverrides + checklist-hook tests; existing tests still pass.

**Runnable prompt**
```text
You are hardening FamilyTrips (C:/Users/tonimontez/FamilyTrips, Vite+React19+TS+Tailwind v4, Supabase, Vercel) BEFORE any feature work. Do not add user-facing features. Tasks, grounded in the real code: (1) Create docs/DATA_CONTRACTS.md defining four data tiers PUBLIC/SHARED/PRIVATE-PII/INTERNAL and a never-ship-client-side deny-list (SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, ADMIN_PIN, TRIP_EDITOR_PIN, share-token secrets, all PII fields). (2) Read scripts/privacy-scan.mjs and make it exit non-zero when it finds phone numbers, residential addresses, Wi-Fi passwords, booking confirmations, or bed/room assignments in src/data/trips/*.ts; add a deliberate failing fixture to prove it, then wire `node scripts/privacy-scan.mjs` as a required step in .github/workflows/ci.yml. (3) Edit src/data/trips/stpete.ts (and audit okc.ts, logan-bachelor.ts, family-cookout.ts, mothers-day-2026.ts) to remove all PRIVATE/PII per the contract — replace with non-identifying placeholders and a code comment that private detail will be served via share-token in a later phase. (4) Fix src/utils/tripOverrides.ts applyTripOverride (lines ~85-92): instead of `{...cloneTrip(seed), ...data, slug}` which whole-replaces arrays, deep-merge array fields (people, bookings, itinerary days, checklist, packing, contacts, food, supplies) BY id so a partial edit never drops unreferenced records; add vitest cases proving add/edit/remove/reorder all preserve untouched records. (5) Add to vercel.json a headers block: Content-Security-Policy (default-src 'self'; connect-src 'self' https://*.supabase.co https://api.openai.com; frame-ancestors 'none'), Strict-Transport-Security, X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin. (6) Remove PIN persistence across browser sessions in src/pages/ManageTrip.tsx (~line 1737) and src/pages/NewTrip.tsx (~line 212). (7) Add deleted_at soft-delete to trip_overrides/checklist_items and replace the hard cascading delete in api/trips.ts deleteUatTrip with soft-delete + a >=7-day recovery path; document in docs/DATA_RETENTION.md. (8) Add error/syncStatus state to src/hooks/useChecklistItems.ts (mirror useChecklistState's setStatus('offline') pattern) so fetch failures are not silently swallowed. (9) Add vitest unit tests for tripOverrides merge and for both checklist sync hooks (offline->online, optimistic+rollback, merge conflict). Run npm run build, npm test, and the governance scripts; report implemented vs verified vs manual. Follow Fail-Loud and real-content (test against the actual stpete/myrtle-beach data).
```

---

### P1 — Data Model & Tenancy Backbone (UUID identity, households, roles)
**Goal:** Install the load-bearing schema: stable UUID trip identity, household/person/role entities, a `trip_members` table, an audit log — generic enough to scale, minimal surface. No new features.
**Depends on:** P0.

**Acceptance gates**
- Two trips with the same slug no longer let a seed silently shadow a user trip — deterministic, tested.
- Every override save writes an `audit_log` row (verified in Supabase).
- Existing seed + dynamic trips load unchanged after migration (backward-compat test).
- Corrupted JSONB surfaces a visible error, never a silent empty trip.
- The person / `trip_members` seam carries nullable `claimed_by_email` + `auth_user_id`, ready for P2 magic-link (columns present + nullable, no behavior yet).
- vitest + `validate-data.mjs` green; privacy-scan still passing.

**Runnable prompt**
```text
You are installing the tenancy backbone for FamilyTrips. Read docs/SUPABASE.md, src/types/trip.ts (Person lines 158-165, Stay 120-133), src/utils/tripOverrides.ts, src/components/Layout.tsx (line 38 seed-over-dynamic), api/trips.ts and api/trip-overrides.ts, src/server/tripOverrideActions.ts (created_by discarded to 'owner' ~line 151). Build the schema generic-over-hardcoded and design-for-scale, minimal surface. Tasks: (1) Write numbered Supabase migration files: add trip_id UUID primary key to trip_overrides (keep trip_slug as a non-unique route alias column), add owner_household_id (nullable) + a jsonb metadata column for forward-compat; create households (id, name, primary_contact_person_id, notes) and trip_members (id, trip_id, person_id, household_id nullable, role); create audit_log (id, trip_id, person_id nullable, action, target, before_summary, after_summary, created_at); add deleted_at where missing. Test migrations on a Supabase BRANCH first. (2) In src/types/trip.ts add a Household type, add optional household_id and a role enum ('owner'|'editor'|'household-lead'|'viewer'|legacy string) to Person, add schema_version to the trip data shape; update EDITABLE_KEYS in tripOverrides.ts accordingly. Also add nullable claimed_by_email + auth_user_id to the Person / trip_members seam now — DL1 is LOCKED to token + magic-link BOTH built now, so this identity-claim data seam must exist in this phase (Design-With-the-End-in-Mind), even though the magic-link FLOW is implemented in P2. (3) Replace the slug-collision behavior: implement a deterministic resolver (dynamic-over-seed, then most-recent updated_at) and update Layout.tsx so a seed no longer silently shadows a user trip; add a Fail-Loud test for the collision case. (4) Capture real created_by/owner identity instead of the literal string 'owner' in tripOverrideActions.ts; write an audit_log row on every save in api/trip-overrides.ts and api/trips.ts. (5) Add a migration runner (npm run migrate:data) and a backfill so existing seed+dynamic rows get a trip_id and schema_version; add a backward-compat test that all current trips still load. (6) Add boundary runtime validation for trip_overrides.data on read so corrupted JSONB surfaces a visible error rather than dynamicTripFromRow silently returning null. Run npm test, validate-data.mjs, privacy-scan.mjs. Report implemented vs verified vs manual. Do NOT add user-facing features in this phase.
```

---

### P2 — Security & Identity (token sharing, RLS, capabilities, private reads)
**Goal:** Make Supabase a real access boundary — per-trip share tokens, capability-scoped editing, RLS gating SHARED and PRIVATE data, token-gated server reads for the PII moved out of the bundle in P0 — while keeping casual "open the link" entry, **plus** optional email **magic-link** sign-in (built now per the DL1 lock) for cross-device identity and co-owners. Login is never required to view.
**Depends on:** P1.

**Acceptance gates**
- An anon client with the anon key but no valid token CANNOT read or write a trip's checklist/private data (demonstrated).
- A viewer token cannot edit SHARED; an editor token cannot delete the trip; only owner manages members (server-enforced, tested).
- A leaked editor token has strictly fewer capabilities than the owner PIN.
- PRIVATE/PII served only via the token-gated endpoint, never in the bundle or anon reads.
- Rate limit survives a server restart and locks after N failed attempts.
- CI secret-scan blocks a deliberately committed fake `.env`.
- A person can optionally claim their roster slot via an emailed magic-link and is then recognized across devices; viewing without login still works via the token alone.

**Runnable prompt**
```text
You are turning FamilyTrips' Supabase posture from 'intentionally casual' into a real access boundary WITHOUT adding a login wall. Read docs/SUPABASE.md RLS policies, src/lib/supabase.ts (anon client), src/hooks/useChecklistState.ts + useChecklistItems.ts (queries by trip_slug only, ~lines 178-184/125-132), api/_requestGuards.ts (IP-only in-memory rate limit, lines 20-90; timingSafeEqual), api/trips.ts + api/trip-overrides.ts (PIN checks), src/server/tripOverrideActions.ts (lines 198-203 identical PIN capabilities). Tasks: (1) Add per-trip share tokens (unguessable, stored in Supabase, scoped to a trip_id and a capability) and a share URL format (e.g. /:slug?share=TOKEN). Thread the token through EVERY Supabase read/write currently keyed only by trip_slug — inventory them first so none is missed (Fail-Loud). (2) Replace the 'using(true)/with check(true)' RLS policies with token-scoped policies: SHARED tables readable/writable only with a valid token; the PRIVATE table (from P0) readable only with token + editor/owner capability. Document that RLS now IS authentication. (3) Implement a capability matrix (owner/editor/household-lead/viewer) and enforce it SERVER-SIDE in the api/ guard — ADMIN_PIN=full, editor=edit SHARED, household-lead=own household only, viewer=read+own RSVP. Stop granting identical power for both PINs. (4) Move rate-limit state from the in-memory IP-keyed Map to Supabase keyed on token/PIN attempt with persistence across restarts and exponential lockout; enforce a 6+ digit PIN minimum. (5) Add a token-gated server endpoint that returns the PRIVATE/PII fields removed from the bundle in P0, so authorized viewers still see host/Wi-Fi/addresses/confirmations/bed assignments/budget. (6) Add a pre-commit + CI secret scan that blocks committed .env/secret patterns; set SameSite=Strict and add CSRF protection on POST/PUT/DELETE; add a per-endpoint OpenAI quota/cost guard in api/trips.ts. (7) Build OPTIONAL email magic-link sign-in NOW (DL1 is locked to token + magic-link, both now): use Supabase Auth magic-link; a person claims their roster slot by email, populating the claimed_by_email/auth_user_id columns from P1; a claimed identity gets cross-device recognition and can be promoted to co-owner. Viewing MUST still work with the share token alone and NEVER require login. Verify with: an anon-without-token read attempt fails; viewer cannot edit; editor cannot delete; rate limit survives restart. Report implemented vs verified vs manual; keep 'just open the link' working for viewers.
```

---

### P3 — Consumer Home, Brand & Information Architecture
**Goal:** A distinct, trustworthy first impression and discoverable editing/sharing — branded landing at `/`, trips at `/trips`, an Edit affordance, prev/next + breadcrumb nav — derived from the object model.
**Depends on:** P2.

**Acceptance gates**
- A first-time visitor to `/` sees brand + value prop + clear CTAs, not a bare task list.
- An editor can reach manage from the trip Home without typing a hidden URL; manage does not render content before a valid PIN/token.
- `MothersDay2026` renders via the normal `/:tripSlug` template path with no dedicated route.
- Prev/next moves through Trip→Stay→People→Checklist→Packing→Budget on mobile.
- Lighthouse/axe a11y ≥90 on the new landing and updated trip Home; Mobile/A11y Bar passes.

**Runnable prompt**
```text
You are giving FamilyTrips a consumer-grade home and IA. FIRST invoke the product-refinement and bespoke-frontend gates and present 2-3 visual directions derived from the object model (trip, household, roster, lodging, prep) — NOT generic travel-app aesthetics (No-Domain-Derived-Aesthetics) — and confirm direction before full build. Read src/App.tsx (line 30 / -> TripsIndex, line 32 /mothers-day-2026, line 41 /:tripSlug/manage), src/pages/TripsIndex.tsx (line 26 'Our trips'), src/components/Layout.tsx, src/components/BottomNav.tsx (6 items, no Packing), src/pages/MothersDay2026.tsx (custom route + responsive type at line 162 — the aesthetic ceiling to pull forward), README line 41 (manage intentionally hidden). Tasks: (1) Build a distinct branded landing at / (product name, one-line value prop, 'create a trip' and 'open a shared trip' CTAs, an example trip preview) and move the working trips list to /trips; keep all /:tripSlug deep-links intact with tests/redirects. (2) Add a discoverable Edit / Command Center affordance on the trip Home that requires a valid PIN/token BEFORE manage renders any content (close the 'manage renders without PIN' gap; never persist PIN across sessions). (3) Add prev/next sibling navigation and a lightweight breadcrumb showing trip context across Trip/Stay/People/Checklist/Packing/Budget. (4) Refactor MothersDay2026 into a templated seed trip on the normal /:tripSlug pattern (template flag on Trip), removing the one-off /mothers-day-2026 route and its hardcoded data drift. (5) Add Packing to navigation (7th item or a More menu) and a light first-run onboarding panel for new trips. Apply the Mobile/A11y Bar to every new screen and hit Lighthouse/axe a11y >=90. Report implemented vs verified vs manual.
```

---

### P4 — UI Craft & Design System
**Goal:** Replace scattered inline Tailwind with a real token + component system and a semantic status language, so the product looks professional and consistent and scales without per-file drift.
**Depends on:** P3.

**Acceptance gates**
- No component redefines button/field classes locally; all derive from tokens/shared components (grep proof).
- All status conveyed by text+icon, never color alone; semantic palette documented.
- Empty/loading/error states use the designed components, not bare emoji+text.
- Typography responsive on every page; contrast meets AA.
- Visual review against `design-system/GRADING.md` passes; Mobile/A11y Bar holds.

**Runnable prompt**
```text
You are building FamilyTrips' design system. Load design-system/DESIGN.md and GRADING.md and the bespoke-frontend skill first; derive the palette/type from the product object model, not travel-domain vibe. Read the duplication evidence: src/pages/NewTrip.tsx (FIELD_CLASS/PRIMARY_BUTTON/SECONDARY_BUTTON lines 66-70), src/pages/ManageTrip.tsx (re-defined FIELD_CLASS/COMPACT_BUTTON lines 77-81), src/components/CopyButton.tsx line 48, src/components/BottomNav.tsx (emoji lines 5-21, aria-hidden line 52), src/components/EmptyState.tsx, src/components/Layout.tsx TripRouteStatus, src/pages/MothersDay2026.tsx (responsive type, the ceiling). Tasks: (1) Create src/styles/tokens.ts with color/spacing(4/8/12/16/24/32)/radius/shadow/responsive-type tokens and wire tailwind.config. (2) Build shared Button (primary/secondary/tertiary with hover+active+focus-visible+disabled, >=44px), FormField (label+required indicator+inline validation+error/disabled states), Card, and designed EmptyState/Loading(skeleton or spinner)/Error(with retry) components. (3) Adopt lucide-react; replace emoji-only nav/section icons with labeled SVG icons, keeping emoji decorative-only and never the sole accessible name. (4) Define a semantic status palette (confirmed=green, pending=amber, overdue=red, neutral=slate) and apply it consistently to TripCard badges and item states — never color alone. (5) Apply responsive typography across all pages (replicate the MothersDay2026 sm:/lg: pattern). (6) Refactor NewTrip/ManageTrip/Trip/Home/TripsIndex/Layout onto the shared components and tokens. Prove with grep that no page redefines button/field classes. Grade finished screens against design-system/GRADING.md and meet the Mobile/A11y Bar. Report implemented vs verified vs manual.
```

---

### P5 — Mobile & Accessibility Hardening
**Goal:** Bring every screen to the Mobile/A11y Bar with an automated a11y gate in CI and real-device sign-off.
**Depends on:** P4.

**Acceptance gates**
- All Bar criteria PASS, verified at 320/360/390px.
- axe/Lighthouse a11y ≥90 on Home, TripsIndex, Trip, Checklist, ManageTrip, wired into CI.
- Keyboard tab order shows visible focus on every interactive element.
- Real iOS and real Android sign-off recorded, incl. safe-area on a notched device.

**Runnable prompt**
```text
You are hardening FamilyTrips for pristine mobile + accessibility against the program's Mobile/A11y Bar. Read src/components/BottomNav.tsx (line 47 text-[0.68rem], min-h-[60px]), src/pages/Checklist.tsx (line 52 switch min-h-8 ~34px; edit/delete buttons ~461-476 only hover), src/components/ActorPicker.tsx (line 32 only active:scale), src/components/CopyButton.tsx (line 48), src/pages/People.tsx + Stay.tsx (text-slate-500 secondary), src/pages/Trip.tsx (line 34 overflow-x-auto pills, no scroll hint; lines 89/102/104 inconsistent break-words vs break-all), index.css (17px base, global focus-visible). Tasks: (1) Raise BottomNav labels to >=14px and fix every sub-44px touch target (Checklist switch to >=44px, ActorPicker/CopyButton explicit min-height). (2) Add focus-visible:ring classes to ActorPicker, CopyButton, and Checklist edit/delete; verify the ring is visible on both light and dark section backgrounds. (3) Upgrade secondary text from text-slate-500 to text-slate-600/700 for AA; ensure no status is conveyed by color alone. (4) Add an edge-fade scroll affordance to the Trip.tsx pill nav; standardize long-text wrapping (break-all for URLs/codes/phones, break-words for names). (5) Add hover/disabled/error styling to form inputs on mobile and confirm single-column stacking <640px with >=py-3. (6) Wire a Lighthouse or axe a11y check into .github/workflows/ci.yml with a >=90 floor on Home, TripsIndex, a Trip, Checklist, ManageTrip; the build fails below the floor. (7) Do a manual keyboard + screen-reader pass and a real-device check on one iOS and one Android phone, recording results. Report implemented vs verified vs manual; every Mobile/A11y Bar criterion must be demonstrably PASS.
```

---

### P6 — Sharing Model & Multi-Household Coordination Features
**Goal:** With identity, tenancy, and security real, ship the consumer features the 16–17 person multi-household trip needs: RSVP, household grouping, per-person/household task assignment, multi-unit lodging-as-prep, household-aware copy blocks, invite/share UX with revocation.
**Depends on:** P5. **Sequence by value — RSVP + households first, demo, then proceed. Do not build all six at once.**

**Acceptance gates**
- Organizer sees "X of N confirmed" across households; RSVP updates persist and audit-log.
- `assignedTo` references a real `Person` (Fail-Loud on unmatched id), not free text.
- A multi-unit lodging trip shows per-household rooming as **data**, not notes prose.
- A household-lead token can edit only its own household's people/packing/RSVP (server-enforced).
- Revoking a share token immediately blocks that link; copy blocks segment by household.
- All new UI meets Mobile/A11y Bar and a11y gate.

**Runnable prompt**
```text
You are adding multi-household coordination to FamilyTrips, on top of the identity/tenancy/security foundation from P1-P2. Ground in real code/data: src/types/trip.ts (Person lines 158-165 no rsvp/household; Stay 120-133 single object; ChecklistItem 177-183 no assignedTo; PackingItem 185-193 has free-text assignedTo), src/data/trips/stpete.ts (room assignments hand-written in Stay.notes lines ~30-51 — the pain point), myrtle-beach.ts (real 18-month-old), src/utils/tripAssist.ts (buildShareSummaryBlocks ~247 takes only trip, no household filter; SmartAssistAction union ~4-17 no household actions), src/pages/ManageTrip.tsx TravelDetailsQuickEditor (~1043-1112 trip-level only), src/components/CopyButton.tsx. Sequence by value: (1) RSVP: add rsvp_status/response_at to Person and rsvp_deadline to the trip; build a manage RSVP tracker with an 'X of N confirmed across households' banner; updates write to audit_log; add a smart-assist 'RSVP reminder' action. (2) Households: group People by household_id (from P1), designate a household-lead, show per-household headcount/arrival metrics, wire household-lead to the capability from P2. (3) Task assignment: add assignedTo as a validated person_id to ChecklistItem, convert packing free-text assignedTo to a person dropdown, MIGRATE existing free-text values to person_ids with an unmatched-report (Fail-Loud), and show a per-person/per-household task summary. (4) Multi-unit lodging: add optional lodges[] with per-household room assignments and a Lodging tab so rooming is structured data, not Stay.notes prose. (5) Sharing: build an invite/share UX (pick name+role, generate scoped token from P2, revocation) and household-segmented copy blocks (extend buildShareSummaryBlocks to accept a household filter). (6) Arrival coordination panel surfacing Person.arriving/leaving and flagging conflicts. Every new screen meets the Mobile/A11y Bar and a11y gate; every assignment/join is validated at the boundary. Report implemented vs verified vs manual; do NOT build all six at once — RSVP+households first, demo, then proceed.
```

---

### P7 — Edge-Case, Toddler-Safety & QA Hardening
**Goal:** Close correctness/edge-case gaps that only bite at scale, add toddler-aware guardrails, and add a test suite exercising the real large/multi-household/toddler scenarios plus an error-boundary safety net.
**Depends on:** P6.

**Acceptance gates**
- A toddler trip flags over-scheduled nap windows and >6hr car/seat time; gear is in the template checklist.
- A bad slug shows a friendly "trip not found," never a white screen.
- Saving an empty-itinerary trip surfaces a clear warning.
- Semantic warnings (capacity/timeline/roles/budget) appear without blocking valid saves.
- Test suite includes 16+ person, 14-day, and toddler scenarios; ManageTrip form save/validation tested; full suite green in CI.

**Runnable prompt**
```text
You are QA-hardening FamilyTrips and adding toddler-aware guardrails. Ground in real code: src/context/tripContextCore.ts (useTrip throws on null lines 6-9; no error boundary), src/pages/Trip.tsx (line 20 useTrip, line 55 empty-itinerary EmptyState), src/utils/formatters.ts (T12:00:00 timezone assumption ~14-39; formatDay/formatItinerary no bounds check ~145-181), src/utils/validateTripData.ts (format-only, ~190-232), src/pages/NewTrip.tsx (kidsAndAges free text line 729), src/utils/tripShell.ts (TRIP_TEMPLATE_OPTIONS lines 19-25, no toddler/multi-household template), src/data/trips/myrtle-beach.ts (real 18-month-old), src/pages/People.tsx (lines 28-40 unguarded p.phone tel: link). Tasks: (1) Add a structured child/toddler constraint model (ages, nap window, dietary notes, gear) and a 'family-with-toddler' template; on itinerary generation flag activities that collide with nap windows or imply >6hr seat time, and include toddler gear in the template checklist — advisory framing only, never medical guidance. (2) Add a route-level error boundary (in Layout or a wrapper) so a missing/null trip shows a friendly 'trip not found' instead of the useTrip throw / white screen; consider making useTrip return Trip|null at call sites. (3) Add semantic validators (capacity vs lodging headcount, timeline feasibility, required roles like at-least-one-organizer, budget plausibility) surfaced as non-blocking WARNINGS separate from shape errors; warn on saving an empty itinerary. (4) Make date formatting timezone-aware for multi-TZ guests and add out-of-trip-bounds date checks in formatDay/formatItinerary. (5) Add defensive rendering for optional fields (People.tsx p.phone?.trim() before tel:). (6) Add test fixtures and tests for 16+ person, 14-day, and toddler scenarios, plus ManageTrip form save/validation tests (date ranges, duplicate ids, API error recovery, optimistic+rollback). Run the full vitest suite + governance scripts in CI. Report implemented vs verified vs manual.
```

---

## Verification performed (how this audit was produced)
- 8 parallel auditor agents read the real repo (`src/`, `api/`, `scripts/`, `docs/`, config) and cited `file:line` evidence per finding.
- Each high/critical/medium finding was adversarially re-checked against the cited files; refuted findings were dropped, over-stated severities adjusted. 83 findings survived across the 8 dimensions.
- A synthesis pass sequenced verified findings into this 8-phase program with per-phase runnable prompts and acceptance gates.
- Raw audit run: workflow `wf_7377a678-69f`, 2026-06-24.

## What is intentionally NOT in this program (named stopping points)
Billing/payments, public trip discovery, org/team multi-tenancy, full account-based RBAC, real-time presence/collaboration, native mobile apps, marketplace. Revisit only after the real multi-household trip ships and is used.
