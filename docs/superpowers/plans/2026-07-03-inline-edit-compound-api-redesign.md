# InlineEdit Compound-API Redesigns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land three independent `InlineEdit` compound-API redesigns: drop the root `error` prop (text only via `InlineEditError` children), split `InlineEditDate`'s `showTime` boolean into `InlineEditDate`/`InlineEditDateTime`, and replace `InlineEditPreview`'s `triggerIcon` prop with `InlineEditPreviewValue`/`InlineEditPreviewIcon` compound parts.

**Architecture:** Each redesign keeps the family's established patterns — self-governing sub-components that read `useInlineEdit()` context directly (the `InlineEditError` precedent), bound-root compound children (the existing `InlineEditDate`/`InlineEditSelect` pattern), and children-detection via `displayName` matching (the `CodeSnippetRoot`/`isCodeSnippetShowMoreButton` precedent) to auto-wrap plain content while still allowing full explicit composition.

**Tech Stack:** React 19 (no `forwardRef`), TypeScript strict, Vitest + Testing Library, Storybook (`storybook-react-rsbuild`), Biome.

**Spec:** `docs/superpowers/specs/2026-07-03-inline-edit-compound-api-redesign-design.md` — read it before starting; every naming/behavior decision below is justified there.

## Global Constraints

- Conventional commits; scope `inline-edit`, ticket suffix `(WDS-143)` on every commit subject.
- TypeScript strict; no `any`.
- No `React.forwardRef` — `ref` is a normal prop (React 19).
- Biome formatting: single quotes, semicolons, trailing commas. Run `pnpm --filter @wallarm-org/design-system lint:fix` before every commit — it also fixes import/export ordering, so add new imports/exports without hand-sorting them.
- Every compound sub-component gets `data-slot` (kebab-case), a `displayName`, and (per `.claude/rules/test-id.md`, matching the existing `InlineEditError` precedent) its own `useTestId('slot-name')` cascading from the `InlineEdit` root's `data-testid`.
- None of this family is published externally (`src/index.ts` re-exports only what a prior extraction spec added) — no breaking-change ceremony needed, but every existing call site must be updated so `typecheck`/`lint` stay green.
- Unit test runs: `pnpm --filter @wallarm-org/design-system test:run <file-filter>` from the repo root.
- E2E runs expect Storybook on `http://localhost:6006`: `pnpm --filter @wallarm-org/design-system storybook` (no webServer in the Playwright config).

---

### Task 1: `InlineEditError` — drop the root `error` prop

Removes `InlineEditProps.error?: string`. `InlineEditError`'s own `children ?? error` behavior is unchanged — only the *source* of the context `error` value changes, from `error ?? autoError` to just `autoError` (the async commit/guard-rejection message). This is a removal-refactor: there's no new runtime behavior to drive with a classic failing test, so the checkpoint here is `typecheck` — it's what actually catches a missed call site (the `States` story) once the prop is gone.

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.tsx:66,89,159` (prop removal)
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditError.test.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx` (`States` story)

**Interfaces:**
- Consumes: existing `InlineEditContextValue.error` (unchanged shape).
- Produces: `InlineEditProps<T>` no longer has an `error` field. No later task depends on this removal.

- [ ] **Step 1: Rewrite `InlineEditError.test.tsx` to drive the context `error` via async rejection instead of the root prop**

Replace the file's two error-message tests (keep the first "renders nothing when valid" test as-is) with:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditError } from './InlineEditError';
import { InlineEditInput } from './InlineEditInput';

describe('InlineEditError', () => {
  it('renders nothing when valid', () => {
    render(
      <InlineEdit defaultValue='x' data-testid='attr'>
        <InlineEditError />
      </InlineEdit>,
    );
    expect(screen.queryByTestId('attr--error')).toBeNull();
  });

  it('renders the auto-error message from a rejected commit when no children are given', async () => {
    const onCommit = vi.fn(() => Promise.reject(new Error('An error message.')));
    render(
      <InlineEdit defaultValue='x' onValueCommit={onCommit} defaultEdit data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
        <InlineEditError />
      </InlineEdit>,
    );
    await userEvent.type(screen.getByTestId('attr--input'), '{Enter}');
    await waitFor(() =>
      expect(screen.getByTestId('attr--error')).toHaveTextContent('An error message.'),
    );
  });

  it('prefers explicit children over the auto-error message', async () => {
    const onCommit = vi.fn(() => Promise.reject(new Error('ctx')));
    render(
      <InlineEdit defaultValue='x' onValueCommit={onCommit} defaultEdit data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
        <InlineEditError>custom</InlineEditError>
      </InlineEdit>,
    );
    await userEvent.type(screen.getByTestId('attr--input'), '{Enter}');
    await waitFor(() => expect(screen.getByTestId('attr--error')).toHaveTextContent('custom'));
  });
});
```

- [ ] **Step 2: Run the rewritten tests — they already pass on the current (unmodified) code**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEditError.test.tsx`
Expected: PASS, 3/3. This is expected — `resolvedError = error ?? autoError` already falls through to `autoError` when the `error` prop isn't passed, so the replacement behavior works before the prop is removed. The removal itself is Step 3.

- [ ] **Step 3: Remove the `error` prop from `InlineEdit.tsx`**

In `InlineEditProps<T>`, delete the line:

```tsx
  error?: string;
```

In the component's destructured parameters, delete:

```tsx
  error,
```

Change the `resolvedError` line from:

```tsx
  const resolvedError = error ?? autoError;
```

to:

```tsx
  const resolvedError = autoError;
```

- [ ] **Step 4: Run typecheck to find every remaining call site — this is the RED step**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: FAIL — `InlineEdit.stories.tsx`'s `States` story passes `error='An error message.'`, which no longer matches `InlineEditProps`. The error message names the file and line.

- [ ] **Step 5: Fix the `States` story — move the message into `InlineEditError`'s children**

In `InlineEdit.stories.tsx`, find:

```tsx
    <Row label='Name'>
      <InlineEdit
        defaultValue='Checkout API and ABC'
        defaultEdit
        status='error'
        error='An error message.'
        data-testid='error'
      >
        <InlineEditPreview>Checkout API and ABC</InlineEditPreview>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
        <InlineEditError />
      </InlineEdit>
    </Row>
```

Replace with:

```tsx
    <Row label='Name'>
      <InlineEdit
        defaultValue='Checkout API and ABC'
        defaultEdit
        status='error'
        data-testid='error'
      >
        <InlineEditPreview>Checkout API and ABC</InlineEditPreview>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
        <InlineEditError>An error message.</InlineEditError>
      </InlineEdit>
    </Row>
```

- [ ] **Step 6: Run typecheck again to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

- [ ] **Step 7: Run the full InlineEdit family suite**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/InlineEdit`
Expected: PASS — all files, no regressions.

- [ ] **Step 8: Lint and commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/InlineEdit/InlineEdit.tsx packages/design-system/src/components/InlineEdit/InlineEditError.test.tsx packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
git commit -m "feat(inline-edit): drop root error prop, text only via InlineEditError children (WDS-143)"
```

---

### Task 2: `InlineEditDate` split → `InlineEditDate` + `InlineEditDateTime`

Splits the `showTime` boolean branch into two sibling bound-root components. `InlineEditDate` keeps only the day-granularity path; the new `InlineEditDateTime` is today's `showTime=true` path, hardcoded. The two cross-package `@internationalized/date`/react-aria cast helpers move to a shared internal file; `withMinuteGranularity` (time-only) moves fully into `InlineEditDateTime.tsx`.

**Files:**
- Create: `packages/design-system/src/components/InlineEdit/dateValueCast.ts`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditDate.tsx` (strip the time branch)
- Create: `packages/design-system/src/components/InlineEdit/InlineEditDateTime.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditDate.test.tsx` (drop `showTime`)
- Create: `packages/design-system/src/components/InlineEdit/InlineEditDateTime.test.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/index.ts`
- Modify: `packages/design-system/src/index.ts`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx` (Gallery `Date & Time` row, imports, `meta.subcomponents`)
- Modify: `packages/design-system/src/components/InlineEdit/ANALYTICS_GAPS.md`

**Interfaces:**
- Consumes: `useInlineEdit<DateValue | null>()`, `useInlineEditSubmitMode('none')` (unchanged context API).
- Produces: `InlineEditDateTime: FC<InlineEditDateTimeProps>` and `InlineEditDateTimeProps` — exported from `index.ts` and the package root `src/index.ts`. `toReactAriaDateValue`/`toCalendarDateValue` exported from the new internal `dateValueCast.ts` (not re-exported from `index.ts` — implementation detail).

- [ ] **Step 1: Create the shared cast helper**

Create `packages/design-system/src/components/InlineEdit/dateValueCast.ts`:

```tsx
import type { DateValue as ReactAriaDateValue } from '@react-aria/datepicker';
import type { DateValue } from '../Calendar';

/**
 * Calendar's `DateValue` (Ark) and DateInput's `DateValue` (react-aria) are
 * structurally identical `@internationalized/date` classes from different
 * package copies — the story-documented interop hazard (Ark values fail an
 * `instanceof` check against react-aria's copy, and vice versa). Cast across
 * the boundary rather than validate, mirroring `toDateValue`/
 * `toReactAriaDateValue` in Calendar/dateValue.ts. Shared by `InlineEditDate`
 * and `InlineEditDateTime`.
 */
export const toReactAriaDateValue = (date: DateValue | null): ReactAriaDateValue | null =>
  date as unknown as ReactAriaDateValue | null;

export const toCalendarDateValue = (date: ReactAriaDateValue | null): DateValue | null =>
  date as unknown as DateValue | null;
```

- [ ] **Step 2: Rewrite `InlineEditDate.tsx` to day-only**

Replace the full file contents with:

```tsx
import type { FC, ReactNode } from 'react';
import { useTestId } from '../../utils/testId';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
  // Aliased: the DS also exports a `Calendar` icon; same trick as the stories.
  Calendar as CalendarRoot,
  CalendarTrigger,
  type DateValue,
} from '../Calendar';
import { DateInput, type DateInputProps } from '../DateInput';
import { toCalendarDateValue, toReactAriaDateValue } from './dateValueCast';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

/**
 * Rest props forward to the real `DateInput` wrapper (see
 * `ANALYTICS_GAPS.md` — `InlineEditDate` entry — for why the wrapper, not the
 * focusable segments, is the documented landing target).
 *
 * `value` / `onChange` are internally controlled via `useInlineEdit`.
 * `granularity` is omitted — this component is always day-granularity; use
 * `InlineEditDateTime` for date+time.
 */
export interface InlineEditDateProps
  extends Omit<DateInputProps, 'value' | 'onChange' | 'granularity'> {
  /**
   * Bound-root pattern: `InlineEditDate` IS the prewired `Calendar` root —
   * the `DateValue[]` adapter, `defaultOpen`/`closeOnSelect`, and
   * commit-on-close all stay on the root regardless of composition.
   * `children` are ordinary `Calendar` compound parts (`CalendarTrigger`,
   * `CalendarContent > CalendarBody > …`) rendered inside that root, not a
   * replacement wrapper. Composing children means the consumer owns their
   * own testids/attributes on their own parts — the shared `input` testId
   * slot below only lands on the default `DateInput` trigger.
   *
   * No children → the default composition renders (segmented `DateInput`
   * trigger + grids).
   */
  children?: ReactNode;
}

export const InlineEditDate: FC<InlineEditDateProps> = ({
  'data-testid': testIdProp,
  showIcon = false,
  children,
  ...rest
}) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, submit } = useInlineEdit<DateValue | null>();
  useInlineEditSubmitMode('none');

  return (
    <CalendarRoot
      type='single'
      defaultOpen
      closeOnSelect
      value={value ? [value] : []}
      onChange={next => setValue(next[0] ?? null)}
      onOpenChange={open => {
        if (!open) submit();
      }}
    >
      {children ?? (
        <>
          <CalendarTrigger>
            {/* Pass the value straight through — an `instanceof` gate drops values
                produced by the Ark calendar (different @internationalized/date
                copy), showing the placeholder instead. */}
            <DateInput
              {...rest}
              data-testid={testId}
              value={toReactAriaDateValue(value ?? null)}
              onChange={v => setValue(toCalendarDateValue(v))}
              granularity='day'
              showIcon={showIcon}
            />
          </CalendarTrigger>
          <CalendarContent>
            <CalendarBody>
              <CalendarGrids />
            </CalendarBody>
          </CalendarContent>
        </>
      )}
    </CalendarRoot>
  );
};

InlineEditDate.displayName = 'InlineEditDate';
```

- [ ] **Step 3: Create `InlineEditDateTime.tsx`**

Create `packages/design-system/src/components/InlineEdit/InlineEditDateTime.tsx`:

```tsx
import type { FC, ReactNode } from 'react';
import { CalendarDateTime } from '@internationalized/date';
import { useTestId } from '../../utils/testId';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
  CalendarInputHeader,
  // Aliased: the DS also exports a `Calendar` icon; same trick as the stories.
  Calendar as CalendarRoot,
  CalendarTrigger,
  type DateValue,
} from '../Calendar';
import { DateInput, type DateInputProps } from '../DateInput';
import { toCalendarDateValue, toReactAriaDateValue } from './dateValueCast';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

/**
 * Rest props forward to the real `DateInput` wrapper (see
 * `ANALYTICS_GAPS.md` — `InlineEditDate` entry — for why the wrapper, not the
 * focusable segments, is the documented landing target).
 *
 * `value` / `onChange` are internally controlled via `useInlineEdit`.
 * `granularity` / `showTimeDropdown` / `timeStep` are omitted — this
 * component is always minute-granularity with the time-aware header; use
 * `InlineEditDate` for day-only.
 */
export interface InlineEditDateTimeProps
  extends Omit<
    DateInputProps,
    'value' | 'onChange' | 'granularity' | 'showTimeDropdown' | 'timeStep'
  > {
  /**
   * Bound-root pattern: `InlineEditDateTime` IS the prewired `Calendar`
   * root — the `DateValue[]` adapter, `defaultOpen`, `showTime`, and
   * commit-on-close all stay on the root regardless of composition.
   * `children` are ordinary `Calendar` compound parts (`CalendarTrigger`,
   * `CalendarContent > CalendarBody > …`) rendered inside that root, not a
   * replacement wrapper. Composing children means the consumer owns their
   * own testids/attributes on their own parts — the shared `input` testId
   * slot below only lands on the default `DateInput` trigger.
   *
   * No children → the default composition renders (minute-granularity
   * segmented `DateInput` trigger + `CalendarInputHeader` + grids).
   */
  children?: ReactNode;
}

/**
 * `DateInput` at `granularity='minute'` requires an hour/minute component —
 * react-aria's `useDateFieldState` throws "Invalid granularity" otherwise. A
 * committed value can be day-only (e.g. a consumer's initial `CalendarDate`,
 * before any time has been picked), so promote it to midnight, mirroring
 * Calendar's own date-only → `CalendarDateTime` promotion in `useCalendarTime`
 * / `withTime` (Calendar/dateValue.ts). The cast crosses the same
 * `@internationalized/date` package-instance boundary as `dateValueCast.ts`.
 */
const withMinuteGranularity = (date: DateValue | null): DateValue | null => {
  if (!date) return null;
  if ('hour' in date) return date;
  return new CalendarDateTime(date.year, date.month, date.day, 0, 0) as unknown as DateValue;
};

export const InlineEditDateTime: FC<InlineEditDateTimeProps> = ({
  'data-testid': testIdProp,
  showIcon = false,
  children,
  ...rest
}) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, submit } = useInlineEdit<DateValue | null>();
  useInlineEditSubmitMode('none');

  return (
    <CalendarRoot
      type='single'
      defaultOpen
      showTime
      closeOnSelect={false}
      value={value ? [value] : []}
      // Calendar's contract is DateValue[]; `useCalendarTime` has already
      // promoted a grid pick to a CalendarDateTime by the time this fires.
      onChange={next => setValue(next[0] ?? null)}
      onOpenChange={open => {
        if (!open) submit();
      }}
    >
      {children ?? (
        <>
          <CalendarTrigger>
            {/* Pass the value straight through — an `instanceof` gate drops values
                produced by the Ark calendar (different @internationalized/date
                copy), showing the placeholder instead. */}
            <DateInput
              {...rest}
              data-testid={testId}
              value={toReactAriaDateValue(withMinuteGranularity(value ?? null))}
              onChange={v => setValue(toCalendarDateValue(v))}
              granularity='minute'
              showIcon={showIcon}
            />
          </CalendarTrigger>
          <CalendarContent>
            <CalendarBody>
              <CalendarInputHeader />
              <CalendarGrids />
            </CalendarBody>
          </CalendarContent>
        </>
      )}
    </CalendarRoot>
  );
};

InlineEditDateTime.displayName = 'InlineEditDateTime';
```

- [ ] **Step 4: Trim `InlineEditDate.test.tsx`**

Replace the file contents with (drops `showTime` from the harness and removes the header test — it moves to Step 5):

```tsx
import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarBody, CalendarContent, CalendarGrids, CalendarTrigger } from '../Calendar';
import { DateInput } from '../DateInput';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDate } from './InlineEditDate';

function Harness({
  onCommit,
  analyticsId,
}: {
  onCommit?: (v: unknown) => void;
  analyticsId?: string;
}) {
  return (
    <InlineEdit
      defaultValue={new CalendarDate(2026, 6, 15)}
      defaultEdit
      onValueCommit={onCommit}
      data-testid='ie'
    >
      <InlineEditControl>
        <InlineEditDate data-analytics-id={analyticsId} />
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditDate', () => {
  it('renders the calendar open with the segmented trigger input pre-filled', async () => {
    render(<Harness />);
    // Portaled content is present (defaultOpen) — grid day cells exist.
    expect(document.querySelector('[data-scope="date-picker"][data-part="content"]')).toBeTruthy();
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('derives the shared input testId slot on the DateInput wrapper', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('forwards data-analytics-id to the DateInput wrapper, not the focusable segments', () => {
    render(<Harness analyticsId='date-edit' />);
    const target = document.querySelector('[data-analytics-id="date-edit"]');
    // Same node as the wrapper carrying the derived testId (documented gap:
    // ANALYTICS_GAPS.md — attributes land on the wrapper, not the segments).
    expect(target).toBe(screen.getByTestId('ie--input'));
    expect(target?.querySelector('[data-segment]')).toBeTruthy();
    // The focusable segments themselves must not carry the attribute.
    expect(target?.querySelectorAll('[data-segment][data-analytics-id]')).toHaveLength(0);
  });

  it('children compose ordinary Calendar parts inside the prewired root (bound-root pattern)', () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        defaultValue={new CalendarDate(2026, 6, 15)}
        defaultEdit
        onValueCommit={onCommit}
        data-testid='ie'
      >
        <InlineEditControl>
          <InlineEditDate>
            <CalendarTrigger>
              <DateInput
                data-testid='custom-date-input'
                value={null}
                onChange={() => {}}
                granularity='day'
                showIcon={false}
              />
            </CalendarTrigger>
            <CalendarContent>
              <CalendarBody>
                <CalendarGrids />
              </CalendarBody>
            </CalendarContent>
          </InlineEditDate>
        </InlineEditControl>
      </InlineEdit>,
    );
    // defaultOpen wiring stays on the root regardless of composition — the
    // portaled popover content renders through the children path too.
    expect(document.querySelector('[data-scope="date-picker"][data-part="content"]')).toBeTruthy();
    expect(screen.getByTestId('custom-date-input')).toBeInTheDocument();
    // The children path replaces the default composition entirely — the
    // default DateInput (which would carry the shared `input` testId slot)
    // must not also render.
    expect(screen.queryByTestId('ie--input')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Create `InlineEditDateTime.test.tsx`**

Create `packages/design-system/src/components/InlineEdit/InlineEditDateTime.test.tsx`:

```tsx
import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarBody, CalendarContent, CalendarGrids, CalendarTrigger } from '../Calendar';
import { DateInput } from '../DateInput';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDateTime } from './InlineEditDateTime';

function Harness({
  onCommit,
  analyticsId,
}: {
  onCommit?: (v: unknown) => void;
  analyticsId?: string;
}) {
  return (
    <InlineEdit
      defaultValue={new CalendarDate(2026, 6, 15)}
      defaultEdit
      onValueCommit={onCommit}
      data-testid='ie'
    >
      <InlineEditControl>
        <InlineEditDateTime data-analytics-id={analyticsId} />
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditDateTime', () => {
  it('renders the calendar open with the time-aware header', () => {
    render(<Harness />);
    const content = document.querySelector('[data-scope="date-picker"][data-part="content"]');
    expect(content).toBeTruthy();
    // CalendarInputHeader renders a minute-granularity DateInput in the popover
    // header — its segments carry `data-segment` (see TemporalSegment.tsx), so
    // hour/minute segments prove the time-aware header rendered.
    expect(content?.querySelector('[data-segment="hour"]')).toBeTruthy();
    expect(content?.querySelector('[data-segment="minute"]')).toBeTruthy();
  });

  it('derives the shared input testId slot on the DateInput wrapper', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('forwards data-analytics-id to the DateInput wrapper, not the focusable segments', () => {
    render(<Harness analyticsId='date-edit' />);
    const target = document.querySelector('[data-analytics-id="date-edit"]');
    expect(target).toBe(screen.getByTestId('ie--input'));
    expect(target?.querySelector('[data-segment]')).toBeTruthy();
    expect(target?.querySelectorAll('[data-segment][data-analytics-id]')).toHaveLength(0);
  });

  it('children compose ordinary Calendar parts inside the prewired root (bound-root pattern)', () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        defaultValue={new CalendarDate(2026, 6, 15)}
        defaultEdit
        onValueCommit={onCommit}
        data-testid='ie'
      >
        <InlineEditControl>
          <InlineEditDateTime>
            <CalendarTrigger>
              <DateInput
                data-testid='custom-date-input'
                value={null}
                onChange={() => {}}
                granularity='minute'
                showIcon={false}
              />
            </CalendarTrigger>
            <CalendarContent>
              <CalendarBody>
                <CalendarGrids />
              </CalendarBody>
            </CalendarContent>
          </InlineEditDateTime>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(document.querySelector('[data-scope="date-picker"][data-part="content"]')).toBeTruthy();
    expect(screen.getByTestId('custom-date-input')).toBeInTheDocument();
    expect(screen.queryByTestId('ie--input')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run both test files, verify green**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEditDate.test.tsx InlineEditDateTime.test.tsx`
Expected: PASS — 4/4 in each file.

- [ ] **Step 7: Export `InlineEditDateTime` from both index files**

In `packages/design-system/src/components/InlineEdit/index.ts`, add after the `InlineEditDate` export line:

```ts
export { InlineEditDateTime, type InlineEditDateTimeProps } from './InlineEditDateTime';
```

In `packages/design-system/src/index.ts`, inside the existing `InlineEdit` family export block (the one starting `export {\n  InlineEdit,\n  ...\n} from './components/InlineEdit';`), add:

```ts
  InlineEditDateTime,
  type InlineEditDateTimeProps,
```

(Insert anywhere in that block — `lint:fix` in Step 9 re-sorts it.)

- [ ] **Step 8: Update the Gallery story's `Date & Time` row and the meta subcomponents list**

In `InlineEdit.stories.tsx`, add to the import block:

```tsx
import { InlineEditDateTime } from './InlineEditDateTime';
```

In `meta.subcomponents`, add `InlineEditDateTime,` (anywhere in the object).

Find:

```tsx
            <InlineEditControl>
              <InlineEditDate showTime />
            </InlineEditControl>
```

Replace with:

```tsx
            <InlineEditControl>
              <InlineEditDateTime />
            </InlineEditControl>
```

- [ ] **Step 9: Generalize the `ANALYTICS_GAPS.md` entry**

In `packages/design-system/src/components/InlineEdit/ANALYTICS_GAPS.md`, replace:

```md
## `InlineEditDate` → DateInput wrapper, not the focusable segments

- **What:** consumer `data-*` / `aria-*` spread lands on the `DateInput`
  wrapper `<div>`, not the focusable date segments (mirror of the
  `InlineEditNumber` entry above).
- **Impact:** Low — document-level click analytics resolve via
  `closest('[data-analytics-id]')`.
- **Fix belongs in:** `components/DateInput` (forward consumer attributes to
  the segment group), out of scope here.
- **Tested:** `InlineEditDate.test.tsx` ("forwards data-analytics-id to the
  DateInput wrapper, not the focusable segments") asserts same-node identity
  with the wrapper carrying the derived testId, and that no focusable
  segment carries the attribute.
```

with:

```md
## `InlineEditDate` / `InlineEditDateTime` → DateInput wrapper, not the focusable segments

- **What:** consumer `data-*` / `aria-*` spread lands on the `DateInput`
  wrapper `<div>`, not the focusable date segments (mirror of the
  `InlineEditNumber` entry above). Applies identically to both components —
  they share the same `DateInput`-based default composition.
- **Impact:** Low — document-level click analytics resolve via
  `closest('[data-analytics-id]')`.
- **Fix belongs in:** `components/DateInput` (forward consumer attributes to
  the segment group), out of scope here.
- **Tested:** `InlineEditDate.test.tsx` and `InlineEditDateTime.test.tsx`
  ("forwards data-analytics-id to the DateInput wrapper, not the focusable
  segments") each assert same-node identity with the wrapper carrying the
  derived testId, and that no focusable segment carries the attribute.
```

- [ ] **Step 10: Full family suite + typecheck + build-storybook**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/InlineEdit`
Expected: PASS, no regressions.

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

Run: `pnpm --filter @wallarm-org/design-system build-storybook`
Expected: exit 0 (catches any leftover JSX/import error in the stories file).

- [ ] **Step 11: Lint and commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/InlineEdit/ packages/design-system/src/index.ts
git commit -m "feat(inline-edit): split InlineEditDate showTime into InlineEditDateTime (WDS-143)"
```

---

### Task 3: `InlineEditPreview` → compound `InlineEditPreviewValue` + `InlineEditPreviewIcon`

Replaces the `triggerIcon` prop with two self-governing compound parts (the `InlineEditError` pattern: each reads `useInlineEdit()` and decides its own content). `InlineEditPreview` detects explicit composition via `Children.toArray` + `displayName` matching (the `CodeSnippetRoot`/`isCodeSnippetShowMoreButton` precedent) and auto-wraps plain children otherwise.

**Files:**
- Create: `packages/design-system/src/components/InlineEdit/InlineEditPreviewValue.tsx`
- Create: `packages/design-system/src/components/InlineEdit/InlineEditPreviewValue.test.tsx`
- Create: `packages/design-system/src/components/InlineEdit/InlineEditPreviewIcon.tsx`
- Create: `packages/design-system/src/components/InlineEdit/InlineEditPreviewIcon.test.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditPreview.tsx` (rewrite)
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditPreview.test.tsx` (add composition tests)
- Modify: `packages/design-system/src/components/InlineEdit/index.ts`
- Modify: `packages/design-system/src/index.ts`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx` (7 `triggerIcon` call sites, imports, `meta.subcomponents`)

**Interfaces:**
- Consumes: `useInlineEdit()` context fields `status`, `disabled`, `readOnly`, `activationMode` (all already on `InlineEditContextValue` — no context change).
- Produces: `InlineEditPreviewValue: FC<InlineEditPreviewValueProps>` (`{ ref?: Ref<HTMLSpanElement>; lineClamp?: 1|2|3|4|5|6; children?: ReactNode }`), `InlineEditPreviewIcon: FC<InlineEditPreviewIconProps>` (`{ ref?: Ref<HTMLSpanElement>; children?: ReactNode }`, default idle icon is a pencil) — both exported from `index.ts` and package root `src/index.ts`. `InlineEditPreviewProps` loses `triggerIcon`.

- [ ] **Step 1: Create `InlineEditPreviewValue.tsx`**

Create `packages/design-system/src/components/InlineEdit/InlineEditPreviewValue.tsx`:

```tsx
import type { FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useInlineEdit } from './InlineEditContext';

// Literal classes so Tailwind can statically detect them.
const LINE_CLAMP_CLASS: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

export interface InlineEditPreviewValueProps {
  ref?: Ref<HTMLSpanElement>;
  /**
   * Clamp the read-mode value to this many lines (with an ellipsis) instead of
   * the default single-line truncation. Use for multi-line values (textarea).
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}

export const InlineEditPreviewValue: FC<InlineEditPreviewValueProps> = ({
  ref,
  lineClamp,
  children,
}) => {
  const testId = useTestId('preview-value');
  const { status } = useInlineEdit();

  return (
    <span
      ref={ref}
      data-testid={testId}
      data-slot='inline-edit-preview-value'
      className={cn(
        'min-w-0 flex-1',
        lineClamp ? LINE_CLAMP_CLASS[lineClamp] : 'truncate',
        status === 'loading' && 'opacity-50',
      )}
    >
      {children}
    </span>
  );
};

InlineEditPreviewValue.displayName = 'InlineEditPreviewValue';
```

- [ ] **Step 2: Write `InlineEditPreviewValue.test.tsx`**

Create `packages/design-system/src/components/InlineEdit/InlineEditPreviewValue.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditPreviewValue } from './InlineEditPreviewValue';

describe('InlineEditPreviewValue', () => {
  it('truncates single-line by default', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreviewValue>hello</InlineEditPreviewValue>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-value')).toHaveClass('truncate');
  });

  it('applies the line-clamp class when lineClamp is set', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreviewValue lineClamp={3}>hello</InlineEditPreviewValue>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-value')).toHaveClass('line-clamp-3');
  });

  it('dims while a commit is loading', () => {
    render(
      <InlineEdit defaultValue='hello' status='loading' data-testid='attr'>
        <InlineEditPreviewValue>hello</InlineEditPreviewValue>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-value')).toHaveClass('opacity-50');
  });
});
```

- [ ] **Step 3: Create `InlineEditPreviewIcon.tsx`**

Create `packages/design-system/src/components/InlineEdit/InlineEditPreviewIcon.tsx`:

```tsx
import type { FC, ReactNode, Ref } from 'react';
import { Check, Pencil } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Loader } from '../Loader';
import { useInlineEdit } from './InlineEditContext';

export interface InlineEditPreviewIconProps {
  ref?: Ref<HTMLSpanElement>;
  /** Idle-state icon shown on hover/focus while the value is editable. Defaults to a pencil. */
  children?: ReactNode;
}

/**
 * Trailing icon area of `InlineEditPreview`: while a commit is in flight it
 * shows a spinner, right after a successful commit a success check, and
 * otherwise the idle icon (only while the field is actually editable).
 */
export const InlineEditPreviewIcon: FC<InlineEditPreviewIconProps> = ({
  ref,
  children = <Pencil size='md' />,
}) => {
  const testId = useTestId('preview-icon');
  const { status, disabled, readOnly, activationMode } = useInlineEdit();

  const isLoading = status === 'loading';
  // Mirrors InlineEditPreview's own `activatable` computation — duplicated
  // intentionally (one boolean expression) to avoid a circular import
  // between the root and this part.
  const activatable = !disabled && !readOnly && !isLoading && activationMode !== 'none';

  if (isLoading) {
    return (
      <span ref={ref} data-testid={testId} data-slot='inline-edit-preview-icon'>
        <Loader type='circle' size='md' />
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span ref={ref} data-testid={testId} data-slot='inline-edit-preview-icon'>
        <Check size='md' className='text-icon-success' />
      </span>
    );
  }
  if (!activatable) return null;

  return (
    <span
      ref={ref}
      data-testid={testId}
      data-slot='inline-edit-preview-icon'
      className='text-icon-secondary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'
    >
      {children}
    </span>
  );
};

InlineEditPreviewIcon.displayName = 'InlineEditPreviewIcon';
```

- [ ] **Step 4: Write `InlineEditPreviewIcon.test.tsx`**

Create `packages/design-system/src/components/InlineEdit/InlineEditPreviewIcon.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditPreviewIcon } from './InlineEditPreviewIcon';

describe('InlineEditPreviewIcon', () => {
  it('renders nothing when not activatable (disabled)', () => {
    render(
      <InlineEdit defaultValue='hello' disabled data-testid='attr'>
        <InlineEditPreviewIcon />
      </InlineEdit>,
    );
    expect(screen.queryByTestId('attr--preview-icon')).toBeNull();
  });

  it('renders the default pencil icon when activatable and idle', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreviewIcon />
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-icon')).toBeInTheDocument();
  });

  it('renders a custom icon when activatable and idle', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreviewIcon>
          <span data-testid='custom'>*</span>
        </InlineEditPreviewIcon>
      </InlineEdit>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('shows the loader while loading, overriding any custom icon', () => {
    render(
      <InlineEdit defaultValue='hello' status='loading' data-testid='attr'>
        <InlineEditPreviewIcon>
          <span data-testid='custom'>*</span>
        </InlineEditPreviewIcon>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('custom')).toBeNull();
  });

  it('shows the success check when saved, overriding any custom icon', () => {
    render(
      <InlineEdit defaultValue='hello' status='saved' data-testid='attr'>
        <InlineEditPreviewIcon>
          <span data-testid='custom'>*</span>
        </InlineEditPreviewIcon>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('custom')).toBeNull();
  });
});
```

- [ ] **Step 5: Run the two new test files, verify green**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEditPreviewValue.test.tsx InlineEditPreviewIcon.test.tsx`
Expected: PASS — 3/3 and 5/5.

- [ ] **Step 6: Rewrite `InlineEditPreview.tsx`**

Replace the full file contents with:

```tsx
import type {
  FC,
  HTMLAttributes,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { Children, isValidElement, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Tooltip, TooltipContent, type TooltipProps, TooltipTrigger } from '../Tooltip';
import { inlineEditPreviewVariants } from './classes';
import { useInlineEdit } from './InlineEditContext';
import { InlineEditPreviewIcon } from './InlineEditPreviewIcon';
import { InlineEditPreviewValue, type InlineEditPreviewValueProps } from './InlineEditPreviewValue';

const isInlineEditPreviewValue = (
  child: ReactNode,
): child is ReactElement<InlineEditPreviewValueProps> =>
  isValidElement(child) &&
  (child.type as { displayName?: string })?.displayName === InlineEditPreviewValue.displayName;

const isInlineEditPreviewIcon = (child: ReactNode): boolean =>
  isValidElement(child) &&
  (child.type as { displayName?: string })?.displayName === InlineEditPreviewIcon.displayName;

export interface InlineEditPreviewProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Tooltip shown on hover/focus while the value is editable. Defaults to
   * `'Edit'`. Pass `null` to disable the tooltip.
   */
  tooltip?: ReactNode;
  /**
   * Clamp the read-mode value to this many lines (with an ellipsis) instead of
   * the default single-line truncation. Use for multi-line values (textarea).
   * Applies to the default (no-parts) composition; when composing
   * `InlineEditPreviewValue` explicitly, set `lineClamp` on it directly.
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Plain content auto-wraps into `InlineEditPreviewValue` + a default
   * `InlineEditPreviewIcon` (pencil). Compose `InlineEditPreviewValue`/
   * `InlineEditPreviewIcon` explicitly for a custom trailing icon.
   */
  children?: ReactNode;
}

export const InlineEditPreview: FC<InlineEditPreviewProps> = ({
  ref,
  tooltip = 'Edit',
  lineClamp,
  children,
  className,
  onClick,
  onFocus,
  onKeyDown,
  onPointerMove,
  ...props
}) => {
  const testId = useTestId('preview');
  const { editing, status, invalid, disabled, readOnly, activationMode, edit } = useInlineEdit();

  // Last pointer position, used to anchor the tooltip under the cursor.
  const pointerRef = useRef({ x: 0, y: 0 });

  if (editing) return null;

  // While a commit is in flight the field is inert: no hover, no trigger, no
  // tooltip, not clickable — just the dimmed value and a spinner.
  const isLoading = status === 'loading';
  const activatable = !disabled && !readOnly && !isLoading && activationMode !== 'none';

  const childArray = Children.toArray(children);
  const valueChild = childArray.find(isInlineEditPreviewValue);
  const hasExplicitParts = childArray.some(
    child => isInlineEditPreviewValue(child) || isInlineEditPreviewIcon(child),
  );
  // Alignment (multiline vs single-line) is a root-level CSS decision
  // regardless of composition — read it off the composed Value's own prop
  // when explicit, else fall back to this component's own `lineClamp`.
  const effectiveLineClamp = hasExplicitParts ? valueChild?.props.lineClamp : lineClamp;

  const handleClick: HTMLAttributes<HTMLDivElement>['onClick'] = event => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (activatable && activationMode === 'click') edit();
  };

  const handleFocus: HTMLAttributes<HTMLDivElement>['onFocus'] = event => {
    onFocus?.(event);
    if (event.defaultPrevented) return;
    if (activatable && activationMode === 'focus') edit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (activatable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      edit();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    pointerRef.current = { x: event.clientX, y: event.clientY };
  };

  // Anchor the tooltip to the cursor position (resolved when it opens) so the
  // "Edit" hint appears under the pointer rather than centered on the row.
  const tooltipPositioning: TooltipProps['positioning'] = {
    placement: 'bottom-start',
    // Clear the ~16-20px pointer-cursor graphic, leaving a small gap below it.
    offset: { mainAxis: 24, crossAxis: 0 },
    getAnchorRect: () => ({
      x: pointerRef.current.x,
      y: pointerRef.current.y,
      width: 0,
      height: 0,
    }),
  };

  const target = (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='inline-edit-preview'
      role={activatable ? 'button' : undefined}
      tabIndex={activatable ? 0 : undefined}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      className={cn(
        inlineEditPreviewVariants({
          multiline: Boolean(effectiveLineClamp),
          activatable,
          invalid: activatable && invalid,
        }),
        className,
      )}
    >
      {hasExplicitParts ? (
        children
      ) : (
        <>
          <InlineEditPreviewValue lineClamp={lineClamp}>{children}</InlineEditPreviewValue>
          <InlineEditPreviewIcon />
        </>
      )}
    </div>
  );

  // Show the "Edit" hint only while the value is actually editable.
  if (activatable && tooltip != null) {
    return (
      <Tooltip positioning={tooltipPositioning}>
        <TooltipTrigger asChild>{target}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return target;
};

InlineEditPreview.displayName = 'InlineEditPreview';
```

- [ ] **Step 7: Add composition tests to `InlineEditPreview.test.tsx`**

Add `InlineEditPreviewIcon`/`InlineEditPreviewValue` imports and these two tests to the existing `describe('InlineEditPreview', ...)` block in `InlineEditPreview.test.tsx`:

```tsx
import { InlineEditPreviewIcon } from './InlineEditPreviewIcon';
import { InlineEditPreviewValue } from './InlineEditPreviewValue';
```

```tsx
  it('auto-wraps plain children into Value + default Icon parts', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreview>hello</InlineEditPreview>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-value')).toHaveTextContent('hello');
    expect(screen.getByTestId('attr--preview-icon')).toBeInTheDocument();
  });

  it('renders explicit Value/Icon composition with a custom icon, no default pencil', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreview>
          <InlineEditPreviewValue>hello</InlineEditPreviewValue>
          <InlineEditPreviewIcon>
            <span data-testid='custom-icon'>*</span>
          </InlineEditPreviewIcon>
        </InlineEditPreview>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview-value')).toHaveTextContent('hello');
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
```

- [ ] **Step 8: Run the full InlineEditPreview test set**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEditPreview.test.tsx InlineEditPreviewValue.test.tsx InlineEditPreviewIcon.test.tsx`
Expected: PASS — all green, including the pre-existing tests (click/keyboard activation, readOnly, loading-inert, data-* forwarding), which are unaffected since they all use plain-children usage.

- [ ] **Step 9: Export the two new parts from both index files**

In `packages/design-system/src/components/InlineEdit/index.ts`, add after the `InlineEditPreview` export line:

```ts
export { InlineEditPreviewIcon, type InlineEditPreviewIconProps } from './InlineEditPreviewIcon';
export { InlineEditPreviewValue, type InlineEditPreviewValueProps } from './InlineEditPreviewValue';
```

In `packages/design-system/src/index.ts`, inside the `InlineEdit` family export block, add:

```ts
  InlineEditPreviewIcon,
  type InlineEditPreviewIconProps,
  InlineEditPreviewValue,
  type InlineEditPreviewValueProps,
```

(Insert anywhere in the block — `lint:fix` in Step 11 re-sorts it.)

- [ ] **Step 10: Update every `triggerIcon` call site in `InlineEdit.stories.tsx`**

Add to the import block:

```tsx
import { InlineEditPreviewIcon } from './InlineEditPreviewIcon';
import { InlineEditPreviewValue } from './InlineEditPreviewValue';
```

Add `InlineEditPreviewValue, InlineEditPreviewIcon,` to `meta.subcomponents`.

Replace each of the following 7 occurrences (Gallery's Role, Roles, Tags, Date, Time, Date & Time rows, plus ConfirmCommit's Role row):

```tsx
          <InlineEditPreview triggerIcon={<ChevronDown size='md' />}>{roleLabel}</InlineEditPreview>
```

with (appears twice — Gallery's Role row and ConfirmCommit's Role row):

```tsx
          <InlineEditPreview>
            <InlineEditPreviewValue>{roleLabel}</InlineEditPreviewValue>
            <InlineEditPreviewIcon>
              <ChevronDown size='md' />
            </InlineEditPreviewIcon>
          </InlineEditPreview>
```

```tsx
          <InlineEditPreview triggerIcon={<ChevronDown size='md' />}>
            {rolesLabel}
          </InlineEditPreview>
```

with:

```tsx
          <InlineEditPreview>
            <InlineEditPreviewValue>{rolesLabel}</InlineEditPreviewValue>
            <InlineEditPreviewIcon>
              <ChevronDown size='md' />
            </InlineEditPreviewIcon>
          </InlineEditPreview>
```

```tsx
          <InlineEditPreview triggerIcon={<ChevronDown size='md' />}>
            <span className='flex gap-4'>
              {tags.map(v => (
                <Tag key={v}>{v}</Tag>
              ))}
            </span>
          </InlineEditPreview>
```

with:

```tsx
          <InlineEditPreview>
            <InlineEditPreviewValue>
              <span className='flex gap-4'>
                {tags.map(v => (
                  <Tag key={v}>{v}</Tag>
                ))}
              </span>
            </InlineEditPreviewValue>
            <InlineEditPreviewIcon>
              <ChevronDown size='md' />
            </InlineEditPreviewIcon>
          </InlineEditPreview>
```

```tsx
            <InlineEditPreview triggerIcon={<Calendar size='md' />}>{dateLabel}</InlineEditPreview>
```

with:

```tsx
            <InlineEditPreview>
              <InlineEditPreviewValue>{dateLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <Calendar size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
```

```tsx
            <InlineEditPreview triggerIcon={<Clock size='md' />}>{timeLabel}</InlineEditPreview>
```

with:

```tsx
            <InlineEditPreview>
              <InlineEditPreviewValue>{timeLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <Clock size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
```

```tsx
            <InlineEditPreview triggerIcon={<Calendar size='md' />}>
              {dateTimeLabel}
            </InlineEditPreview>
```

with:

```tsx
            <InlineEditPreview>
              <InlineEditPreviewValue>{dateTimeLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <Calendar size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
```

- [ ] **Step 11: Full family suite + typecheck + build-storybook**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/InlineEdit`
Expected: PASS, no regressions.

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS — this is where a leftover `triggerIcon` usage would surface as a type error.

Run: `pnpm --filter @wallarm-org/design-system build-storybook`
Expected: exit 0.

- [ ] **Step 12: Lint and commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/InlineEdit/ packages/design-system/src/index.ts
git commit -m "feat(inline-edit): InlineEditPreviewValue/Icon compound parts, drop triggerIcon (WDS-143)"
```

---

### Task 4: Full verification pass

**Files:** none new — verification, visual spot-check, and e2e re-baseline only.

**Interfaces:**
- Consumes: everything from Tasks 1-3.
- Produces: a green, visually-verified branch.

- [ ] **Step 1: Run the full quality gate**

```bash
pnpm --filter @wallarm-org/design-system lint
pnpm --filter @wallarm-org/design-system typecheck
pnpm --filter @wallarm-org/design-system test:run
```

Expected: zero Biome errors, zero TS errors, all unit/integration tests pass.

- [ ] **Step 2: Check each redesign against the spec**

Open `docs/superpowers/specs/2026-07-03-inline-edit-compound-api-redesign-design.md` and verify every "In scope" bullet landed: `error` prop removed with children-only authoring intact; `InlineEditDate`/`InlineEditDateTime` split with shared cast helper; `InlineEditPreview` compound parts with auto-wrap preserved. Grep for stragglers:

```bash
grep -rn "triggerIcon\|showTime\b" packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
grep -rn "error=" packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
```

Expected: no matches (the `error=` grep may match unrelated things like `errorText=` in other stories — confirm any hit is not the removed `InlineEdit` root prop).

- [ ] **Step 3: Re-baseline and visually spot-check the affected e2e screenshots**

Start Storybook if not already running: `pnpm --filter @wallarm-org/design-system storybook`

Run: `pnpm --filter @wallarm-org/design-system e2e InlineEdit.e2e.ts --update-snapshots`
Expected: all tests pass, new local baselines generated for `Gallery`, `States`, `ConfirmCommit` (the only stories whose call sites changed).

Re-run without the flag to confirm stability: `pnpm --filter @wallarm-org/design-system e2e InlineEdit.e2e.ts`
Expected: all pass.

Open `http://localhost:6006/?path=/story/data-display-inlineedit--gallery` and `--confirm-commit` in a browser and manually confirm: Role/Roles/Tags/Date/Time/Date & Time rows still show their chevron/calendar/clock icons in the same position; the email/role confirmation flow still works; the `States` story's error row still shows the message text.

- [ ] **Step 4: Commit the re-baselined screenshots**

```bash
git add packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts-snapshots
git commit -m "test(inline-edit): re-baseline screenshots for compound-API redesign [update-screenshots] (WDS-143)"
```

(Skip this commit if `git status` shows no snapshot changes — the redesigns are visually inert by design.)

- [ ] **Step 5: Push and open the PR (if requested)**

PR title (conventional-commit format, required by CI): `feat(inline-edit): compound-API redesign — error children, InlineEditDateTime, PreviewValue/Icon (WDS-143)`.
