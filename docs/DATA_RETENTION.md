# Data Retention & Deletion

Status: P0 defines the **policy**. The soft-delete **code + `deleted_at` migration** land in P1 (the schema-migration phase) because they require a Supabase schema change that must be branch-tested and owner-approved before touching production.

## Current reality (P0)

- The only delete path today is `deleteUatTrip` in `api/trips.ts`, and it is **scoped to test data only** — it deletes a dynamic trip only when `created_by = 'Codex UAT'`. Hard-deleting that test row (with its history/checklist cascade) is correct and intentional for UAT cleanup.
- **There is no owner-facing trip delete yet**, so there is no accidental-real-trip-deletion path to guard against in P0. P0 leaves `deleteUatTrip` unchanged.

## Target policy (implemented in P1 / P6)

- **Deletion is reversible by default.** An owner-facing delete marks a trip deleted (`deleted_at`) and hides it; it is not immediately destroyed.
- **A recovery window of at least 7 days** applies before any hard purge.
- **History is append-only.** `trip_override_history` is retained for restore and is not deleted on soft-delete.
- Reads filter out soft-deleted rows; a hard purge is a separate, explicit action after the window.

## Migration to add (P1)

```sql
alter table trip_overrides   add column if not exists deleted_at timestamptz;
alter table checklist_items  add column if not exists deleted_at timestamptz;
alter table checklist_state  add column if not exists deleted_at timestamptz;
-- reads then filter: ... where deleted_at is null
```

## Retention defaults

- Active and past trips are retained indefinitely unless the owner deletes them.
- Soft-deleted trips are recoverable for ≥7 days, then eligible for purge.
- Override history: retained for restore; not auto-expired in P0.

## Deferred (named, later phases)

- Owner-facing "recently deleted / restore" UI (P3+).
- Owner-initiated permanent delete + a documented right-to-be-forgotten path (P2/P6).
- Automated purge job for expired soft-deletes.
- Audit-log retention policy (audit log itself lands in P1).
