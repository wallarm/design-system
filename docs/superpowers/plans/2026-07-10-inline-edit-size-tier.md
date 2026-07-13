# InlineEdit `inline-edit` Size Tier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 28px `'inline-edit'` size tier to `Input`, `Textarea`, `InputGroup` (backing `DateInput`/`TimeInput`), `ButtonBase`/`Button`, `NumberInput`, `SelectButton`, and `SelectInput`, and switch `InlineEdit`'s built-in editors to use it, fixing WDS-143's "value container is 24px, should be 28px" comment.

**Architecture:** Every atom already exposes a `size` CVA variant with 3 tiers (`small`/`medium`/`default`, or `small`/`medium`/`large` for `Button`). This plan adds a 4th tier, `'inline-edit'`, to each — additive only, no renames, no behavior change for existing consumers who don't pass it. `InlineEdit`'s own wrapper components (`InlineEditInput`, `InlineEditTextarea`, `InlineEditNumber`, `InlineEditTime`) then default their `size` prop to `'inline-edit'` instead of `'small'`.

**Tech Stack:** React 19, `class-variance-authority` (CVA), Vitest + Testing Library, Playwright (E2E/screenshots), TypeScript strict mode.

## Global Constraints

- Height for every `'inline-edit'` tier is **28px**. Padding formula (established convention, do not deviate without a documented reason): `py = (height − 20) / 2 = 4`, i.e. `py-4`, since `text-sm` has a 20px line-height.
- `'inline-edit'` is an **additive** tier — never remove or rename `small`/`medium`/`default`/`large`.
- No new component-specific size prop names (e.g. no `AttributeInputSize`) — reuse each atom's own existing `size` union everywhere.
- Single quotes, semicolons, trailing commas (Biome-enforced) — match the exact style of the surrounding file in every edit.
- Every new/changed test must pass under `pnpm --filter @wallarm-org/design-system test -- <file>` before moving to the next step.
- `pnpm --filter @wallarm-org/design-system typecheck` is a confirmed pre-existing no-op for this package (established in the 2026-07-06 spec) — do not rely on it to catch type errors; rely on `pnpm --filter @wallarm-org/design-system build` instead.

---

### Task 1: `Input` — add the `inline-edit` size tier

**Files:**
- Modify: `packages/design-system/src/components/Input/classes.ts`
- Test: `packages/design-system/src/components/Input/Input.test.tsx`

**Interfaces:**
- Produces: `Input`'s `size` prop accepts `'inline-edit'`, rendering `h-28 py-4`.

- [ ] **Step 1: Write the failing test**

Add to the existing `describe('Size variants', ...)` block in `Input.test.tsx` (after the `'small'` test):

```tsx
  it('renders the inline-edit (28px) height', () => {
    render(<Input data-testid='input' size='inline-edit' />);
    expect(screen.getByTestId('input').className).toContain('h-28');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test -- Input.test.tsx`
Expected: FAIL — rendered className does not contain `h-28` (CVA has no `'inline-edit'` key yet, so the `size` slot resolves to nothing).

- [ ] **Step 3: Implement**

In `Input/classes.ts`, change:

```ts
      size: {
        default: 'h-36 py-8',
        medium: 'h-32 py-6',
        small: 'h-24 py-2',
      },
```

to:

```ts
      size: {
        default: 'h-36 py-8',
        medium: 'h-32 py-6',
        small: 'h-24 py-2',
        'inline-edit': 'h-28 py-4',
      },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system test -- Input.test.tsx`
Expected: PASS (all `Size variants` cases, including the new one).

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Input/classes.ts packages/design-system/src/components/Input/Input.test.tsx
git commit -m "feat(input): add inline-edit (28px) size tier"
```

---

### Task 2: `Textarea` — add the `inline-edit` size tier

**Files:**
- Modify: `packages/design-system/src/components/Textarea/classes.ts`
- Test: `packages/design-system/src/components/Textarea/Textarea.test.tsx`

**Interfaces:**
- Produces: `Textarea`'s `size` prop accepts `'inline-edit'`, rendering `py-4` and `min-h-[64px]`.

**Note:** unlike the other atoms, Textarea's existing tiers (`small`=64px, `medium`=72px, `default`=76px) are not on the same linear "single line + padding" formula as `Input`/`InputGroup`/`NumberInput` — a textarea inherently needs multi-row visible space, and Figma's own "use custom size for text + select inputs" note (Documentation frame, node `11604:36160`) does not name Textarea. `min-h-[64px]` is reused unchanged from `small` (Textarea already comfortably exceeds the 28px single-line target); only the vertical padding changes, to keep the top-of-text baseline consistent with the rest of the `inline-edit` family. Flagged for a visual check against Figma's "text-area" content-type reference in Task 11.

- [ ] **Step 1: Write the failing test**

Add to the existing `describe('Size variants', ...)` block in `Textarea.test.tsx` (after the `'default'` test):

```tsx
  it('renders the inline-edit size at 4px padding, 64px min-height', () => {
    render(<Textarea data-testid='textarea' size='inline-edit' />);
    expect(screen.getByTestId('textarea').className).toContain('py-4');
    expect(screen.getByTestId('textarea').className).toContain('min-h-[64px]');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test -- Textarea.test.tsx`
Expected: FAIL — neither `py-4` nor `min-h-[64px]` present for `size='inline-edit'` (unrecognized CVA key).

- [ ] **Step 3: Implement**

In `Textarea/classes.ts`, change:

```ts
export const textareaPaddingVariants = cva('', {
  variants: {
    size: {
      small: 'py-0',
      medium: 'py-6',
      default: 'py-8',
    },
  },
});

export const textareaHeightVariants = cva('min-h-[64px]', {
  variants: {
    size: {
      small: 'min-h-[64px]',
      medium: 'min-h-[72px]',
      default: 'min-h-[76px]',
    },
  },
});
```

to:

```ts
export const textareaPaddingVariants = cva('', {
  variants: {
    size: {
      small: 'py-0',
      medium: 'py-6',
      default: 'py-8',
      'inline-edit': 'py-4',
    },
  },
});

export const textareaHeightVariants = cva('min-h-[64px]', {
  variants: {
    size: {
      small: 'min-h-[64px]',
      medium: 'min-h-[72px]',
      default: 'min-h-[76px]',
      'inline-edit': 'min-h-[64px]',
    },
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system test -- Textarea.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Textarea/classes.ts packages/design-system/src/components/Textarea/Textarea.test.tsx
git commit -m "feat(textarea): add inline-edit size tier"
```

---

### Task 3: `InputGroup` + `TemporalInputSize` — add the `inline-edit` size tier (backs `DateInput`/`TimeInput`/`DateRangeInput`)

**Files:**
- Modify: `packages/design-system/src/components/InputGroup/InputGroup.tsx`
- Modify: `packages/design-system/src/components/TemporalCore/props.ts`
- Test: `packages/design-system/src/components/DateInput/DateInput.test.tsx`
- Test: `packages/design-system/src/components/TimeInput/TimeInput.test.tsx`

**Interfaces:**
- Produces: `InputGroup`'s `size` prop accepts `'inline-edit'` (`h-28`). `DateInput`/`TimeInput`/`DateRangeInput`'s public `size` prop (typed via `TemporalInputSize`) accepts `'inline-edit'`.

- [ ] **Step 1: Write the failing tests**

Add to the `describe('Size variants ...)` block in `DateInput.test.tsx` (after the `'small'` test):

```tsx
  it('renders the inline-edit (28px) InputGroup height', () => {
    render(<DateInput data-testid='date-input' size='inline-edit' />);
    const group = screen.getByTestId('date-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-28');
  });
```

Add the equivalent to `TimeInput.test.tsx`'s matching describe block:

```tsx
  it('renders the inline-edit (28px) InputGroup height', () => {
    render(<TimeInput data-testid='time-input' size='inline-edit' />);
    const group = screen.getByTestId('time-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-28');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @wallarm-org/design-system test -- DateInput.test.tsx TimeInput.test.tsx`
Expected: Both new cases FAIL — `'inline-edit'` isn't a valid `InputGroup` size yet, so `group` doesn't have class `h-28`.

- [ ] **Step 3: Implement**

In `InputGroup/InputGroup.tsx`, change:

```ts
    variants: {
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
      },
    },
```

to:

```ts
    variants: {
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
        'inline-edit': 'h-28',
      },
    },
```

In `TemporalCore/props.ts`, change:

```ts
export type TemporalInputSize = 'default' | 'medium' | 'small';
```

to:

```ts
export type TemporalInputSize = 'default' | 'medium' | 'small' | 'inline-edit';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @wallarm-org/design-system test -- DateInput.test.tsx TimeInput.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/InputGroup/InputGroup.tsx packages/design-system/src/components/TemporalCore/props.ts packages/design-system/src/components/DateInput/DateInput.test.tsx packages/design-system/src/components/TimeInput/TimeInput.test.tsx
git commit -m "feat(input-group): add inline-edit size tier, widen TemporalInputSize"
```

---

### Task 4: `ButtonBase`/`Button` — add the `inline-edit` size tier

**Files:**
- Modify: `packages/design-system/src/components/ButtonBase/classes.ts`
- Test: `packages/design-system/src/components/Button/Button.test.tsx`

**Interfaces:**
- Produces: `ButtonBase`/`Button`'s `size` prop accepts `'inline-edit'` (`h-28 px-10 py-4 gap-5`; `iconOnly` compound → `w-28 h-28 p-4`; `hasNonTextEnd` compound → `pr-4`).
- Note: `TabsButton`, `ToggleButton`, `SegmentedControlButton` also render through `ButtonBase` and therefore gain `'inline-edit'` in their own `size` prop type — purely additive, no behavior change since none of them use it.

- [ ] **Step 1: Write the failing test**

`Button.test.tsx` currently has no `Size variants` block at all. Add one at the end of the file:

```tsx
describe('Size variants', () => {
  it('renders the inline-edit (28px) height', () => {
    render(
      <Button data-testid='button' size='inline-edit'>
        Save
      </Button>,
    );
    expect(screen.getByTestId('button').className).toContain('h-28');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test -- Button.test.tsx`
Expected: FAILs (`'inline-edit'` isn't a valid size yet, so the rendered className has no `h-28`).

- [ ] **Step 3: Implement**

In `ButtonBase/classes.ts`, change:

```ts
      size: {
        small: 'h-24 px-8 py-2 gap-4',
        medium: 'h-32 px-12 py-6 gap-6',
        large: 'h-36 px-16 py-8 gap-8',
      },
```

to:

```ts
      size: {
        small: 'h-24 px-8 py-2 gap-4',
        medium: 'h-32 px-12 py-6 gap-6',
        large: 'h-36 px-16 py-8 gap-8',
        'inline-edit': 'h-28 px-10 py-4 gap-5',
      },
```

And change:

```ts
    compoundVariants: [
      // region --- Icon only
      { iconOnly: true, size: 'small', className: 'w-24 h-24 p-2' },
      { iconOnly: true, size: 'medium', className: 'w-32 h-32 p-6' },
      { iconOnly: true, size: 'large', className: 'w-36 h-36 p-8' },
      // endregion

      // region --- Non-text end adjustment
      { hasNonTextEnd: true, size: 'small', className: 'pr-2' },
      { hasNonTextEnd: true, size: 'medium', className: 'pr-6' },
      { hasNonTextEnd: true, size: 'large', className: 'pr-10' },
      // endregion
    ],
```

to:

```ts
    compoundVariants: [
      // region --- Icon only
      { iconOnly: true, size: 'small', className: 'w-24 h-24 p-2' },
      { iconOnly: true, size: 'medium', className: 'w-32 h-32 p-6' },
      { iconOnly: true, size: 'large', className: 'w-36 h-36 p-8' },
      { iconOnly: true, size: 'inline-edit', className: 'w-28 h-28 p-4' },
      // endregion

      // region --- Non-text end adjustment
      { hasNonTextEnd: true, size: 'small', className: 'pr-2' },
      { hasNonTextEnd: true, size: 'medium', className: 'pr-6' },
      { hasNonTextEnd: true, size: 'large', className: 'pr-10' },
      { hasNonTextEnd: true, size: 'inline-edit', className: 'pr-4' },
      // endregion
    ],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system test -- Button.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/ButtonBase/classes.ts packages/design-system/src/components/Button/Button.test.tsx
git commit -m "feat(button): add inline-edit (28px) size tier"
```

---

### Task 5: `NumberInput` — add the `inline-edit` size tier (4 cva blocks)

**Files:**
- Modify: `packages/design-system/src/components/NumberInput/classes.ts`
- Test: `packages/design-system/src/components/NumberInput/NumberInput.test.tsx`

**Interfaces:**
- Produces: `NumberInput`'s `size` prop accepts `'inline-edit'` — root `h-28`, field `px-12 py-4`, stepper control `px-2 py-0 [&_svg]:icon-xs` (matches `small`'s discrete icon choice — 28px sits closer to 24px than 32px), stepper trigger `w-12 h-11`.

- [ ] **Step 1: Write the failing test**

Add to the existing `describe('Size variants', ...)` block in `NumberInput.test.tsx` (after the `'small'` test):

```tsx
  it('renders the inline-edit (28px) height', () => {
    render(<NumberInput data-testid='number-input' size='inline-edit' />);
    expect(screen.getByTestId('number-input')).toHaveClass('h-28');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test -- NumberInput.test.tsx`
Expected: FAIL — `'inline-edit'` isn't a valid size yet.

- [ ] **Step 3: Implement**

In `NumberInput/classes.ts`, change each of the 4 `variants.size` blocks:

```ts
export const numberInputRootVariants = cva(
  /* ... */
  {
    variants: {
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
```

to add `'inline-edit': 'h-28',`:

```ts
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
        'inline-edit': 'h-28',
      },
```

```ts
export const numberInputFieldVariants = cva(
  /* ... */
  {
    variants: {
      size: {
        default: 'px-12 py-8',
        medium: 'px-12 py-6',
        small: 'px-12 py-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
```

to add `'inline-edit': 'px-12 py-4',`:

```ts
      size: {
        default: 'px-12 py-8',
        medium: 'px-12 py-6',
        small: 'px-12 py-2',
        'inline-edit': 'px-12 py-4',
      },
```

```ts
export const numberInputControlVariants = cva(
  /* ... */
  {
    variants: {
      size: {
        default: 'px-4 py-2 [&_svg]:icon-sm',
        medium: 'px-3 py-1 [&_svg]:icon-sm',
        small: 'px-2 py-0 [&_svg]:icon-xs',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
```

to add `'inline-edit': 'px-2 py-0 [&_svg]:icon-xs',` (reuses `small`'s discrete icon choice — `icon-xs`/`icon-sm` is a discrete swap, not interpolatable, and 28px sits closer to `small`'s 24px than `medium`'s 32px):

```ts
      size: {
        default: 'px-4 py-2 [&_svg]:icon-sm',
        medium: 'px-3 py-1 [&_svg]:icon-sm',
        small: 'px-2 py-0 [&_svg]:icon-xs',
        'inline-edit': 'px-2 py-0 [&_svg]:icon-xs',
      },
```

```ts
export const numberInputTriggerVariants = cva(
  /* ... */
  {
    variants: {
      size: {
        default: 'w-16 h-14 px-2 py-1',
        medium: 'w-14 h-12 px-2 py-1',
        small: 'w-12 h-10 px-1 py-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
```

to add `'inline-edit': 'w-12 h-11 px-1 py-0',` (width/padding reuse `small`'s since the trigger button is bound to the stepper control's own `icon-xs` choice above; height rounds to the nearest whole pixel between `small`'s 10 and `medium`'s 12):

```ts
      size: {
        default: 'w-16 h-14 px-2 py-1',
        medium: 'w-14 h-12 px-2 py-1',
        small: 'w-12 h-10 px-1 py-0',
        'inline-edit': 'w-12 h-11 px-1 py-0',
      },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system test -- NumberInput.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/NumberInput/classes.ts packages/design-system/src/components/NumberInput/NumberInput.test.tsx
git commit -m "feat(number-input): add inline-edit size tier to all 4 cva blocks"
```

---

### Task 6: `SelectButton` — add the `inline-edit` size tier

**Files:**
- Modify: `packages/design-system/src/components/Select/SelectButton.tsx`
- Test: `packages/design-system/src/components/Select/Select.test.tsx`

**Interfaces:**
- Consumes: Task 4's `ButtonBase` `'inline-edit'` tier.
- Produces: `SelectButton`'s `size` prop accepts `'inline-edit'`, rendering the underlying `Button` at `size='inline-edit'`.

- [ ] **Step 1: Write the failing test**

Add to the `describe('Size variants', ...)` block in `Select.test.tsx` (after the `SelectButton` `'small'` test, before the `SelectInput` tests start):

```tsx
  it('SelectButton renders the inline-edit (28px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='inline-edit' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-28');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test -- Select.test.tsx`
Expected: the new case FAILs (TypeScript would reject `size='inline-edit'` if strictly checked, and at runtime the value falls through `SELECT_BUTTON_SIZE_MAP` as `undefined`, so `Button` renders its own default `size='large'` → `h-36`, not `h-28`).

- [ ] **Step 3: Implement**

In `Select/SelectButton.tsx`, change:

```ts
export type SelectButtonSize = 'small' | 'medium' | 'default';

// Select's own 24/32/36px scale ('small'|'medium'|'default') is independent
// of Button's ('small'|'medium'|'large') — translate at the call site
// rather than rename Button's own scale, which is used everywhere in the app.
const SELECT_BUTTON_SIZE_MAP: Record<SelectButtonSize, ButtonProps['size']> = {
  small: 'small',
  medium: 'medium',
  default: 'large',
};
```

to:

```ts
export type SelectButtonSize = 'small' | 'medium' | 'default' | 'inline-edit';

// Select's own 24/32/36/28px scale ('small'|'medium'|'default'|'inline-edit')
// is independent of Button's ('small'|'medium'|'large'|'inline-edit') —
// translate at the call site rather than rename Button's own scale, which is
// used everywhere in the app.
const SELECT_BUTTON_SIZE_MAP: Record<SelectButtonSize, ButtonProps['size']> = {
  small: 'small',
  medium: 'medium',
  default: 'large',
  'inline-edit': 'inline-edit',
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system test -- Select.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Select/SelectButton.tsx packages/design-system/src/components/Select/Select.test.tsx
git commit -m "feat(select): add inline-edit size tier to SelectButton"
```

---

### Task 7: `SelectInput` — add the `inline-edit` size tier (and its Tag-size mapping)

**Files:**
- Modify: `packages/design-system/src/components/Select/SelectInput/SelectInput.tsx`
- Modify: `packages/design-system/src/components/Select/SelectInput/SelectInputItemRenderer.tsx`
- Test: `packages/design-system/src/components/Select/Select.test.tsx`

**Interfaces:**
- Produces: `SelectInput`'s `size` prop accepts `'inline-edit'` (`h-28`); its item `Tag`s render at `size='large'` for `'inline-edit'` (same as `medium`/`default` — at 28px there's enough margin for a 24px tag, unlike at `small`'s 24px container where a 24px tag leaves none).

- [ ] **Step 1: Write the failing tests**

Add to the `describe('Size variants', ...)` block in `Select.test.tsx` (after the existing `SelectInput` tests):

```tsx
  it('SelectInput renders the inline-edit (28px) height', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' size='inline-edit' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-28');
  });

  it('SelectInput keeps its item Tags at large for inline-edit size', () => {
    render(
      <Select collection={collection} multiple defaultValue={['react']} data-testid='select'>
        <SelectInput data-testid='trigger' size='inline-edit' />
      </Select>,
    );
    const tag = document.querySelector('[data-slot="tag"]');
    expect(tag?.className).toContain('h-24');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @wallarm-org/design-system test -- Select.test.tsx`
Expected: both new cases FAIL — `'inline-edit'` isn't a valid `SelectInput` size yet.

- [ ] **Step 3: Implement**

In `Select/SelectInput/SelectInput.tsx`, change:

```ts
      // 24/32/36px scale, matching Input/InputGroup/Textarea/DateInput/TimeInput.
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
      },
```

to:

```ts
      // 24/28/32/36px scale, matching Input/InputGroup/Textarea/DateInput/TimeInput.
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
        'inline-edit': 'h-28',
      },
```

And change:

```ts
interface SelectInputBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  'data-testid'?: string;
  size?: 'small' | 'medium' | 'default';
}
```

to:

```ts
interface SelectInputBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  'data-testid'?: string;
  size?: 'small' | 'medium' | 'default' | 'inline-edit';
}
```

In `Select/SelectInput/SelectInputItemRenderer.tsx`, change:

```ts
type SelectInputItemRendererProps = {
  item: SelectDataItem;
  /** `SelectInput`'s own size — chips scale down with it, see `TAG_SIZE_BY_SELECT_SIZE`. */
  size?: 'small' | 'medium' | 'default';
};

// Tag's own scale (small=16px/medium=20px/large=24px) is unrelated to
// Select's (small=24px/medium=32px/default=36px) — at Select's `small`
// (24px container), a `large` (24px) tag leaves no margin, so it steps down
// to `medium` (20px). Select's `medium`/`default` containers (32px/36px)
// already fit a `large` tag with margin to spare, so those stay unchanged.
export const TAG_SIZE_BY_SELECT_SIZE: Record<'small' | 'medium' | 'default', TagProps['size']> = {
  small: 'medium',
  medium: 'large',
  default: 'large',
};
```

to:

```ts
type SelectInputItemRendererProps = {
  item: SelectDataItem;
  /** `SelectInput`'s own size — chips scale down with it, see `TAG_SIZE_BY_SELECT_SIZE`. */
  size?: 'small' | 'medium' | 'default' | 'inline-edit';
};

// Tag's own scale (small=16px/medium=20px/large=24px) is unrelated to
// Select's (small=24px/medium=32px/default=36px/inline-edit=28px) — at
// Select's `small` (24px container), a `large` (24px) tag leaves no margin,
// so it steps down to `medium` (20px). Select's `medium`/`default`
// containers (32px/36px) already fit a `large` tag with margin to spare, so
// those stay unchanged. `inline-edit` (28px) has 4px of margin budget for a
// 24px tag, so it also stays at `large`.
export const TAG_SIZE_BY_SELECT_SIZE: Record<
  'small' | 'medium' | 'default' | 'inline-edit',
  TagProps['size']
> = {
  small: 'medium',
  medium: 'large',
  default: 'large',
  'inline-edit': 'large',
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @wallarm-org/design-system test -- Select.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Select/SelectInput/SelectInput.tsx packages/design-system/src/components/Select/SelectInput/SelectInputItemRenderer.tsx packages/design-system/src/components/Select/Select.test.tsx
git commit -m "feat(select): add inline-edit size tier to SelectInput"
```

---

### Task 8: `InlineEditPreview` — match the read-only row to 28px

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/classes.ts`

**Interfaces:**
- Produces: `InlineEditPreview`'s single-line (`multiline: false`) row renders at `h-28 py-4` instead of `h-24 py-2`.

- [ ] **Step 1: Write the failing test**

`InlineEdit.test.tsx` doesn't import `InlineEditPreview` today (verified — it only tests the root `InlineEdit` component's context/value plumbing) and has exactly two top-level `describe` blocks: `'InlineEdit'` (line 38) and `'InlineEdit onBeforeValueCommit'` (line 184). Add the import and a new third top-level `describe` block at the end of the file (after the closing `});` of `'InlineEdit onBeforeValueCommit'`):

Add to the top-of-file import list:

```tsx
import { InlineEditPreview } from './InlineEditPreview';
```

Append at the end of the file:

```tsx
describe('InlineEditPreview sizing', () => {
  it('sizes the single-line preview row to match the inline-edit control height (28px)', () => {
    render(
      <InlineEdit defaultValue='ab' data-testid='attr'>
        <InlineEditPreview>ab</InlineEditPreview>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview')).toHaveClass('h-28');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test -- InlineEdit.test.tsx`
Expected: FAIL — current class is `h-24`, not `h-28`.

- [ ] **Step 3: Implement**

In `InlineEdit/classes.ts`, change:

```ts
      multiline: {
        true: 'items-start py-0',
        false: 'items-center py-2 h-24',
      },
```

to:

```ts
      multiline: {
        true: 'items-start py-0',
        false: 'items-center py-4 h-28',
      },
```

Also update the file's own top comment block (lines 4–12), which documents the old `24px`/`Input's is 2px` numbers — change:

```
  // Multi-line values (Textarea) align the icon to the top, use
  // Textarea's `size='small'` py-0, and grow with content (lineClamp).
  // Single-line values (Input/NumberInput/Select/Date/Time) center the
  // icon, use Input's `size='small'` py-2, and fix the row at Input's
  // small 24px height (border-box: 2px padding + 1px border on each
  // side + the 20px text-sm line-height above = 24px total).
```

to:

```
  // Multi-line values (Textarea) align the icon to the top, use
  // Textarea's `size='inline-edit'` py-4, and grow with content (lineClamp).
  // Single-line values (Input/NumberInput/Select/Date/Time) center the
  // icon, use Input's `size='inline-edit'` py-4, and fix the row at Input's
  // inline-edit 28px height (border-box: 4px padding + 1px border on each
  // side + the 20px text-sm line-height above = 28px total).
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system test -- InlineEdit.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/InlineEdit/classes.ts packages/design-system/src/components/InlineEdit/InlineEdit.test.tsx
git commit -m "feat(inline-edit): size the single-line preview row to 28px"
```

---

### Task 9: `InlineEdit`'s built-in editors — default to `size='inline-edit'`

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditInput.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditTextarea.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditNumber.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditTime.tsx`
- Test: `packages/design-system/src/components/InlineEdit/InlineEditInput.test.tsx` (covers `InlineEditInput`/`InlineEditTextarea`/`InlineEditNumber` describe blocks)
- Test: `packages/design-system/src/components/InlineEdit/InlineEditTime.test.tsx`

**Interfaces:**
- Consumes: Task 1 (`Input`), Task 2 (`Textarea`), Task 5 (`NumberInput`), Task 3 (`TimeInput`/`InputGroup`) `'inline-edit'` tiers.
- Produces: all four wrapper components default their `size` prop to `'inline-edit'` (still overridable by the caller).

- [ ] **Step 1: Update the failing assertions**

In `InlineEditInput.test.tsx`, change the `InlineEditInput` describe block's size test:

```tsx
  it('defaults to the small (24px) size, matching the rest of InlineEdit', () => {
    render(
      <InlineEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveClass('h-24');
  });
```

to:

```tsx
  it('defaults to the inline-edit (28px) size, matching the rest of InlineEdit', () => {
    render(
      <InlineEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveClass('h-28');
  });
```

In the same file's `InlineEditTextarea` describe block, change:

```tsx
  it('defaults to the small (64px) size, matching the rest of InlineEdit', () => {
    render(
      <InlineEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <InlineEditControl>
          <InlineEditTextarea />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveClass('min-h-[64px]');
  });
```

to:

```tsx
  it('defaults to the inline-edit (64px min-height, 4px padding) size, matching the rest of InlineEdit', () => {
    render(
      <InlineEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <InlineEditControl>
          <InlineEditTextarea />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveClass('min-h-[64px]');
    expect(screen.getByTestId('attr--input')).toHaveClass('py-4');
  });
```

In the same file's `InlineEditNumber` describe block, change:

```tsx
  it('defaults to the small (24px) size, matching the rest of InlineEdit', () => {
    render(
      <InlineEdit defaultEdit defaultValue='8443' data-testid='attr'>
        <InlineEditControl>
          <InlineEditNumber />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveClass('h-24');
  });
```

to:

```tsx
  it('defaults to the inline-edit (28px) size, matching the rest of InlineEdit', () => {
    render(
      <InlineEdit defaultEdit defaultValue='8443' data-testid='attr'>
        <InlineEditControl>
          <InlineEditNumber />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveClass('h-28');
  });
```

In `InlineEditTime.test.tsx`, change:

```tsx
  it('defaults to the small (24px) size, matching the rest of InlineEdit', () => {
    render(<Harness />);
    const group = screen.getByTestId('ie--input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-24');
  });
```

to:

```tsx
  it('defaults to the inline-edit (28px) size, matching the rest of InlineEdit', () => {
    render(<Harness />);
    const group = screen.getByTestId('ie--input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-28');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @wallarm-org/design-system test -- InlineEditInput.test.tsx InlineEditTime.test.tsx`
Expected: all four updated cases FAIL (components still default to `size='small'`).

- [ ] **Step 3: Implement**

In `InlineEditInput.tsx`, change:

```tsx
export const InlineEditInput: FC<InlineEditInputProps> = ({
  size = 'small',
  'data-testid': testIdProp,
  ...props
}) => {
```

to:

```tsx
export const InlineEditInput: FC<InlineEditInputProps> = ({
  size = 'inline-edit',
  'data-testid': testIdProp,
  ...props
}) => {
```

In `InlineEditTextarea.tsx`, change:

```tsx
export const InlineEditTextarea: FC<InlineEditTextareaProps> = ({
  size = 'small',
  'data-testid': testIdProp,
  ...props
}) => {
```

to:

```tsx
export const InlineEditTextarea: FC<InlineEditTextareaProps> = ({
  size = 'inline-edit',
  'data-testid': testIdProp,
  ...props
}) => {
```

In `InlineEditNumber.tsx`, change:

```tsx
export const InlineEditNumber: FC<InlineEditNumberProps> = ({
  size = 'small',
  'data-testid': testIdProp,
  ...props
}) => {
```

to:

```tsx
export const InlineEditNumber: FC<InlineEditNumberProps> = ({
  size = 'inline-edit',
  'data-testid': testIdProp,
  ...props
}) => {
```

In `InlineEditTime.tsx`, change:

```tsx
export const InlineEditTime: FC<InlineEditTimeProps> = ({
  'data-testid': testIdProp,
  granularity = 'minute',
  showTimeDropdown = true,
  showIcon = false,
  size = 'small',
  ...props
}) => {
```

to:

```tsx
export const InlineEditTime: FC<InlineEditTimeProps> = ({
  'data-testid': testIdProp,
  granularity = 'minute',
  showTimeDropdown = true,
  showIcon = false,
  size = 'inline-edit',
  ...props
}) => {
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @wallarm-org/design-system test -- InlineEditInput.test.tsx InlineEditTime.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/InlineEdit/InlineEditInput.tsx packages/design-system/src/components/InlineEdit/InlineEditTextarea.tsx packages/design-system/src/components/InlineEdit/InlineEditNumber.tsx packages/design-system/src/components/InlineEdit/InlineEditTime.tsx packages/design-system/src/components/InlineEdit/InlineEditInput.test.tsx packages/design-system/src/components/InlineEdit/InlineEditTime.test.tsx
git commit -m "feat(inline-edit): default built-in editors to the inline-edit size"
```

---

### Task 10: `InlineEdit.stories.tsx` — migrate call sites, delete `CustomEditor`

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx`

**Interfaces:**
- Consumes: Task 6 (`SelectButton`), Task 7 (`SelectInput`), Task 3 (`DateInput`) `'inline-edit'` tiers.

**Note:** no automated test covers Storybook story content directly — correctness here is verified visually via Storybook (Task 11) and by the fact the file still compiles/lints. This task is still split into discrete steps for reviewability.

- [ ] **Step 1: Change `size='small'` → `size='inline-edit'` at 5 call sites**

Line 139 (`SelectInputTrigger`), change:

```tsx
function SelectInputTrigger() {
  const testId = useTestId('input');
  return <SelectInput data-testid={testId} size='small' />;
}
```

to:

```tsx
function SelectInputTrigger() {
  const testId = useTestId('input');
  return <SelectInput data-testid={testId} size='inline-edit' />;
}
```

Line 148 (`SelectButtonTrigger`), change:

```tsx
function SelectButtonTrigger() {
  const testId = useTestId('input');
  return <SelectButton data-testid={testId} size='small' />;
}
```

to:

```tsx
function SelectButtonTrigger() {
  const testId = useTestId('input');
  return <SelectButton data-testid={testId} size='inline-edit' />;
}
```

Line ~165 (`DateInputTrigger`), locate:

```tsx
    <DateInput
```
```
      size='small'
```

and change `size='small'` to `size='inline-edit'` (keep the surrounding props on the same `<DateInput ...>` call unchanged).

Lines 242 and 274 (`SelectButton` inside the `ConfirmCommit`/`MultiSelectEditor` stories), change both occurrences of:

```tsx
              <SelectButton size='small' />
```

to:

```tsx
              <SelectButton size='inline-edit' />
```

- [ ] **Step 2: Delete the `CustomEditor` story**

Remove lines 520–587 in full (the `export const CustomEditor: StoryFn = () => { ... };` block, its trailing blank line, and the `CustomEditor.parameters = { ... };` block that follows it) — i.e. everything between the end of the preceding `Various` story (`);` on line 518) and the start of `export const ConfirmCommit` (line 588), leaving exactly one blank line as the separator (matching the spacing convention used between every other story export in this file).

- [ ] **Step 3: Remove the now-unused `Input` import**

`Input` (imported at the top of the file) was only used inside the deleted `CustomEditor` story. Confirm no other `<Input` usage remains:

Run: `grep -n '<Input\b' packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx`
Expected: no output.

Remove the import line:

```tsx
import { Input } from '../Input';
```

`Button` stays imported — it's still used by `ConfirmCommit`'s dialog buttons (lines ~675, 684, unaffected by this task).

- [ ] **Step 4: Verify the file still compiles and lints clean**

Run: `pnpm --filter @wallarm-org/design-system lint -- src/components/InlineEdit/InlineEdit.stories.tsx` (the `lint` script is `biome check`; the path is relative to `packages/design-system`, the filtered package's own root)
Expected: no errors (no unused imports, no unused `DateInputTrigger`/`SelectButtonTrigger`/`SelectInputTrigger` functions — all three remain referenced by other stories in the file).

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
git commit -m "feat(inline-edit): migrate stories to inline-edit size, drop CustomEditor story"
```

---

### Task 11: Build, Storybook visual check, E2E screenshot update

**Files:**
- None modified directly — this task verifies Tasks 1–10 together and regenerates Playwright screenshot baselines under `packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts-snapshots/` (and any sibling `Attribute.e2e.ts-snapshots/` files affected by the `AttributeValue`/`InlineEdit` height change).

**Interfaces:**
- Consumes: everything from Tasks 1–10.

- [ ] **Step 1: Full package build**

Run: `pnpm --filter @wallarm-org/design-system build`
Expected: succeeds with no TypeScript errors (this is the real type-check gate for this package — `typecheck` is a confirmed no-op).

- [ ] **Step 2: Full unit test suite**

Run: `pnpm --filter @wallarm-org/design-system test -- --run`
Expected: all tests pass, including every test added/modified in Tasks 1–9.

- [ ] **Step 3: Build Storybook and visually compare against Figma**

Run: `pnpm --filter @wallarm-org/design-system build-storybook`

Then run: `pnpm --filter @wallarm-org/design-system storybook` and open the `InlineEdit` stories (in the "Input groups" group per existing Storybook navigation, or wherever `InlineEdit.stories.tsx`'s current `title` places it — this task does not move it, per the design spec's Non-Goals).

Compare the rendered `Various` story (covers text/select/multi-select/date/datetime/time/number rows) side-by-side against the Figma "Documentation" frame (`VKb5gW46uSGw0rqrhZsbXT`, node `11604:36160`). Specifically confirm:
- Every single-line editor (text, number, select, date, time, datetime) renders its edit-mode control at the same 28px height as its read-only preview row (no jump when clicking to edit).
- The multiline (`Textarea`) editor's top padding looks correct next to its label (Task 2's `py-4`/`min-h-[64px]` choice) — if it looks visibly off compared to Figma's "text-area" content-type reference, adjust `textareaPaddingVariants`/`textareaHeightVariants`'s `'inline-edit'` values from Task 2 and re-run that task's test.
- `NumberInput`'s stepper buttons at `size='inline-edit'` (Task 5) don't look visually cramped or misaligned — if the interpolated `w-12 h-11` trigger size looks wrong, adjust it and re-run Task 5's test.
- `Button`'s `size='inline-edit'` (Task 4) in a row next to a `size='inline-edit'` `Input`/`SelectButton` looks proportionate — if `px-10 py-4 gap-5` looks visibly off, adjust it and re-run Task 4's test.

- [ ] **Step 4: Regenerate E2E screenshot baselines**

Run: `pnpm e2e:docker:update:design-system` (from the repo root — this runs Playwright inside the same Docker Playwright image CI uses, so the regenerated PNGs match CI's rendering; a locally-run non-Docker `playwright test --update-snapshots` would produce mismatched baselines on non-Linux machines).

Expected: `InlineEdit.e2e.ts-snapshots/` (and `Attribute.e2e.ts-snapshots/` if any of its screenshots compose an `InlineEdit` row) updates with the new 28px heights. Review the diff — `git diff --stat` should show only `.png` files under these two `*-snapshots/` directories changing, nothing else.

- [ ] **Step 5: Full E2E run against the updated baselines**

Run: `pnpm e2e:docker:design-system`
Expected: all `InlineEdit.e2e.ts` and `Attribute.e2e.ts` specs pass against the freshly-updated screenshots.

- [ ] **Step 6: Commit**

```bash
git add packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts-snapshots packages/design-system/src/components/Attribute/Attribute.e2e.ts-snapshots
git commit -m "test(inline-edit): update e2e screenshot baselines for the 28px inline-edit size"
```
