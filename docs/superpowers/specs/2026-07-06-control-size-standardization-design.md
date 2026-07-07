# Control Size Standardization Design Spec

**Date:** 2026-07-06
**Ticket:** [WDS-143](https://wallarm.atlassian.net/browse/WDS-143) (continuation)
**Branch:** `feature/WDS-143`
**Figma:** `VKb5gW46uSGw0rqrhZsbXT` (WADS-Components) — node `706-15967` (Input, 3 sizes), node `725-12085` (Textarea, 3 sizes)

## Overview

Comparing the `InlineEdit` Select/Date/DateTime/Time editors against their Figma
reference surfaced a real gap one level down: the shared control-family
components (`Input`, `Textarea`, `Select`, `DateInput`/`TimeInput`) don't
consistently expose the 3-tier height scale (**small = 24px, medium = 32px,
default = 36px**) that Figma specifies for every text-style control. Two of
the four already have it; two don't. This spec standardizes all four on one
scale and naming convention, fixes one confirmed regression, and confirms
(rather than assumes) the two components already believed correct.

**Out of scope:** `Button`/`ButtonBase`'s own `size` (`'small'|'medium'|'large'`,
24/32/36px) is a separate, wider-blast-radius family (used everywhere in the
app, including as the basis for `SelectButton`) and is not renamed or
touched — this spec only adds an internal translation layer where `Select`
touches it (see below). `InlineEdit`'s own components are not touched at all
— this spec fixes the shared primitives one layer down, which is why the
mismatch was visible there in the first place.

## Naming Convention

One scale, one name per tier, used identically across all four components:

```ts
type ControlSize = 'small' | 'medium' | 'default';
// small  -> 24px
// medium -> 32px
// default -> 36px (current, pre-existing visual behavior — must stay the default)
```

This matches `InputGroup`/`Textarea`/`DateInput`/`TimeInput`'s existing
convention (3 of 4 families already use `'small'|'medium'|'default'`) rather
than `Button`'s `'small'|'medium'|'large'`. `Button` itself is not renamed.

## Per-Component Design

### 1. `Input` — add the missing `size` variant

**Current state:** `Input/classes.ts`'s `inputVariants` CVA has no `size`
variant at all; `Input.tsx` hardcodes `className={cn('h-36 py-8',
inputVariants({ error }), className)}` — a single fixed 36px height,
unconditionally.

**Change:** move `h-36 py-8` into a new `size` variant on `inputVariants`,
computed as `padding = (height − 20) / 2` so the `text-sm`/20px-line-height
text stays vertically centered at every size (the same relationship Figma's
own 3-size reference uses — text size never changes, only the box and its
padding do):

```ts
size: {
  default: 'h-36 py-8',  // (36-20)/2 = 8
  medium: 'h-32 py-6',   // (32-20)/2 = 6
  small: 'h-24 py-2',    // (24-20)/2 = 2
},
```

`Input.tsx` gains `size = 'default'` (destructured, matching the existing
`error = false` pattern) and passes it into `inputVariants({ error, size })`;
`className` drops its own hardcoded `h-36 py-8` in favor of the variant.
Defaulting to `'default'` preserves current visual output for every existing
consumer — this is additive, not a behavior change until a consumer opts in.

**Known caveat (documented, not fixed here):** `Input` does not read `size`
from an ambient `InputGroup` context. If some future consumer nests
`<Input>` directly inside `<InputGroup size='small'>` today, `Input`'s own
default 36px height will not shrink to match — the two components size
independently. No current call site in this codebase does this (checked),
so it's not a live bug, but it's a real seam: solving it properly (e.g. an
`InputGroup`-provided size context that `Input` reads as a fallback) is a
separate, bigger architectural decision, deliberately deferred.

### 2. `Textarea` — fix the `small` variant's height (real regression)

**Current state:** `Textarea/classes.ts`'s `textareaHeightVariants` has
`small: 'min-h-[60px]'`. Figma's `size="Small"` `AreaBox` (node `725-12916`)
specifies `h-[64px]`.

**Change:** one line —

```ts
small: 'min-h-[64px]',  // was 'min-h-[60px]'
```

`medium` (`72px`) and `default` (`76px`) already match Figma exactly — leave
unchanged.

### 3. `Select` — decouple `SelectButton`'s size from `Button`'s, add `SelectInput`'s missing variant

**No new prop on the `Select` root.** Both `SelectButton` and `SelectInput`
already accept `size` individually; consumers already set it per-part (this
matches the pure-root-wrapper composition pattern established earlier in
this branch — the consumer composes real parts directly).

**`SelectButton`** (`Select/SelectButton.tsx`): today `size?: ButtonProps['size']`
(literally `Button`'s own type), defaulting to `'large'`. Decouple it to an
independent type using this spec's own scale, and translate internally when
calling the underlying `Button` — `Button.tsx` itself is not touched:

```ts
export interface SelectButtonVariantProps {
  variant?: Exclude<ButtonProps['variant'], 'primary'>;
  color?: Exclude<ButtonProps['color'], 'destructive'>;
  size?: 'small' | 'medium' | 'default';
}

const SELECT_BUTTON_SIZE_MAP: Record<NonNullable<SelectButtonVariantProps['size']>, ButtonProps['size']> = {
  small: 'small',
  medium: 'medium',
  default: 'large',
};
```

`SelectButton`'s own `size = 'default'` default prop stays visually
identical to today's `size = 'large'` default (both resolve to 36px via
`Button`) — no behavior change for existing consumers, just a renamed public
value (`'large'` → `'default'` at the `SelectButton` call site; anyone
currently passing `size='large'` to `SelectButton` needs to pass
`size='default'` instead — the one intentional breaking rename, scoped to
this one prop on this one component).

**Migration check (already done, zero call sites affected):** grepped every
`<SelectButton ... size=` usage in `packages/design-system/src` — the only
hit is `Pagination/PaginationPageSize.tsx:51` (`size='medium'`), a value
unaffected by the rename. No caller passes `size='large'` today, so this
breaking rename requires no call-site migration in this codebase.

**`SelectInput`** (`Select/SelectInput/SelectInput.tsx`): today
`selectInputVariants` hardcodes `h-36 pr-12` directly in its own CVA (it
does not go through `Button` or `InputGroup` at all). Add the same 3-tier
`size` variant directly:

```ts
size: {
  default: 'h-36',
  medium: 'h-32',
  small: 'h-24',
},
```

defaulting to `'default'`. Figma has no published 3-size reference for
`SelectInput` specifically (only `Input`/`Textarea` were provided) — reuse
the same height triad for consistency with the rest of this scale, and
verify the horizontal padding/gap still reads correctly at each size via a
live Storybook check during implementation (adjust `pr`/`gap` only if it
visibly looks wrong at `small`, rather than asserting an unverified formula
here).

### 4. `DateInput` / `TimeInput` — confirmed already correct, no change

**Verified, not assumed:** `DateInputInternal.tsx`/`TimeInput`'s internal
renders wrap `TemporalSegmentGroup` in `<InputGroup size={size}>`
(`DateInputInternal.tsx:135`) — never a raw `<Input>`. `TemporalSegment.tsx`
sets no height class of its own at all (only `text-sm`, no `h-*`), so it
naturally fills whatever height `InputGroup`'s own `size` variant sets
(24/32/36, already exactly matching Figma) with no competing fixed height to
conflict with — unlike `Input.tsx`'s hardcoded `h-36` (the caveat in
section 1). This family already exposes `TemporalInputSize =
'default'|'medium'|'small'` (`TemporalCore/props.ts`) — the same naming this
spec standardizes on. No code change; add regression coverage instead (see
Testing).

## Testing

- `Input.test.tsx`: new tests for `size='small'`/`'medium'`/`'default'`
  rendering the expected height class; confirm default (no `size` prop)
  still renders `h-36 py-8` unchanged.
- `Textarea.test.tsx`: update/add a test asserting `size='small'` renders
  `min-h-[64px]` (catches the regression fix; the existing test likely
  asserted the wrong `60px` value today and needs correcting alongside the
  fix, not just extending).
- `Select/Select.test.tsx` (verified: no dedicated `SelectButton.test.tsx`/
  `SelectInput.test.tsx` exist — both sub-parts are tested inside the root
  `Select.test.tsx`): add cases asserting `SelectButton`'s
  `size='small'|'medium'|'default'` (new values) render the expected
  height, and that omitting `size` still defaults to the same rendered
  height as before (36px/`Button` `size='large'`) — proving the rename is
  behavior-preserving at the default. Add the equivalent 3 cases for
  `SelectInput`.
- `DateInput.test.tsx`/`TimeInput.test.tsx`: new tests asserting
  `size='small'`/`'medium'` render an `InputGroup` at the expected height
  (24/32px) with no visual/layout regression — this is the confirmation
  test for section 4, not a bugfix.
- Real compile-check via `pnpm --filter @wallarm-org/design-system build` +
  `build-storybook` (this package's `pnpm typecheck` is a confirmed
  pre-existing no-op, established earlier this session — do not rely on
  it).
- No Storybook story changes are required by this spec — existing stories
  keep using the implicit `'default'` size; a follow-up (not this spec) can
  add small/medium story variants if the team wants to showcase them.

## Non-Goals

- Renaming `Button`'s own `'small'|'medium'|'large'` scale.
- Giving `Input` an ambient-context fallback to `InputGroup`'s size (the
  caveat in section 1) — real seam, deliberately deferred as a separate,
  bigger decision.
- Any change to `InlineEdit`'s own components — this spec fixes the layer
  they compose from.
- Adding `size` to the `Select` root component.
