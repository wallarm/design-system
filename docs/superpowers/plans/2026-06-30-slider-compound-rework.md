# Slider Compound-Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the flat `Slider` into a lean compound component (root + composable sub-parts), matching the
Checkbox/Switch idiom, per maintainer review on PR #192.

**Architecture:** The root `Slider` owns the Ark slider machine, `Field` context, `error`, and a DS
`SliderRootContext`; it renders `ArkSlider.Root` so descendants read the live api via Ark's `useSliderContext()`.
Consumers compose `SliderControl` (renders track+range internally) → `SliderThumb` (the real `role="slider"`
node; carries analytics) → `SliderMarks` (ticks), plus optional `SliderInput` / `SliderValue`. Exposing
`SliderThumb` makes each thumb individually addressable, **closing the CG-1 range-analytics gap**.

**Tech Stack:** React 19 (`ref` prop, no `forwardRef`), TypeScript strict, `@ark-ui/react/slider` 5.31.0, CVA +
`cn`, Tailwind (1 unit = 1px), Vitest + Testing Library, Playwright, `@figma/code-connect`.

## Global Constraints

- **No `any`.** Strict TS; `type` imports for type-only. Named exports only. `displayName` on every part. `ref`
  prop (never `forwardRef`).
- **CVA in `classes.ts`; merge with `cn()`.** No inline styles, no hardcoded colors — design tokens only.
- **`data-slot` (kebab) on every part's root element.** `data-testid` cascades via `TestIdProvider` /
  `useTestId` (`.claude/rules/test-id.md`); slots: `control`, `thumb`|`thumb-0`,`thumb-1`, `marker-group`,
  `marker`, `input`|`input-0`,`input-1`, `value`.
- **Metrics contract (`docs/metrics/contract.md`):** consumer `data-*`/`aria-*`/`id`/`ref`/events forward to the
  **real interactive node** — the thumb. No analytics-named props. No allowlisting/reshaping.
- **Conventional commits** (commitlint). Biome formats — single quotes, semicolons, trailing commas.
- **Hard cut:** remove the flat props (`marks`, `tooltip`, `input`, thumb `{...rest}`, `aria-label`/
  `aria-labelledby` arrays) from the root. No backwards-compat surface (PR #192 unmerged → zero consumers).
- **Invariants preserved:** single-vs-range = value length; thumbs never cross; focus == hover emphasis (no
  ring); disabled dims whole control 50% at root; horizontal, one size; `error` repaints handle (message is the
  Field's); snap to `step`; tooltip and persistent readout mutually exclusive.

---

### Task 1: Foundation + single-value slider renders

The first renderable, testable vertical slice: shared types, the DS context, the root, `SliderControl`, and
`SliderThumb` (single-thumb behavior only). Range/analytics/marks/input land in later tasks.

**Files:**
- Create: `packages/design-system/src/components/Slider/types.ts`
- Create: `packages/design-system/src/components/Slider/SliderContext.tsx`
- Rewrite: `packages/design-system/src/components/Slider/Slider.tsx` (root only)
- Create: `packages/design-system/src/components/Slider/SliderControl.tsx`
- Create: `packages/design-system/src/components/Slider/SliderThumb.tsx`
- Modify: `packages/design-system/src/components/Slider/index.ts`
- Modify: `packages/design-system/src/components/Slider/classes.ts` (root layout: gap + marks band)
- Test: `packages/design-system/src/components/Slider/Slider.test.tsx` (replace the flat suite)

**Interfaces:**
- Produces:
  - `interface SliderMark { value: number; label?: string }` (`types.ts`)
  - `SliderRootContextValue` + `SliderRootContextProvider` + `useSliderRootContext()` (`SliderContext.tsx`),
    fields: `isRange: boolean`, `invalid: boolean`, `disabled: boolean`, `ariaDescribedby?: string`,
    `fieldLabelId?: string`, `marksRef: RefObject<SliderMark[]>`, `registerMarks: (m: SliderMark[]) => void`.
  - `Slider: FC<SliderProps>` — root; props = Ark machine config (`value` `defaultValue` `min` `max` `step`
    `disabled` `readOnly` `getAriaValueText` `name` `form` `minStepsBetweenThumbs` `thumbCollisionBehavior`)
    + `error?` `className?` `children?` `onValueChange?(v:number[])` `onValueChangeEnd?(v:number[])`
    `ref?: Ref<HTMLDivElement>` + `data-testid`.
  - `SliderControl: FC<{ children?; className? }>`
  - `SliderThumb: FC<SliderThumbProps>` — `index?` (default 0), `tooltip?`, `className?`, `ref?`, + Ark thumb
    pass-through (`data-*`/`id`/`aria-*`/events).
- Consumes: `useFieldContext` (`@ark-ui/react/field`), `Slider`/`useSliderContext` (`@ark-ui/react/slider`),
  `cn`, `TestableProps`/`TestIdProvider`/`useTestId` (`../../utils/testId`).

- [ ] **Step 1: Write the failing tests** — replace the entire body of `Slider.test.tsx` with the compound
  rendering/value-model/states/Field suite (range/analytics/marks/input tests are added in later tasks):

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field, FieldLabel } from '../Field';
import { Slider } from './Slider';
import { SliderControl } from './SliderControl';
import { SliderThumb } from './SliderThumb';

const getThumbs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="slider-thumb"]'));

const Single = (props: React.ComponentProps<typeof Slider>) => (
  <Slider {...props}>
    <SliderControl>
      <SliderThumb aria-label='Value' />
    </SliderControl>
  </Slider>
);

describe('Slider — rendering & value model', () => {
  it('renders a single thumb (role="slider") for a 1-entry value', () => {
    const { container } = render(<Single defaultValue={[50]} />);
    const thumbs = getThumbs(container);
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0]).toHaveAttribute('role', 'slider');
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '50');
  });

  it('accepts a custom aria-label as a string on the thumb', () => {
    const { container } = render(
      <Slider defaultValue={[40]}>
        <SliderControl>
          <SliderThumb aria-label='Brightness' />
        </SliderControl>
      </Slider>,
    );
    expect(getThumbs(container)[0]).toHaveAttribute('aria-label', 'Brightness');
  });
});

describe('Slider — states', () => {
  it('marks the root disabled (data-disabled)', () => {
    render(<Single disabled data-testid='s' />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-disabled');
  });

  it('maps error → invalid (data-invalid) on the root', () => {
    render(<Single error data-testid='s' />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-invalid');
  });
});

describe('Slider — Field context', () => {
  it('inherits invalid from a wrapping <Field invalid>', () => {
    render(
      <Field invalid>
        <FieldLabel>Risk</FieldLabel>
        <Slider data-testid='s'>
          <SliderControl><SliderThumb /></SliderControl>
        </Slider>
      </Field>,
    );
    expect(screen.getByTestId('s')).toHaveAttribute('data-invalid');
  });

  it('inherits disabled from a wrapping <Field disabled>', () => {
    render(
      <Field disabled>
        <FieldLabel>Risk</FieldLabel>
        <Slider data-testid='s'>
          <SliderControl><SliderThumb /></SliderControl>
        </Slider>
      </Field>,
    );
    expect(screen.getByTestId('s')).toHaveAttribute('data-disabled');
  });

  it('is labelled by the FieldLabel via aria-labelledby (single, no explicit label)', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Risk threshold</FieldLabel>
        <Slider><SliderControl><SliderThumb /></SliderControl></Slider>
      </Field>,
    );
    const labelledBy = getThumbs(container)[0].getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Risk threshold');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @wallarm-org/design-system test Slider.test`
Expected: FAIL — `SliderControl`/`SliderThumb` modules don't exist / `Slider` no longer renders thumbs itself.

- [ ] **Step 3: Create `types.ts`**

```tsx
/** A tick mark: a position on the scale with an optional text label. */
export interface SliderMark {
  /** The value this tick sits at (within `[min, max]`). */
  value: number;
  /**
   * Optional label rendered below the tick. For ordinal scales (e.g. Low/Medium/High)
   * the label also becomes the thumb's `aria-valuetext` unless a custom
   * `getAriaValueText` is supplied.
   */
  label?: string;
}
```

- [ ] **Step 4: Create `SliderContext.tsx`**

```tsx
import { createContext, type RefObject, useContext } from 'react';
import type { SliderMark } from './types';

export interface SliderRootContextValue {
  /** True when the value has 2+ entries (range) — drives slot-naming + label defaults. */
  isRange: boolean;
  /** Resolved invalid state (own `error` || Field `invalid`) — for sub-part error styling. */
  invalid: boolean;
  /** Resolved disabled state (own `disabled` ?? Field `disabled`). */
  disabled: boolean;
  /** Field help/error id to announce on the thumb (`aria-describedby`). */
  ariaDescribedby?: string;
  /** Field label id — fallback accessible name for a single thumb with no explicit label. */
  fieldLabelId?: string;
  /** Live marks published by `<SliderMarks>`; read for ordinal display + `aria-valuetext`. */
  marksRef: RefObject<SliderMark[]>;
  /** Called by `<SliderMarks>` to publish its marks to the root. */
  registerMarks: (marks: SliderMark[]) => void;
}

const SliderRootContext = createContext<SliderRootContextValue | null>(null);

export const SliderRootContextProvider = SliderRootContext.Provider;

export const useSliderRootContext = (): SliderRootContextValue => {
  const context = useContext(SliderRootContext);
  if (!context) throw new Error('Slider sub-components must be rendered inside <Slider>.');
  return context;
};
```

- [ ] **Step 5: Rewrite `Slider.tsx` (root only)**

```tsx
import { type FC, type ReactNode, type Ref, useCallback, useMemo, useRef } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { Slider as ArkSlider } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { sliderVariants } from './classes';
import { SliderRootContextProvider } from './SliderContext';
import type { SliderMark } from './types';

/** Ark/Zag machine-config props forwarded to the headless `Slider.Root`. */
type SliderRootConfig = Pick<
  ArkSlider.RootProps,
  | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'disabled' | 'readOnly'
  | 'getAriaValueText' | 'name' | 'form' | 'minStepsBetweenThumbs' | 'thumbCollisionBehavior'
>;

export interface SliderProps extends SliderRootConfig, TestableProps {
  /** Error state → maps to Ark `invalid` (repaints the handle; the message is the Field's job). */
  error?: boolean;
  className?: string;
  children?: ReactNode;
  /** Fires live during drag with the current value array (`[n]` single, `[low, high]` range). */
  onValueChange?: (value: number[]) => void;
  /** Fires once on drag release with the committed value array. */
  onValueChangeEnd?: (value: number[]) => void;
  /** Ref to the Ark Slider root element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Slider — pick an approximate, bounded value (or range) by dragging a handle along
 * a track. Built on `@ark-ui/react/slider`. Compose `SliderControl` + `SliderThumb`
 * (+ optional `SliderMarks` / `SliderInput` / `SliderValue`). Single vs range is driven
 * by the length of `value` / `defaultValue`; render one `SliderThumb` per thumb.
 */
export const Slider: FC<SliderProps> = ({
  value,
  defaultValue = [50],
  min,
  max,
  step,
  disabled,
  readOnly,
  getAriaValueText,
  name,
  form,
  minStepsBetweenThumbs,
  thumbCollisionBehavior,
  error = false,
  className,
  children,
  onValueChange,
  onValueChangeEnd,
  ref,
  'data-testid': testId,
}) => {
  const field = useFieldContext();
  const invalid = error || Boolean(field?.invalid);
  const isDisabled = disabled ?? field?.disabled ?? false;
  const isReadOnly = readOnly ?? field?.readOnly;

  const isRange = (value ?? defaultValue).length > 1;

  // Marks published by <SliderMarks> (if any), read lazily for ordinal aria-valuetext.
  const marksRef = useRef<SliderMark[]>([]);
  const registerMarks = useCallback((marks: SliderMark[]) => {
    marksRef.current = marks;
  }, []);

  // Ordinal scale: announce a mark's label as aria-valuetext unless the consumer
  // supplies their own formatter. Reads marksRef at call time (post-mount).
  const resolvedGetAriaValueText = useMemo(
    () =>
      getAriaValueText ??
      (({ value: v }: { value: number; index: number }) =>
        marksRef.current.find(m => m.value === v)?.label ?? String(v)),
    [getAriaValueText],
  );

  const fieldLabelId = field && !isRange ? field.ids.label : undefined;

  const contextValue = useMemo(
    () => ({
      isRange,
      invalid,
      disabled: isDisabled,
      ariaDescribedby: field?.ariaDescribedby,
      fieldLabelId,
      marksRef,
      registerMarks,
    }),
    [isRange, invalid, isDisabled, field?.ariaDescribedby, fieldLabelId, registerMarks],
  );

  return (
    <ArkSlider.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={isDisabled}
      readOnly={isReadOnly}
      invalid={invalid}
      getAriaValueText={resolvedGetAriaValueText}
      name={name}
      form={form}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      thumbCollisionBehavior={thumbCollisionBehavior}
      onValueChange={onValueChange ? details => onValueChange(details.value) : undefined}
      onValueChangeEnd={onValueChangeEnd ? details => onValueChangeEnd(details.value) : undefined}
      data-slot='slider'
      data-testid={testId}
      className={cn(sliderVariants(), className)}
    >
      <SliderRootContextProvider value={contextValue}>
        <TestIdProvider value={testId}>{children}</TestIdProvider>
      </SliderRootContextProvider>
    </ArkSlider.Root>
  );
};

Slider.displayName = 'Slider';
```

- [ ] **Step 6: Update `classes.ts`** — make the root the layout row (gap for flanking inputs) and reserve the
  marks band via `:has()` (replaces the old JS-driven `pb-28`). Replace the `sliderVariants` `cn(...)` body:

```tsx
export const sliderVariants = cva(
  cn(
    'relative flex w-full touch-none select-none items-center gap-8',
    // Reserve room below the track for the tick-label band when <SliderMarks> is present.
    '[&:has([data-slot=slider-marker-group])]:pb-28',
    // Disabled — whole control dimmed + non-interactive (requirements §5)
    'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
  ),
  { variants: {}, defaultVariants: {} },
);
```

Leave `sliderControlClassNames`, `sliderTrackClassNames`, `sliderRangeClassNames`, `sliderMarkerGroupClassNames`,
`sliderMarkerClassNames`, `sliderThumbClassNames`, `sliderInputBoxClassNames` unchanged. **Delete**
`sliderInputRowClassNames` (the row moves onto the root; verify no other importer with
`grep -rn sliderInputRowClassNames packages/design-system/src`).

- [ ] **Step 7: Create `SliderControl.tsx`**

```tsx
import type { FC, ReactNode } from 'react';
import { Slider as ArkSlider } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  sliderControlClassNames,
  sliderRangeClassNames,
  sliderTrackClassNames,
} from './classes';

export interface SliderControlProps {
  children?: ReactNode;
  className?: string;
}

/** The interactive track region — renders the track + range, then the thumb(s) / marks. */
export const SliderControl: FC<SliderControlProps> = ({ children, className }) => {
  const testId = useTestId('control');
  return (
    <ArkSlider.Control
      data-slot='slider-control'
      data-testid={testId}
      className={cn(sliderControlClassNames, className)}
    >
      <ArkSlider.Track data-slot='slider-track' className={sliderTrackClassNames}>
        <ArkSlider.Range data-slot='slider-range' className={sliderRangeClassNames} />
      </ArkSlider.Track>
      {children}
    </ArkSlider.Control>
  );
};

SliderControl.displayName = 'SliderControl';
```

- [ ] **Step 8: Create `SliderThumb.tsx`** (tooltip wiring lands in Task 4 — this version is single-thumb,
  no tooltip):

```tsx
import type { FC, Ref } from 'react';
import { Slider as ArkSlider } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { sliderThumbClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';

type ArkThumbPassThrough = Omit<
  ArkSlider.ThumbProps,
  'index' | 'children' | 'className' | 'asChild'
>;

export interface SliderThumbProps extends ArkThumbPassThrough {
  /** Which thumb this is (0 = single/low, 1 = high). */
  index?: number;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The draggable handle — the real interactive node (`role="slider"`, focusable).
 * Consumer `data-*` / `aria-*` / `id` / `ref` / event props forward HERE.
 */
export const SliderThumb: FC<SliderThumbProps> = ({
  index = 0,
  className,
  ref,
  'aria-label': ariaLabelProp,
  'aria-labelledby': ariaLabelledbyProp,
  ...rest
}) => {
  const { isRange, ariaDescribedby, fieldLabelId } = useSliderRootContext();
  const testId = useTestId(isRange ? `thumb-${index}` : 'thumb');

  // Accessible name: explicit on the thumb wins; else single-in-Field → the field label;
  // else a range default (Minimum / Maximum) by index.
  const hasExplicit = ariaLabelProp !== undefined || ariaLabelledbyProp !== undefined;
  const ariaLabel =
    ariaLabelProp ?? (!hasExplicit && isRange ? (index === 0 ? 'Minimum' : 'Maximum') : undefined);
  const ariaLabelledby = ariaLabelledbyProp ?? (!hasExplicit && !isRange ? fieldLabelId : undefined);

  return (
    <ArkSlider.Thumb
      {...rest}
      ref={ref}
      index={index}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      data-slot='slider-thumb'
      data-testid={testId}
      className={cn(sliderThumbClassNames, className)}
    >
      <ArkSlider.HiddenInput />
    </ArkSlider.Thumb>
  );
};

SliderThumb.displayName = 'SliderThumb';
```

- [ ] **Step 9: Update `index.ts`** — replace the file with:

```tsx
export { sliderVariants } from './classes';
export { Slider, type SliderProps } from './Slider';
export { SliderControl, type SliderControlProps } from './SliderControl';
export { SliderThumb, type SliderThumbProps } from './SliderThumb';
export type { SliderMark } from './types';
```

(Later tasks append `SliderMarks`, `SliderInput`, `SliderValue` exports.)

- [ ] **Step 10: Run tests + typecheck + lint**

Run: `pnpm --filter @wallarm-org/design-system test Slider.test && pnpm --filter @wallarm-org/design-system typecheck && pnpm biome check packages/design-system/src/components/Slider`
Expected: PASS (Task 1 suite green; no TS/biome errors in the Slider dir).

- [ ] **Step 11: Commit**

```bash
git add packages/design-system/src/components/Slider
git commit -m "refactor(slider): compound root + SliderControl + SliderThumb (single value)"
```

---

### Task 2: Range — multiple thumbs, per-thumb analytics, testid cascade

Range rendering is consumer-driven (one `<SliderThumb index>` per thumb). This task verifies the analytics-gap
closure (the whole point of the rework) and the indexed testid cascade.

**Files:**
- Modify: `Slider.test.tsx` (add the range / analytics / testid describe blocks)
- (No source changes expected — `SliderThumb`/context from Task 1 already handle `index`. If a test fails, fix
  the responsible part.)

**Interfaces:**
- Consumes: `Slider`, `SliderControl`, `SliderThumb` from Task 1.

- [ ] **Step 1: Write the failing tests** — append to `Slider.test.tsx`:

```tsx
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';

const Range = (props: React.ComponentProps<typeof Slider>) => (
  <Slider defaultValue={[20, 80]} {...props}>
    <SliderControl>
      <SliderThumb index={0} />
      <SliderThumb index={1} />
    </SliderControl>
  </Slider>
);

describe('Slider — range', () => {
  it('renders two thumbs defaulting to Minimum / Maximum labels', () => {
    const { container } = render(<Range />);
    const thumbs = getThumbs(container);
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Minimum');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Maximum');
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '20');
    expect(thumbs[1]).toHaveAttribute('aria-valuenow', '80');
  });

  it('clamps range thumbs so they cannot cross', () => {
    const { container } = render(<Range />);
    const [low, high] = getThumbs(container);
    expect(low).toHaveAttribute('aria-valuemax', '80');
    expect(high).toHaveAttribute('aria-valuemin', '20');
  });

  it('accepts per-thumb aria-labels', () => {
    const { container } = render(
      <Slider defaultValue={[10, 90]}>
        <SliderControl>
          <SliderThumb index={0} aria-label='Floor' />
          <SliderThumb index={1} aria-label='Ceiling' />
        </SliderControl>
      </Slider>,
    );
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Floor');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Ceiling');
  });
});

describe('Slider — analytics pass-through (each thumb is the real node, CG-1 closed)', () => {
  it('forwards a distinct data-analytics-id to each range thumb', () => {
    const { container } = render(
      <Slider defaultValue={[20, 80]} data-testid='s'>
        <SliderControl>
          <SliderThumb index={0} data-analytics-id='PRICE_MIN' />
          <SliderThumb index={1} data-analytics-id='PRICE_MAX' />
        </SliderControl>
      </Slider>,
    );
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('role', 'slider');
    expect(thumbs[0]).toHaveAttribute('data-analytics-id', 'PRICE_MIN');
    expect(thumbs[1]).toHaveAttribute('data-analytics-id', 'PRICE_MAX');
    const root = screen.getByTestId('s');
    expect(root).not.toHaveAttribute('data-analytics-id');
  });

  it('forwards data-analytics-props byte-for-byte to the thumb', () => {
    const payload = '{"feature":"risk","unit":"score"}';
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb aria-label='Risk' data-analytics-id='RISK' data-analytics-props={payload} />
        </SliderControl>
      </Slider>,
    );
    expect(getThumbs(container)[0]).toHaveAttribute('data-analytics-props', payload);
  });

  it('resolves a thumb click to its analytics-id via closest()', () => {
    const captured = captureAnalyticsClicks();
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb aria-label='Risk' data-analytics-id='RISK_THRESHOLD' />
        </SliderControl>
      </Slider>,
    );
    fireEvent.click(getThumbs(container)[0]);
    expect(captured).toHaveBeenCalledWith('RISK_THRESHOLD');
  });
});

describe('Slider — data-testid cascade', () => {
  it('derives the single thumb id as `{base}--thumb`', () => {
    const { container } = render(<Single data-testid='risk' />);
    expect(getThumbs(container)[0]).toHaveAttribute('data-testid', 'risk--thumb');
  });

  it('derives indexed thumb ids for a range (`{base}--thumb-0/1`)', () => {
    const { container } = render(<Range data-testid='price' />);
    const thumbs = getThumbs(container);
    expect(thumbs[0]).toHaveAttribute('data-testid', 'price--thumb-0');
    expect(thumbs[1]).toHaveAttribute('data-testid', 'price--thumb-1');
  });

  it('stays clean (no derived ids) when no data-testid is passed', () => {
    const { container } = render(<Single />);
    expect(getThumbs(container)[0]).not.toHaveAttribute('data-testid');
  });
});
```

- [ ] **Step 2: Run tests** — `pnpm --filter @wallarm-org/design-system test Slider.test`. Expected: PASS. If
  the analytics or testid tests fail, the bug is in `SliderThumb` (rest-spread order, or `useTestId` slot
  string) — fix there.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Slider/Slider.test.tsx
git commit -m "test(slider): range + per-thumb analytics (CG-1 closure) + testid cascade"
```

---

### Task 3: `SliderMarks` — ticks, ordinal aria-valuetext, click-to-jump

**Files:**
- Create: `packages/design-system/src/components/Slider/SliderMarks.tsx`
- Modify: `Slider.test.tsx` (ordinal + tick render + click-to-jump)
- Modify: `index.ts` (export `SliderMarks`)

**Interfaces:**
- Produces: `SliderMarks: FC<{ marks: SliderMark[]; className? }>` — renders the marker group; publishes `marks`
  to the root via `registerMarks` (drives `aria-valuetext`).
- Consumes: `useSliderRootContext` (`registerMarks`), `useSliderContext` (`setThumbValue`, `value`), `SliderMark`.

- [ ] **Step 1: Write the failing tests** — append to `Slider.test.tsx`:

```tsx
import { SliderMarks } from './SliderMarks';

const MARKS = [
  { value: 0, label: 'Low' },
  { value: 50, label: 'Medium' },
  { value: 100, label: 'High' },
];

describe('Slider — marks / ordinal scale', () => {
  it('renders a tick + label per mark', () => {
    const { container } = render(
      <Slider defaultValue={[50]} min={0} max={100} step={50}>
        <SliderControl>
          <SliderThumb aria-label='Volume' />
          <SliderMarks marks={MARKS} />
        </SliderControl>
      </Slider>,
    );
    const markers = container.querySelectorAll('[data-slot="slider-marker"]');
    expect(markers).toHaveLength(3);
    expect(markers[1]).toHaveTextContent('Medium');
  });

  it('announces the mark label as aria-valuetext instead of the number', () => {
    const { container } = render(
      <Slider defaultValue={[50]} min={0} max={100} step={50}>
        <SliderControl>
          <SliderThumb aria-label='Risk level' />
          <SliderMarks marks={MARKS} />
        </SliderControl>
      </Slider>,
    );
    expect(getThumbs(container)[0]).toHaveAttribute('aria-valuetext', 'Medium');
  });

  it('jumps the nearest thumb to a clicked tick', () => {
    const { container } = render(
      <Slider defaultValue={[50]} min={0} max={100} step={50}>
        <SliderControl>
          <SliderThumb aria-label='Risk level' />
          <SliderMarks marks={MARKS} />
        </SliderControl>
      </Slider>,
    );
    fireEvent.click(screen.getByText('High'));
    expect(getThumbs(container)[0]).toHaveAttribute('aria-valuenow', '100');
  });
});
```

- [ ] **Step 2: Run** — Expected: FAIL (`SliderMarks` missing; `aria-valuetext` not resolved).

- [ ] **Step 3: Create `SliderMarks.tsx`**

```tsx
import { type FC, useLayoutEffect } from 'react';
import { Slider as ArkSlider, useSliderContext } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { sliderMarkerClassNames, sliderMarkerGroupClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';
import type { SliderMark } from './types';

/** Index of the thumb whose value is closest to `target` (for tick click-to-jump). */
const nearestThumbIndex = (values: number[], target: number): number => {
  let nearest = 0;
  let smallest = Number.POSITIVE_INFINITY;
  values.forEach((v, i) => {
    const distance = Math.abs(v - target);
    if (distance < smallest) {
      smallest = distance;
      nearest = i;
    }
  });
  return nearest;
};

export interface SliderMarksProps {
  /** Each entry places a tick at `value`; an optional `label` renders below it (and
   *  drives `aria-valuetext` for ordinal scales). Align `step` to the marks. */
  marks: SliderMark[];
  className?: string;
}

/** Tick marks along the track + click-to-jump. Render inside `<SliderControl>`. */
export const SliderMarks: FC<SliderMarksProps> = ({ marks, className }) => {
  const { registerMarks } = useSliderRootContext();
  const api = useSliderContext();
  const testId = useTestId('marker-group');

  // Publish marks to the root so its getAriaValueText (and SliderValue/tooltip) can
  // resolve ordinal labels. Effect (post-commit) — never a render-time ref write.
  useLayoutEffect(() => {
    registerMarks(marks);
  });

  if (marks.length === 0) return null;

  return (
    <ArkSlider.MarkerGroup
      data-slot='slider-marker-group'
      data-testid={testId}
      className={cn(sliderMarkerGroupClassNames, className)}
    >
      {marks.map(mark => (
        <ArkSlider.Marker
          key={mark.value}
          value={mark.value}
          data-slot='slider-marker'
          className={sliderMarkerClassNames}
          // Click-to-jump: move the nearest thumb onto this tick. Keyboard equivalent
          // is arrow-stepping, so ticks are not separate tab stops.
          onClick={() => api.setThumbValue(nearestThumbIndex(api.value, mark.value), mark.value)}
        >
          {mark.label}
        </ArkSlider.Marker>
      ))}
    </ArkSlider.MarkerGroup>
  );
};

SliderMarks.displayName = 'SliderMarks';
```

- [ ] **Step 4: Add export to `index.ts`**

```tsx
export { SliderMarks, type SliderMarksProps } from './SliderMarks';
```

- [ ] **Step 5: Run tests** — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/design-system/src/components/Slider/SliderMarks.tsx packages/design-system/src/components/Slider/index.ts packages/design-system/src/components/Slider/Slider.test.tsx
git commit -m "feat(slider): SliderMarks (ticks + ordinal aria-valuetext + click-to-jump)"
```

---

### Task 4: `SliderThumb` on-drag tooltip

**Files:**
- Modify: `SliderThumb.tsx` (add `tooltip` prop + DS Tooltip wiring)
- Modify: `Slider.test.tsx` (renders-with-tooltip smoke test)

**Interfaces:**
- Produces: `SliderThumbProps.tooltip?: boolean`.
- Consumes: `Tooltip`, `TooltipContent`, `TooltipTrigger` (`../Tooltip`); `useSliderContext` (`dragging`,
  `value`); `useSliderRootContext` (`disabled`, `marksRef`).

- [ ] **Step 1: Write the failing test** — append to `Slider.test.tsx`:

```tsx
describe('Slider — thumb tooltip', () => {
  it('renders a thumb with the tooltip affordance without error (bubble is drag-driven)', () => {
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderThumb aria-label='Value' tooltip />
        </SliderControl>
      </Slider>,
    );
    // Tooltip is closed until drag (api.dragging), so we only assert the thumb still
    // renders as the real control; open-on-drag is covered by E2E.
    expect(getThumbs(container)[0]).toHaveAttribute('role', 'slider');
  });
});
```

- [ ] **Step 2: Run** — Expected: FAIL (TS: `tooltip` not a prop of `SliderThumbProps`).

- [ ] **Step 3: Edit `SliderThumb.tsx`** — add imports, the `tooltip` prop, and the conditional wrap. Add to
  imports:

```tsx
import { Slider as ArkSlider, useSliderContext } from '@ark-ui/react/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
```

Add `tooltip?: boolean;` to `SliderThumbProps`. Destructure `tooltip = false`. Pull `disabled` + `marksRef` from
`useSliderRootContext()` and call `const api = useSliderContext();`. Rename the existing JSX to `const thumb = (…)`
and return:

```tsx
  if (!tooltip) return thumb;

  // Ordinal scales show the mark label; otherwise the raw value.
  const current = api.value[index] ?? 0;
  const display = marksRef.current.find(m => m.value === current)?.label ?? String(current);

  return (
    <Tooltip
      // Driven by drag, NOT hover/focus: open ONLY while dragging (Ark keeps the thumb
      // focused after a drag, which would leave the bubble lingering).
      open={api.dragging}
      closeOnPointerDown={false}
      closeDelay={0}
      disabled={disabled}
      positioning={{ placement: 'top', offset: { mainAxis: 6 }, overflowPadding: 8 }}
    >
      <TooltipTrigger asChild>{thumb}</TooltipTrigger>
      {/* The DS Tooltip slide keys on data-side, but this Ark version emits
          data-placement — add the Figma 4px slide-up on the live attribute. */}
      <TooltipContent className='data-[placement=top]:slide-in-from-bottom-[4px] data-[placement=bottom]:slide-in-from-top-[4px]'>
        {display}
      </TooltipContent>
    </Tooltip>
  );
```

- [ ] **Step 4: Run tests + typecheck** — Expected: PASS, no TS errors.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Slider/SliderThumb.tsx packages/design-system/src/components/Slider/Slider.test.tsx
git commit -m "feat(slider): per-thumb on-drag tooltip on SliderThumb"
```

---

### Task 5: `SliderInput` — inline numbers-only box (two-way bind + clamp)

**Files:**
- Create: `packages/design-system/src/components/Slider/SliderInput.tsx`
- Modify: `Slider.test.tsx` (distinct ids, label-stays-on-thumb, sync + clamp)
- Modify: `index.ts` (export `SliderInput`)

**Interfaces:**
- Produces: `SliderInput: FC<{ index?: number; 'aria-label'?: string; className? }>` — DS `Input` bound to the
  thumb at `index`; commits valid numbers via `api.setThumbValue` (machine clamps/snaps).
- Consumes: `Input` (`../Input`), `useSliderContext` (`value`, `setThumbValue`), `useSliderRootContext`
  (`isRange`, `disabled`, `invalid`), `useId`, `useTestId`.

- [ ] **Step 1: Write the failing tests** — append to `Slider.test.tsx`:

```tsx
import { SliderInput } from './SliderInput';

const getInputBoxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[data-slot="input"]'));

describe('Slider — inline SliderInput', () => {
  it('gives the two range inputs distinct, non-empty ids', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Price range</FieldLabel>
        <Slider defaultValue={[20, 80]}>
          <SliderInput index={0} />
          <SliderControl>
            <SliderThumb index={0} />
            <SliderThumb index={1} />
          </SliderControl>
          <SliderInput index={1} />
        </Slider>
      </Field>,
    );
    const ids = getInputBoxes(container).map(i => i.id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBeTruthy();
    expect(ids[1]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('keeps the FieldLabel naming the thumb, not the input box', () => {
    const { container } = render(
      <Field>
        <FieldLabel>Risk threshold</FieldLabel>
        <Slider defaultValue={[50]}>
          <SliderControl><SliderThumb /></SliderControl>
          <SliderInput />
        </Slider>
      </Field>,
    );
    const labelledBy = getThumbs(container)[0].getAttribute('aria-labelledby');
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Risk threshold');
    const [box] = getInputBoxes(container);
    expect(box).toHaveAttribute('aria-label', 'Value');
    expect(box.id).toBeTruthy();
  });

  it('commits a typed value to the slider', () => {
    const { container } = render(
      <Slider defaultValue={[50]}>
        <SliderControl><SliderThumb aria-label='Value' /></SliderControl>
        <SliderInput />
      </Slider>,
    );
    fireEvent.change(getInputBoxes(container)[0], { target: { value: '30' } });
    expect(getThumbs(container)[0]).toHaveAttribute('aria-valuenow', '30');
  });

  it('clamps an out-of-range entry to the max', () => {
    const { container } = render(
      <Slider defaultValue={[50]} min={0} max={100}>
        <SliderControl><SliderThumb aria-label='Value' /></SliderControl>
        <SliderInput />
      </Slider>,
    );
    fireEvent.change(getInputBoxes(container)[0], { target: { value: '150' } });
    expect(getThumbs(container)[0]).toHaveAttribute('aria-valuenow', '100');
  });
});
```

- [ ] **Step 2: Run** — Expected: FAIL (`SliderInput` missing).

- [ ] **Step 3: Create `SliderInput.tsx`**

```tsx
import { type FC, useId } from 'react';
import { useSliderContext } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Input } from '../Input';
import { sliderInputBoxClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';

export interface SliderInputProps {
  /** Which thumb this box is bound to (0 = single/low, 1 = high). */
  index?: number;
  'aria-label'?: string;
  className?: string;
}

/**
 * Inline numbers-only `Input` two-way bound to the thumb at `index`: a plain box (no
 * stepper, fixed width). The slider machine owns clamping/snapping, so it just commits
 * any valid number typed. Explicit `useId` so two range boxes never collide on the
 * wrapping field's control id.
 */
export const SliderInput: FC<SliderInputProps> = ({ index = 0, 'aria-label': ariaLabel, className }) => {
  const { isRange, disabled, invalid } = useSliderRootContext();
  const api = useSliderContext();
  const id = useId();
  const testId = useTestId(isRange ? `input-${index}` : 'input');

  const defaultLabel = isRange ? (index === 0 ? 'Minimum value' : 'Maximum value') : 'Value';

  return (
    <Input
      inputMode='numeric'
      id={id}
      value={String(api.value[index] ?? '')}
      disabled={disabled}
      error={invalid}
      aria-label={ariaLabel ?? defaultLabel}
      data-testid={testId}
      className={cn(sliderInputBoxClassNames, className)}
      onChange={event => {
        const next = Number(event.target.value);
        if (event.target.value !== '' && !Number.isNaN(next)) api.setThumbValue(index, next);
      }}
    />
  );
};

SliderInput.displayName = 'SliderInput';
```

- [ ] **Step 4: Add export to `index.ts`**

```tsx
export { SliderInput, type SliderInputProps } from './SliderInput';
```

- [ ] **Step 5: Run tests + typecheck** — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/design-system/src/components/Slider/SliderInput.tsx packages/design-system/src/components/Slider/index.ts packages/design-system/src/components/Slider/Slider.test.tsx
git commit -m "feat(slider): inline SliderInput (two-way bind + clamp)"
```

---

### Task 6: `SliderValue` — live value readout

**Files:**
- Create: `packages/design-system/src/components/Slider/SliderValue.tsx`
- Modify: `Slider.test.tsx`
- Modify: `index.ts` (export `SliderValue`)

**Interfaces:**
- Produces: `SliderValue: FC<{ index?: number; className? }>` — single → `"50"`, range (no index) →
  `"20 – 80"`, `index` → that thumb's value; ordinal scales show the mark label.
- Consumes: `useSliderContext` (`value`), `useSliderRootContext` (`marksRef`), `useTestId`.

- [ ] **Step 1: Write the failing tests** — append to `Slider.test.tsx`:

```tsx
import { SliderValue } from './SliderValue';

describe('Slider — SliderValue readout', () => {
  it('shows a single value', () => {
    render(
      <Slider defaultValue={[42]}>
        <SliderControl><SliderThumb aria-label='V' /></SliderControl>
        <SliderValue data-testid='out' />
      </Slider>,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows both ends of a range joined by an en-dash', () => {
    render(
      <Slider defaultValue={[20, 80]}>
        <SliderControl><SliderThumb index={0} /><SliderThumb index={1} /></SliderControl>
        <SliderValue />
      </Slider>,
    );
    expect(screen.getByText('20 – 80')).toBeInTheDocument();
  });

  it('shows the ordinal mark label for the current value', () => {
    render(
      <Slider defaultValue={[50]} min={0} max={100} step={50}>
        <SliderControl>
          <SliderThumb aria-label='Risk' />
          <SliderMarks marks={MARKS} />
        </SliderControl>
        <SliderValue />
      </Slider>,
    );
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
});
```

> Note: the ordinal test relies on `SliderMarks` registering its marks via `useLayoutEffect`; `SliderValue`
> reads `marksRef` during its value-driven render, which happens after the marks are registered.

- [ ] **Step 2: Run** — Expected: FAIL (`SliderValue` missing).

- [ ] **Step 3: Create `SliderValue.tsx`**

```tsx
import type { FC } from 'react';
import { useSliderContext } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useSliderRootContext } from './SliderContext';

export interface SliderValueProps extends TestableProps {
  /** Show one thumb's value (range). Omit to show all (single → "50", range → "20 – 80"). */
  index?: number;
  className?: string;
}

/** Live value readout for the value-beside-label pattern. Ordinal scales show the mark label. */
export const SliderValue: FC<SliderValueProps> = ({ index, className, 'data-testid': testIdProp }) => {
  const { marksRef } = useSliderRootContext();
  const api = useSliderContext();
  const testId = useTestId('value') ?? testIdProp;

  const display = (v: number) => marksRef.current.find(m => m.value === v)?.label ?? String(v);
  const text = index !== undefined ? display(api.value[index] ?? 0) : api.value.map(display).join(' – ');

  return (
    <span
      data-slot='slider-value'
      data-testid={testId}
      className={cn('text-sm text-text-primary tabular-nums', className)}
    >
      {text}
    </span>
  );
};

SliderValue.displayName = 'SliderValue';
```

- [ ] **Step 4: Add export to `index.ts`**

```tsx
export { SliderValue, type SliderValueProps } from './SliderValue';
```

- [ ] **Step 5: Run tests + typecheck** — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/design-system/src/components/Slider/SliderValue.tsx packages/design-system/src/components/Slider/index.ts packages/design-system/src/components/Slider/Slider.test.tsx
git commit -m "feat(slider): SliderValue readout"
```

---

### Task 7: Root barrel export

**Files:**
- Modify: `packages/design-system/src/index.ts` (line ~525)

**Interfaces:**
- Consumes: the full part set from `./components/Slider`.

- [ ] **Step 1: Replace the single Slider barrel line** (currently
  `export { Slider, type SliderMark, type SliderProps } from './components/Slider';`) with:

```tsx
export {
  Slider,
  SliderControl,
  type SliderControlProps,
  SliderInput,
  type SliderInputProps,
  type SliderMark,
  SliderMarks,
  type SliderMarksProps,
  type SliderProps,
  SliderThumb,
  type SliderThumbProps,
  SliderValue,
  type SliderValueProps,
} from './components/Slider';
```

- [ ] **Step 2: Typecheck the package** — `pnpm --filter @wallarm-org/design-system typecheck`. Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/index.ts
git commit -m "feat(slider): export compound parts from the package barrel"
```

---

### Task 8: Rewrite Storybook stories

Keep **every existing story export name** — `Slider.e2e.ts` references them by display name (Basic, Range,
Ticks, TicksWithoutSnapping, Labeled, WithTooltip, WithInput, RangeWithInput, Disabled, InField, FieldWithError,
FieldWithValue, RangeFieldWithValue).

**Files:**
- Rewrite: `packages/design-system/src/components/Slider/Slider.stories.tsx`

- [ ] **Step 1: Rewrite the stories file** — `component: Slider`, update the `args`/`argTypes` (drop the removed
  flat props from `argTypes`; keep `defaultValue`/`min`/`max`/`step`/`disabled`/`readOnly`/`error`), refresh the
  `docs.description.component` copy to the compound model, keep the `width: 380` decorator. Convert each story to
  compose parts. Representative conversions (apply the same pattern to all):

```tsx
import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { Slider, type SliderProps } from './Slider';
import { SliderControl } from './SliderControl';
import { SliderInput } from './SliderInput';
import { SliderMarks } from './SliderMarks';
import { SliderThumb } from './SliderThumb';
import { SliderValue } from './SliderValue';

// ... meta unchanged except argTypes prune + compound copy ...

export const Basic: StoryFn<SliderProps> = args => (
  <Slider aria-label='Value' {...args}>
    <SliderControl><SliderThumb aria-label='Value' /></SliderControl>
  </Slider>
);

export const Range: StoryFn<SliderProps> = args => (
  <Slider {...args} defaultValue={[20, 80]}>
    <SliderControl>
      <SliderThumb index={0} />
      <SliderThumb index={1} />
    </SliderControl>
  </Slider>
);

export const Ticks: StoryFn<SliderProps> = args => (
  <Slider {...args} step={25} defaultValue={[50]}>
    <SliderControl>
      <SliderThumb aria-label='Volume' />
      <SliderMarks marks={[
        { value: 0, label: '0' }, { value: 25, label: '25' }, { value: 50, label: '50' },
        { value: 75, label: '75' }, { value: 100, label: '100' },
      ]} />
    </SliderControl>
  </Slider>
);

export const WithTooltip: StoryFn<SliderProps> = args => (
  <Slider aria-label='Value' {...args}>
    <SliderControl><SliderThumb aria-label='Value' tooltip /></SliderControl>
  </Slider>
);

export const WithInput: StoryFn<SliderProps> = args => (
  <Slider aria-label='Value' {...args}>
    <SliderControl><SliderThumb aria-label='Value' /></SliderControl>
    <SliderInput />
  </Slider>
);

export const RangeWithInput: StoryFn<SliderProps> = args => (
  <Slider {...args} defaultValue={[20, 80]}>
    <SliderInput index={0} />
    <SliderControl><SliderThumb index={0} /><SliderThumb index={1} /></SliderControl>
    <SliderInput index={1} />
  </Slider>
);

export const InField: StoryFn<SliderProps> = args => (
  <Field>
    <FieldLabel>Risk threshold</FieldLabel>
    <Slider {...args}><SliderControl><SliderThumb /></SliderControl></Slider>
    <FieldDescription>Approximate — fine-tune the exact value later.</FieldDescription>
  </Field>
);

export const FieldWithError: StoryFn<SliderProps> = args => (
  <Field invalid>
    <FieldLabel>Risk threshold</FieldLabel>
    <Slider {...args}><SliderControl><SliderThumb /></SliderControl></Slider>
    <FieldError>Enter a value between 0 and 100.</FieldError>
  </Field>
);

export const FieldWithValue: StoryFn<SliderProps> = args => {
  const [value, setValue] = useState([40]);
  return (
    <Field>
      <div className='flex w-full items-center justify-between'>
        <FieldLabel>Risk threshold</FieldLabel>
        <Slider {...args} value={value} onValueChange={setValue}>
          <SliderValue />
        </Slider>
      </div>
      <Slider {...args} value={value} onValueChange={setValue}>
        <SliderControl><SliderThumb /></SliderControl>
      </Slider>
    </Field>
  );
};
```

> `FieldWithValue` / `RangeFieldWithValue`: `SliderValue` must live inside a `<Slider>` (it reads context). Render
> a readout-only `<Slider value … />` (no control) in the label row beside the interactive one, OR keep the
> existing hand-rolled `<span>{value[0]}</span>` approach. Prefer the hand-rolled span here (simplest, the value
> readout in the label row is a layout concern) and reserve `<SliderValue>` for a dedicated `WithValueReadout`
> story demonstrating the part. Keep `Labeled`, `TicksWithoutSnapping`, `Disabled`, `RangeFieldWithValue` as
> compound conversions of their current bodies (same args, parts instead of flat props).

- [ ] **Step 2: Verify stories build** — `pnpm --filter @wallarm-org/design-system build-storybook` (or the repo's
  storybook dev build). Expected: no build/type errors. Eyeball each story renders.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Slider/Slider.stories.tsx
git commit -m "docs(slider): rewrite stories for the compound API"
```

---

### Task 9: Update E2E + regenerate visual baselines

**Files:**
- Modify: `packages/design-system/src/components/Slider/Slider.e2e.ts`
- Regenerate: `packages/design-system/src/components/Slider/Slider.e2e.ts-snapshots/*`

- [ ] **Step 1: Update the inline-input selector.** The `slider-input-row` wrapper is gone (the row is the root).
  Replace:

```tsx
const VALUE_INPUT = '[data-slot="slider"] input[data-slot="input"]';
```

The role-based locators (`page.getByRole('slider')`, `{ name: 'Minimum' }`, etc.) are markup-agnostic and need no
change. The story names list is unchanged.

- [ ] **Step 2: Run E2E to confirm logic (non-visual) passes** — interaction + accessibility groups should pass
  unchanged against the rebuilt Storybook. Run the repo's e2e command for the Slider spec.
  Expected: interaction/accessibility PASS; **visual tests may FAIL** on pixel diff from DOM/layout changes.

- [ ] **Step 3: Regenerate visual baselines.** Run the project's screenshot-update path against the Slider spec
  (the `--update-snapshots` Playwright flag via the repo's e2e script). Confirm the 8 PNGs in
  `Slider.e2e.ts-snapshots/` are rewritten and the visual diffs are intentional (layout parity with the flat
  version — spot-check one before/after).

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/Slider/Slider.e2e.ts packages/design-system/src/components/Slider/Slider.e2e.ts-snapshots
git commit -m "test(slider): compound E2E selectors + regenerated visual baselines [update-screenshots]"
```

---

### Task 10: Code Connect (`Slider.figma.tsx`)

**Files:**
- Rewrite: `packages/design-system/src/components/Slider/Slider.figma.tsx`

- [ ] **Step 1: Rewrite the examples to compound** (keep the same URLs + variant mappings):

```tsx
import figma from '@figma/code-connect';
import { Field, FieldLabel } from '../Field';
import { Slider } from './Slider';
import { SliderControl } from './SliderControl';
import { SliderInput } from './SliderInput';
import { SliderMarks } from './SliderMarks';
import { SliderThumb } from './SliderThumb';

const SLIDER_URL = 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11354-181';
const SLIDER_INPUT_URL = 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11358-1807';

// Single value (default variant).
figma.connect(Slider, SLIDER_URL, {
  example: () => (
    <Slider aria-label='Value' defaultValue={[50]}>
      <SliderControl><SliderThumb aria-label='Value' /></SliderControl>
    </Slider>
  ),
});

// Range — Double=On (two thumbs from a 2-element value).
figma.connect(Slider, SLIDER_URL, {
  variant: { Double: 'On' },
  example: () => (
    <Slider defaultValue={[20, 80]}>
      <SliderControl><SliderThumb index={0} /><SliderThumb index={1} /></SliderControl>
    </Slider>
  ),
});

// Discrete / ticks — Ticks=On.
figma.connect(Slider, SLIDER_URL, {
  variant: { Ticks: 'On' },
  example: () => (
    <Slider aria-label='Value' step={25} defaultValue={[50]}>
      <SliderControl>
        <SliderThumb aria-label='Value' />
        <SliderMarks marks={[
          { value: 0, label: '0' }, { value: 25, label: '25' }, { value: 50, label: '50' },
          { value: 75, label: '75' }, { value: 100, label: '100' },
        ]} />
      </SliderControl>
    </Slider>
  ),
});

// Input variant — On=inline SliderInput.
figma.connect(Slider, SLIDER_URL, {
  variant: { Input: 'On' },
  example: () => (
    <Slider aria-label='Value' defaultValue={[50]}>
      <SliderControl><SliderThumb aria-label='Value' /></SliderControl>
      <SliderInput />
    </Slider>
  ),
});

// The "Slider input" field — standard Field composition.
figma.connect(Slider, SLIDER_INPUT_URL, {
  example: () => (
    <Field>
      <FieldLabel>Risk threshold</FieldLabel>
      <Slider defaultValue={[50]}><SliderControl><SliderThumb /></SliderControl></Slider>
    </Field>
  ),
});
```

- [ ] **Step 2: Typecheck** — `pnpm --filter @wallarm-org/design-system typecheck`. (Code Connect publish
  validation runs in CI; don't publish here.)

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Slider/Slider.figma.tsx
git commit -m "docs(slider): compound Code Connect examples"
```

---

### Task 11: Docs — llm.md, ANALYTICS_GAPS, decision log, design-spec

**Files:**
- Rewrite: `packages/design-system/src/components/Slider/Slider.llm.md`
- Modify: `packages/design-system/src/components/Slider/ANALYTICS_GAPS.md`
- Modify: `docs/slider-handoff-requirements.md`
- Modify: `docs/slider-design-spec.md`

- [ ] **Step 1: `Slider.llm.md`** — keep the judgment intact (Reach-for-it / Don't-use / Locked / boundaries vs
  NumberInput & SegmentedControl). Rewrite the API-shape sections + the code example to compound:

```tsx
<Field>
  <FieldLabel>Risk threshold</FieldLabel>
  <Slider value={value} onValueChange={setValue} min={0} max={100}>
    <SliderControl>
      <SliderThumb />
    </SliderControl>
  </Slider>
</Field>
```

Add a "Composition" section: root owns the machine; compose `SliderControl` → `SliderThumb` (one per thumb;
`index`, `tooltip`, analytics land here) → `SliderMarks` (inside control); `SliderInput` / `SliderValue` optional.
Update "Showing the value" (`tooltip` is a `SliderThumb` prop; `SliderInput`/`SliderValue` parts). Update the
"Locked — single vs range is the value's length" bullet to add "and you render one `<SliderThumb index>` per
thumb."

- [ ] **Step 2: `ANALYTICS_GAPS.md`** — move CG-1 from "Accepted closed-target gaps" to **resolved**: the range
  high thumb is now addressable via the exported `<SliderThumb index={1}>` seam (consumer puts `data-analytics-id`
  on each thumb). Update the "Already covered" table to: target = each `<SliderThumb>`; seam = the `SliderThumb`
  sub-component's `{...rest}`. Keep the track-gesture entry (still a typed callback, not a gap). Update the
  Audited/Updated date to 2026-06-30.

- [ ] **Step 3: `docs/slider-handoff-requirements.md`** — add decision **#13** to the log: *"Compound rework at
  maintainer request (PR #192, 2026-06-30): root + `SliderControl`/`SliderThumb`/`SliderMarks`/`SliderInput`/
  `SliderValue`; exposing `SliderThumb` resolves CG-1. Reverses #12 (no flat field-composition-only rule) — the
  Field composition still holds, but the control itself is now composed."* Mark #12 as superseded-by-#13. Update
  the API/prop tables (§3) from flat props to the parts.

- [ ] **Step 4: `docs/slider-design-spec.md`** — its §"Public API sketch (compound, Ark-style)" predates the
  final surface; reconcile the names to the shipped parts (lean: no `SliderTrack`/`SliderRange` exports;
  `SliderMarks` not `MarkerGroup`; `SliderValue` not `Slider.Value`). One paragraph noting the final surface.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Slider/Slider.llm.md packages/design-system/src/components/Slider/ANALYTICS_GAPS.md docs/slider-handoff-requirements.md docs/slider-design-spec.md
git commit -m "docs(slider): reconcile docs + decision log + CG-1 resolution for compound API"
```

---

### Task 12: Final verification + PR update

**Files:** none (verification + PR comms).

- [ ] **Step 1: Full quality sweep**

Run: `pnpm --filter @wallarm-org/design-system typecheck && pnpm biome check packages/design-system/src/components/Slider && pnpm --filter @wallarm-org/design-system test Slider.test`
Expected: typecheck clean, biome clean, all unit/component tests pass.

- [ ] **Step 2: Coverage check** — confirm Slider coverage stays >80% (the suite covers every part + the new
  per-thumb analytics path).

- [ ] **Step 3: `grep` for stragglers** — `grep -rn "input=\|marks=\|tooltip=" packages/design-system/src/components/Slider` should only hit the new prop sites (`SliderInput`, `SliderMarks marks=`, `SliderThumb tooltip`), not flat-API leftovers. `grep -rn "sliderInputRowClassNames\|SliderValueInput" packages/design-system/src` → no matches.

- [ ] **Step 4: Push + reply to the reviewer.** Push the branch. Reply in the PR review thread (not a top-level
  comment) summarizing: reworked to lean compound (root + parts); `SliderThumb` exposure closes the CG-1 range
  analytics gap; decision log updated (#13). Do not self-merge.

---

## Self-Review (completed during plan authoring)

- **Spec coverage:** every spec section maps to a task — parts inventory → Tasks 1/3/4/5/6; CG-1 closure →
  Task 2 + Task 11 step 2; context plumbing → Task 1; file plan → Tasks 1–11; invariants → preserved via
  unchanged `classes.ts` rules + Task 1 root; testing → Tasks 1–6 (unit) + Task 9 (E2E); docs → Task 11.
- **Dropped from spec (YAGNI):** the dev-only "thumb count ≠ value length" warning — it requires fragile
  `React.Children` type-inspection for a self-evident mistake; omitted. (Spec §4/§8 mention it; treat as not
  implemented.)
- **Type consistency:** `SliderRootContextValue` fields are referenced identically across root (producer) and
  `SliderThumb`/`SliderMarks`/`SliderInput`/`SliderValue` (consumers): `isRange`, `invalid`, `disabled`,
  `ariaDescribedby`, `fieldLabelId`, `marksRef`, `registerMarks`. `useTestId` slot strings match the
  test/e2e selectors (`slider-thumb`, `slider-marker-group`, `slider-marker`, `input`).
- **Placeholder scan:** none.
