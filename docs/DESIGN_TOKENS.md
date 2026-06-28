# FamilyTrips skin — design tokens

Derived from the object model (trip / household / roster / lodging / the anchor-a-day pacing),
not travel-app tropes. Implements the Montez design grammar (`design-system/DESIGN.md`).
Tokens live in `src/index.css` `@theme` (Tailwind v4).

## Palette (semantic product-noun tokens)

| Token | Hex | Means |
|---|---|---|
| `--color-paper` | #f6f3ec | the field-guide page (app background) |
| `--color-surface` | #fffdf8 | a lifted record (the active trip) |
| `--color-ink` | #201b16 | primary text / primary action |
| `--color-ink-soft` | #6f665b | secondary text + system labels |
| `--color-rule` | #e4ded1 | hairline containment (1px borders) |
| `--color-live` | #bf4a2a | the active/upcoming trip — alive |
| `--color-held` | #9b9488 | wrapped/past trips — quiet |
| `--color-open` | #4f7361 | protected open space (the pacing principle) |

## Type (two-font discipline)

- **Text face:** Fraunces (warm editorial serif) — wordmark, headings, body. `--font-display`.
- **System labels:** DM Mono — uppercase, ~0.12–0.18em tracking, for countdowns/labels. `--font-mono`.
- No Inter / Roboto / SF Pro.

## Signature moves

1. **Mono system labels** ("NEXT TRIP · DEPARTS IN 6 DAYS", "WHO'S COMING · 17").
2. **The trip record** — a sharp-cornered block with a `--live` left-accent; the active trip dominates, others are quiet hairline lines (asymmetric).
3. **"Copy for the group"** — the pasteable-message affordance, recurring.

## Banned-list (what would make this look like everyone else's app)

Rounded card soup, drop-shadow cards, gradient hero band, KPI/stat tiles, pill/badge status,
prototype navbar, equal-column splits, Inter/Roboto/SF, destination-search-bar hero.
Shadow is allowed ONLY as actionability (a pressable button lifts), never on a content block.
