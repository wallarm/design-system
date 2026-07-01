# Paired chip — operator re-selection in an incomplete chip

**Date:** 2026-07-01
**Component:** `FilterInput` (paired / `key_value` fields, e.g. `context_param`)
**Ticket:** AS-1192

## Problem

A paired chip has two triplets: the **base** (`attribute → operator → value`) and the
**pair** (`operator → value`). When a paired chip is committed *incomplete*, the user
cannot re-select the **pair operator** while it is not yet set.

Two incomplete-pair states exist today:

| State | Chip shows | Click behaviour today |
|---|---|---|
| `condition.pair == null` (base done, pair never started) | required `Value` segment | label is clickable, but `handlePairChipClick` returns early on the `!condition?.pair` guard → **nothing happens** |
| `pair.operator` set, `pair.value` empty | operator segment + red `Value` | label routes to **value**; the visible operator segment is clickable → operator re-select already works |

So the pair operator is unreachable exactly when it has not been chosen yet. The base
triplet already behaves like a single chip (`handleChipClick` + `getFirstIncompleteSegment`),
so this spec only closes the gap on the **pair** side.

The underlying commit machinery already supports this: `useOperatorFlow` with
`editingSide === 1` reads/writes `condition.pair`, and `upsertCondition(..., side: 1)`
creates `condition.pair` even when it did not exist. Only the two entry points are missing.

## Approach (A — mirror single-chip resume in the pair, with targeted re-select)

1. **Helper `getFirstIncompletePairSegment(condition, field)`** — mirrors
   `getFirstIncompleteSegment` for the pair:
   - returns `operator` when the base is complete and the pair operator is missing
     (`condition.pair == null` **or** `condition.pair.operator` undefined);
   - else returns `value` when the pair value is empty;
   - else `null`.

2. **`handlePairChipClick` (`useChipEditing.ts`)** — relax the early-return: require
   `pairedField && chip?.pair` but **not** `condition.pair`. When the pair has no
   operator yet, seed the operator menu (`selectedField = pairedField`,
   `selectedOperator = null`, `editingSegment = operator`, `editingSide = 1`,
   `menuState = 'operator'`). Keep the handler **segment-direct** — clicking the
   operator segment opens the operator menu, clicking value opens the value menu
   (no redirect). This is the "targeted re-select" the user asked for.

3. **`FilterInputChip.tsx` incomplete-pair label** — replace the hardcoded
   `SEGMENT_VARIANT.value` in the label `onClick` with a route through
   `getFirstIncompletePairSegment`: no operator → operator menu; operator set but
   value empty → value menu.

### Interaction contract after the change

- Incomplete pair, no operator: click the chip (label) → **operator menu** → pick
  operator → advances to value → pick value → chip is complete/green.
- Incomplete pair, operator set / value empty: click the label → **value menu**;
  click the operator segment → **operator menu** (targeted re-select).
- Complete pair: unchanged — clicking the operator segment re-selects the operator.
- Base triplet: unchanged (already mirrors the single-chip resume).

## Non-goals

- No change to the base-triplet flow.
- No change to the building (first-time entry) flow — only re-editing a committed
  incomplete chip.
- No "any click redirects to first incomplete segment" behaviour on the pair; the
  user explicitly chose targeted per-segment re-select.

## Testing

- **Unit** — `getFirstIncompletePairSegment`: base-incomplete → `null`;
  base-complete + no pair → `operator`; pair operator set + empty value → `value`;
  complete pair → `null`.
- **E2E** — build a `context_param` chip, commit it with the pair operator unset,
  then click the chip and verify the pair **operator** menu opens, selecting an
  operator advances to the value menu, and completing it clears the error (chip
  no longer red). Also verify the operator-set/value-empty case: label → value,
  operator segment → operator.

## Touched files

- `hooks/useFilterInputAutocomplete/useChipEditing.ts` — helper + `handlePairChipClick`
- `FilterInputField/FilterInputChip/FilterInputChip.tsx` — label routing
- unit + e2e test files under `FilterInput/`
