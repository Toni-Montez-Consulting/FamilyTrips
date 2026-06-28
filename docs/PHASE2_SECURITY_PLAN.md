# Phase 2 — Security & Identity — Implementation Plan

> Plan-first (owner-approved before any DB change). New tables run on a **Supabase branch** first, then merge to prod (same flow P1 used). Source: `docs/AUDIT_AND_ELEVATION.md` (P2) + locks DL1/DL2/DL5. Architecture locked **2026-06-27: Hybrid**.

**Goal:** Make Supabase a real access boundary — close the PII exposure, add per-trip share tokens + optional magic-link identity, and enforce capability roles — **without a login wall for viewing** and **without losing realtime checklist sync.**

**Architecture (locked — Hybrid):** Enforcement is **server-side** in the `api/` layer (validate share token or magic-link identity, then capability), not claim-based RLS. SHARED data (itinerary, checklist, roster first-names) stays anon-readable so realtime survives. **PRIVATE/PII moves to a server-only table served only through a gated endpoint** — that is the actual breach fix. New tables are server-only (RLS on, no anon policy). Magic-link gives real identity for attribution, co-ownership, and capability checks.

## Global Constraints

- **Branch-first** for all migrations; confirm branch cost before creating; merge to prod only on explicit owner go; delete branch after.
- **Additive only** on existing tables; new tables server-only (RLS enabled, no anon grant).
- **No login wall:** "open the link and read it" must keep working for SHARED data; magic-link and editor tokens are opt-in upgrades.
- **Capability is server-enforced** (never trusted from the client). Roles: `owner` (full), `editor` (edit SHARED), `household-lead` (own household only), `viewer` (read + own RSVP).
- **Fail-Loud**, **secrets never client-side** (extends `DATA_CONTRACTS.md`), full gate before done (`privacy:scan`, `validate:data`, `lint`, `test`, `build`).

## Migration SQL (branch first)

```sql
-- Per-trip share tokens (link-bearer access; server-validated)
create table if not exists public.trip_shares (
  id uuid primary key default gen_random_uuid(),
  trip_slug text not null,
  token text not null unique,
  capability text not null default 'viewer' check (capability in ('owner','editor','household-lead','viewer')),
  label text null,
  created_by text null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz null
);
create index if not exists trip_shares_trip_idx on public.trip_shares (trip_slug);
create index if not exists trip_shares_token_active_idx on public.trip_shares (token) where revoked_at is null;

-- Private trip data (PII) — NEVER anon-readable; served only via the gated endpoint
create table if not exists public.trip_private (
  trip_slug text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Magic-link identity -> roster mapping (the P1 DL1 seam, added here)
alter table public.trip_members add column if not exists auth_user_id uuid null;
alter table public.trip_members add column if not exists claimed_by_email text null;
create index if not exists trip_members_auth_idx on public.trip_members (auth_user_id);

-- Durable rate limiting (replaces the in-memory IP map)
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null,
  locked_until timestamptz null,
  updated_at timestamptz not null default now()
);

alter table public.trip_shares enable row level security;  -- server-only
alter table public.trip_private enable row level security;  -- server-only
alter table public.rate_limits enable row level security;   -- server-only
```

## Data classification applied (what moves to `trip_private`)

Per `DATA_CONTRACTS.md`, these fields move out of the anon-readable `trip_overrides.data` into `trip_private.data`, and are stripped from seed files: `Stay.address` (residential), `Stay.hostName`, `Stay.hostPhone`, `Stay.wifiSsid`, `Stay.wifiPassword`, `Stay.confirmation`, `Booking.confirmation`, `Person.phone`, per-person bed/room assignments, and granular budget detail (account/payment specifics; line-item names + totals stay SHARED). The client fetches the public trip (anon) and overlays the private data only when the request is authorized.

---

## Sub-phase P2a — PRIVATE split + gated read (highest value; do first)

Closes the breach-class exposure on its own.

- **Tasks:** add `trip_private` (branch-tested → prod); a `getPrivateTripData(tripSlug, auth)` server path in `api/` that returns `trip_private.data` only when the request carries a valid (non-revoked) share token OR a magic-link member of the trip; a client overlay that merges private fields into the trip after an authorized fetch; migrate existing PRIVATE fields out of `trip_overrides.data` and seed files into `trip_private`; extend `privacy-scan` to also fail on these fields appearing in `trip_overrides` SHARED data.
- **Acceptance gates:** an anon client (no token, not signed in) cannot read host/Wi-Fi/address/confirmation/phone for any trip (demonstrated); an authorized viewer still sees them; `privacy-scan` blocks PII in the SHARED path; full gate green.
- **TDD:** the authorization function (`canReadPrivate(token|auth, trip)`) is pure/unit-tested (valid token, revoked token, wrong trip, member, non-member).

## Sub-phase P2b — Share tokens + capability roles

- **Tasks:** `trip_shares` table; server token generation (opaque random, `crypto.randomBytes`) + revocation; share URL format `/:slug?s=<token>`; a capability matrix enforced in the `api/_requestGuards`-equivalent (owner/editor/household-lead/viewer); per-trip **editor tokens** so `TRIP_EDITOR_PIN` stops granting blanket edit on every trip (DL2) — the shared editor PIN is retired in favor of scoped tokens, `ADMIN_PIN` stays the owner root credential; an owner "Share" UI to mint/revoke links with a chosen role.
- **Acceptance gates:** a viewer token cannot edit SHARED; an editor token cannot delete the trip or manage members; a household-lead token can edit only its own household; revoking a token immediately blocks that link (tested); capability checks are server-side (tested at the action layer).
- **TDD:** capability resolution + enforcement at `runTripOverrideAction` and the private-read path.

## Sub-phase P2c — Magic-link identity

- **Tasks:** enable Supabase Auth magic-link (`supabase.ts` → `persistSession: true` for a separate authed client, keep the anon client for public reads); a sign-in flow (email → magic link); a claim step linking a signed-in user to a roster `person_id` (`trip_members.auth_user_id` / `claimed_by_email`); the server uses the verified identity for capability + attribution (audit `person_id`) + co-owner promotion. **Viewing never requires login.**
- **Acceptance gates:** a person claims their roster slot via emailed magic-link and is recognized across devices; an owner can promote a claimed member to co-owner; anon viewing still works via token alone; audit rows now carry `person_id` for signed-in editors.
- **Limitations check (state at build):** magic-link adds email-deliverability as a new failure surface (per the DL1 tradeoff the owner accepted); degrade gracefully if email send fails.

## Sub-phase P2d — Hardening

- **Tasks:** move rate-limit state from the in-memory IP map (`api/_requestGuards.ts:22`) to the `rate_limits` table, keyed on **token/PIN attempt** (not just IP), persistent across serverless restarts, with exponential lockout and a 6+ digit PIN minimum; a pre-commit + CI **secret scan** blocking committed `.env`/key patterns; `SameSite=Strict` + CSRF protection on POST/PUT/DELETE; a per-endpoint **OpenAI cost/quota guard** in `api/trips.ts`.
- **Acceptance gates:** rate limit survives a simulated restart and locks after N failed attempts (tested via `checkRateLimitForKey` with a Supabase-backed store); CI secret-scan fails on a deliberately committed fake `.env`; a 4-digit PIN is rejected at config.

---

## Rollback (documented, not executed)
All new tables/columns are additive: `drop table if exists trip_shares, trip_private, rate_limits;` and `alter table trip_members drop column if exists auth_user_id, claimed_by_email;`. Before stripping PRIVATE fields, export them to a one-time JSON backup **outside** the anon path (not left in `trip_overrides.data`, which would defeat the fix) so the split is reversible.

## Sequencing & not-in-P2
Order: **P2a → P2b → P2c → P2d** (PII fix first; each sub-phase shippable). Migrations branch-first. NOT in P2: the consumer home/brand (P3), design system (P4), households/RSVP UI (P6). Full account RBAC and real-time presence stay deferred.

## Self-review
- Locks covered: DL1 (token + magic-link, P2b+P2c) ✓; DL2 (capability roles, retire shared editor PIN, P2b) ✓; DL5 (two-tier privacy, PRIVATE table + gated read, P2a) ✓.
- Realtime preserved (SHARED stays anon) ✓; no login wall for viewing ✓; new tables server-only ✓; branch-first + rollback ✓.
