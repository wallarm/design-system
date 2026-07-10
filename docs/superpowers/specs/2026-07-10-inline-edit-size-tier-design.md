# InlineEdit Custom Size (`inline-edit`) Design Spec

**Date:** 2026-07-10
**Ticket:** [WDS-143](https://wallarm.atlassian.net/browse/WDS-143) (continuation of the 2026-07-06 control-size-standardization spec)
**Branch:** TBD (WDS-143 implementation branch, not yet created — current branch is `main`)
**Figma:** `VKb5gW46uSGw0rqrhZsbXT` (WADS-Components), "Inline edit" canvas (node `11604:35999`), "Documentation" reference frame (node `11604:36160`)

## Overview

Artem Miskevich's 2026-07-09 review comment on WDS-143 flags the InlineEdit
value container: *"fix value's container size (all content types) → now 24
but should be 28 → + add new custom size of the input."* This spec addresses
that one bullet only.

The 2026-07-06 spec (`2026-07-06-control-size-standardization-design.md`)
standardized `Input`/`Textarea`/`InputGroup`/`SelectButton`/`SelectInput` onto
one shared 24/32/36px 3-tier scale (`small`/`medium`/`default`), but
explicitly deferred `InlineEdit` itself: *"InlineEdit's own components are
not touched at all — this spec fixes the shared primitives one layer down,
which is why the mismatch was visible there in the first place."* This spec
is that deferred follow-up: it adds a 4th tier — 28px, named `'inline-edit'`
— to that scale (and to `Button`/`ButtonBase`'s separate
small/medium/large scale), and wires InlineEdit's built-in editors to use it.

**28px is confirmed, not assumed**, from three independent sources:
1. Artem's comment text, verbatim ("should be 28").
2. Figma's "Documentation" reference frame: 7 independent value-container
   measurements — text, textarea, numeric, select, multi-select/tags,
   date/datetime, time — all render at `height=28`, with an explicit design
   note on the frame: *"use custom size for text + select inputs (to match
   overall height with other variations)."*
3. `AttributeValue.tsx:46` already has `min-h-[28px]` for vertical
   orientation — the host row already anticipates this height; only the
   guest controls (`Input`/`Textarea`/etc., rendered by `InlineEditControl`)
   haven't caught up yet.

## Why a new CVA tier, not a CSS override

Two mechanisms were considered:

- **(A) Add a real `size='inline-edit'` tier** to each atom's own CVA.
- **(B) Leave every atom alone** and force the 28px box via descendant-selector
  overrides in `InlineEditControl.tsx` (the same technique already used
  there for the 6px horizontal alignment: `[&_[data-slot=input]]:px-6`).

(B) was the initial direction — it needs no atom changes and guarantees
uniform height regardless of whatever `size` a consumer's custom editor
passes, by CSS specificity (`.control [data-slot=input]` at (0,2,0) always
beats a single-class `h-24` utility at (0,1,0), independent of stylesheet
order).

It was rejected once two atoms turned out to have more than one CVA block
keyed off the same `size`:

- **`NumberInput`** has 4 separate cva blocks (root / field / stepper
  control / stepper trigger). The stepper's icon size is a **discrete**
  `icon-xs` ↔ `icon-sm` swap, not an interpolatable padding value — a
  height-only ancestor override cannot make `size='small'` and
  `size='medium'` render identical steppers without also reaching into the
  stepper button and its child `svg` individually.
- **`ButtonBase`** (which `SelectButton` renders through) varies `px`/`gap`
  and `iconOnly`/`hasNonTextEnd` compound dimensions by size, not just
  height — an ancestor override would have to duplicate that whole
  compound-variant matrix from outside the component.

A real tier is one additional line per CVA block — consistent with how the
2026-07-06 spec already extended these same components — and keeps sizing
logic inside each component's own variant system instead of introducing a
second, parallel mechanism that only applies inside `InlineEdit`.

## Naming

Both existing scales gain `'inline-edit'` as an **additional** tier, not a
rename:

```ts
// Input / Textarea / InputGroup / SelectButton / SelectInput scale:
'small' | 'medium' | 'default' | 'inline-edit'   // 24 / 32 / 36 / 28 px

// Button / ButtonBase scale (unchanged tier names, per 07-06 spec):
'small' | 'medium' | 'large' | 'inline-edit'     // 24 / 32 / 36 / 28 px
```

Height: **28px**. Padding formula (unchanged from the 07-06 spec):
`py = (height − 20) / 2 = 4`.

## Per-component changes

### 1. `Input` (`Input/classes.ts`)

Add to `inputVariants`'s `size` variant:

```ts
'inline-edit': 'h-28 py-4',
```

### 2. `Textarea` (`Textarea/classes.ts`)

Add an `'inline-edit'` tier to both `textareaPaddingVariants` (`py-?`) and
`textareaHeightVariants` (`min-h-[?px]`). **Exact value TBD at
implementation** — Textarea's existing tiers (64/72/76px) don't sit on the
same linear height formula as the single-line controls, since a textarea's
box isn't just one line of text plus padding. Verify against the "text-area"
content-type reference in the Figma Documentation frame.

### 3. `InputGroup` (`InputGroup/InputGroup.tsx`) — backs `DateInput`/`TimeInput`/`DateRangeInput`

Add to `inputGroupVariants`'s `size` variant:

```ts
'inline-edit': 'h-28',
```

Widen `TemporalInputSize` in `TemporalCore/props.ts`:

```ts
export type TemporalInputSize = 'default' | 'medium' | 'small' | 'inline-edit';
```

Blast-radius note: this type is shared by `DateRangeInput` too, which gains
`'inline-edit'` in its public `size` prop even though InlineEdit doesn't
compose it today — same purely-additive tradeoff as `ButtonBase` below.

### 4. `ButtonBase` (`ButtonBase/classes.ts`)

Add to `buttonBaseVariants`'s `size` variant (px/gap interpolated between
`small`'s 8/4 and `medium`'s 12/6 — confirm visually at implementation):

```ts
'inline-edit': 'h-28 px-10 py-4 gap-5',
```

Add the two matching compound-variant rows:

```ts
{ iconOnly: true, size: 'inline-edit', className: 'w-28 h-28 p-4' },
{ hasNonTextEnd: true, size: 'inline-edit', className: 'pr-4' },
```

**Blast-radius note:** `ButtonBase` also backs `TabsButton`, `ToggleButton`,
and `SegmentedControlButton`. None of these will use `'inline-edit'`, but
all three gain it in their type surface since the addition is unconditional
on the shared CVA — the same acknowledged tradeoff the 07-06 spec flagged
when it first touched this "wider blast radius family."

### 5. `NumberInput` (`NumberInput/classes.ts`)

Add an `'inline-edit'` row to all 4 cva blocks:

- `numberInputRootVariants`: `h-28`
- `numberInputFieldVariants`: `px-12 py-4`
- `numberInputControlVariants`: interpolate between `small`
  (`px-2 py-0 [&_svg]:icon-xs`) and `medium` (`px-3 py-1 [&_svg]:icon-sm`) —
  the icon size is a discrete choice, not a blend; default to `icon-xs`
  (28px sits closer to `small`'s 24px than to `medium`'s 32px) and confirm
  visually.
- `numberInputTriggerVariants`: interpolate between `small` (`w-12 h-10`)
  and `medium` (`w-14 h-12`) — round to the nearest even value at
  implementation.

### 6. `SelectButton` (`Select/SelectButton.tsx`)

Add `'inline-edit'` to `SelectButtonSize` and to `SELECT_BUTTON_SIZE_MAP`
(`'inline-edit' → 'inline-edit'`, passed straight through to the now-extended
`Button`).

### 7. `SelectInput` (`Select/SelectInput/SelectInput.tsx`)

Add to `selectInputVariants`'s `size` variant:

```ts
'inline-edit': 'h-28',
```

Widen the `size` prop union (currently `'small' | 'medium' | 'default'`) to
include `'inline-edit'`.

### 8. `InlineEditPreview` (`InlineEdit/classes.ts`)

Independent of the tier work above, but must move in lockstep:
`inlineEditPreviewVariants`'s single-line compound (`multiline: false`)
changes from `'items-center py-2 h-24'` to `'items-center py-4 h-28'` — this
is the file's own documented invariant: the read-only preview and the
edit-mode control must render the same box height, or toggling between them
visibly jumps.

## Wiring InlineEdit's built-in editors to the new tier

Change the hardcoded `size = 'small'` default to `size = 'inline-edit'` in:

- `InlineEditInput.tsx`
- `InlineEditTextarea.tsx`
- `InlineEditNumber.tsx`
- `InlineEditTime.tsx`

`InlineEditDate`/`InlineEditDateTime`/`InlineEditSelect` don't render their
own leaf control — the consumer composes `DateInput`/`SelectButton`/
`SelectInput`/`SelectButtonTag` as children — so there's no default to
change in the component itself; consumers pass `size='inline-edit'`
explicitly, exactly as they explicitly pass `size='small'` today.

## Call-site migration (grepped)

`Attribute.stories.tsx` has no InlineEdit-scale `size=` usages (its `size=`
call sites are all `Text`/`Link`/`Code`, an unrelated prop). Everything to
change lives in `InlineEdit.stories.tsx`:

Change `size='small'` → `size='inline-edit'`:
- `:139` (`SelectInputTrigger`)
- `:148` (`SelectButtonTrigger`)
- `:165` (`DateInputTrigger`)
- `:242`, `:274` (`SelectButton` in the Confirm/MultiSelect editor stories)

**Delete the `CustomEditor` story** (~`:520`–`:586`, including its
`docs.description` block) instead of migrating its sizes — grepped, nothing
else references it: no e2e test navigates to it, no unit test asserts
against its `custom`/`custom-confirm`/`custom-cancel` testids (the `custom`
hits elsewhere in the test suite are unrelated). It was the only place
demonstrating the render-prop `InlineEditControl` composition path with
manually-sized `Save`/`Cancel` buttons; no replacement is needed since that
composition pattern isn't part of this spec's scope.

**Not touched:** `:678`/`:687` (`ConfirmCommit`'s confirmation-dialog
Cancel/Change buttons, `size='large'`) — that's a modal confirmation, not an
inline editor row; stays 36px.

## Testing

- Per-atom unit tests, mirroring the 07-06 spec's pattern: `Input.test.tsx`,
  `Textarea.test.tsx`, `Button`/`ButtonBase` tests, `NumberInput` tests,
  `DateInput.test.tsx`/`TimeInput.test.tsx`, `Select.test.tsx` — assert
  `size='inline-edit'` renders the expected 28px height class, alongside the
  existing small/medium/default(/large) cases.
- `InlineEditInput.test.tsx` / `InlineEditTextarea.test.tsx` /
  `InlineEditNumber.test.tsx` / `InlineEditTime.test.tsx`: update the
  assertion for the new default size.
- `InlineEdit.e2e.ts` screenshot tests: update/regenerate snapshots at the
  new 28px height across every editor variant (text, textarea, number,
  select, multi-select/tags, date, datetime, time) and the `CustomEditor`
  story.
- Visual check against the Figma Documentation frame (node `11604:36160`)
  and against `Attribute`'s existing `min-h-[28px]` row — confirms no
  preview↔edit jump and correct alignment against the surrounding
  `Attribute` row.
- Real compile-check via `pnpm --filter @wallarm-org/design-system build` +
  `build-storybook` (per the 07-06 spec's note, this package's
  `pnpm typecheck` is a confirmed pre-existing no-op).

## Non-Goals

- Horizontal/vertical orientation support for InlineEdit (Artem's 2nd
  comment bullet) — separate follow-up.
- Select editor keyboard navigation, up/down (3rd bullet) — separate
  follow-up.
- Moving InlineEdit's Storybook stories into the "Input groups" group (4th
  bullet) — separate follow-up.
- Pixel-perfect final values for `Textarea`'s `inline-edit` height and
  `NumberInput`'s control/trigger interpolation — intentionally left as
  "verify visually against Figma at implementation," the same way the
  07-06 spec treated `SelectInput`'s not-published-in-Figma padding.
- Renaming or otherwise changing the existing `small`/`medium`/`default`/
  `large` tiers — this addition is purely additive.
