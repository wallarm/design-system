# HorizontalBar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `HorizontalBar` chart to the `SimpleCharts` family — a headline number + optional delta chip + a single proportional segmented bar + an optional horizontal legend.

**Architecture:** One data-driven React component. `data: HorizontalBarDatum[]` is the single source of truth for both the bar and the legend, so their colors match automatically. Colors resolve to CSS variables via the family's `resolveChartColor()` and are applied inline (segment `backgroundColor`, dot `backgroundColor`) — the same mechanism `PieChartDonut` uses for slice `fill`. Segment sizing is `flexGrow`. The card frame + title is composed externally with the existing `Chart`/`ChartHeader`/`ChartTitle`.

**Tech Stack:** React 19, TypeScript (strict), Tailwind (px-named scale), class-variance-authority, Vitest + Testing Library (unit), Playwright (E2E), Storybook, `@figma/code-connect`.

> **Command note:** the package's `test` script is `vitest` (watch mode). Every unit-test step below uses `test:run` (one-shot). `test:run <pattern>` runs only files whose path matches `<pattern>`.

**Spec:** `docs/superpowers/specs/2026-07-01-horizontal-bar-design.md`

## Global Constraints

- Component rules (`.claude/rules/component-development.md`): CVA in `classes.ts`; merge classes with `cn()` from `../../../utils/cn`; `data-slot='horizontal-bar'` on root (kebab-case); `HorizontalBar.displayName = 'HorizontalBar'`; accept `ref?: Ref<HTMLDivElement>` and forward it; named exports only; export `{ HorizontalBar, type HorizontalBarProps }` from `index.ts`.
- Forbidden: `any`; inline styles **for styling** (dynamic per-datum color and `flexGrow` are values, allowed — precedent: `BarListBar` uses inline `width: calc(...)`); hardcoded hex colors (use tokens / `resolveChartColor`); `React.forwardRef` (use the `ref` prop); default exports; `useEffect` for derived state.
- SimpleCharts family rules (`SimpleCharts/CLAUDE.md`): one chart per folder; local `index.ts` barrel; reuse family primitives (`ChartColor`, `resolveChartColor`, `Chart`) rather than reinventing; story title `Data display/SimpleCharts/HorizontalBar`; story `parameters.design.url` + a `*.figma.tsx` binding both point at the Figma node; keep a living doc at `SimpleCharts/docs/HorizontalBar.md`.
- Test-id rule (`.claude/rules/test-id.md`): wrap children in `TestIdProvider`; internal parts call `useTestId('slot')` → `{base}--{slot}`; clean DOM (no `data-testid`) when no `data-testid` is passed.
- Conventional commits. End every commit message with the trailer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Figma node: `https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883`
- Token facts: `resolveChartColor('slate')` → `var(--color-badge-slate-dark-alt)`, `'brand'` → `var(--color-w-orange-500)`, others → `var(--color-{color}-500)`. Remainder tail color = `var(--color-bg-strong-primary)` (dark-mode-aware; light = `#cad5e2` = Figma `azure-84`). Delta badge = `<Badge type='secondary' color='w-orange' size='medium'>`. Icons `ArrowUp` / `ArrowDown` from `../../../icons`.

---

## File Structure

All paths under `packages/design-system/src/components/SimpleCharts/HorizontalBar/` unless noted.

- `constants.ts` — `HORIZONTAL_BAR_PALETTE: ChartColor[]` (auto-cycle order) + `REMAINDER_KEY`.
- `classes.ts` — static class strings + CVA (none with variants yet; plain strings).
- `lib/resolveSegments.ts` — pure fn: `data + total → ResolvedSegment[]` (sanitize, auto-color, remainder). Unit-tested in isolation.
- `HorizontalBar.tsx` — root component: types (`HorizontalBarDatum`, `HorizontalBarProps`), header (value + delta), bar (segments), legend.
- `index.ts` — local barrel.
- `HorizontalBar.test.tsx` — Vitest unit/component tests.
- `HorizontalBar.stories.tsx` — Storybook stories.
- `HorizontalBar.e2e.ts` — Playwright screenshots + a11y.
- `HorizontalBar.figma.tsx` — Code Connect binding.
- `../docs/HorizontalBar.md` — living doc.
- Modify `../index.ts` (SimpleCharts barrel) and `packages/design-system/src/index.ts` (top-level barrel) — add exports.

---

## Task 1: Scaffold — folder, types, root skeleton, registration

**Files:**
- Create: `SimpleCharts/HorizontalBar/HorizontalBar.tsx`
- Create: `SimpleCharts/HorizontalBar/classes.ts`
- Create: `SimpleCharts/HorizontalBar/index.ts`
- Create: `SimpleCharts/HorizontalBar/HorizontalBar.test.tsx`
- Modify: `SimpleCharts/index.ts` (add barrel export)
- Modify: `packages/design-system/src/index.ts` (add top-level export, alphabetical)

**Interfaces:**
- Produces:
  - `interface HorizontalBarDatum { name: string; value: number; color?: ChartColor; className?: string }`
  - `interface HorizontalBarProps extends HTMLAttributes<HTMLDivElement>, TestableProps { ref?: Ref<HTMLDivElement>; data: HorizontalBarDatum[]; value?: number; delta?: { value: number; trend?: 'up' | 'down' }; total?: number; legend?: boolean }`
  - `const HorizontalBar: FC<HorizontalBarProps>`

- [ ] **Step 1: Write the failing test**

Create `SimpleCharts/HorizontalBar/HorizontalBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HorizontalBar } from './HorizontalBar';

describe('HorizontalBar — root', () => {
  it('renders the root with data-slot and forwards data-testid + extra props', () => {
    render(
      <HorizontalBar
        data-testid='hb'
        data={[{ name: 'A', value: 1 }]}
        aria-label='distribution'
        className='custom-class'
      />,
    );
    const root = screen.getByTestId('hb');
    expect(root).toHaveAttribute('data-slot', 'horizontal-bar');
    expect(root).toHaveAttribute('aria-label', 'distribution');
    expect(root).toHaveClass('custom-class');
  });

  it('keeps the DOM clean when no data-testid is passed', () => {
    const { container } = render(<HorizontalBar data={[{ name: 'A', value: 1 }]} />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: FAIL — `Cannot find module './HorizontalBar'`.

- [ ] **Step 3: Create `classes.ts`**

```ts
export const horizontalBarRootClasses = ['flex flex-col w-full'].join(' ');
```

- [ ] **Step 4: Create the minimal root in `HorizontalBar.tsx`**

```tsx
import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import type { ChartColor } from '../types';
import { horizontalBarRootClasses } from './classes';

export interface HorizontalBarDatum {
  /** Legend label, React key, and `data-name` hook. */
  name: string;
  /** Segment size; proportional to the bar total. */
  value: number;
  /** Built-in palette; resolves via `resolveChartColor`. Omitted → auto-assigned by index. */
  color?: ChartColor;
  /** Tailwind `bg-*` escape hatch; wins over `color` (inline fill is skipped). */
  className?: string;
}

export interface HorizontalBarProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Segments + legend. One array drives both, so colors stay in sync. */
  data: HorizontalBarDatum[];
  /** Headline number, rendered as `value.toLocaleString('en-US')`. Omitted → header hidden. */
  value?: number;
  /** Delta chip. Rendered as an internal Badge (arrow + number). Omitted → no chip. */
  delta?: { value: number; trend?: 'up' | 'down' };
  /** Bar denominator. `> sum(data.value)` → grey remainder tail. Default: `sum(data.value)`. */
  total?: number;
  /** Show/hide the legend. Default: true. */
  legend?: boolean;
}

export const HorizontalBar: FC<HorizontalBarProps> = ({
  data,
  value,
  delta,
  total,
  legend = true,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='horizontal-bar'
        data-testid={testId}
        className={cn(horizontalBarRootClasses, className)}
      >
        {/* header + bar + legend added in later tasks */}
      </div>
    </TestIdProvider>
  );
};

HorizontalBar.displayName = 'HorizontalBar';
```

- [ ] **Step 5: Create the local barrel `index.ts`**

```ts
export {
  HorizontalBar,
  type HorizontalBarDatum,
  type HorizontalBarProps,
} from './HorizontalBar';
```

- [ ] **Step 6: Register in the SimpleCharts barrel**

In `SimpleCharts/index.ts`, add (alphabetically, after the `Chart` block / before `LineChart`):

```ts
export {
  HorizontalBar,
  type HorizontalBarDatum,
  type HorizontalBarProps,
} from './HorizontalBar';
```

- [ ] **Step 7: Register in the top-level barrel**

In `packages/design-system/src/index.ts`, add the exports alphabetically. The three symbols are already re-exported by `./components/SimpleCharts`; add:

```ts
export {
  HorizontalBar,
  type HorizontalBarDatum,
  type HorizontalBarProps,
} from './components/SimpleCharts';
```

(Place near the other `SimpleCharts` re-exports; if the file re-exports the whole family from one block, add the three symbols to that block instead of a new statement.)

- [ ] **Step 8: Run test + typecheck**

Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: PASS (both tests).
Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add packages/design-system/src/components/SimpleCharts/HorizontalBar packages/design-system/src/components/SimpleCharts/index.ts packages/design-system/src/index.ts
git commit -m "feat(simple-charts): scaffold HorizontalBar root + exports

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Segmented bar — segment resolution + rendering

**Files:**
- Create: `SimpleCharts/HorizontalBar/constants.ts`
- Create: `SimpleCharts/HorizontalBar/lib/resolveSegments.ts`
- Modify: `SimpleCharts/HorizontalBar/classes.ts`
- Modify: `SimpleCharts/HorizontalBar/HorizontalBar.tsx`
- Modify: `SimpleCharts/HorizontalBar/HorizontalBar.test.tsx`

**Interfaces:**
- Consumes: `HorizontalBarDatum` (Task 1), `ChartColor` + `resolveChartColor` from the family (`../types`, `../lib/chartPalette`).
- Produces:
  - `interface ResolvedSegment { key: string; value: number; color?: ChartColor; className?: string; isRemainder: boolean }`
  - `function resolveSegments(data: HorizontalBarDatum[], total?: number): ResolvedSegment[]`
  - `const REMAINDER_KEY = '__horizontal-bar-remainder__'`
  - `const HORIZONTAL_BAR_PALETTE: ChartColor[]`
  - Bar DOM: `data-slot='horizontal-bar-bar'` (wrapper) and repeated `data-slot='horizontal-bar-segment'` with `data-name` (real segments) / `data-remainder='true'` (tail).

- [ ] **Step 1: Write the failing test for `resolveSegments`**

Add to `HorizontalBar.test.tsx`:

```tsx
import { resolveSegments } from './lib/resolveSegments';

describe('resolveSegments', () => {
  it('preserves order, auto-assigns colors by index when omitted, keeps explicit colors', () => {
    const out = resolveSegments([
      { name: 'A', value: 3, color: 'blue' },
      { name: 'B', value: 2 },
    ]);
    expect(out.map(s => s.key)).toEqual(['A', 'B']);
    expect(out[0].color).toBe('blue');
    expect(out[1].color).toBeDefined(); // auto-assigned, not undefined
    expect(out.every(s => !s.isRemainder)).toBe(true);
  });

  it('coerces negative and non-finite values to 0', () => {
    const out = resolveSegments([
      { name: 'A', value: -5 },
      { name: 'B', value: Number.NaN },
      { name: 'C', value: Number.POSITIVE_INFINITY },
    ]);
    expect(out.map(s => s.value)).toEqual([0, 0, 0]);
  });

  it('appends a remainder segment when total exceeds the sum', () => {
    const out = resolveSegments([{ name: 'A', value: 3 }], 10);
    expect(out).toHaveLength(2);
    expect(out[1]).toMatchObject({ isRemainder: true, value: 7 });
  });

  it('adds no remainder when total is omitted, <= sum, or non-finite', () => {
    expect(resolveSegments([{ name: 'A', value: 3 }])).toHaveLength(1);
    expect(resolveSegments([{ name: 'A', value: 3 }], 2)).toHaveLength(1);
    expect(resolveSegments([{ name: 'A', value: 3 }], Number.NaN)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: FAIL — `Cannot find module './lib/resolveSegments'`.

- [ ] **Step 3: Create `constants.ts`**

```ts
import type { ChartColor } from '../types';

/** Reserved key for the auto-generated remainder tail (must not collide with a datum name). */
export const REMAINDER_KEY = '__horizontal-bar-remainder__';

/**
 * Auto-cycle order for data without an explicit `color`. Leads with the
 * warm hues used in the Figma reference (red → brand/w-orange → amber).
 */
export const HORIZONTAL_BAR_PALETTE: ChartColor[] = [
  'red',
  'brand',
  'amber',
  'blue',
  'green',
  'purple',
  'teal',
  'cyan',
  'indigo',
  'pink',
  'rose',
  'slate',
];
```

- [ ] **Step 4: Create `lib/resolveSegments.ts`**

```ts
import type { HorizontalBarDatum } from '../HorizontalBar';
import type { ChartColor } from '../../types';
import { HORIZONTAL_BAR_PALETTE, REMAINDER_KEY } from '../constants';

export interface ResolvedSegment {
  key: string;
  value: number;
  color?: ChartColor;
  className?: string;
  isRemainder: boolean;
}

const sanitize = (n: number): number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0;

export function resolveSegments(
  data: HorizontalBarDatum[],
  total?: number,
): ResolvedSegment[] {
  const segments: ResolvedSegment[] = data.map((d, i) => ({
    key: d.name,
    value: sanitize(d.value),
    color: d.color ?? HORIZONTAL_BAR_PALETTE[i % HORIZONTAL_BAR_PALETTE.length],
    className: d.className,
    isRemainder: false,
  }));

  const sum = segments.reduce((s, seg) => s + seg.value, 0);
  const hasTotal = typeof total === 'number' && Number.isFinite(total) && total > sum;
  const remainder = hasTotal ? total - sum : 0;

  if (remainder > 0) {
    segments.push({ key: REMAINDER_KEY, value: remainder, isRemainder: true });
  }

  return segments;
}
```

- [ ] **Step 5: Add bar classes to `classes.ts`**

```ts
export const horizontalBarBarWrapperClasses = ['px-16 py-8 w-full'].join(' ');

export const horizontalBarBarClasses = [
  'flex h-8 w-full overflow-hidden rounded-4',
].join(' ');

export const horizontalBarSegmentClasses = ['h-full min-w-px'].join(' ');
```

- [ ] **Step 6: Render the bar in `HorizontalBar.tsx`**

Add imports:

```tsx
import { useMemo } from 'react';
import { useTestId } from '../../../utils/testId';
import { resolveChartColor } from '../lib/chartPalette';
import {
  horizontalBarBarClasses,
  horizontalBarBarWrapperClasses,
  horizontalBarSegmentClasses,
} from './classes';
import { resolveSegments } from './lib/resolveSegments';
```

Inside the component body, before `return`:

```tsx
  const segments = useMemo(() => resolveSegments(data, total), [data, total]);
  const barTestId = useTestId('bar');
```

Render the bar as the second child of the root `<div>` (header will be inserted before it in Task 3):

```tsx
        <div data-slot='horizontal-bar-bar-wrapper' className={horizontalBarBarWrapperClasses}>
          <div
            data-slot='horizontal-bar-bar'
            data-testid={barTestId}
            aria-hidden='true'
            className={horizontalBarBarClasses}
          >
            {segments.map(seg => (
              <div
                key={seg.key}
                data-slot='horizontal-bar-segment'
                data-name={seg.isRemainder ? undefined : seg.key}
                data-remainder={seg.isRemainder ? 'true' : undefined}
                className={cn(horizontalBarSegmentClasses, seg.className)}
                style={{
                  flexGrow: seg.value,
                  flexBasis: 0,
                  backgroundColor: seg.isRemainder
                    ? 'var(--color-bg-strong-primary)'
                    : seg.className
                      ? undefined
                      : resolveChartColor(seg.color),
                }}
              />
            ))}
          </div>
        </div>
```

- [ ] **Step 7: Write the failing render test for the bar**

Add to `HorizontalBar.test.tsx`:

```tsx
describe('HorizontalBar — bar rendering', () => {
  it('renders one segment per datum with matching data-name and resolved color', () => {
    render(
      <HorizontalBar
        data-testid='hb'
        data={[
          { name: 'Critical', value: 5, color: 'red' },
          { name: 'High', value: 3, color: 'amber' },
        ]}
      />,
    );
    const segs = document.querySelectorAll('[data-slot="horizontal-bar-segment"]');
    expect(segs).toHaveLength(2);
    expect(segs[0]).toHaveAttribute('data-name', 'Critical');
    expect((segs[0] as HTMLElement).style.backgroundColor).toBe('var(--color-red-500)');
    expect((segs[0] as HTMLElement).style.flexGrow).toBe('5');
  });

  it('renders a remainder segment (no data-name) when total exceeds the sum', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 3 }]} total={10} />);
    const remainder = document.querySelector('[data-slot="horizontal-bar-segment"][data-remainder="true"]');
    expect(remainder).not.toBeNull();
    expect((remainder as HTMLElement).style.backgroundColor).toBe('var(--color-bg-strong-primary)');
    expect(remainder).not.toHaveAttribute('data-name');
  });

  it('lets a datum className win over the inline color', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1, className: 'bg-sky-500' }]} />);
    const seg = document.querySelector('[data-slot="horizontal-bar-segment"]') as HTMLElement;
    expect(seg).toHaveClass('bg-sky-500');
    expect(seg.style.backgroundColor).toBe('');
  });
});
```

- [ ] **Step 8: Run tests + typecheck**

Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: PASS (all `resolveSegments` + bar tests).
Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add packages/design-system/src/components/SimpleCharts/HorizontalBar
git commit -m "feat(simple-charts): HorizontalBar segmented bar + remainder

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Header — value + delta badge

**Files:**
- Modify: `SimpleCharts/HorizontalBar/classes.ts`
- Modify: `SimpleCharts/HorizontalBar/HorizontalBar.tsx`
- Modify: `SimpleCharts/HorizontalBar/HorizontalBar.test.tsx`

**Interfaces:**
- Consumes: `value?: number`, `delta?: { value: number; trend?: 'up' | 'down' }` (Task 1); `Badge` from `../../Badge`; `ArrowUp` / `ArrowDown` from `../../../icons`.
- Produces: header DOM `data-slot='horizontal-bar-header'` (rendered only when `value` or `delta` is set), value `data-slot='horizontal-bar-value'`, delta `<Badge>` with an accessible label `"up 10"` / `"down 5"`.

- [ ] **Step 1: Write the failing tests**

Add to `HorizontalBar.test.tsx`:

```tsx
describe('HorizontalBar — header', () => {
  it('renders the value with locale formatting', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1 }]} value={12345} />);
    const value = document.querySelector('[data-slot="horizontal-bar-value"]');
    expect(value).toHaveTextContent('12,345');
  });

  it('renders no header when both value and delta are absent', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1 }]} />);
    expect(document.querySelector('[data-slot="horizontal-bar-header"]')).toBeNull();
  });

  it('renders a delta badge with an up label and absolute value', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1 }]} delta={{ value: 10 }} />);
    const badge = screen.getByLabelText('up 10');
    expect(badge).toHaveTextContent('10');
  });

  it('uses trend for direction over sign; shows the absolute number', () => {
    render(<HorizontalBar data={[{ name: 'A', value: 1 }]} delta={{ value: 5, trend: 'down' }} />);
    expect(screen.getByLabelText('down 5')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: FAIL — no `horizontal-bar-value` / no element labeled `up 10`.

- [ ] **Step 3: Add header classes to `classes.ts`**

```ts
export const horizontalBarHeaderClasses = [
  'flex items-baseline gap-8 px-16 pt-8',
].join(' ');

export const horizontalBarValueClasses = [
  'text-3xl font-medium leading-3xl text-text-primary',
].join(' ');
```

- [ ] **Step 4: Render the header in `HorizontalBar.tsx`**

Add imports:

```tsx
import { ArrowDown, ArrowUp } from '../../../icons';
import { Badge } from '../../Badge';
import { horizontalBarHeaderClasses, horizontalBarValueClasses } from './classes';
```

Add derived values in the component body (before `return`):

```tsx
  const valueTestId = useTestId('value');
  const hasValue = typeof value === 'number';
  const hasDelta = !!delta;
  const deltaDirection = delta ? (delta.trend ?? (delta.value >= 0 ? 'up' : 'down')) : null;
  const deltaAbs = delta ? Math.abs(delta.value) : 0;
```

Render the header as the FIRST child of the root `<div>` (before the bar wrapper):

```tsx
        {(hasValue || hasDelta) && (
          <div data-slot='horizontal-bar-header' className={horizontalBarHeaderClasses}>
            {hasValue && (
              <span
                data-slot='horizontal-bar-value'
                data-testid={valueTestId}
                className={horizontalBarValueClasses}
              >
                {value.toLocaleString('en-US')}
              </span>
            )}
            {delta && (
              <Badge
                type='secondary'
                color='w-orange'
                size='medium'
                aria-label={`${deltaDirection} ${deltaAbs}`}
              >
                {deltaDirection === 'up' ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
                {deltaAbs.toLocaleString('en-US')}
              </Badge>
            )}
          </div>
        )}
```

- [ ] **Step 5: Run tests + typecheck**

Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: PASS (all header tests).
Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: no errors. (If `ArrowUp` rejects `aria-hidden`, wrap in `<span aria-hidden className='inline-flex'>…</span>` instead and re-run.)

- [ ] **Step 6: Commit**

```bash
git add packages/design-system/src/components/SimpleCharts/HorizontalBar
git commit -m "feat(simple-charts): HorizontalBar value + delta header

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Legend — auto-derived dots + toggle + a11y fallback

**Files:**
- Modify: `SimpleCharts/HorizontalBar/classes.ts`
- Modify: `SimpleCharts/HorizontalBar/HorizontalBar.tsx`
- Modify: `SimpleCharts/HorizontalBar/HorizontalBar.test.tsx`

**Interfaces:**
- Consumes: `legend: boolean` (Task 1, default true); `segments` (Task 2) — legend renders only the **non-remainder** segments so the grey tail never appears in the legend; `resolveChartColor` (Task 2).
- Produces: legend DOM `data-slot='horizontal-bar-legend'`, items `data-slot='horizontal-bar-legend-item'` with `data-name`, dots `data-slot='horizontal-bar-legend-dot'`. When `legend={false}`, the bar wrapper gets an `aria-label` summarizing the segments.

- [ ] **Step 1: Write the failing tests**

Add to `HorizontalBar.test.tsx`:

```tsx
describe('HorizontalBar — legend', () => {
  const data = [
    { name: 'Critical', value: 5, color: 'red' as const },
    { name: 'High', value: 3, color: 'amber' as const },
  ];

  it('renders one legend item per datum with a color-matched dot', () => {
    render(<HorizontalBar data={data} total={10} />);
    const items = document.querySelectorAll('[data-slot="horizontal-bar-legend-item"]');
    expect(items).toHaveLength(2); // remainder excluded
    expect(items[0]).toHaveTextContent('Critical');
    const dot = items[0].querySelector('[data-slot="horizontal-bar-legend-dot"]') as HTMLElement;
    expect(dot.style.backgroundColor).toBe('var(--color-red-500)');
  });

  it('hides the legend when legend={false} and summarizes the bar via aria-label', () => {
    render(<HorizontalBar data={data} legend={false} />);
    expect(document.querySelector('[data-slot="horizontal-bar-legend"]')).toBeNull();
    const bar = document.querySelector('[data-slot="horizontal-bar-bar"]') as HTMLElement;
    expect(bar).toHaveAttribute('aria-label', 'Critical 5, High 3');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: FAIL — no legend elements / no `aria-label` on the bar.

- [ ] **Step 3: Add legend classes to `classes.ts`**

```ts
export const horizontalBarLegendClasses = [
  'flex flex-row flex-wrap items-center gap-6 px-12 py-2',
].join(' ');

export const horizontalBarLegendItemClasses = [
  'inline-flex items-center gap-4 px-4 py-2',
].join(' ');

export const horizontalBarLegendDotClasses = ['inline-block size-8 rounded-2 shrink-0'].join(' ');

export const horizontalBarLegendLabelClasses = ['text-xs font-mono text-text-primary'].join(' ');
```

- [ ] **Step 4: Compute the legend items + aria summary in `HorizontalBar.tsx`**

Add imports:

```tsx
import {
  horizontalBarLegendClasses,
  horizontalBarLegendDotClasses,
  horizontalBarLegendItemClasses,
  horizontalBarLegendLabelClasses,
} from './classes';
```

Add derived values (before `return`):

```tsx
  const legendTestId = useTestId('legend');
  const legendItemTestId = useTestId('legend-item');
  const legendSegments = useMemo(() => segments.filter(s => !s.isRemainder), [segments]);
  const barAriaLabel = useMemo(
    () => (legend ? undefined : legendSegments.map(s => `${s.key} ${s.value}`).join(', ')),
    [legend, legendSegments],
  );
```

Set the summary on the bar — update the bar `<div>` from Task 2 so its `aria-*` reflects the legend state:

```tsx
          <div
            data-slot='horizontal-bar-bar'
            data-testid={barTestId}
            aria-hidden={legend ? 'true' : undefined}
            aria-label={barAriaLabel}
            className={horizontalBarBarClasses}
          >
```

Render the legend as the LAST child of the root `<div>` (after the bar wrapper):

```tsx
        {legend && legendSegments.length > 0 && (
          <div
            data-slot='horizontal-bar-legend'
            data-testid={legendTestId}
            className={horizontalBarLegendClasses}
          >
            {legendSegments.map(seg => (
              <span
                key={seg.key}
                data-slot='horizontal-bar-legend-item'
                data-testid={legendItemTestId}
                data-name={seg.key}
                className={horizontalBarLegendItemClasses}
              >
                <span
                  data-slot='horizontal-bar-legend-dot'
                  aria-hidden='true'
                  className={cn(horizontalBarLegendDotClasses, seg.className)}
                  style={{
                    backgroundColor: seg.className ? undefined : resolveChartColor(seg.color),
                  }}
                />
                <span className={horizontalBarLegendLabelClasses}>{seg.key}</span>
              </span>
            ))}
          </div>
        )}
```

- [ ] **Step 5: Run tests + typecheck**

Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: PASS (all legend tests + earlier tests still green).
Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: no errors.

- [ ] **Step 6: Lint**

Run: `pnpm --filter @wallarm-org/design-system lint`
Expected: no errors (run `pnpm lint:fix` if formatting drifts).

- [ ] **Step 7: Commit**

```bash
git add packages/design-system/src/components/SimpleCharts/HorizontalBar
git commit -m "feat(simple-charts): HorizontalBar legend + a11y fallback

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Stories + Figma Code Connect

**Files:**
- Create: `SimpleCharts/HorizontalBar/HorizontalBar.stories.tsx`
- Create: `SimpleCharts/HorizontalBar/HorizontalBar.figma.tsx`

**Interfaces:**
- Consumes: `HorizontalBar`, `HorizontalBarDatum` (Task 1–4); `Chart`, `ChartHeader`, `ChartTitle` from `../Chart/*`; `ChartColor` from `../types`.
- Produces: stories `Default`, `NoDelta`, `NoValue`, `WithRemainder`, `LegendOff`, `Palette`, `Empty`; a `figma.connect(HorizontalBar, …)` binding.

- [ ] **Step 1: Write `HorizontalBar.stories.tsx`**

```tsx
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import type { ChartColor } from '../types';
import { HorizontalBar, type HorizontalBarDatum, type HorizontalBarProps } from './HorizontalBar';

const figmaUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883';

const severityData: HorizontalBarDatum[] = [
  { name: 'Critical', value: 42, color: 'red' },
  { name: 'High', value: 31, color: 'brand' },
  { name: 'Medium', value: 18, color: 'amber' },
];

const meta = {
  title: 'Data display/SimpleCharts/HorizontalBar',
  component: HorizontalBar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: figmaUrl },
    docs: {
      description: {
        component:
          'A single proportional segmented bar with a headline value, an optional delta badge, and an optional horizontal legend. Composed inside a `Chart` card.',
      },
    },
  },
  argTypes: {
    data: { control: false },
    delta: { control: false },
    ref: { control: false },
    className: { control: 'text' },
  },
} satisfies Meta<typeof HorizontalBar>;

export default meta;

const Frame: StoryFn<HorizontalBarProps> = args => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Findings by severity</ChartTitle>
      </ChartHeader>
      <HorizontalBar {...args} />
    </Chart>
  </div>
);

export const Default: StoryFn<HorizontalBarProps> = Frame.bind({});
Default.args = { data: severityData, value: 91, delta: { value: 10, trend: 'up' } };

export const NoDelta: StoryFn<HorizontalBarProps> = Frame.bind({});
NoDelta.args = { data: severityData, value: 91 };

export const NoValue: StoryFn<HorizontalBarProps> = Frame.bind({});
NoValue.args = { data: severityData };

export const WithRemainder: StoryFn<HorizontalBarProps> = Frame.bind({});
WithRemainder.args = { data: severityData, value: 91, total: 120, delta: { value: 4, trend: 'down' } };

export const LegendOff: StoryFn<HorizontalBarProps> = Frame.bind({});
LegendOff.args = { data: severityData, value: 91, legend: false };

const PALETTE: ChartColor[] = ['red', 'brand', 'amber', 'blue', 'green', 'purple'];
export const Palette: StoryFn<HorizontalBarProps> = Frame.bind({});
Palette.args = {
  data: PALETTE.map((color, i) => ({ name: color, value: 10 + i, color })),
  value: 75,
};

export const Empty: StoryFn<HorizontalBarProps> = Frame.bind({});
Empty.args = { data: [] };
```

- [ ] **Step 2: Write `HorizontalBar.figma.tsx`**

```tsx
import figma from '@figma/code-connect';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { HorizontalBar, type HorizontalBarDatum } from './HorizontalBar';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883';

const sampleData: HorizontalBarDatum[] = [
  { name: 'Critical', value: 42, color: 'red' },
  { name: 'High', value: 31, color: 'brand' },
  { name: 'Medium', value: 18, color: 'amber' },
];

figma.connect(HorizontalBar, figmaNodeUrl, {
  props: {
    title: figma.string('Title'),
  },
  example: ({ title }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <HorizontalBar data={sampleData} value={91} delta={{ value: 10, trend: 'up' }} />
    </Chart>
  ),
});
```

- [ ] **Step 3: Verify stories build / render**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: no errors.
Run: `pnpm --filter @wallarm-org/design-system storybook` (or the repo's storybook dev script), open `Data display/SimpleCharts/HorizontalBar`, and confirm every story renders and visually matches the Figma screenshot (segment order/colors, delta chip, legend dots, remainder tail on `WithRemainder`). Tune the paddings in `classes.ts` (`px-16` header/bar, `px-12` legend) against the screenshot if spacing is off. Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/SimpleCharts/HorizontalBar
git commit -m "feat(simple-charts): HorizontalBar stories + code connect

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: E2E screenshots + a11y + living doc

**Files:**
- Create: `SimpleCharts/HorizontalBar/HorizontalBar.e2e.ts`
- Create: `SimpleCharts/docs/HorizontalBar.md`

**Interfaces:**
- Consumes: story ids from Task 5 (`Default`, `WithRemainder`, `LegendOff`, `Empty`); the `createStoryHelper` id is derived from the story title → `data-display-simplecharts-horizontalbar`.

- [ ] **Step 1: Write `HorizontalBar.e2e.ts`**

```ts
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('data-display-simplecharts-horizontalbar', [
  'Default',
  'No Delta',
  'No Value',
  'With Remainder',
  'Legend Off',
  'Palette',
  'Empty',
] as const);

test.describe('HorizontalBar', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await story.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('With Remainder', async ({ page }) => {
      await story.goto(page, 'With Remainder');
      await expect(page).toHaveScreenshot();
    });

    test('Legend Off', async ({ page }) => {
      await story.goto(page, 'Legend Off');
      await expect(page).toHaveScreenshot();
    });

    test('Empty', async ({ page }) => {
      await story.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Accessibility', () => {
    test('legend mirrors the bar; bar is aria-hidden by default', async ({ page }) => {
      await story.goto(page, 'Default');
      const bar = page.locator('[data-slot=horizontal-bar-bar]');
      await expect(bar).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('[data-slot=horizontal-bar-legend-item]')).toHaveCount(3);
    });

    test('bar carries an aria-label summary when the legend is hidden', async ({ page }) => {
      await story.goto(page, 'Legend Off');
      const bar = page.locator('[data-slot=horizontal-bar-bar]');
      await expect(bar).toHaveAttribute('aria-label', /Critical 42/);
      await expect(page.locator('[data-slot=horizontal-bar-legend]')).toHaveCount(0);
    });
  });
});
```

- [ ] **Step 2: Generate screenshot baselines**

Run the repo's E2E screenshot-update command for this file (mirror how `PieChart.e2e.ts` baselines are produced — typically the Playwright run with `--update-snapshots` against the containerized/dev Storybook). Confirm `HorizontalBar.e2e.ts-snapshots/` is created with `Default`, `With Remainder`, `Legend Off`, `Empty` PNGs.
Expected: 4 baseline PNGs written; a second run passes clean.

- [ ] **Step 3: Write the living doc `../docs/HorizontalBar.md`**

Include the required family sections (Overview, Figma, Data model, States, Interactions, Edge cases & unclear states, Accessibility notes, Open questions). Content, verbatim:

```markdown
# HorizontalBar

## Overview

`HorizontalBar` is a compact distribution stat: a headline number, an optional delta badge, a single proportional segmented bar (colored segments + an optional grey remainder tail), and an optional horizontal legend. It renders the body only — the card frame and "Title" header are composed with the existing `Chart` / `ChartHeader` / `ChartTitle`, like every other member of the family. Use it when one total reads naturally as a few named parts shown as a single band; when each part needs its own row, use `BarList`.

## Figma

- Root: https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883

## Data model

- `data` (required, `HorizontalBarDatum[]`) — drives both the bar segments and the legend, so their colors always match. Order is preserved (the caller sorts). Non-finite / negative values are coerced to `0`. No aggregation or "Other" bucketing.
- `value` (optional, `number`) — the headline number, rendered as `value.toLocaleString('en-US')`. Omitted → the header row is not rendered (unless a delta is present).
- `delta` (optional, `{ value: number; trend?: 'up' | 'down' }`) — rendered as an internal `Badge` (`type='secondary'`, `color='w-orange'`) with an up/down arrow and the absolute value. Direction comes from `trend`, else the sign of `value`.
- `total` (optional, `number`) — the bar denominator. When `total > sum(data.value)`, a grey remainder tail fills `(total − sum)`. Defaults to the sum (no tail). `total <= sum` or non-finite is ignored.
- `legend` (optional, `boolean`, default `true`) — show/hide the legend.

`HorizontalBarDatum.color` uses the family `ChartColor` palette; omit it to auto-assign by index (`HORIZONTAL_BAR_PALETTE`). `HorizontalBarDatum.className` (a Tailwind `bg-*`) overrides the resolved color on both the segment and the legend dot.

## States

| State | Trigger | Behaviour |
| --- | --- | --- |
| Default | `data` with ≥1 segment | Segments sized by value and colored via `resolveChartColor`; legend mirrors them. |
| No value | `value` undefined | Headline number omitted; header row hidden if `delta` is also absent. |
| No delta | `delta` undefined | No chip. |
| Remainder | `total > sum(data.value)` | Grey tail (`--color-bg-strong-primary`) fills the gap; not shown in the legend. |
| Legend off | `legend={false}` | Bar + header only; the bar gains an `aria-label` summary. |
| Empty | `data.length === 0` | Bar renders an empty rounded track; legend hidden. Prefer swapping in `<ChartEmpty />` for an explicit empty body. |

## Interactions

None in v1 — the component is display-only. No hover-sync or click-to-filter (contrast `PieChart`'s legend). Add later if a use case appears.

## Edge cases & unclear states

- **Negative / non-finite values** are coerced to `0` in `resolveSegments` so `flexGrow` geometry stays valid.
- **Zero total** (all values 0, no positive `total`): the bar renders an empty track; no console warnings.
- **`className` on a datum** wins over the palette color on both the segment and its legend dot (the inline `backgroundColor` is skipped).
- **Remainder is never in the legend** — the legend renders only `data` items, not the synthetic tail.
- **Duplicate `name`s** are used as the React key / `data-name`; keep them unique.

## Accessibility notes

- The bar is `aria-hidden` when the legend is shown (the legend is the readable representation). When `legend={false}`, the bar instead carries an `aria-label` summarizing the segments (`"Critical 42, High 31, …"`).
- The delta badge exposes an `aria-label` like `"up 10"`; its arrow icon is `aria-hidden`.
- Non-interactive: no focusable elements.

## Open questions / known limitations

- Delta color is baked to Figma's `w-orange`; trend drives the arrow only, not color. Revisit if product wants trend-driven red/green.
- No segment animation in v1.
- No tooltips on long legend labels in v1 — wrap the label in `OverflowTooltip` if a use case needs it.
```

- [ ] **Step 4: Full verification pass**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Run: `pnpm --filter @wallarm-org/design-system lint`
Run: `pnpm --filter @wallarm-org/design-system test:run HorizontalBar`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/SimpleCharts/HorizontalBar packages/design-system/src/components/SimpleCharts/docs/HorizontalBar.md
git commit -m "test(simple-charts): HorizontalBar e2e + docs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review Notes

- **Spec coverage:** data-driven API (Task 1), color mechanism via `resolveChartColor` inline + `className` override (Tasks 2 & 4), remainder tail (Task 2), value + delta header (Task 3), legend toggle + a11y fallback (Task 4), external `Chart` frame + stories (Task 5), e2e + docs + registration (Tasks 1, 6). All spec sections map to a task.
- **Type consistency:** `HorizontalBarDatum` / `HorizontalBarProps` defined once in Task 1 and imported by `resolveSegments` (Task 2) and stories/figma (Task 5). `ResolvedSegment` + `resolveSegments(data, total)` defined in Task 2 and consumed by Tasks 2 & 4. `REMAINDER_KEY` / `HORIZONTAL_BAR_PALETTE` defined in Task 2 constants. `data-slot` names are stable across component code, unit tests, and e2e selectors.
- **Non-interactive:** e2e intentionally omits Hover/Selected/Focus (component is display-only in v1) — a deliberate deviation from the family's default screenshot set, noted in the spec.
