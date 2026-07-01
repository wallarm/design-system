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

1. **`FilterInputChip.tsx` incomplete-pair label** — replace the hardcoded
   `SEGMENT_VARIANT.value` in the label `onClick` with a route based on the
   displayed pair: `pair.operator ? 'value' : 'operator'`. The decision lives at
   the display layer because that is where the routing happens and the chip only
   holds display data — `chip.pair.operator` is populated exactly when
   `condition.pair.operator` exists, so it is a faithful proxy for "the pair
   operator is set". (This supersedes the originally-sketched condition-based
   `getFirstIncompletePairSegment` helper, which would have needed the condition
   the chip does not have.)

2. **`handlePairChipClick` (`useChipEditing.ts`)** — relax the early-return: require
   `condition && pairedField && chip?.pair` but **not** `condition.pair` (and guard
   the one `condition.pair.operator` read with `?.`). When the pair has no operator
   yet, the handler already seeds the operator menu for `segment === 'operator'`
   (`selectedField = pairedField`, `selectedOperator = null`, `editingSegment =
   operator`, `editingSide = 1`, `menuState = 'operator'`). It stays
   **segment-direct** — clicking the operator segment opens the operator menu,
   clicking value opens the value menu (no redirect). This is the "targeted
   re-select" the user asked for. The commit path (`useOperatorFlow` with
   `editingSide === 1`, `upsertCondition(..., side: 1)`) already creates
   `condition.pair` from scratch, so no change is needed there.

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

- **Unit** (`FilterInputChip.test.tsx`) — the incomplete-pair label routes clicks:
  no operator → `onPairSegmentClick('operator')`; operator set + empty value →
  `onPairSegmentClick('value')`; complete pair → label not interactive.
- **E2E** (`FilterInput.e2e.ts`, AS-1179 paired-chip block) — build a `context_param`
  chip, blur before choosing the pair operator so it commits incomplete, then click
  the "Value" label and verify the pair **operator** menu opens (operator menuitems
  visible; the freeform value flow has none). Interaction-only, so it dodges the
  AS-1193 value-commit race that quarantines the sibling resume→value test.

## Touched files

- `FilterInputField/FilterInputChip/FilterInputChip.tsx` — incomplete-pair label routing
- `hooks/useFilterInputAutocomplete/useChipEditing.ts` — `handlePairChipClick` guard
- `__tests__/FilterInputChip.test.tsx` — updated label-routing unit test
- `__tests__/FilterInput.e2e.ts` — new AS-1192 resume-at-operator e2e
