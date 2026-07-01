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

## Follow-up (targeted per-segment editing — the real "like a single chip" fix)

The label routing above made the operator *reachable*, but clicking the chip still
did not behave like a single chip. Root cause: `useResumeBuilding.tryResumeBuilding`
(called first in both `handleChipClick` and `handlePairChipClick`) intercepts **every**
click on a committed-incomplete paired chip and *resumes building* at the first missing
step — removing the chip and reopening the menu there — regardless of which segment was
clicked. So clicking the base operator jumped to the pair value; no segment was
individually editable. A single chip has no such hijack: clicks inline-edit the segment
they land on.

**Fix:** in `useResumeBuilding`, stop resuming for the *base-complete but pair-incomplete*
case (return `false`), so those clicks fall through to the normal inline-edit handlers,
which target the clicked segment. The one genuine cascade — base **value** missing on a
paired field, where picking the value must flow into the second triplet — is kept.

Resulting behaviour, matching a single chip:

- Click the base operator → base operator menu; base value → key menu.
- Click the (visible) pair operator → pair operator menu; pick → advances to value.
- The zero-width missing pair segments keep the "Value" label as their affordance
  (routes to operator when unset, else value).

The commit paths were already correct (`useOperatorFlow` / `useValueFlow` with
`editingSide === 1`, `upsertCondition(..., side: 1)`), so no change there.

## Follow-up 2 (empty paired value has no clickable edit area)

Symptom: after the pair goes red (value required), clicking to fill the value "just
closes". Root cause (reproduced in Storybook): the inline-edit `<input>` auto-sizes to
its content (`useSizerWidth` on `editText || ' '`), so an **empty** value collapses to
~5px. A freeform paired value (`options: []`) has no dropdown to fall back on, so there
is no visible, hittable target — any near-miss blurs the edit shut. Typing works only if
the ~5px input is somehow hit.

**Fix:** give the value-variant edit input a minimum width (`min-w-[3.5rem]`) in
`Segment.tsx`. Content-driven width still grows past it, so non-empty edits are
unchanged; only the empty case gains a usable (~56px) click/type area. Scoped to the
value variant — operator/attribute edits have menus and don't need it.

## Follow-up 3 (clicking the empty value deletes the chip)

Symptom: with the pair operator set and the value empty (red), clicking the value to
fill it **deletes the chip**. Root cause (reproduced in Storybook): the idle empty value
segment is zero-width and sits at the chip's right edge — exactly where the trailing
remove (×) button renders (both at x≈401). So the click lands on × and removes the chip.
(Follow-up 2's min-width only applied while *editing*; idle it was still 0px.)

**Fix (two parts):**

1. `FilterInputChip.tsx` — reserve a clickable width (`min-w-[3.5rem]`) for the pair
   value segment while it is empty, even when idle. The value becomes its own hit target
   and pushes × to its right (verified: value x=401 w=56, × x=457).
2. `useChipEditing.ts` — a value click while the pair operator is unset redirects to the
   operator (you can't fill a value before its operator), mirroring the label routing and
   the single-chip first-incomplete-segment behaviour.

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
- `hooks/useFilterInputAutocomplete/useResumeBuilding.ts` — stop hijacking clicks on a
  base-complete/pair-incomplete chip so segments stay individually editable
- `FilterInputField/FilterInputChip/Segment.tsx` — minimum edit width for the value
  variant so an empty freeform value is a usable click/type target
- `__tests__/FilterInputChip.test.tsx` — updated label-routing unit test
- `__tests__/FilterInput.test.tsx` — updated force-commit-mid-pair test to the targeted behaviour
- `__tests__/FilterInput.e2e.ts` — label-opens-operator e2e + targeted-segment-edit e2e
