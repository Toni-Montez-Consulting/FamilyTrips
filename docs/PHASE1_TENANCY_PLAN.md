# Phase 1 — Data Model & Tenancy Backbone — Implementation Plan

> Plan-first (owner-approved before any DB change). Migrations run on a **Supabase branch** first, then merge to prod. Source spec: `docs/AUDIT_AND_ELEVATION.md` (P1) + decision locks DL2/DL3.

**Goal:** Install a stable UUID trip identity, household/person/role tenancy, an audit log, soft-delete, and a deterministic slug resolver — additively, without a risky primary-key swap.

**Central design decision (locks the blast radius down):** `trip_slug` is the PK of `trip_overrides` and the join key for `trip_override_history`, `checklist_state`, and `checklist_items`. We do **NOT** swap that PK. Instead we **add** `trip_id uuid unique` as the stable identity and keep `trip_slug` as the operational join key. Every trip gains a permanent UUID (the scale seam); the join-key migration to `trip_id` is explicitly deferred until a real need forces it.

**Tech Stack:** Supabase Postgres (migrations via the connected Supabase MCP, branch first), Vite/React/TS, vitest.

## Global Constraints

- **Branch-first:** create a Supabase dev branch, apply + verify there, then merge to prod. Confirm the branch cost before creating it (Supabase branching is paid).
- **Additive only:** no PK swap, no destructive column drops, no data deletion. Every `alter` is `add column if not exists` / `create table if not exists`.
- **Permission role ≠ display role:** the new permission role (`owner`/`editor`/`household-lead`/`viewer`) lives on `trip_members`, NOT on `Person.role` (which is a display label like "Wife"/"Dad"). Do not conflate them.
- **Security/RLS lockdown is P2, not here.** New tables (`households`, `trip_members`, `audit_log`) ship server-only: RLS enabled, **no anon grants/policies** (service role bypasses RLS). Existing open anon policies are untouched in P1.
- **Fail-Loud:** corrupted JSONB on read surfaces a visible error (never a silent empty trip); the slug resolver resolves deterministically and is tested.
- **Verify gate before merge-to-prod:** on the branch — `npm run privacy:scan && npm run validate:data && npm run lint && npm run test && npm run build`, plus a manual smoke that existing seed + dynamic trips still load.

---

## Migration SQL (apply on the branch)

```sql
create extension if not exists pgcrypto;

-- 1. Stable UUID identity (additive; slug stays the operational key)
alter table public.trip_overrides add column if not exists trip_id uuid not null default gen_random_uuid();
create unique index if not exists trip_overrides_trip_id_idx on public.trip_overrides (trip_id);
alter table public.trip_overrides add column if not exists schema_version integer not null default 1;

-- 2. Soft-delete (recovery window; see DATA_RETENTION.md)
alter table public.trip_overrides  add column if not exists deleted_at timestamptz null;
alter table public.checklist_items add column if not exists deleted_at timestamptz null;
alter table public.checklist_state add column if not exists deleted_at timestamptz null;

-- 3. Households (per-trip roster grouping)
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  trip_slug text not null,
  name text not null,
  primary_contact_person_id text null,
  notes text null,
  created_at timestamptz not null default now()
);
create index if not exists households_trip_idx on public.households (trip_slug);

-- 4. Trip members + permission role (authority for who-can-do-what)
create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_slug text not null,
  person_id text not null,
  household_id uuid null references public.households(id) on delete set null,
  role text not null default 'viewer' check (role in ('owner','editor','household-lead','viewer')),
  created_at timestamptz not null default now(),
  unique (trip_slug, person_id)
);
create index if not exists trip_members_trip_idx on public.trip_members (trip_slug);

-- 5. Audit log (who changed what, when)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  trip_slug text not null,
  person_id text null,
  actor text null,
  action text not null,
  target text null,
  before_summary text null,
  after_summary text null,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_trip_idx on public.audit_log (trip_slug, created_at desc);

-- 6. Server-only by default (token-scoped access defined in P2)
alter table public.households   enable row level security;
alter table public.trip_members enable row level security;
alter table public.audit_log    enable row level security;

-- 7. Belt-and-suspenders backfill (the volatile default already fills existing rows)
update public.trip_overrides set trip_id = gen_random_uuid() where trip_id is null;
```

This SQL is appended to `docs/SUPABASE.md` as the P1 block once verified on the branch.

---

### Task 1: Create + cost-confirm the Supabase branch

- [ ] Identify the FamilyTrips Supabase project (connected Supabase MCP `list_projects`).
- [ ] `get_cost` for a branch; **surface the cost to the owner and confirm** before `create_branch`.
- [ ] Create the dev branch.

### Task 2: Apply the migration SQL on the branch

- [ ] `apply_migration` (name `p1_tenancy_backbone`) with the SQL above against the branch.
- [ ] `list_tables` to confirm `households`, `trip_members`, `audit_log` exist and `trip_overrides` has `trip_id`, `schema_version`, `deleted_at`.
- [ ] Verify existing `trip_overrides` rows each got a distinct non-null `trip_id`.

### Task 3: Type scaffolding (code-only, additive)

**Files:** `src/types/trip.ts`

- [ ] Add a `Household` type and an optional `household_id?: string` to `Person` (data lives in `trip_overrides.data` JSONB → no DB column). Leave `Person.role` as the free-text **display** label; do not enum it.
- [ ] Add optional `schema_version?: number` to the editable trip data shape; add `'household_id'` handling so it survives `normalizeTripOverrideData` (it rides inside `people`, already an editable key — confirm no stripping).
- [ ] `npx tsc -b` clean; existing tests still green.

### Task 4: Runtime validation on JSONB read (Fail-Loud)

**Files:** `src/utils/tripOverrides.ts` (`dynamicTripFromRow`), test in `src/utils/tripOverrides.test.ts`

- [ ] **Failing test:** a `dynamicTripFromRow` row whose `data` is structurally corrupt returns a *visible* error signal, not `null` that renders as an empty trip. (Define the signal: e.g. `dynamicTripFromRow` stays, but add `resolveDynamicTrip(row): { trip } | { error }` consumed by `useResolvedTrip`, surfaced via the existing `TripRouteStatus error`.)
- [ ] Implement minimal resolver; run RED→GREEN.

### Task 5: Deterministic slug resolver (the HIGH-severity fix)

**Files:** `src/components/Layout.tsx` (line 38), `src/hooks/useTripOverrides.ts`, test for the resolver

- [ ] First **verify the collision is reachable**: does `/api/trips` `create` reject a slug that matches a code seed (`getTrip(slug)` truthy)? If it already rejects, the resolver fix is defense-in-depth; if not, add the guard.
- [ ] **Failing test** for a deterministic resolver: given a code seed for slug X AND a `trip_overrides` row for X with `source='dynamic'`, resolution is deterministic and documented (dynamic row wins as a standalone dynamic trip; it is not silently merged onto the seed). Fail-Loud on ambiguity.
- [ ] Implement; keep the happy path (seed + its own override) unchanged. This touches the core resolution path — extra care + a green full suite before moving on.

### Task 6: Audit-log writes on save

**Files:** `src/server/tripOverrideActions.ts`, `api/trip-overrides.ts` (store), `api/trips.ts`, tests in `tripOverrideActions.test.ts`

- [ ] Extend `TripOverrideStore` with `appendAudit(row)`; the in-memory test store records it.
- [ ] **Failing test:** a successful `save` writes one audit row (trip_slug, actor=updatedBy, action='save', version summary).
- [ ] Implement: write an `audit_log` row on every override save + restore. Wire the Supabase store's `appendAudit` in `api/trip-overrides.ts`.

### Task 7: Verify on branch, then merge to prod

- [ ] On the branch: full gate (`privacy:scan`, `validate:data`, `lint`, `test`, `build`) green.
- [ ] Manual smoke: existing seed trip + a dynamic trip still load; an override save still works and writes an audit row.
- [ ] Append the P1 SQL block to `docs/SUPABASE.md`.
- [ ] **Owner confirms** → `merge_branch` to prod (production mutation — explicit go required).
- [ ] Delete the dev branch (stop the cost).

### Task 8: Rollback plan (documented, not executed)

- All changes are additive, so rollback = `drop table if exists households, trip_members, audit_log;` and `alter table trip_overrides drop column if exists trip_id, schema_version, deleted_at;` (plus the checklist `deleted_at`). No data loss in existing columns. Keep this snippet ready before merge-to-prod.

## Explicitly NOT in P1 (deferred, named)

- Token-scoped RLS / making Supabase an access boundary (P2).
- Magic-link identity + share tokens (P2, per DL1).
- The join-key migration from `trip_slug` to `trip_id` across history/checklist tables (only if a real need forces it).
- Any owner-facing households/roles UI (P6).
- Full account RBAC.

## Self-review

- Spec coverage: UUID identity (Task 2/3) ✓; households + members + role (Task 2, role-not-on-Person ✓); audit log (Task 2/6) ✓; soft-delete columns (Task 2; code wiring stays deferred per P0 DATA_RETENTION) ✓; slug resolver (Task 5) ✓; runtime JSONB validation (Task 4) ✓; backfill (Task 2) ✓; branch-first + rollback (Tasks 1/7/8) ✓.
- Blast-radius control: no PK swap; new tables server-only; happy-path resolution unchanged.
