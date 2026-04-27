# Attribute Horizontal Orientation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `horizontal` orientation to the `Attribute` compound component (label on the left, value on the right) while keeping `vertical` (current behavior) as the default. The label has a fixed width range and ellipsis truncation; the value also truncates when content overflows.

**Architecture:** Add an `orientation` prop on the `Attribute` root (`'vertical' | 'horizontal'`, default `'vertical'`). The orientation cascades to `AttributeLabel` and `AttributeValue` via a new `AttributeOrientationContext` (mirrors the existing `TestIdProvider` pattern). Each sub-component reads the context and applies orientation-specific Tailwind classes — no markup duplication, fully backward compatible.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Storybook 10, Vitest, Playwright

**Spec:**
- Figma reference: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9015-21014
- Label: `min-w-[100px] max-w-[160px] w-[160px]`, single-line, truncates with ellipsis
- Value: takes remaining space (`flex-1 min-w-0`), truncates with ellipsis when content does not fit on a single line
- Container: `flex flex-row items-start gap-4`, no extra `pt-4` between label and value (each cell aligns at its own top padding)
- Vertical (default) behavior is unchanged

---

## File Structure

```
packages/design-system/src/components/Attribute/
├── Attribute.tsx                  # Root: add orientation prop + provide context
├── AttributeOrientationContext.ts # NEW: context + hook for orientation
├── AttributeLabel.tsx             # Modify: read orientation, apply horizontal classes
├── AttributeValue.tsx             # Modify: read orientation, apply horizontal classes + truncate
├── Attribute.stories.tsx          # Modify: add Horizontal stories
└── index.ts                       # No changes (no new public exports)
```

**Modified files:**
- `packages/design-system/src/components/Attribute/Attribute.tsx`
- `packages/design-system/src/components/Attribute/AttributeLabel.tsx`
- `packages/design-system/src/components/Attribute/AttributeValue.tsx`
- `packages/design-system/src/components/Attribute/Attribute.stories.tsx`

**Created files:**
- `packages/design-system/src/components/Attribute/AttributeOrientationContext.ts`
- `packages/design-system/src/components/Attribute/Attribute.e2e.ts` (only if not already present — see Task 7)

---

### Task 1: Create the orientation context

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeOrientationContext.ts`

- [ ] **Step 1: Write the context file**

```ts
import { createContext, useContext } from 'react';

export type AttributeOrientation = 'vertical' | 'horizontal';

const AttributeOrientationContext = createContext<AttributeOrientation>('vertical');

export const AttributeOrientationProvider = AttributeOrientationContext.Provider;

export const useAttributeOrientation = (): AttributeOrientation =>
  useContext(AttributeOrientationContext);
```

- [ ] **Step 2: Commit**

```bash
git add packages/design-system/src/components/Attribute/AttributeOrientationContext.ts
git commit -m "feat(attribute): add orientation context"
```

---

### Task 2: Add `orientation` prop to `Attribute` root

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.tsx`

- [ ] **Step 1: Replace the current `Attribute.tsx` with the orientation-aware version**

```tsx
import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { Skeleton } from '../Skeleton';
import {
  type AttributeOrientation,
  AttributeOrientationProvider,
} from './AttributeOrientationContext';

export interface AttributeProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Show skeleton placeholders instead of children */
  loading?: boolean;
  /**
   * Layout direction of the label and value.
   * - `vertical` (default): label above value
   * - `horizontal`: label on the left, value on the right
   */
  orientation?: AttributeOrientation;
  children?: ReactNode;
}

export const Attribute: FC<AttributeProps> = ({
  ref,
  loading = false,
  orientation = 'vertical',
  children,
  className,
  'data-testid': testId,
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <TestIdProvider value={testId}>
      <AttributeOrientationProvider value={orientation}>
        <div
          {...props}
          ref={ref}
          data-testid={testId}
          data-slot='attribute'
          data-orientation={orientation}
          className={cn(
            isHorizontal ? 'flex flex-row items-start gap-4' : 'flex flex-col',
            loading && !isHorizontal && 'gap-4 py-2',
            loading && isHorizontal && 'py-2',
            className,
          )}
        >
          {loading ? (
            isHorizontal ? (
              <>
                <Skeleton width='82px' height='16px' rounded={6} />
                <Skeleton width='100%' height='16px' rounded={6} />
              </>
            ) : (
              <>
                <Skeleton width='82px' height='16px' rounded={6} />
                <Skeleton width='100%' height='24px' rounded={6} />
              </>
            )
          ) : (
            children
          )}
        </div>
      </AttributeOrientationProvider>
    </TestIdProvider>
  );
};

Attribute.displayName = 'Attribute';
```

- [ ] **Step 2: Run typecheck to verify no type errors**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Attribute/Attribute.tsx
git commit -m "feat(attribute): add orientation prop to Attribute root"
```

---

### Task 3: Make `AttributeLabel` orientation-aware

**Files:**
- Modify: `packages/design-system/src/components/Attribute/AttributeLabel.tsx`

In horizontal mode the label must:
- have `min-w-[100px] max-w-[160px] w-[160px]` so it occupies a fixed cell that may shrink down to 100px when the parent is narrow
- be a single line that truncates with ellipsis when the text exceeds 160px (`truncate` = `whitespace-nowrap overflow-hidden text-ellipsis`)
- not wrap (so `flex-wrap` from vertical mode must be off)
- have `py-4` vertical padding (matches the Figma `py-[var(--spacing-4,4px)]`)

`AttributeLabelDescription` and `AttributeLabelInfo` are not expected to render inside a horizontal label (the spec/Figma shows label = single line text only). We do not actively forbid them — we just don't add layout for them in horizontal. Keep the existing styling for vertical untouched.

- [ ] **Step 1: Replace `AttributeLabel.tsx`**

```tsx
import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useAttributeOrientation } from './AttributeOrientationContext';

export interface AttributeLabelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AttributeLabel: FC<AttributeLabelProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('label');
  const orientation = useAttributeOrientation();
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-label'
      className={cn(
        'font-sans-display text-sm font-normal text-text-secondary',
        isHorizontal
          ? 'flex items-center min-w-[100px] max-w-[160px] w-[160px] py-4 shrink-0 truncate'
          : 'flex items-center gap-4 flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  );
};

AttributeLabel.displayName = 'AttributeLabel';
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Attribute/AttributeLabel.tsx
git commit -m "feat(attribute): support horizontal orientation in AttributeLabel"
```

---

### Task 4: Make `AttributeValue` orientation-aware

**Files:**
- Modify: `packages/design-system/src/components/Attribute/AttributeValue.tsx`

In horizontal mode the value must:
- take the remaining horizontal space (`flex-1 min-w-0` — `min-w-0` lets the flex child shrink and lets `truncate` work)
- truncate with ellipsis when content does not fit (`truncate`)
- have `py-4` vertical padding so it baselines with the label cell (replaces the vertical-mode `pt-4`)

In vertical mode behavior is unchanged.

- [ ] **Step 1: Replace `AttributeValue.tsx`**

```tsx
import { Children, type FC, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { useAttributeOrientation } from './AttributeOrientationContext';

export interface AttributeValueProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

function isEmpty(children: ReactNode): boolean {
  return (
    children === undefined ||
    children === null ||
    children === false ||
    Children.count(children) === 0
  );
}

export const AttributeValue: FC<AttributeValueProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('value');
  const orientation = useAttributeOrientation();
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-value'
      className={cn(
        'flex items-center',
        isHorizontal ? 'flex-1 min-w-0 py-4 truncate' : 'pt-4 min-h-[28px]',
        className,
      )}
    >
      {isEmpty(children) ? (
        <Text size='sm' color='secondary'>
          &mdash;
        </Text>
      ) : (
        children
      )}
    </div>
  );
};

AttributeValue.displayName = 'AttributeValue';
```

Note on the `truncate` utility: `truncate` applies `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`. It works on direct text nodes in the value (e.g. `<Text>artem@acme.com, uxd@acme.com</Text>`). For non-text children (Badges, Tags, IpList), the parent's `overflow: hidden` will still clip overflowing siblings — the ellipsis only shows on text. That matches the spec ("if content does not fit it is also clipped with ellipsis"): the ellipsis applies to text content; non-text children are simply clipped.

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @wallarm/design-system typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Attribute/AttributeValue.tsx
git commit -m "feat(attribute): support horizontal orientation in AttributeValue"
```

---

### Task 5: Add Storybook stories for the horizontal orientation

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.stories.tsx`

Add stories that mirror the Figma reference and demonstrate the truncation contract.

- [ ] **Step 1: Append four new stories at the end of `Attribute.stories.tsx`**

```tsx
export const Horizontal: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute orientation='horizontal'>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <Badge color='red' variant='dotted'>
          Blocked
        </Badge>
      </AttributeValue>
    </Attribute>
  </div>
);

export const HorizontalLabelTruncation: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-8'>
    <Attribute orientation='horizontal'>
      <AttributeLabel>Short</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>Fits in 160px label cell</Text>
      </AttributeValue>
    </Attribute>
    <Attribute orientation='horizontal'>
      <AttributeLabel>This label text is much longer than 160 pixels and must be truncated</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>Value</Text>
      </AttributeValue>
    </Attribute>
  </div>
);

export const HorizontalValueTruncation: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute orientation='horizontal'>
      <AttributeLabel>Users</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>
          artem@acme.com, uxd@acme.com, ops@acme.com, security@acme.com, admin@acme.com
        </Text>
      </AttributeValue>
    </Attribute>
  </div>
);

export const HorizontalComposition: StoryFn<AttributeProps> = () => (
  <div className='grid grid-cols-2 gap-x-8 gap-y-6 w-[874px]'>
    <Attribute orientation='horizontal'>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <Badge color='red' variant='dotted'>
          Blocked
        </Badge>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>First seen</AttributeLabel>
      <AttributeValue>
        <FormatDateTime value='2026-04-03T10:15:00Z' />
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Attack type</AttributeLabel>
      <AttributeValue>
        <div className='flex items-center gap-4 flex-wrap'>
          <Tag>XSS</Tag>
          <Tag>BOLA</Tag>
          <Tag>SQL Injection</Tag>
          <Tag>Scanner</Tag>
          <Tag>+5</Tag>
        </div>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Last seen</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>2 Apr, 2026 14:03</Text>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Sessions</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>3 sessions</Text>
      </AttributeValue>
    </Attribute>

    <Attribute orientation='horizontal'>
      <AttributeLabel>Users</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>artem@acme.com, uxd@acme.com</Text>
      </AttributeValue>
    </Attribute>

    <div className='col-span-2'>
      <Attribute orientation='horizontal'>
        <AttributeLabel>IPs</AttributeLabel>
        <AttributeValue>
          <IpList>
            <Ip>
              <IpCountry code='US' />
              <IpAddress>142.198.167.52</IpAddress>
              <IpProvider>Azure</IpProvider>
            </Ip>
            <Ip>
              <IpCountry code='US' />
              <IpAddress>34.74.73.20</IpAddress>
              <IpProvider>AWS</IpProvider>
            </Ip>
            <Ip>
              <IpCountry code='DE' />
              <IpAddress>34.74.73.20</IpAddress>
              <IpProvider>GCP</IpProvider>
            </Ip>
          </IpList>
        </AttributeValue>
      </Attribute>
    </div>
  </div>
);
```

- [ ] **Step 2: Run Storybook locally and visually verify the new stories**

Run: `pnpm --filter @wallarm/design-system storybook`
Expected: Storybook opens. Navigate to `Data Display / Attribute`. Verify:
- `Horizontal` — label and value are on a single row, label is 160px wide.
- `HorizontalLabelTruncation` — second item shows ellipsis on the label.
- `HorizontalValueTruncation` — long text shows ellipsis at the right edge of the container.
- `HorizontalComposition` — matches the Figma reference layout.

- [ ] **Step 3: Format with biome**

Run: `npx biome check --write packages/design-system/src/components/Attribute/Attribute.stories.tsx`
Expected: file formatted, no remaining issues.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/Attribute/Attribute.stories.tsx
git commit -m "docs(attribute): add horizontal orientation stories"
```

---

### Task 6: Verify the existing Loading story still works in horizontal

**Files:**
- Modify (only if needed): `packages/design-system/src/components/Attribute/Attribute.stories.tsx`

The `Loading` story already exists for vertical. Confirm there is no regression in vertical, and add a small horizontal loading story.

- [ ] **Step 1: Append a horizontal loading story to `Attribute.stories.tsx`**

```tsx
export const HorizontalLoading: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-8'>
    <Attribute orientation='horizontal' loading>
      <AttributeLabel>Created at</AttributeLabel>
      <AttributeValue />
    </Attribute>
    <Attribute orientation='horizontal' loading>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue />
    </Attribute>
  </div>
);
```

- [ ] **Step 2: Visually verify in Storybook**

Open `Data Display / Attribute / HorizontalLoading`. Expected: two rows, each containing a small skeleton on the left (label) and a wider skeleton on the right (value), aligned on the same horizontal line.

- [ ] **Step 3: Format and commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/Attribute.stories.tsx
git add packages/design-system/src/components/Attribute/Attribute.stories.tsx
git commit -m "docs(attribute): add horizontal loading story"
```

---

### Task 7: Add E2E coverage (screenshot + interaction-free) for horizontal stories

E2E rules: see `docs/e2e-test-rules.md` (referenced from `.claude/rules/e2e.md`). E2E files are colocated as `*.e2e.ts`.

**Files:**
- Create (or modify, if it already exists): `packages/design-system/src/components/Attribute/Attribute.e2e.ts`

- [ ] **Step 1: Read existing rules**

Run: `cat docs/e2e-test-rules.md | head -120`
Expected: rules describing `test.describe`/`test()` naming and Screenshot/Interaction/Accessibility grouping.

- [ ] **Step 2: Inspect the existing `Attribute.e2e.ts` if present**

Run: `ls packages/design-system/src/components/Attribute/Attribute.e2e.ts 2>/dev/null && cat packages/design-system/src/components/Attribute/Attribute.e2e.ts || echo "no existing e2e file"`

If a file already exists, append to it; otherwise create a new file following the conventions in `docs/e2e-test-rules.md`.

- [ ] **Step 3: Add screenshot tests for the four new stories**

The exact test code depends on the project's e2e helpers (story URL builders, `expect.toHaveScreenshot` style). Follow the same shape as the existing screenshot tests in this package — a representative example to mirror is `packages/design-system/src/components/Alert/Alert.e2e.ts` (or any `*.e2e.ts` already in use). Cover, at minimum:

- `Data Display/Attribute/Horizontal` — visual snapshot
- `Data Display/Attribute/HorizontalLabelTruncation` — visual snapshot (proves ellipsis on the long label)
- `Data Display/Attribute/HorizontalValueTruncation` — visual snapshot (proves ellipsis on the long value)
- `Data Display/Attribute/HorizontalComposition` — visual snapshot (matches Figma reference)

- [ ] **Step 4: Run the e2e tests for this component locally**

Run: `pnpm --filter @wallarm/design-system test:e2e -- --grep "Attribute"`
Expected: tests run; first run will likely fail because the screenshots are missing. Generate them with the project's standard update flow (see `CLAUDE.md` → `[update-screenshots]` commit trigger) or, locally, by re-running the command with the project's update flag.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Attribute/Attribute.e2e.ts
git add packages/design-system/src/components/Attribute/__screenshots__/ || true
git commit -m "test(attribute): add screenshot tests for horizontal orientation"
```

If the local environment cannot generate the screenshots reliably, instead commit only the test file and add `[update-screenshots]` to the commit message so CI updates the snapshots:

```bash
git add packages/design-system/src/components/Attribute/Attribute.e2e.ts
git commit -m "test(attribute): add horizontal screenshot tests [update-screenshots]"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run typecheck across the workspace**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 2: Run unit tests**

Run: `pnpm --filter @wallarm/design-system test`
Expected: PASS

- [ ] **Step 3: Run lint/format on the changed files**

Run: `npx biome check --write packages/design-system/src/components/Attribute`
Expected: clean (no remaining diagnostics).

- [ ] **Step 4: Open the PR**

Run: `gh pr create --title "feat(attribute): add horizontal orientation"` with a body that links the Figma node and lists the new stories.

---

## Self-Review Notes

- **Spec coverage:**
  - "Add prop, default vertical" — Task 2.
  - "Horizontal layout per Figma" — Tasks 2/3/4.
  - "Label width 100/160" — Task 3 (`min-w-[100px] max-w-[160px] w-[160px]`).
  - "Label truncates with ellipsis when text > max width" — Task 3 (`truncate`).
  - "Value truncates with ellipsis when content does not fit" — Task 4 (`truncate` + `min-w-0`).
  - "New story" — Tasks 5 & 6.
- **Backward compatibility:** Vertical mode (current default) keeps its exact class strings except where `gap-4 py-2` was conditioned on `loading`. The vertical loading branch keeps the same skeleton sizes and gap as before.
- **Type consistency:** `AttributeOrientation` is defined once and re-used in `Attribute.tsx`; `useAttributeOrientation` returns the same union; sub-components compute `isHorizontal` from the same value. No drifting names.
