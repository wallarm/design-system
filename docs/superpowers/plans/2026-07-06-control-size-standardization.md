# Control Size Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the 24px/32px/36px control-height scale (`'small'|'medium'|'default'`) across `Input`, `Textarea`, `Select` (`SelectButton`/`SelectInput`), and confirm `DateInput`/`TimeInput` already match it.

**Architecture:** Each component gets (or already has) a CVA `size` variant producing the same three heights, all defaulting to `'default'` (36px, today's unconditional behavior) so no existing consumer's visual output changes unless it opts in. `Button`'s own `'small'|'medium'|'large'` scale is untouched; `SelectButton` gains an independent `'small'|'medium'|'default'` type and translates internally when calling `Button`.

**Tech Stack:** React 19, TypeScript strict, `class-variance-authority` (CVA), Vitest + Testing Library, Tailwind (this repo's config maps utility numbers directly to px, e.g. `h-36` = 36px).

## Global Constraints

- Scale and naming: `'small' | 'medium' | 'default'` → 24px / 32px / 36px, exactly matching `InputGroup`/`Textarea`/`DateInput`/`TimeInput`'s existing convention. Do not use `'large'` anywhere in this plan's new code.
- `Button`/`ButtonBase` is never modified — its own `'small'|'medium'|'large'` scale is a separate, wider-blast-radius family, out of scope.
- Every new/changed `size` variant defaults to `'default'` and must be visually identical to today's unconditional behavior at that default — this is additive, not a breaking change, except for the one documented rename in Task 3.
- Conventional commits; scope `controls`, ticket suffix `(WDS-143)`.
- TypeScript strict; no `any`. No `React.forwardRef` — `ref` is a normal prop.
- Biome: `pnpm --filter @wallarm-org/design-system lint:fix` before every commit — fixes import ordering, don't hand-sort.
- This package's `pnpm typecheck` script is a confirmed pre-existing no-op (`tsc --noEmit` against a solution-style tsconfig with `files: []` — checks zero files, always exits 0). Use `pnpm --filter @wallarm-org/design-system build` and `build-storybook` as the real compile-checks.
- No Storybook story changes are required by this plan.

---

### Task 1: Add the missing `size` variant to `Input`

**Files:**
- Modify: `packages/design-system/src/components/Input/classes.ts`
- Modify: `packages/design-system/src/components/Input/Input.tsx`
- Modify: `packages/design-system/src/components/Input/Input.test.tsx`

**Interfaces:**
- Produces: `inputVariants({ error, size })` where `size?: 'small' | 'medium' | 'default'` (defaults to `'default'`). `InputProps` (already `VariantProps<typeof inputVariants> & ...`) picks up `size` automatically — no separate type export needed.

- [ ] **Step 1: Add the `size` variant to `inputVariants`**

Replace the full contents of `packages/design-system/src/components/Input/classes.ts` with:

```ts
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const inputVariants = cva(
  cn(
    'flex w-full px-12 rounded-8 border bg-component-input-bg',
    'font-sans text-sm text-text-primary placeholder:text-text-secondary',
    'shadow-xs transition-[color,border,box-shadow]',
    'focus-visible:outline-none focus-visible:ring-3',

    'disabled:aria-disabled:cursor-not-allowed disabled:aria-disabled:opacity-50',
  ),
  {
    variants: {
      error: {
        true: cn(
          'border-border-strong-danger',

          'hover:not-disabled:border-border-strong-danger',
          'hover:not-disabled:outline-none',
          'hover:not-disabled:ring-3',
          'hover:not-disabled:ring-focus-destructive-hover',

          'focus-visible:ring-focus-destructive',
        ),
        false: cn(
          'border-border-primary',

          'hover:not-disabled:border-component-border-input-hover',

          'focus-visible:not-disabled:border-border-strong-primary',
          'focus-visible:ring-focus-primary',
        ),
      },
      // 24/32/36px scale, matching InputGroup/Textarea/DateInput/TimeInput.
      // Vertical padding is (height - 20) / 2 so the text-sm/20px-line-height
      // value stays vertically centered at every size.
      size: {
        default: 'h-36 py-8',
        medium: 'h-32 py-6',
        small: 'h-24 py-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
```

- [ ] **Step 2: Consume `size` in `Input.tsx`**

Replace the full contents of `packages/design-system/src/components/Input/Input.tsx` with:

```tsx
import type { FC, InputHTMLAttributes, Ref } from 'react';
import type { HTMLProps } from '@ark-ui/react/factory';
import { useFieldContext } from '@ark-ui/react/field';
import { mergeProps } from '@ark-ui/react/utils';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { inputVariants } from './classes';

type InputNativeProps = InputHTMLAttributes<HTMLInputElement>;

type InputVariantsProps = VariantProps<typeof inputVariants>;

export type InputProps = InputNativeProps &
  InputVariantsProps &
  TestableProps & {
    ref?: Ref<HTMLInputElement>;
  };

export const Input: FC<InputProps> = ({
  className,
  error = false,
  size = 'default',
  disabled = false,
  ref,
  ...props
}) => {
  const field = useFieldContext();
  const mergedProps = mergeProps<HTMLProps<'input'>>(field?.getInputProps(), props);

  return (
    <input
      {...mergedProps}
      {...props}
      className={cn(inputVariants({ error, size }), className)}
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-disabled={disabled}
      ref={ref}
      data-slot='input'
    />
  );
};

Input.displayName = 'Input';
```

(The only functional change from the current file: `size` is destructured with a `'default'` fallback, and the hardcoded `'h-36 py-8'` string is removed from the `cn()` call in the JSX — `inputVariants({ error, size })` now supplies those classes.)

- [ ] **Step 3: Add size-variant tests**

Add this new `describe` block to the end of `packages/design-system/src/components/Input/Input.test.tsx` (keep the existing `Attribute pass-through` block untouched):

```tsx
describe('Size variants', () => {
  it('defaults to the default (36px) height with no size prop', () => {
    render(<Input data-testid='input' />);
    expect(screen.getByTestId('input').className).toContain('h-36');
  });

  it('renders the medium (32px) height', () => {
    render(<Input data-testid='input' size='medium' />);
    expect(screen.getByTestId('input').className).toContain('h-32');
  });

  it('renders the small (24px) height', () => {
    render(<Input data-testid='input' size='small' />);
    expect(screen.getByTestId('input').className).toContain('h-24');
  });
});
```

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @wallarm-org/design-system test:run Input.test.tsx`
Expected: PASS, 6/6 (3 existing + 3 new).

- [ ] **Step 5: Compile-check with the real build**

Run: `pnpm --filter @wallarm-org/design-system build`
Expected: exit 0.

- [ ] **Step 6: Lint and commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/Input/classes.ts packages/design-system/src/components/Input/Input.tsx packages/design-system/src/components/Input/Input.test.tsx
git commit -m "feat(controls): add size variant to Input (WDS-143)"
```

---

### Task 2: Fix `Textarea`'s `small` size height (regression)

**Files:**
- Modify: `packages/design-system/src/components/Textarea/classes.ts`
- Modify: `packages/design-system/src/components/Textarea/Textarea.test.tsx`

**Interfaces:**
- Consumes: nothing from Task 1 (independent file).
- Produces: `textareaHeightVariants({ size: 'small' })` now renders `'min-h-[64px]'` (was `'min-h-[60px]'`) — matches Figma node `725-12916`. `medium`/`default` are already correct and unchanged.

- [ ] **Step 1: Fix the `small` height value**

In `packages/design-system/src/components/Textarea/classes.ts`, replace:

```ts
export const textareaHeightVariants = cva('min-h-[60px]', {
  variants: {
    size: {
      small: 'min-h-[60px]',
      medium: 'min-h-[72px]',
      default: 'min-h-[76px]',
    },
  },
});
```

with:

```ts
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

(Both the CVA's own base string and the `small` variant value change — the base string is the fallback when no `size` variant matches, and should stay in sync with `small`, its original intent.)

- [ ] **Step 2: Add a regression test**

No existing test in `Textarea.test.tsx` asserts a specific height for any size value (verified — only behavioral tests exist today, e.g. `resize-none`, `rows`, `disabled`). Add this new `describe` block to the end of `packages/design-system/src/components/Textarea/Textarea.test.tsx`:

```tsx
describe('Size variants', () => {
  it('renders the small size at 64px min-height (matches Figma spec)', () => {
    render(<Textarea data-testid='textarea' size='small' />);
    expect(screen.getByTestId('textarea').className).toContain('min-h-[64px]');
  });

  it('renders the medium size at 72px min-height', () => {
    render(<Textarea data-testid='textarea' size='medium' />);
    expect(screen.getByTestId('textarea').className).toContain('min-h-[72px]');
  });

  it('renders the default size at 76px min-height with no size prop', () => {
    render(<Textarea data-testid='textarea' />);
    expect(screen.getByTestId('textarea').className).toContain('min-h-[76px]');
  });
});
```

- [ ] **Step 3: Run the tests**

Run: `pnpm --filter @wallarm-org/design-system test:run Textarea.test.tsx`
Expected: PASS, all tests including the 3 new ones.

- [ ] **Step 4: Compile-check with the real build**

Run: `pnpm --filter @wallarm-org/design-system build`
Expected: exit 0.

- [ ] **Step 5: Lint and commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/Textarea/classes.ts packages/design-system/src/components/Textarea/Textarea.test.tsx
git commit -m "fix(controls): correct Textarea small size to 64px, matching Figma (WDS-143)"
```

---

### Task 3: Decouple `SelectButton`'s size from `Button`, add `SelectInput`'s missing size variant

**Files:**
- Modify: `packages/design-system/src/components/Select/SelectButton.tsx`
- Modify: `packages/design-system/src/components/Select/SelectInput/SelectInput.tsx`
- Modify: `packages/design-system/src/components/Select/Select.test.tsx`

**Interfaces:**
- Consumes: `Button`, `type ButtonProps` (unchanged, from `../Button`).
- Produces: `SelectButtonSize = 'small' | 'medium' | 'default'` (exported from `SelectButton.tsx`); `SelectButtonVariantProps.size?: SelectButtonSize` (was `ButtonProps['size']`); `SelectButton`'s own default is now `size = 'default'` (was `'large'`) — visually identical (both resolve to `Button`'s `size='large'`, 36px). `SelectInput`'s new `size?: 'small' | 'medium' | 'default'` prop, defaulting to `'default'` (36px, today's unconditional height).
- No other file in this codebase passes `size='large'` to `SelectButton` today (verified via repo-wide grep) — this task requires no call-site migration.

- [ ] **Step 1: Decouple `SelectButton`'s size type and translate internally**

Replace the full contents of `packages/design-system/src/components/Select/SelectButton.tsx` with:

```tsx
import type { FC } from 'react';
import { Select as ArkUiSelect, useSelectContext } from '@ark-ui/react/select';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { SelectArrow } from './SelectArrow';
import { useSelectSharedContext } from './SelectSharedContext';
import { SelectValueIcon } from './SelectValueIcon';
import { SelectValueText, type SelectValueTextProps } from './SelectValueText';

type SelectButtonBaseProps = Omit<ButtonProps, 'variant' | 'color' | 'size' | 'disabled'>;

export type SelectButtonSize = 'small' | 'medium' | 'default';

// Select's own 24/32/36px scale ('small'|'medium'|'default') is independent
// of Button's ('small'|'medium'|'large') — translate at the call site
// rather than rename Button's own scale, which is used everywhere in the app.
const SELECT_BUTTON_SIZE_MAP: Record<SelectButtonSize, ButtonProps['size']> = {
  small: 'small',
  medium: 'medium',
  default: 'large',
};

export interface SelectButtonVariantProps {
  variant?: Exclude<ButtonProps['variant'], 'primary'>;
  color?: Exclude<ButtonProps['color'], 'destructive'>;
  size?: SelectButtonSize;
}

type SelectButtonProps = SelectButtonBaseProps & SelectButtonVariantProps & SelectValueTextProps;

export const SelectButton: FC<SelectButtonProps> = ({
  placeholder = 'Choose...',
  variant = 'outline',
  color = 'neutral',
  size = 'default',
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('button', testIdProp);
  const { loading } = useSelectSharedContext();
  const { disabled } = useSelectContext();

  return (
    <ArkUiSelect.Control>
      <ArkUiSelect.Trigger asChild>
        <Button
          {...props}
          data-testid={testId}
          variant={variant}
          color={color}
          size={SELECT_BUTTON_SIZE_MAP[size]}
          loading={loading}
          disabled={disabled}
          fullWidth
        >
          <SelectValueIcon />

          <SelectValueText placeholder={placeholder} />

          <SelectArrow />
        </Button>
      </ArkUiSelect.Trigger>
    </ArkUiSelect.Control>
  );
};

SelectButton.displayName = 'SelectButton';
```

- [ ] **Step 2: Add the `size` variant to `SelectInput`**

Replace the full contents of `packages/design-system/src/components/Select/SelectInput/SelectInput.tsx` with:

```tsx
import type { FC } from 'react';
import { Select as ArkUiSelect, useSelectContext } from '@ark-ui/react/select';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { OverflowList } from '../../OverflowList';
import { SelectArrow } from '../SelectArrow';
import { SelectValueText, type SelectValueTextProps } from '../SelectValueText';
import { SelectInputClear } from './SelectInputClear';
import { SelectInputItemRenderer } from './SelectInputItemRenderer';
import { SelectInputOverflowRenderer } from './SelectInputOverflowRenderer';

const selectInputVariants = cva(
  [
    // Layout & container
    'flex items-center gap-4 w-fit pr-12 rounded-8 border bg-component-input-bg shadow-xs transition-[colors,border,box-shadow]',

    // Typography
    'font-sans text-sm text-text-primary placeholder:text-text-secondary',

    // Focus styles for the root element
    'focus-visible:outline-none focus-visible:ring-3',

    // Disabled state — visuals
    'data-disabled:cursor-not-allowed',
    'data-disabled:opacity-50',

    // Disabled state — block all pointer interactions for children
    'data-disabled:[&_*]:pointer-events-none',

    // Disabled state — suppress any visible focus styles on children
    // (Note: CSS cannot fully prevent focus via keyboard, this is visual only)
    'data-disabled:[&_*]:focus:outline-none',
    'data-disabled:[&_*]:focus-visible:outline-none',
    'data-disabled:[&_*]:focus-within:outline-none',
    'data-disabled:[&_*]:ring-0',

    // Default border + hover border (hover applies only when NOT disabled)
    'border-border-primary not-focus-visible:hover:[&:not([data-disabled])]:border-component-border-input-hover',

    // Focus ring (applies only when NOT disabled)
    'focus-visible:[&:not([data-disabled]):not([data-invalid])]:ring-focus-primary',
    'focus-visible:[&:not([data-disabled]):not([data-invalid])]:border-border-strong-primary',

    // Opened state - base
    '[&[data-state=open]:not([data-disabled])]:ring-3',

    // Opened state - active
    '[&[data-state=open]:not([data-disabled])]:ring-focus-primary',
    '[&[data-state=open]:not([data-disabled])]:border-border-strong-primary',

    // Opened state - invalid
    '[&[data-state=open][data-invalid]:not([data-disabled])]:ring-focus-destructive',
    '[&[data-state=open][data-invalid]:not([data-disabled])]:border-border-strong-danger',

    // Invalid state — base border
    'data-invalid:border-border-strong-danger',

    // Invalid state + hover (hover applies only when NOT disabled)
    'data-invalid:hover:[&:not([data-disabled])]:border-border-strong-danger',
    'data-invalid:hover:[&:not([data-disabled])]:ring-3',
    'data-invalid:hover:[&:not([data-disabled])]:ring-focus-destructive-hover',

    // Invalid state + focus
    'data-invalid:focus-within:ring-focus-destructive',
  ],
  {
    variants: {
      multiple: {
        true: 'text-text-secondary',
        false: 'pl-12',
      },
      empty: {
        true: 'text-text-secondary',
      },
      // 24/32/36px scale, matching Input/InputGroup/Textarea/DateInput/TimeInput.
      size: {
        default: 'h-36',
        medium: 'h-32',
        small: 'h-24',
      },
    },
    compoundVariants: [
      {
        multiple: true,
        empty: true,
        className: 'pl-12',
      },
    ],
    defaultVariants: {
      size: 'default',
    },
  },
);

interface SelectInputBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  'data-testid'?: string;
  size?: 'small' | 'medium' | 'default';
}

type SelectInputProps = SelectInputBaseProps & Pick<SelectValueTextProps, 'placeholder'>;

export const SelectInput: FC<SelectInputProps> = ({
  placeholder = 'Choose...',
  size = 'default',
  className,
  ...rest
}) => {
  const { selectedItems, disabled, multiple } = useSelectContext();

  const isEmpty = selectedItems.length <= 0;

  return (
    <ArkUiSelect.Control className='w-full max-w-full'>
      <ArkUiSelect.Trigger asChild>
        <div
          {...rest}
          className={cn(
            selectInputVariants({ empty: isEmpty, multiple, size }),
            'w-full max-w-full gap-8',
            className,
          )}
          tabIndex={disabled ? -1 : 0}
        >
          {multiple && !isEmpty ? (
            <OverflowList
              className='flex items-center gap-4 flex-1 h-full pl-6 overflow-hidden'
              items={selectedItems}
              itemRenderer={item => <SelectInputItemRenderer key={item.value} item={item} />}
              overflowRenderer={SelectInputOverflowRenderer}
            />
          ) : (
            <SelectValueText placeholder={placeholder} />
          )}

          <SelectInputClear />

          <SelectArrow className='text-icon-secondary' />
        </div>
      </ArkUiSelect.Trigger>
    </ArkUiSelect.Control>
  );
};

SelectInput.displayName = 'SelectInput';
```

(Only change from the current file: `h-36` moved out of the base class array and into a new `size` CVA variant; `size` destructured with a `'default'` fallback and passed into `selectInputVariants(...)`. `SelectInputBaseProps` gains the `size` field.)

- [ ] **Step 3: Add size-variant tests to `Select.test.tsx`**

Add this new `describe` block to the end of `packages/design-system/src/components/Select/Select.test.tsx` (the file already imports `createListCollection`, `render`, `screen`, `Select`, `SelectButton` — this step additionally needs `SelectInput`, so add that import too):

Add this import alongside the existing ones near the top of the file:

```ts
import { SelectInput } from './SelectInput';
```

Then add at the end of the file:

```tsx
describe('Size variants', () => {
  const collection = createListCollection({ items });

  it('SelectButton defaults to the default (36px) height with no size prop', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-36');
  });

  it('SelectButton renders the medium (32px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='medium' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-32');
  });

  it('SelectButton renders the small (24px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='small' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-24');
  });

  it('SelectInput defaults to the default (36px) height with no size prop', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-36');
  });

  it('SelectInput renders the medium (32px) height', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' size='medium' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-32');
  });

  it('SelectInput renders the small (24px) height', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' size='small' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-24');
  });
});
```

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @wallarm-org/design-system test:run Select.test.tsx`
Expected: PASS, all existing tests plus the 6 new ones.

- [ ] **Step 5: Compile-check with the real build**

Run: `pnpm --filter @wallarm-org/design-system build`
Expected: exit 0.

Run: `pnpm --filter @wallarm-org/design-system build-storybook`
Expected: exit 0 (confirms no Storybook story anywhere passes `size='large'` to `SelectButton`, which would now fail to type-check since `SelectButtonSize` no longer includes `'large'`).

- [ ] **Step 6: Lint and commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/Select/SelectButton.tsx packages/design-system/src/components/Select/SelectInput/SelectInput.tsx packages/design-system/src/components/Select/Select.test.tsx
git commit -m "feat(controls): decouple SelectButton size from Button, add SelectInput size variant (WDS-143)"
```

---

### Task 4: Confirm `DateInput`/`TimeInput` already scale correctly, add regression tests, final verification

**Files:**
- Modify: `packages/design-system/src/components/DateInput/DateInput.test.tsx`
- Modify: `packages/design-system/src/components/TimeInput/TimeInput.test.tsx`

**Interfaces:**
- Consumes: `DateInput`/`TimeInput`'s existing `size?: 'default' | 'medium' | 'small'` prop (already implemented, forwarded to `InputGroup` — no production code change in this task).
- Produces: nothing new — this task only adds regression coverage and runs the full plan's final quality gate.

- [ ] **Step 1: Add a size regression test to `DateInput.test.tsx`**

Add this new `describe` block to the end of `packages/design-system/src/components/DateInput/DateInput.test.tsx`:

```tsx
describe('Size variants (confirms InputGroup scaling, no DateInput code change)', () => {
  it('defaults to the default (36px) InputGroup height with no size prop', () => {
    render(<DateInput data-testid='date-input' />);
    const group = screen.getByTestId('date-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-36');
  });

  it('renders the medium (32px) InputGroup height', () => {
    render(<DateInput data-testid='date-input' size='medium' />);
    const group = screen.getByTestId('date-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-32');
  });

  it('renders the small (24px) InputGroup height', () => {
    render(<DateInput data-testid='date-input' size='small' />);
    const group = screen.getByTestId('date-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-24');
  });
});
```

- [ ] **Step 2: Add the equivalent regression test to `TimeInput.test.tsx`**

Add this new `describe` block to the end of `packages/design-system/src/components/TimeInput/TimeInput.test.tsx`:

```tsx
describe('Size variants (confirms InputGroup scaling, no TimeInput code change)', () => {
  it('defaults to the default (36px) InputGroup height with no size prop', () => {
    render(<TimeInput data-testid='time-input' />);
    const group = screen.getByTestId('time-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-36');
  });

  it('renders the medium (32px) InputGroup height', () => {
    render(<TimeInput data-testid='time-input' size='medium' />);
    const group = screen.getByTestId('time-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-32');
  });

  it('renders the small (24px) InputGroup height', () => {
    render(<TimeInput data-testid='time-input' size='small' />);
    const group = screen.getByTestId('time-input').querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass('h-24');
  });
});
```

- [ ] **Step 3: Run both test files**

Run: `pnpm --filter @wallarm-org/design-system test:run DateInput.test.tsx TimeInput.test.tsx`
Expected: PASS, all existing tests plus the 6 new ones (3 per file). If any of these 6 fail, this is a genuine, previously-unknown regression in `DateInput`/`TimeInput` — stop and report it rather than adjusting the test to match broken output; it would mean the spec's "already correct" conclusion was wrong and needs escalating, not silently patching over.

- [ ] **Step 4: Full quality gate across all 4 tasks**

```bash
pnpm --filter @wallarm-org/design-system lint
pnpm --filter @wallarm-org/design-system build
pnpm --filter @wallarm-org/design-system build-storybook
pnpm --filter @wallarm-org/design-system test:run
```

Expected: all green. `lint` may show pre-existing warnings (confirmed baseline: 99, no errors) — do not introduce new ones.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/DateInput/DateInput.test.tsx packages/design-system/src/components/TimeInput/TimeInput.test.tsx
git commit -m "test(controls): add size-scaling regression coverage for DateInput/TimeInput (WDS-143)"
```
