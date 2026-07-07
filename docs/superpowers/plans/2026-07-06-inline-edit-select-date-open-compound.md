# InlineEditSelect / InlineEditDate / InlineEditDateTime Pure Root-Wrapper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse `InlineEditSelect`, `InlineEditDate`, and `InlineEditDateTime` into pure root-wrappers — `children` becomes required, the default composition is removed, and consumers always compose `Select`/`Calendar`'s own compound parts directly, exactly as they would standalone.

**Architecture:** Each component keeps only its data wiring (draft binding, `defaultOpen`, commit-on-close, submit-mode override) and renders `{children}` unconditionally — no more `children ?? <default>`. `InlineEditSelect` bridges the ambient `InlineEdit` testid cascade into `Select`'s own re-provided one via a transparent `useTestId()`; `InlineEditDate`/`InlineEditDateTime` need no testid handling at all, since `Calendar` never re-provides its own cascade. The cross-package `@internationalized/date` cast helpers move from internal to public, since composing a `DateInput` trigger is now the consumer's job.

**Tech Stack:** React 19, TypeScript strict, Vitest + Testing Library, Storybook, Biome.

**Spec:** `docs/superpowers/specs/2026-07-06-inline-edit-select-date-open-compound-design.md` — read it before starting; every decision below is justified there, including the exact `Select`/`Calendar` source lines verified during design (testid cascading behavior, the `SelectInput` cascading gap).

## Global Constraints

- Conventional commits; scope `inline-edit`, ticket suffix `(WDS-143)`.
- TypeScript strict; no `any`. No `React.forwardRef` — `ref` is a normal prop.
- Biome: `pnpm --filter @wallarm-org/design-system lint:fix` before every commit.
- This package's `pnpm typecheck` script is a confirmed pre-existing no-op (`tsc --noEmit` against a solution-style tsconfig with `files: []` — checks zero files). Use `pnpm --filter @wallarm-org/design-system build` and `build-storybook` as the real compile-checks.
- Each task must leave the repo in a green, buildable state — do not split a component's redesign from its own story call-site migration across tasks, or the build breaks in between.
- `InlineEditTime`/`InlineEditNumber` are untouched — out of scope.
- E2E tests need NO changes: verified against the current `InlineEdit.e2e.ts` — its Select-related tests only use `{testid}--preview` and `getByRole('option', ...)`, never the trigger's testid; Date/DateTime stories keep the `input` slot name by explicit consumer choice in the migrated stories. Confirm this with the grep in Task 3 rather than assuming.

---

### Task 1: Collapse `InlineEditSelect` to a pure root-wrapper + migrate its story call sites

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditSelect.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditSelect.test.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx` (`SelectEditor`, `MultiSelectEditor`, `TagsEditor`, `ConfirmCommit`'s Role row, imports)

**Interfaces:**
- Consumes: `Select`/`SelectButton`/`SelectInput`/`SelectPositioner`/`SelectContent`/`SelectOption`/`SelectOptionText`/`SelectOptionIndicator`/`createListCollection`/`SelectDataItem`/`ListCollection` (all pre-existing exports from `../Select`, unchanged).
- Produces: `InlineEditSelectProps = { items?: SelectDataItem[]; collection?: ListCollection<SelectDataItem>; multiple?: boolean; children: ReactNode }` (children now required, no `data-testid` prop). Task 3's grep/verification step relies on this shape being final.

- [ ] **Step 1: Rewrite `InlineEditSelect.tsx`**

Replace the full file contents with:

```tsx
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import type { ListCollection } from '@ark-ui/react/collection';
import { useTestId } from '../../utils/testId';
import { createListCollection, Select, type SelectDataItem } from '../Select';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

export interface InlineEditSelectProps {
  /**
   * Options; the collection is built internally (PaginationPageSize
   * precedent). Provide exactly one of `items` / `collection`.
   */
  items?: SelectDataItem[];
  /**
   * A prebuilt collection (e.g. built once upstream, or with custom
   * filtering/sorting). Provide exactly one of `items` / `collection` — a
   * dev-only warning fires otherwise.
   */
  collection?: ListCollection<SelectDataItem>;
  multiple?: boolean;
  /**
   * `InlineEditSelect` IS the prewired `Select` root — the draft binding,
   * `defaultOpen`, and commit-on-close all live here. `children` are
   * ordinary `Select` compound parts (`SelectButton`/`SelectInput`,
   * `SelectPositioner > SelectContent > SelectOption…`) — exactly as you'd
   * compose a standalone `Select`. `SelectButton`/`SelectOption` already
   * cascade their own testid slot from this root (`{base}--button` /
   * `{base}--option`); `SelectInput` (the multiple-select trigger) does not
   * cascade on its own — pass it `data-testid` explicitly if you need one.
   */
  children: ReactNode;
}

export const InlineEditSelect = ({
  items,
  collection,
  multiple = false,
  children,
}: InlineEditSelectProps) => {
  // Transparent pass-through (no slot segment): bridges the ambient
  // InlineEdit-level cascade into Select's own re-provided TestIdProvider,
  // so a consumer's bare SelectButton/SelectOption resolve automatically.
  const testId = useTestId();
  const { value, setValue, submit } = useInlineEdit<string[] | string>();
  useInlineEditSubmitMode('none');

  // useMemo must run unconditionally (hooks rule) — memoize from `items`
  // (defaulting to `[]` when a `collection` is provided instead) and pick
  // the resolved collection afterward.
  const collectionFromItems = useMemo(() => createListCollection({ items: items ?? [] }), [items]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const hasItems = items !== undefined;
    const hasCollection = collection !== undefined;
    if (hasItems === hasCollection) {
      // biome-ignore lint/suspicious/noConsole: dev-only warning surface
      console.warn(
        `InlineEditSelect: provide exactly one of \`items\` or \`collection\` (got ${
          hasItems && hasCollection ? 'both' : 'neither'
        }).`,
      );
    }
  }, [items, collection]);

  const resolvedCollection = collection ?? collectionFromItems;
  // A plain-string committed value is a natural single-select shape —
  // normalize instead of silently blanking it.
  const selected = Array.isArray(value)
    ? value
    : typeof value === 'string' && value !== ''
      ? [value]
      : [];

  return (
    <Select
      data-testid={testId}
      defaultOpen
      collection={resolvedCollection}
      multiple={multiple}
      value={selected}
      onValueChange={details => setValue(details.value)}
      onOpenChange={details => {
        if (!details.open) submit();
      }}
    >
      {children}
    </Select>
  );
};

InlineEditSelect.displayName = 'InlineEditSelect';
```

- [ ] **Step 2: Rewrite `InlineEditSelect.test.tsx`**

Replace the full file contents with:

```tsx
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useTestId } from '../../utils/testId';
import {
  createListCollection,
  SelectButton,
  SelectContent,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditSelect } from './InlineEditSelect';

const items = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
];

// SelectInput does not self-cascade its testid (unlike SelectButton/
// SelectOption) — a consumer wanting a stable one derives it themselves via
// useTestId, which only resolves correctly from a component rendered as a
// descendant of <InlineEdit> (i.e. not from the top of a test's Harness).
function SelectInputTrigger({ analyticsId }: { analyticsId?: string }) {
  const testId = useTestId('input');
  return <SelectInput data-testid={testId} data-analytics-id={analyticsId} />;
}

function SelectParts({
  multiple = false,
  analyticsId,
}: {
  multiple?: boolean;
  analyticsId?: string;
}) {
  return (
    <>
      {multiple ? (
        <SelectInputTrigger analyticsId={analyticsId} />
      ) : (
        <SelectButton data-analytics-id={analyticsId} />
      )}
      <SelectPositioner>
        <SelectContent>
          {items.map(item => (
            <SelectOption key={item.value} item={item}>
              <SelectOptionText>{item.label}</SelectOptionText>
              <SelectOptionIndicator />
            </SelectOption>
          ))}
        </SelectContent>
      </SelectPositioner>
    </>
  );
}

function Harness({
  onCommit,
  value = ['editor'],
  multiple = false,
  analyticsId,
}: {
  onCommit?: (v: unknown) => void;
  value?: string[] | string;
  multiple?: boolean;
  analyticsId?: string;
}) {
  return (
    <InlineEdit defaultValue={value} defaultEdit onValueCommit={onCommit} data-testid='ie'>
      <InlineEditControl>
        <InlineEditSelect items={items} multiple={multiple}>
          <SelectParts multiple={multiple} analyticsId={analyticsId} />
        </InlineEditSelect>
      </InlineEditControl>
    </InlineEdit>
  );
}

// Ark's `Select` root always renders an aria-hidden native `<select>` mirror
// (`ArkUiSelect.HiddenSelect`) with `<option>` elements duplicating every item
// label, driven directly by the `collection` — independent of the visible
// composition. This makes plain `getByText` ambiguous (jsdom quirk
// `Select.test.tsx` never hits, since it queries options via `data-testid`
// instead of text). `ignore: 'option'` excludes that hidden mirror from the
// match pool without weakening any assertion.
const ignoreHiddenSelectOption = { ignore: 'option' };

describe('InlineEditSelect', () => {
  it('opens on mount and shows options from items', async () => {
    render(<Harness />);
    expect(await screen.findByText('Admin', ignoreHiddenSelectOption)).toBeInTheDocument();
  });

  it('picking an option (single) commits on close', async () => {
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);
    const option = await screen.findByText('Admin', ignoreHiddenSelectOption);
    // Opening on mount alone must not commit — only the close does.
    expect(onCommit).not.toHaveBeenCalled();
    await userEvent.click(option);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(['admin']);
  });

  it('normalizes a plain string committed value into an array draft', async () => {
    render(<Harness value='editor' />);
    const listbox = await screen.findByRole('listbox');
    const option = within(listbox).getByText('Editor', ignoreHiddenSelectOption);
    expect(option.closest('[data-state]')).toHaveAttribute('data-state', 'checked');
  });

  it('forwards data-analytics-id to the real trigger', async () => {
    render(<Harness analyticsId='role-edit' />);
    expect(document.querySelector('[data-analytics-id="role-edit"]')?.tagName).toBe('BUTTON');
  });

  it('renders only the given children — no fallback composition exists to leak through', async () => {
    render(
      <InlineEdit defaultValue={['admin']} defaultEdit data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect items={items}>
            <span data-testid='custom-composition' />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('custom-composition')).toBeInTheDocument();
    expect(screen.queryByText('Admin', ignoreHiddenSelectOption)).not.toBeInTheDocument();
  });

  it('collection-only usage renders options from the resolved collection and commits on close', async () => {
    const onCommit = vi.fn();
    const collection = createListCollection({ items });
    render(
      <InlineEdit defaultValue={['editor']} defaultEdit onValueCommit={onCommit} data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect collection={collection}>
            <SelectParts />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    const option = await screen.findByText('Admin', ignoreHiddenSelectOption);
    await userEvent.click(option);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(['admin']);
  });

  it('warns in dev when both items and collection are provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const collection = createListCollection({ items });
    render(
      <InlineEdit defaultValue={['editor']} defaultEdit data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect items={items} collection={collection}>
            <SelectParts />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('InlineEditSelect'));
    warnSpy.mockRestore();
  });

  it('warns in dev when neither items nor collection are provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <InlineEdit defaultValue={[]} defaultEdit data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect>
            <SelectParts />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('InlineEditSelect'));
    warnSpy.mockRestore();
  });

  it('bridges the ambient InlineEdit testid into a bare SelectButton/SelectOption with zero extra wiring', async () => {
    render(<Harness />);
    // SelectButton/SelectOption call useTestId('button'/'option', ...) themselves —
    // InlineEditSelect only forwards a transparent useTestId() onto <Select>.
    expect(screen.getByTestId('ie--button')).toBeInTheDocument();
    const option = await screen.findByTestId('ie--option');
    expect(option).toHaveTextContent('Admin');
  });

  describe('multiple', () => {
    it('renders the SelectInput div trigger, testid supplied explicitly by the consumer', async () => {
      render(<Harness multiple />);
      const trigger = await screen.findByTestId('ie--input');
      expect(trigger.tagName).not.toBe('BUTTON');
      expect(trigger.tagName).toBe('DIV');
      // SelectInput-distinctive: Ark trigger part rendered as a div.
      expect(trigger).toHaveAttribute('data-part', 'trigger');
    });

    it('stays open across picks and commits the multi-value array on close', async () => {
      const onCommit = vi.fn();
      render(<Harness onCommit={onCommit} value={[]} multiple />);
      const listbox = await screen.findByRole('listbox');

      await userEvent.click(within(listbox).getByText('Admin', ignoreHiddenSelectOption));
      // Multi-select does NOT close on selection — no commit yet.
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(onCommit).not.toHaveBeenCalled();

      await userEvent.click(within(listbox).getByText('Editor', ignoreHiddenSelectOption));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(onCommit).not.toHaveBeenCalled();

      // Toggle-close via the trigger (outside-click dismissal relies on
      // document-level pointer tracking jsdom doesn't drive reliably)
      // → onOpenChange(open:false) → submit()
      await userEvent.click(screen.getByTestId('ie--input'));
      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith(['admin', 'editor']);
    });

    it('forwards data-analytics-id to the real div trigger', async () => {
      render(<Harness multiple analyticsId='roles-edit' />);
      const target = document.querySelector('[data-analytics-id="roles-edit"]');
      expect(target?.tagName).toBe('DIV');
      expect(target).toBe(screen.getByTestId('ie--input'));
    });
  });
});
```

- [ ] **Step 3: Run the InlineEditSelect test file**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEditSelect.test.tsx`
Expected: PASS, 12/12.

- [ ] **Step 4: Migrate the story call sites**

In `InlineEdit.stories.tsx`, replace the import block's line:

```tsx
import type { SelectDataItem } from '../Select';
```

with:

```tsx
import {
  SelectButton,
  type SelectDataItem,
  SelectContent,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
```

and add to the import block:

```tsx
import { useTestId } from '../../utils/testId';
```

After the `tagItems` constant, add two shared helpers:

```tsx
function renderSelectOptions(items: SelectDataItem[]) {
  return items.map(item => (
    <SelectOption key={item.value} item={item}>
      <SelectOptionText>{item.label}</SelectOptionText>
      <SelectOptionIndicator />
    </SelectOption>
  ));
}

// SelectInput does not self-cascade its testid (unlike SelectButton) — derive
// it explicitly. Must be its own component: useTestId only resolves from a
// descendant of <InlineEdit>, not from the story function that renders it.
function SelectInputTrigger() {
  const testId = useTestId('input');
  return <SelectInput data-testid={testId} />;
}
```

Replace the `SelectEditor` story's `InlineEditControl` block:

```tsx
          <InlineEditControl>
            <InlineEditSelect items={roleItems} />
          </InlineEditControl>
```

with:

```tsx
          <InlineEditControl>
            <InlineEditSelect items={roleItems}>
              <SelectButton />
              <SelectPositioner>
                <SelectContent>{renderSelectOptions(roleItems)}</SelectContent>
              </SelectPositioner>
            </InlineEditSelect>
          </InlineEditControl>
```

Replace the `MultiSelectEditor` story's `InlineEditControl` block:

```tsx
          <InlineEditControl>
            <InlineEditSelect items={roleItems} multiple />
          </InlineEditControl>
```

with:

```tsx
          <InlineEditControl>
            <InlineEditSelect items={roleItems} multiple>
              <SelectInputTrigger />
              <SelectPositioner>
                <SelectContent>{renderSelectOptions(roleItems)}</SelectContent>
              </SelectPositioner>
            </InlineEditSelect>
          </InlineEditControl>
```

Replace the `TagsEditor` story's `InlineEditControl` block:

```tsx
          <InlineEditControl>
            <InlineEditSelect items={tagItems} multiple />
          </InlineEditControl>
```

with:

```tsx
          <InlineEditControl>
            <InlineEditSelect items={tagItems} multiple>
              <SelectInputTrigger />
              <SelectPositioner>
                <SelectContent>{renderSelectOptions(tagItems)}</SelectContent>
              </SelectPositioner>
            </InlineEditSelect>
          </InlineEditControl>
```

Replace `ConfirmCommit`'s Role row `InlineEditControl` block:

```tsx
          <InlineEditControl>
            <InlineEditSelect items={roleItems} />
          </InlineEditControl>
```

with:

```tsx
          <InlineEditControl>
            <InlineEditSelect items={roleItems}>
              <SelectButton />
              <SelectPositioner>
                <SelectContent>{renderSelectOptions(roleItems)}</SelectContent>
              </SelectPositioner>
            </InlineEditSelect>
          </InlineEditControl>
```

- [ ] **Step 5: Compile-check with the real build**

Run: `pnpm --filter @wallarm-org/design-system build`
Expected: exit 0.

Run: `pnpm --filter @wallarm-org/design-system build-storybook`
Expected: exit 0.

- [ ] **Step 6: Run the full InlineEdit family suite**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/InlineEdit`
Expected: PASS, no regressions.

- [ ] **Step 7: Lint and commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/InlineEdit/InlineEditSelect.tsx packages/design-system/src/components/InlineEdit/InlineEditSelect.test.tsx packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
git commit -m "feat(inline-edit): collapse InlineEditSelect to a pure root-wrapper (WDS-143)"
```

---

### Task 2: Collapse `InlineEditDate`/`InlineEditDateTime` to pure root-wrappers, promote cast helpers, migrate their story call sites

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditDate.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditDateTime.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/dateValueCast.ts`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditDate.test.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEditDateTime.test.tsx`
- Modify: `packages/design-system/src/components/InlineEdit/index.ts`
- Modify: `packages/design-system/src/index.ts`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx` (`DateEditor`, `DateTimeEditor`, imports)

**Interfaces:**
- Consumes: `Calendar`/`CalendarTrigger`/`CalendarContent`/`CalendarBody`/`CalendarGrids`/`CalendarInputHeader`/`DateValue` (from `../Calendar`), `DateInput` (from `../DateInput`) — all pre-existing, unchanged.
- Produces: `InlineEditDateProps = { children: ReactNode }`, `InlineEditDateTimeProps = { children: ReactNode }`. `dateValueCast.ts` exports `toReactAriaDateValue`, `toCalendarDateValue`, and (newly) `withMinuteGranularity` — all now re-exported from both `index.ts` files. Task 3's grep/verification step and the spec's public-API claim depend on this export shape.

- [ ] **Step 1: Move `withMinuteGranularity` into `dateValueCast.ts` and add its export**

Replace the full contents of `packages/design-system/src/components/InlineEdit/dateValueCast.ts` with:

```tsx
import { CalendarDateTime } from '@internationalized/date';
import type { DateValue as ReactAriaDateValue } from '@react-aria/datepicker';
import type { DateValue } from '../Calendar';

/**
 * Calendar's `DateValue` (Ark) and DateInput's `DateValue` (react-aria) are
 * structurally identical `@internationalized/date` classes from different
 * package copies — the story-documented interop hazard (Ark values fail an
 * `instanceof` check against react-aria's copy, and vice versa). Cast across
 * the boundary rather than validate, mirroring `toDateValue`/
 * `toReactAriaDateValue` in Calendar/dateValue.ts. Use these when composing a
 * `DateInput` trigger inside `InlineEditDate`/`InlineEditDateTime`.
 */
export const toReactAriaDateValue = (date: DateValue | null): ReactAriaDateValue | null =>
  date as unknown as ReactAriaDateValue | null;

export const toCalendarDateValue = (date: ReactAriaDateValue | null): DateValue | null =>
  date as unknown as DateValue | null;

/**
 * `DateInput` at `granularity='minute'` requires an hour/minute component —
 * react-aria's `useDateFieldState` throws "Invalid granularity" otherwise. A
 * committed value can be day-only (e.g. a consumer's initial `CalendarDate`,
 * before any time has been picked), so promote it to midnight, mirroring
 * Calendar's own date-only → `CalendarDateTime` promotion in `useCalendarTime`
 * / `withTime` (Calendar/dateValue.ts). The cast crosses the same
 * `@internationalized/date` package-instance boundary as the casts above.
 * Use this when composing a minute-granularity `DateInput` trigger inside
 * `InlineEditDateTime`.
 */
export const withMinuteGranularity = (date: DateValue | null): DateValue | null => {
  if (!date) return null;
  if ('hour' in date) return date;
  return new CalendarDateTime(date.year, date.month, date.day, 0, 0) as unknown as DateValue;
};
```

- [ ] **Step 2: Rewrite `InlineEditDate.tsx`**

Replace the full file contents with:

```tsx
import type { FC, ReactNode } from 'react';
import { Calendar as CalendarRoot, type DateValue } from '../Calendar';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

export interface InlineEditDateProps {
  /**
   * `InlineEditDate` IS the prewired `Calendar` root (day-only:
   * `closeOnSelect`) — the `DateValue[]` adapter and commit-on-close live
   * here. `children` are ordinary `Calendar` compound parts
   * (`CalendarTrigger > DateInput`, `CalendarContent > CalendarBody >
   * CalendarGrids`) — exactly as you'd compose a standalone `Calendar`. Use
   * `InlineEditDateTime` for date+time. Wire your own `DateInput`'s
   * `value`/`onChange` via `useInlineEdit()` plus the `toReactAriaDateValue`/
   * `toCalendarDateValue` casts from `./dateValueCast` (the two
   * `@internationalized/date` package copies aren't `instanceof`-compatible).
   * `Calendar` does not re-provide its own testid cascade, so a `DateInput`
   * you place inside already resolves `useTestId(...)` from the ambient
   * `InlineEdit` root — no extra wiring needed.
   */
  children: ReactNode;
}

export const InlineEditDate: FC<InlineEditDateProps> = ({ children }) => {
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
      {children}
    </CalendarRoot>
  );
};

InlineEditDate.displayName = 'InlineEditDate';
```

- [ ] **Step 3: Rewrite `InlineEditDateTime.tsx`**

Replace the full file contents with:

```tsx
import type { FC, ReactNode } from 'react';
import { Calendar as CalendarRoot, type DateValue } from '../Calendar';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

export interface InlineEditDateTimeProps {
  /**
   * `InlineEditDateTime` IS the prewired `Calendar` root (date+time:
   * `showTime`, `closeOnSelect={false}`) — the `DateValue[]` adapter and
   * commit-on-close live here. `children` are ordinary `Calendar` compound
   * parts (`CalendarTrigger > DateInput`, `CalendarContent > CalendarBody >
   * CalendarInputHeader > CalendarGrids`) — exactly as you'd compose a
   * standalone `Calendar`. Use `InlineEditDate` for day-only. Wire your own
   * `DateInput`'s `value`/`onChange` via `useInlineEdit()` plus the
   * `toReactAriaDateValue`/`toCalendarDateValue`/`withMinuteGranularity`
   * helpers from `./dateValueCast` (minute-granularity `DateInput` needs a
   * promoted day-only value, and the two `@internationalized/date` package
   * copies aren't `instanceof`-compatible). `Calendar` does not re-provide
   * its own testid cascade, so a `DateInput` you place inside already
   * resolves `useTestId(...)` from the ambient `InlineEdit` root — no extra
   * wiring needed.
   */
  children: ReactNode;
}

export const InlineEditDateTime: FC<InlineEditDateTimeProps> = ({ children }) => {
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
      {children}
    </CalendarRoot>
  );
};

InlineEditDateTime.displayName = 'InlineEditDateTime';
```

- [ ] **Step 4: Rewrite `InlineEditDate.test.tsx`**

Replace the full file contents with:

```tsx
import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTestId } from '../../utils/testId';
import { CalendarBody, CalendarContent, CalendarGrids, CalendarTrigger, type DateValue } from '../Calendar';
import { DateInput } from '../DateInput';
import { toCalendarDateValue, toReactAriaDateValue } from './dateValueCast';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDate } from './InlineEditDate';
import { useInlineEdit } from './InlineEditContext';

// `useTestId`/`useInlineEdit` only resolve correctly from a component
// rendered as a descendant of <InlineEdit> — must be its own component, not
// called at the top of the Harness (which renders <InlineEdit> itself).
function DateInputTrigger({ analyticsId }: { analyticsId?: string }) {
  const testId = useTestId('input');
  const { value, setValue } = useInlineEdit<DateValue | null>();
  return (
    <DateInput
      data-testid={testId}
      data-analytics-id={analyticsId}
      value={toReactAriaDateValue(value ?? null)}
      onChange={v => setValue(toCalendarDateValue(v))}
      granularity='day'
    />
  );
}

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
        <InlineEditDate>
          <CalendarTrigger>
            <DateInputTrigger analyticsId={analyticsId} />
          </CalendarTrigger>
          <CalendarContent>
            <CalendarBody>
              <CalendarGrids />
            </CalendarBody>
          </CalendarContent>
        </InlineEditDate>
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

  it('derives the shared input testId slot from the ambient InlineEdit root, with no wiring in InlineEditDate itself', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('forwards data-analytics-id to whatever node the consumer places it on', () => {
    render(<Harness analyticsId='date-edit' />);
    const target = document.querySelector('[data-analytics-id="date-edit"]');
    expect(target).toBe(screen.getByTestId('ie--input'));
  });
});
```

- [ ] **Step 5: Rewrite `InlineEditDateTime.test.tsx`**

Replace the full file contents with:

```tsx
import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTestId } from '../../utils/testId';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
  CalendarInputHeader,
  CalendarTrigger,
  type DateValue,
} from '../Calendar';
import { DateInput } from '../DateInput';
import { toCalendarDateValue, toReactAriaDateValue, withMinuteGranularity } from './dateValueCast';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDateTime } from './InlineEditDateTime';
import { useInlineEdit } from './InlineEditContext';

function DateInputTrigger({ analyticsId }: { analyticsId?: string }) {
  const testId = useTestId('input');
  const { value, setValue } = useInlineEdit<DateValue | null>();
  return (
    <DateInput
      data-testid={testId}
      data-analytics-id={analyticsId}
      value={toReactAriaDateValue(withMinuteGranularity(value ?? null))}
      onChange={v => setValue(toCalendarDateValue(v))}
      granularity='minute'
    />
  );
}

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
        <InlineEditDateTime>
          <CalendarTrigger>
            <DateInputTrigger analyticsId={analyticsId} />
          </CalendarTrigger>
          <CalendarContent>
            <CalendarBody>
              <CalendarInputHeader />
              <CalendarGrids />
            </CalendarBody>
          </CalendarContent>
        </InlineEditDateTime>
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

  it('derives the shared input testId slot from the ambient InlineEdit root, with no wiring in InlineEditDateTime itself', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('forwards data-analytics-id to whatever node the consumer places it on', () => {
    render(<Harness analyticsId='date-edit' />);
    const target = document.querySelector('[data-analytics-id="date-edit"]');
    expect(target).toBe(screen.getByTestId('ie--input'));
  });
});
```

- [ ] **Step 6: Run both test files**

Run: `pnpm --filter @wallarm-org/design-system test:run InlineEditDate.test.tsx InlineEditDateTime.test.tsx`
Expected: PASS, 3/3 in each file.

- [ ] **Step 7: Migrate the `DateEditor`/`DateTimeEditor` story call sites**

In `InlineEdit.stories.tsx`, add to the import block (alongside the Task 1 additions):

```tsx
import { CalendarInputHeader, CalendarTrigger, CalendarBody, CalendarContent, CalendarGrids } from '../Calendar';
import { DateInput } from '../DateInput';
import { toCalendarDateValue, toReactAriaDateValue, withMinuteGranularity } from './dateValueCast';
```

Add a shared helper near `renderSelectOptions`/`SelectInputTrigger` (after them):

```tsx
// `Calendar` never re-provides its own testid cascade, so this resolves
// straight from the ambient InlineEdit root — same reasoning as
// SelectInputTrigger above, just without needing a bridge.
function DateInputTrigger({ granularity }: { granularity: 'day' | 'minute' }) {
  const testId = useTestId('input');
  const { value, setValue } = useInlineEdit<DateValue | null>();
  const resolvedValue = granularity === 'minute' ? withMinuteGranularity(value ?? null) : (value ?? null);
  return (
    <DateInput
      data-testid={testId}
      value={toReactAriaDateValue(resolvedValue)}
      onChange={v => setValue(toCalendarDateValue(v))}
      granularity={granularity}
    />
  );
}
```

Add this new import line among the existing `./InlineEdit*`-family imports (`DateInputTrigger` needs `useInlineEdit`):

```tsx
import { useInlineEdit } from './InlineEditContext';
```

Replace the `DateEditor` story's `InlineEditControl` block:

```tsx
            <InlineEditControl>
              <InlineEditDate />
            </InlineEditControl>
```

with:

```tsx
            <InlineEditControl>
              <InlineEditDate>
                <CalendarTrigger>
                  <DateInputTrigger granularity='day' />
                </CalendarTrigger>
                <CalendarContent>
                  <CalendarBody>
                    <CalendarGrids />
                  </CalendarBody>
                </CalendarContent>
              </InlineEditDate>
            </InlineEditControl>
```

Replace the `DateTimeEditor` story's `InlineEditControl` block:

```tsx
            <InlineEditControl>
              <InlineEditDateTime />
            </InlineEditControl>
```

with:

```tsx
            <InlineEditControl>
              <InlineEditDateTime>
                <CalendarTrigger>
                  <DateInputTrigger granularity='minute' />
                </CalendarTrigger>
                <CalendarContent>
                  <CalendarBody>
                    <CalendarInputHeader />
                    <CalendarGrids />
                  </CalendarBody>
                </CalendarContent>
              </InlineEditDateTime>
            </InlineEditControl>
```

- [ ] **Step 8: Export the cast helpers publicly from both index files**

In `packages/design-system/src/components/InlineEdit/index.ts`, add:

```ts
export { toCalendarDateValue, toReactAriaDateValue, withMinuteGranularity } from './dateValueCast';
```

In `packages/design-system/src/index.ts`, inside the `InlineEdit` family export block, add:

```ts
  toCalendarDateValue,
  toReactAriaDateValue,
  withMinuteGranularity,
```

(Insert anywhere in the block — `lint:fix` in Step 10 re-sorts it.)

- [ ] **Step 9: Compile-check with the real build**

Run: `pnpm --filter @wallarm-org/design-system build`
Expected: exit 0.

Run: `pnpm --filter @wallarm-org/design-system build-storybook`
Expected: exit 0.

- [ ] **Step 10: Full family suite + lint + commit**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/InlineEdit`
Expected: PASS, no regressions.

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/InlineEdit/ packages/design-system/src/index.ts
git commit -m "feat(inline-edit): collapse InlineEditDate/InlineEditDateTime to pure root-wrappers, promote cast helpers (WDS-143)"
```

---

### Task 3: Update `ANALYTICS_GAPS.md`, component docs, and full verification

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/ANALYTICS_GAPS.md`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx` (`meta.parameters.docs.description.component`)

**Interfaces:**
- Consumes: everything from Tasks 1-2.
- Produces: a green, fully migrated, and documented branch.

- [ ] **Step 1: Remove the now-obsolete `ANALYTICS_GAPS.md` entry**

Delete this entire section from `ANALYTICS_GAPS.md`:

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

Leave the `InlineEditNumber` and `InlineEditTime` sections untouched — this task only removes the `InlineEditDate`/`InlineEditDateTime` entry, which no longer describes a real gap (there is no more DS-owned default composition to leave attributes stranded on).

- [ ] **Step 2: Update the component-level docs**

In `InlineEdit.stories.tsx`, in `meta.parameters.docs.description.component`, the sentence `'`InlineEditSelect`, `InlineEditDate`, `InlineEditTime`) or a custom one. '` already lists the built-in editors generically and needs no change — but append one clause after it to document the new composition contract. Find:

```tsx
          'InlineEdit is a compound inline-edit component: `InlineEditPreview` renders the ' +
          'read-mode wrapper and `InlineEditControl` the edit-mode wrapper, hosting either a ' +
          'built-in editor (`InlineEditInput`, `InlineEditNumber`, `InlineEditTextarea`, ' +
          '`InlineEditSelect`, `InlineEditDate`, `InlineEditTime`) or a custom one. ' +
```

Replace with:

```tsx
          'InlineEdit is a compound inline-edit component: `InlineEditPreview` renders the ' +
          'read-mode wrapper and `InlineEditControl` the edit-mode wrapper, hosting either a ' +
          'built-in editor (`InlineEditInput`, `InlineEditNumber`, `InlineEditTextarea`, ' +
          '`InlineEditSelect`, `InlineEditDate`, `InlineEditTime`) or a custom one. ' +
          '`InlineEditSelect`/`InlineEditDate`/`InlineEditDateTime` are pure root-wrappers — ' +
          'they own only the draft/commit wiring, and `children` (required) are ordinary ' +
          '`Select`/`Calendar` compound parts, composed exactly as you would standalone. ' +
```

- [ ] **Step 3: Full quality gate**

```bash
pnpm --filter @wallarm-org/design-system lint
pnpm --filter @wallarm-org/design-system build
pnpm --filter @wallarm-org/design-system build-storybook
pnpm --filter @wallarm-org/design-system test:run
```

Expected: all green.

- [ ] **Step 4: Spec cross-check — confirm no e2e changes were needed**

Run: `grep -n "select--\|date--\|datetime--" packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts`
Expected: only `{testid}--preview` matches (e.g. `select--preview`, `date--preview`, `datetime--preview`) — no `--input`/`--button` hits, confirming the spec's claim that e2e never depended on the trigger's own testid slot.

Run: `pnpm --filter @wallarm-org/design-system e2e InlineEdit.e2e.ts`
Expected: all 35 tests still pass, no re-baseline needed (visual output is unchanged — same DOM structure, just authored by the story instead of the component).

- [ ] **Step 5: Commit the docs**

```bash
git add packages/design-system/src/components/InlineEdit/ANALYTICS_GAPS.md packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
git commit -m "docs(inline-edit): remove obsolete analytics gap, document root-wrapper contract (WDS-143)"
```
