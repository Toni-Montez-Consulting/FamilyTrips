# Data Contracts & Classification

Status: P0 baseline (governance floor). This file is the source of truth for what data may live where. It is enforced today by `scripts/privacy-scan.mjs` (CI-blocking) for seed content, and tightened by token-scoped reads in P2 (see `docs/AUDIT_AND_ELEVATION.md`).

The hard rule: **anything in `src/data/trips/*.ts` ships in the public JavaScript bundle**, and dynamic trips are anon-readable by slug today. `visibility: 'unlisted'` only hides a trip from the index — it is not access control. Classify before you store.

## Four tiers

| Tier | Definition | Where it may live |
|------|------------|-------------------|
| **PUBLIC** | Non-identifying trip metadata | Bundle / anywhere (`destination`, public dates, public resort/venue name, `tagline`, `heroImage`) |
| **SHARED** | Visible to anyone holding the trip's share token | Itinerary, things-to-do, packing, checklist + state, copy blocks, roster **first names**, budget line items/totals |
| **PRIVATE / PII** | Must never ship client-side and never be anon-readable | See the list below |
| **INTERNAL** | System-only | Audit logs, share tokens, override history, rate-limit state |

## PRIVATE / PII (never in the bundle, never anon-readable)

Mapped to real `Trip` fields (`src/types/trip.ts`):

- `Stay.hostPhone`, `Person.phone` — direct phone numbers
- `Stay.address` (exact residential address; public venue addresses are PUBLIC)
- `Stay.wifiSsid`, `Stay.wifiPassword` — network access
- `Booking.confirmation` — reservation / record-locator / PNR codes
- **Bed / room assignments** — who sleeps where (currently appears in `Stay.notes` prose)
- Door / gate / lockbox / key codes and access instructions
- Granular financial detail tied to a person (account numbers, card detail). Budget *line items and totals* are SHARED.
- Child / toddler specifics that identify a minor's routine beyond first name

Until P2's token-gated private read exists, keep these **out of seed objects entirely** and use the established private-wording convention (`"shared privately with the group"`, `"stored privately"`).

## Never ship client-side (secret deny-list)

These must only exist as server-side env vars (never `VITE_`-prefixed, never committed):

- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ADMIN_PIN`, `TRIP_EDITOR_PIN`
- Any future share-token signing secret

The PIN is also never persisted to `localStorage`/`sessionStorage` (held in component memory only).

## Enforcement

- `npm run privacy:scan` (in `.github/workflows/ci.yml`, runs before build) fails the build on phone numbers, confirmation codes, access/key instructions, exact private addresses, **and bed/room assignments** in seed data. A deliberate fixture in the script's self-tests proves each rule still triggers.
- `npm run validate:data` checks shape, duplicate ids, and date ranges.
- New `PRIVATE/PII` fields added to the `Trip` type must be added to the scan and to this file in the same change.

## Not yet enforced (named, deferred to later phases)

- Token-scoped RLS so SHARED/PRIVATE data is only readable with a valid share token (P2).
- A separate server-only table for PRIVATE fields with a token-gated read endpoint (P2).
- Per-person identity (`person_id`) and roles so "roster first names" can be governed (P1).
