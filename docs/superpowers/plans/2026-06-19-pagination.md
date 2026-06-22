# Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a composable `Pagination` component to the design system, built on `@ark-ui/react/pagination`, reproducing the Figma design (Full / Simple / Links-only types, medium/small sizes, left/center/right alignment, optional "Rows per page") with Storybook stories and tests.

**Architecture:** Thin DS wrappers around Ark UI's pagination primitives (same pattern as `Tabs`/`Select`). Ark owns all state, range math, ellipsis collapsing, disabled-at-bounds, and a11y (`<nav>` landmark + `aria-current`). The "Type" is expressed by which sub-components the consumer includes, not by a prop. A DS-only React context carries `size` to sub-components; `align` is a `justify-*` class on the root.

**Tech Stack:** React 19, TypeScript (strict), `@ark-ui/react@5.31.0` (`@zag-js/pagination`), CVA, Tailwind tokens, Vitest + Testing Library (unit), Playwright (e2e), Storybook (`storybook-react-rsbuild`). Reuses DS `Button`, `Select`, `Separator`, `Text`, icons.

## Global Constraints

- Component dir: `packages/design-system/src/components/Pagination/`.
- CVA variants live in `classes.ts`; merge classes with `cn()` from `../../utils/cn`. Never template-literal class concatenation.
- Every component root has `data-slot='<name>'` (kebab-case) and `displayName`.
- React 19 `ref` prop — never `React.forwardRef`. No `any`. No inline styles. Colors via tokens only (`text-text-*`, `bg-states-*`, `border-border-*`).
- TestId cascade: root wraps children in `TestIdProvider`; sub-components call `useTestId('<slot>')`. Slots: `previous`, `list`, `item`, `ellipsis`, `next`, `page-size`.
- Type exports: export component **and** its Props type from `index.ts`.
- Conventional commits; PR/commit prefix `feat: WDS-140 ...`.
- `pnpm typecheck` is a no-op in this repo — typecheck with `tsc -p tsconfig.app.json --noEmit` (run from `packages/design-system`).
- Run `npx biome check --write <changed files>` before every commit; commit the formatted result.
- Size mapping: Pagination `medium` → 32px squares / `Button size='medium'`; `small` → 24px / `Button size='small'`.
- Ark data model: `count` = total data items, `pageSize` = items per page; Ark derives `totalPages`. Do NOT add a `pageCount` prop.

---

### Task 1: Scaffold — types, size context, classes, `Pagination` root

**Files:**
- Create: `packages/design-system/src/components/Pagination/types.ts`
- Create: `packages/design-system/src/components/Pagination/PaginationContext.tsx`
- Create: `packages/design-system/src/components/Pagination/classes.ts`
- Create: `packages/design-system/src/components/Pagination/Pagination.tsx`
- Create: `packages/design-system/src/components/Pagination/index.ts`
- Test: `packages/design-system/src/components/Pagination/Pagination.test.tsx`

**Interfaces:**
- Produces:
  - `type PaginationSize = 'medium' | 'small'`
  - `type PaginationAlign = 'left' | 'center' | 'right'`
  - `usePaginationSizeContext(): { size: PaginationSize }`
  - `PaginationSizeProvider: FC<{ size: PaginationSize; children: ReactNode }>`
  - `paginationVariants({ align })`, `paginationItemVariants({ size })`, `paginationEllipsisVariants({ size })` (CVA)
  - `Pagination: FC<PaginationProps>` wrapping `ArkPagination.Root` (`<nav>`)
  - `PaginationProps` (see code)

- [ ] **Step 1: Write the failing test**

```tsx
// Pagination.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination root', () => {
  it('renders a nav landmark with aria-label, data-slot and align class', () => {
    render(
      <Pagination count={50} pageSize={10} align="center" aria-label="Results" data-testid="pg">
        <span>child</span>
      </Pagination>,
    );
    const nav = screen.getByRole('navigation', { name: 'Results' });
    expect(nav).toHaveAttribute('data-slot', 'pagination');
    expect(nav).toHaveAttribute('data-testid', 'pg');
    expect(nav.className).toContain('justify-center');
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: FAIL — cannot resolve `./Pagination`.

- [ ] **Step 3: Create `types.ts`**

```ts
export type PaginationSize = 'medium' | 'small';
export type PaginationAlign = 'left' | 'center' | 'right';
```

- [ ] **Step 4: Create `PaginationContext.tsx`**

```tsx
import { createContext, type FC, type ReactNode, useContext } from 'react';
import type { PaginationSize } from './types';

interface PaginationSizeContextValue {
  size: PaginationSize;
}

const PaginationSizeContext = createContext<PaginationSizeContextValue>({ size: 'medium' });

export const PaginationSizeProvider: FC<{ size: PaginationSize; children: ReactNode }> = ({
  size,
  children,
}) => <PaginationSizeContext.Provider value={{ size }}>{children}</PaginationSizeContext.Provider>;

export const usePaginationSizeContext = (): PaginationSizeContextValue =>
  useContext(PaginationSizeContext);
```

- [ ] **Step 5: Create `classes.ts`**

```ts
import { cva } from 'class-variance-authority';

export const paginationVariants = cva('flex w-full items-center gap-6', {
  variants: {
    align: {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    },
  },
  defaultVariants: { align: 'left' },
});

export const paginationItemVariants = cva(
  [
    'inline-flex items-center justify-center shrink-0 rounded-8',
    'text-sm font-medium font-sans text-text-primary',
    'cursor-pointer transition-colors',
    'border-1 border-transparent bg-transparent',
    'hover:bg-states-primary-hover active:bg-states-primary-pressed',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
    'disabled:opacity-50 disabled:pointer-events-none disabled:hover:bg-transparent',
    'data-[selected]:bg-states-primary-active',
  ],
  {
    variants: {
      size: {
        medium: 'size-32',
        small: 'size-24',
      },
    },
    defaultVariants: { size: 'medium' },
  },
);

export const paginationEllipsisVariants = cva(
  'inline-flex items-center justify-center shrink-0 text-text-secondary opacity-50 [&_svg]:icon-md',
  {
    variants: {
      size: {
        medium: 'size-32',
        small: 'size-24',
      },
    },
    defaultVariants: { size: 'medium' },
  },
);
```

- [ ] **Step 6: Create `Pagination.tsx`**

```tsx
import type { FC, ReactNode, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { paginationVariants } from './classes';
import { PaginationSizeProvider } from './PaginationContext';
import type { PaginationAlign, PaginationSize } from './types';

export interface PaginationPageChangeDetails {
  page: number;
  pageSize: number;
}

export interface PaginationPageSizeChangeDetails {
  pageSize: number;
}

export interface PaginationProps extends TestableProps {
  /** Total number of data items (Ark `count`). */
  count?: number;
  /** Controlled current page (1-based). */
  page?: number;
  /** Uncontrolled initial page. @default 1 */
  defaultPage?: number;
  /** Controlled items-per-page. */
  pageSize?: number;
  /** Uncontrolled initial items-per-page. @default 10 */
  defaultPageSize?: number;
  /** Pages shown beside the active page. @default 1 */
  siblingCount?: number;
  /** Pages shown at the start/end. @default 1 */
  boundaryCount?: number;
  onPageChange?: (details: PaginationPageChangeDetails) => void;
  onPageSizeChange?: (details: PaginationPageSizeChangeDetails) => void;
  /** Trigger element type. @default 'button' */
  type?: 'button' | 'link';
  getPageUrl?: (details: { page: number; pageSize: number }) => string;
  /** Visual size. @default 'medium' */
  size?: PaginationSize;
  /** Horizontal alignment of the row. @default 'left' */
  align?: PaginationAlign;
  'aria-label'?: string;
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

export const Pagination: FC<PaginationProps> = ({
  size = 'medium',
  align = 'left',
  className,
  children,
  ref,
  'data-testid': testId,
  'aria-label': ariaLabel = 'Pagination',
  ...arkProps
}) => (
  <PaginationSizeProvider size={size}>
    <TestIdProvider value={testId}>
      <ArkPagination.Root
        {...arkProps}
        ref={ref}
        translations={{ rootLabel: ariaLabel }}
        className={cn(paginationVariants({ align }), className)}
        data-slot="pagination"
        data-testid={testId}
      >
        {children}
      </ArkPagination.Root>
    </TestIdProvider>
  </PaginationSizeProvider>
);

Pagination.displayName = 'Pagination';
```

- [ ] **Step 7: Create `index.ts`**

```ts
export { Pagination, type PaginationPageChangeDetails, type PaginationPageSizeChangeDetails, type PaginationProps } from './Pagination';
export { usePaginationSizeContext } from './PaginationContext';
export type { PaginationAlign, PaginationSize } from './types';
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: PASS.

- [ ] **Step 9: Typecheck**

Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

- [ ] **Step 10: Format + commit**

```bash
cd /Users/klimovaoks/Projects/work/design-system
npx biome check --write packages/design-system/src/components/Pagination
git add packages/design-system/src/components/Pagination
git commit -m "feat: WDS-140 scaffold Pagination root, size context and classes"
```

---

### Task 2: `PaginationItem` + `PaginationEllipsis`

**Files:**
- Create: `packages/design-system/src/components/Pagination/PaginationItem.tsx`
- Create: `packages/design-system/src/components/Pagination/PaginationEllipsis.tsx`
- Modify: `packages/design-system/src/components/Pagination/index.ts`
- Test: `packages/design-system/src/components/Pagination/Pagination.test.tsx` (append)

**Interfaces:**
- Consumes: `usePaginationSizeContext`, `paginationItemVariants`, `paginationEllipsisVariants`, `Pagination`.
- Produces:
  - `PaginationItem: FC<PaginationItemProps>` where `PaginationItemProps = ButtonHTMLAttributes<HTMLButtonElement> & { value: number; ref?: Ref<HTMLButtonElement> }`
  - `PaginationEllipsis: FC<PaginationEllipsisProps>` where `PaginationEllipsisProps = HTMLAttributes<HTMLDivElement> & { index: number; ref?: Ref<HTMLDivElement> }`

- [ ] **Step 1: Write the failing tests (append to `Pagination.test.tsx`)**

```tsx
import { Pagination } from './Pagination';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';

describe('PaginationItem', () => {
  it('renders a page button and marks the active page with aria-current', () => {
    render(
      <Pagination count={50} pageSize={10} page={2} size="small">
        <ul>
          <PaginationItem value={1}>1</PaginationItem>
          <PaginationItem value={2}>2</PaginationItem>
        </ul>
      </Pagination>,
    );
    const active = screen.getByRole('button', { name: '2' });
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(active).toHaveAttribute('data-slot', 'pagination-item');
    expect(active.className).toContain('size-24'); // small
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('forwards data-analytics-id to the real button', () => {
    render(
      <Pagination count={50} pageSize={10}>
        <ul>
          <PaginationItem value={3} data-analytics-id="PAGE_3">3</PaginationItem>
        </ul>
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('data-analytics-id', 'PAGE_3');
  });
});

describe('PaginationEllipsis', () => {
  it('renders a non-interactive, aria-hidden indicator', () => {
    const { container } = render(
      <Pagination count={500} pageSize={10}>
        <ul>
          <PaginationEllipsis index={0} />
        </ul>
      </Pagination>,
    );
    const el = container.querySelector('[data-slot="pagination-ellipsis"]');
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el?.tagName).toBe('DIV');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: FAIL — cannot resolve `./PaginationItem` / `./PaginationEllipsis`.

- [ ] **Step 3: Create `PaginationItem.tsx`**

```tsx
import type { ButtonHTMLAttributes, FC, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { paginationItemVariants } from './classes';
import { usePaginationSizeContext } from './PaginationContext';

export interface PaginationItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 1-based page number. */
  value: number;
  ref?: Ref<HTMLButtonElement>;
}

export const PaginationItem: FC<PaginationItemProps> = ({ value, className, ref, ...props }) => {
  const { size } = usePaginationSizeContext();
  const testId = useTestId('item');

  return (
    <ArkPagination.Item
      {...props}
      ref={ref}
      type="page"
      value={value}
      className={cn(paginationItemVariants({ size }), className)}
      data-slot="pagination-item"
      data-testid={testId}
    />
  );
};

PaginationItem.displayName = 'PaginationItem';
```

- [ ] **Step 4: Create `PaginationEllipsis.tsx`**

```tsx
import type { FC, HTMLAttributes, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { Ellipsis } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { paginationEllipsisVariants } from './classes';
import { usePaginationSizeContext } from './PaginationContext';

export interface PaginationEllipsisProps extends HTMLAttributes<HTMLDivElement> {
  /** Index of this ellipsis within the pages array (required by Ark). */
  index: number;
  ref?: Ref<HTMLDivElement>;
}

export const PaginationEllipsis: FC<PaginationEllipsisProps> = ({
  index,
  className,
  ref,
  ...props
}) => {
  const { size } = usePaginationSizeContext();
  const testId = useTestId('ellipsis');

  return (
    <ArkPagination.Ellipsis
      {...props}
      ref={ref}
      index={index}
      aria-hidden
      className={cn(paginationEllipsisVariants({ size }), className)}
      data-slot="pagination-ellipsis"
      data-testid={testId}
    >
      <Ellipsis size="md" />
    </ArkPagination.Ellipsis>
  );
};

PaginationEllipsis.displayName = 'PaginationEllipsis';
```

- [ ] **Step 5: Append exports to `index.ts`**

```ts
export { PaginationEllipsis, type PaginationEllipsisProps } from './PaginationEllipsis';
export { PaginationItem, type PaginationItemProps } from './PaginationItem';
```

- [ ] **Step 6: Run tests + typecheck**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: PASS.
Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

- [ ] **Step 7: Format + commit**

```bash
cd /Users/klimovaoks/Projects/work/design-system
npx biome check --write packages/design-system/src/components/Pagination
git add packages/design-system/src/components/Pagination
git commit -m "feat: WDS-140 add PaginationItem and PaginationEllipsis"
```

---

### Task 3: `PaginationList`

**Files:**
- Create: `packages/design-system/src/components/Pagination/PaginationList.tsx`
- Modify: `packages/design-system/src/components/Pagination/index.ts`
- Test: `packages/design-system/src/components/Pagination/Pagination.test.tsx` (append)

**Interfaces:**
- Consumes: `PaginationItem`, `PaginationEllipsis`, Ark `Pagination.Context`.
- Produces:
  - `PaginationPage = { type: 'page'; value: number } | { type: 'ellipsis' }`
  - `PaginationList: FC<PaginationListProps>` where `PaginationListProps = { className?: string; children?: (page: PaginationPage, index: number) => ReactNode; ref?: Ref<HTMLUListElement> }`

- [ ] **Step 1: Write the failing test (append)**

```tsx
import { PaginationList } from './PaginationList';

describe('PaginationList', () => {
  it('auto-renders boundary pages, sibling pages and a single ellipsis', () => {
    render(
      <Pagination count={200} pageSize={10} page={1} siblingCount={1} boundaryCount={1}>
        <PaginationList />
      </Pagination>,
    );
    // 20 total pages. page=1 -> [1] 2 … 20
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('data-slot', 'pagination-list');
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '10' })).toBeNull();
    // exactly one ellipsis between sibling group and the trailing boundary
    expect(list.querySelectorAll('[data-slot="pagination-ellipsis"]')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: FAIL — cannot resolve `./PaginationList`.

- [ ] **Step 3: Create `PaginationList.tsx`**

```tsx
import type { FC, ReactNode, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';

export type PaginationPage = { type: 'page'; value: number } | { type: 'ellipsis' };

export interface PaginationListProps {
  className?: string;
  /** Optional override for rendering each page entry. */
  children?: (page: PaginationPage, index: number) => ReactNode;
  ref?: Ref<HTMLUListElement>;
}

export const PaginationList: FC<PaginationListProps> = ({ className, children, ref }) => {
  const testId = useTestId('list');

  return (
    <ArkPagination.Context>
      {(api) => (
        <ul
          ref={ref}
          className={cn('flex items-center gap-2', className)}
          data-slot="pagination-list"
          data-testid={testId}
        >
          {api.pages.map((page, index) => (
            <li key={page.type === 'page' ? `page-${page.value}` : `ellipsis-${index}`}>
              {children
                ? children(page, index)
                : page.type === 'page'
                  ? <PaginationItem value={page.value}>{page.value}</PaginationItem>
                  : <PaginationEllipsis index={index} />}
            </li>
          ))}
        </ul>
      )}
    </ArkPagination.Context>
  );
};

PaginationList.displayName = 'PaginationList';
```

- [ ] **Step 4: Append export to `index.ts`**

```ts
export { type PaginationPage, PaginationList, type PaginationListProps } from './PaginationList';
```

- [ ] **Step 5: Run test + typecheck**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: PASS.
Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

> If the ellipsis count assertion fails, log `api.pages` in the render prop to confirm Ark's collapsing for `count=200, pageSize=10, page=1, siblingCount=1, boundaryCount=1` and adjust the expected page set in the test to match Ark's actual output (do not change the algorithm — Ark owns it).

- [ ] **Step 6: Format + commit**

```bash
cd /Users/klimovaoks/Projects/work/design-system
npx biome check --write packages/design-system/src/components/Pagination
git add packages/design-system/src/components/Pagination
git commit -m "feat: WDS-140 add PaginationList auto-rendering pages"
```

---

### Task 4: `PaginationPrevious` + `PaginationNext`

**Files:**
- Create: `packages/design-system/src/components/Pagination/PaginationPrevious.tsx`
- Create: `packages/design-system/src/components/Pagination/PaginationNext.tsx`
- Modify: `packages/design-system/src/components/Pagination/index.ts`
- Test: `packages/design-system/src/components/Pagination/Pagination.test.tsx` (append)

**Interfaces:**
- Consumes: `usePaginationSizeContext`, `Button`, Ark `PrevTrigger`/`NextTrigger`, icons `ArrowLeft`/`ArrowRight`.
- Produces:
  - `PaginationPrevious: FC<PaginationPreviousProps>` where `PaginationPreviousProps = ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode; ref?: Ref<HTMLButtonElement> }`
  - `PaginationNext: FC<PaginationNextProps>` with the same prop shape.

- [ ] **Step 1: Write the failing tests (append)**

```tsx
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { PaginationNext } from './PaginationNext';
import { PaginationPrevious } from './PaginationPrevious';

describe('Pagination prev/next', () => {
  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(
      <Pagination count={30} pageSize={10} page={1}>
        <PaginationPrevious />
        <PaginationNext />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();

    rerender(
      <Pagination count={30} pageSize={10} page={3}>
        <PaginationPrevious />
        <PaginationNext />
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('calls onPageChange when Next is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination count={30} pageSize={10} defaultPage={1} onPageChange={onPageChange}>
        <PaginationPrevious />
        <PaginationNext />
      </Pagination>,
    );
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: FAIL — cannot resolve `./PaginationPrevious` / `./PaginationNext`.

- [ ] **Step 3: Create `PaginationPrevious.tsx`**

```tsx
import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { ArrowLeft } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { usePaginationSizeContext } from './PaginationContext';

export interface PaginationPreviousProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export const PaginationPrevious: FC<PaginationPreviousProps> = ({ children, ...props }) => {
  const { size } = usePaginationSizeContext();
  const testId = useTestId('previous');

  return (
    <ArkPagination.PrevTrigger asChild>
      <Button
        {...props}
        variant="ghost"
        color="neutral"
        size={size}
        data-slot="pagination-previous"
        data-testid={testId}
      >
        <ArrowLeft />
        {children ?? 'Previous'}
      </Button>
    </ArkPagination.PrevTrigger>
  );
};

PaginationPrevious.displayName = 'PaginationPrevious';
```

- [ ] **Step 4: Create `PaginationNext.tsx`**

```tsx
import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import { ArrowRight } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { usePaginationSizeContext } from './PaginationContext';

export interface PaginationNextProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export const PaginationNext: FC<PaginationNextProps> = ({ children, ...props }) => {
  const { size } = usePaginationSizeContext();
  const testId = useTestId('next');

  return (
    <ArkPagination.NextTrigger asChild>
      <Button
        {...props}
        variant="ghost"
        color="neutral"
        size={size}
        data-slot="pagination-next"
        data-testid={testId}
      >
        {children ?? 'Next'}
        <ArrowRight />
      </Button>
    </ArkPagination.NextTrigger>
  );
};

PaginationNext.displayName = 'PaginationNext';
```

- [ ] **Step 5: Append exports to `index.ts`**

```ts
export { PaginationNext, type PaginationNextProps } from './PaginationNext';
export { PaginationPrevious, type PaginationPreviousProps } from './PaginationPrevious';
```

- [ ] **Step 6: Run tests + typecheck**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: PASS.
Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors.

> If `asChild` merge does not disable the `Button` at the bounds, check whether Ark passes `disabled` vs `data-disabled`; the `Button`/`ButtonBase` already handles the `disabled` boolean, which Ark's trigger provides. Do not re-implement bounds logic.

- [ ] **Step 7: Format + commit**

```bash
cd /Users/klimovaoks/Projects/work/design-system
npx biome check --write packages/design-system/src/components/Pagination
git add packages/design-system/src/components/Pagination
git commit -m "feat: WDS-140 add PaginationPrevious and PaginationNext"
```

---

### Task 5: `PaginationPageSize` (Rows per page)

**Files:**
- Create: `packages/design-system/src/components/Pagination/PaginationPageSize.tsx`
- Modify: `packages/design-system/src/components/Pagination/index.ts`
- Test: `packages/design-system/src/components/Pagination/Pagination.test.tsx` (append)

**Interfaces:**
- Consumes: Ark `usePaginationContext` (`.pageSize`, `.setPageSize`), `Select` + sub-parts, `Separator`, `Text`, `createListCollection`.
- Produces:
  - `PaginationPageSize: FC<PaginationPageSizeProps>` where `PaginationPageSizeProps = { options: number[]; label?: string; className?: string; 'data-testid'?: string }`

- [ ] **Step 1: Write the failing test (append)**

```tsx
import { PaginationPageSize } from './PaginationPageSize';

describe('PaginationPageSize', () => {
  it('renders the label and the current page size, and changes it', async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination count={200} defaultPageSize={25} onPageSizeChange={onPageSizeChange}>
        <PaginationPageSize options={[10, 25, 50]} />
      </Pagination>,
    );
    expect(screen.getByText('Rows per page')).toBeInTheDocument();
    // current value shown on the select trigger
    const trigger = screen.getByRole('combobox', { name: /rows per page/i });
    expect(trigger).toHaveTextContent('25');

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: '50' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 50 }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: FAIL — cannot resolve `./PaginationPageSize`.

- [ ] **Step 3: Create `PaginationPageSize.tsx`**

```tsx
import { type FC, useMemo } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import { usePaginationContext } from '@ark-ui/react/pagination';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Select } from '../Select';
import { SelectButton } from '../Select/SelectButton';
import { SelectContent } from '../Select/SelectContent';
import { SelectOption } from '../Select/SelectOption';
import { SelectOptionText } from '../Select/SelectOptionText';
import { SelectPositioner } from '../Select/SelectPositioner';
import { Separator } from '../Separator';
import { Text } from '../Text';

export interface PaginationPageSizeProps {
  /** Selectable items-per-page values. */
  options: number[];
  /** Leading label. @default 'Rows per page' */
  label?: string;
  className?: string;
  'data-testid'?: string;
}

export const PaginationPageSize: FC<PaginationPageSizeProps> = ({
  options,
  label = 'Rows per page',
  className,
  'data-testid': testIdProp,
}) => {
  const api = usePaginationContext();
  const testId = useTestId('page-size', testIdProp);

  const collection = useMemo(
    () =>
      createListCollection({
        items: options.map((value) => ({ label: String(value), value: String(value) })),
      }),
    [options],
  );

  return (
    <div
      className={cn('flex items-center gap-6', className)}
      data-slot="pagination-page-size"
      data-testid={testId}
    >
      <Text size="sm" weight="medium" color="primary" className="whitespace-nowrap">
        {label}
      </Text>
      <div className="w-fit">
        <Select
          collection={collection}
          value={[String(api.pageSize)]}
          onValueChange={({ value }) => api.setPageSize(Number(value[0]))}
          aria-label={label}
        >
          <SelectButton />
          <SelectPositioner>
            <SelectContent>
              {collection.items.map((item) => (
                <SelectOption key={item.value} item={item}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </Select>
      </div>
      <Separator orientation="vertical" />
    </div>
  );
};

PaginationPageSize.displayName = 'PaginationPageSize';
```

> Note: `SelectButton` hard-codes `size='large'` (36px); the page-size select is therefore 36px tall, a minor deviation from the Figma 32px. This is acceptable for v1 (DS consistency over pixel match). Do not fork `SelectButton`.

- [ ] **Step 4: Verify the `Text` props compile**

Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors. If `color="primary"` or `size="sm"`/`weight="medium"` are not valid union members, open `src/components/Text/Text.tsx`, read the CVA `variants`, and use the correct literals (e.g. `color` may be `text-primary`). Adjust to the actual union.

- [ ] **Step 5: Append export to `index.ts`**

```ts
export { PaginationPageSize, type PaginationPageSizeProps } from './PaginationPageSize';
```

- [ ] **Step 6: Run test**

Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination/Pagination.test.tsx`
Expected: PASS.

> The Select `combobox`/`option` roles come from Ark's Select. If the role query fails in jsdom, fall back to `screen.getByTestId('...--page-size--button')` for the trigger and assert it shows `25`, then open via click and select `50` by visible text. The `onPageSizeChange` assertion is the load-bearing one — keep it.

- [ ] **Step 7: Format + commit**

```bash
cd /Users/klimovaoks/Projects/work/design-system
npx biome check --write packages/design-system/src/components/Pagination
git add packages/design-system/src/components/Pagination
git commit -m "feat: WDS-140 add PaginationPageSize rows-per-page control"
```

---

### Task 6: Barrel export from the package root

**Files:**
- Modify: `packages/design-system/src/index.ts`

**Interfaces:**
- Consumes: the full `./components/Pagination` public surface.
- Produces: top-level exports of all `Pagination*` symbols + `usePaginationSizeContext` and the re-exported Ark hooks/types.

- [ ] **Step 1: Find the insertion point**

Run: `grep -n "from './components/OverflowList'" packages/design-system/src/index.ts`
Expected: a line number near other alphabetical `export { ... } from './components/...'` blocks. Insert the new block in alphabetical position (after `OverflowList`/`OverflowTooltip`, before `ParameterPath`).

- [ ] **Step 2: Add the export block**

```ts
export {
  Pagination,
  PaginationEllipsis,
  type PaginationEllipsisProps,
  PaginationItem,
  type PaginationItemProps,
  PaginationList,
  type PaginationListProps,
  PaginationNext,
  type PaginationNextProps,
  type PaginationPage,
  type PaginationPageChangeDetails,
  PaginationPageSize,
  type PaginationPageSizeProps,
  type PaginationPageSizeChangeDetails,
  PaginationPrevious,
  type PaginationPreviousProps,
  type PaginationProps,
  type PaginationAlign,
  type PaginationSize,
  usePaginationSizeContext,
} from './components/Pagination';
export { usePagination, usePaginationContext } from '@ark-ui/react/pagination';
```

- [ ] **Step 3: Typecheck**

Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
Expected: no errors. (If Biome flags `usePagination`/`usePaginationContext` re-export ordering, let `biome check --write` reorder.)

- [ ] **Step 4: Format + commit**

```bash
cd /Users/klimovaoks/Projects/work/design-system
npx biome check --write packages/design-system/src/index.ts
git add packages/design-system/src/index.ts
git commit -m "feat: WDS-140 export Pagination from package barrel"
```

---

### Task 7: Storybook stories

**Files:**
- Create: `packages/design-system/src/components/Pagination/Pagination.stories.tsx`

**Interfaces:**
- Consumes: all `Pagination*` components from local files.
- Produces: a Storybook file titled `Navigation/Pagination` (story id prefix `navigation-pagination`) with stories: `Full`, `Simple`, `LinksOnly`, `WithPageSize`, `Sizes`, `Alignment`, `ManyPages`, `Playground`.

- [ ] **Step 1: Create `Pagination.stories.tsx`**

```tsx
import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Pagination } from './Pagination';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';
import { PaginationList } from './PaginationList';
import { PaginationNext } from './PaginationNext';
import { PaginationPageSize } from './PaginationPageSize';
import { PaginationPrevious } from './PaginationPrevious';

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  subcomponents: {
    PaginationPageSize,
    PaginationPrevious,
    PaginationList,
    PaginationItem,
    PaginationEllipsis,
    PaginationNext,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Pagination>;

export default meta;

export const Full: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align="center" aria-label="Search results">
    <PaginationPrevious />
    <PaginationList />
    <PaginationNext />
  </Pagination>
);

export const Simple: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align="center">
    <PaginationPrevious />
    <PaginationNext />
  </Pagination>
);

export const LinksOnly: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align="center">
    <PaginationList />
  </Pagination>
);

export const WithPageSize: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} defaultPageSize={25} defaultPage={2} align="left">
    <PaginationPageSize options={[10, 25, 50]} />
    <PaginationPrevious />
    <PaginationList />
    <PaginationNext />
  </Pagination>
);

export const Sizes: StoryFn<typeof Pagination> = () => (
  <VStack gap={24}>
    <Pagination count={120} pageSize={10} defaultPage={2} size="medium" align="center">
      <PaginationPrevious />
      <PaginationList />
      <PaginationNext />
    </Pagination>
    <Pagination count={120} pageSize={10} defaultPage={2} size="small" align="center">
      <PaginationPrevious />
      <PaginationList />
      <PaginationNext />
    </Pagination>
  </VStack>
);

export const Alignment: StoryFn<typeof Pagination> = () => (
  <VStack gap={24} className="w-150">
    {(['left', 'center', 'right'] as const).map((align) => (
      <Pagination key={align} count={120} pageSize={10} defaultPage={2} align={align}>
        <PaginationList />
      </Pagination>
    ))}
  </VStack>
);

export const ManyPages: StoryFn<typeof Pagination> = () => (
  <Pagination count={500} pageSize={10} defaultPage={6} siblingCount={1} boundaryCount={1} align="center">
    <PaginationPrevious />
    <PaginationList />
    <PaginationNext />
  </Pagination>
);

export const Playground: StoryFn<typeof Pagination> = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return (
    <Pagination
      count={120}
      page={page}
      pageSize={pageSize}
      align="left"
      onPageChange={({ page }) => setPage(page)}
      onPageSizeChange={({ pageSize }) => setPageSize(pageSize)}
    >
      <PaginationPageSize options={[10, 25, 50]} />
      <PaginationPrevious />
      <PaginationList />
      <PaginationNext />
    </Pagination>
  );
};
```

- [ ] **Step 2: Verify the story renders in Storybook**

Run: `pnpm --filter @wallarm-org/design-system storybook` (in a background terminal), open `http://localhost:6006/?path=/story/navigation-pagination--full`.
Expected: the Full story renders `← Previous  1 [2] 3 … 12  Next →`. Check `WithPageSize`, `Sizes`, `Alignment`, `ManyPages`, `Playground` visually against Figma. Stop the server when done.

> If `VStack` / `className="w-150"` / `w-fit` utilities don't exist, replace with the nearest existing utility (grep `w-` usages in other stories). `VStack` is exported from `../Stack` (used by `Select.stories.tsx`).

- [ ] **Step 3: Typecheck + format + commit**

```bash
cd /Users/klimovaoks/Projects/work/design-system
pnpm exec tsc -p packages/design-system/tsconfig.app.json --noEmit
npx biome check --write packages/design-system/src/components/Pagination/Pagination.stories.tsx
git add packages/design-system/src/components/Pagination/Pagination.stories.tsx
git commit -m "docs: WDS-140 add Pagination Storybook stories"
```

---

### Task 8: E2E tests (Playwright)

**Files:**
- Create: `packages/design-system/src/components/Pagination/Pagination.e2e.ts`

**Interfaces:**
- Consumes: the stories from Task 7 via `createStoryHelper('navigation-pagination', [...])`.
- Produces: visual, interaction, and accessibility e2e coverage. Follows `docs/e2e-test-rules.md`.

- [ ] **Step 1: Re-read the e2e rules**

Run: `sed -n '1,200p' docs/e2e-test-rules.md`
Expected: confirm `test.describe` naming, the Screenshot/Interaction/Accessibility grouping, and severity annotations. Mirror the structure of `src/components/Breadcrumbs/Breadcrumbs.e2e.ts`.

- [ ] **Step 2: Create `Pagination.e2e.ts`**

```ts
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const paginationStory = createStoryHelper('navigation-pagination', [
  'Full',
  'Simple',
  'LinksOnly',
  'WithPageSize',
  'Sizes',
  'Alignment',
  'ManyPages',
  'Playground',
] as const);

test.describe('Component: Pagination', () => {
  test.describe('Visual', () => {
    test('Should render full pagination correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Full');
      await expect(page).toHaveScreenshot();
    });

    test('Should render simple pagination correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Simple');
      await expect(page).toHaveScreenshot();
    });

    test('Should render links-only pagination correctly', async ({ page }) => {
      await paginationStory.goto(page, 'LinksOnly');
      await expect(page).toHaveScreenshot();
    });

    test('Should render rows-per-page control correctly', async ({ page }) => {
      await paginationStory.goto(page, 'WithPageSize');
      await expect(page).toHaveScreenshot();
    });

    test('Should render medium and small sizes correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render alignments correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Alignment');
      await expect(page).toHaveScreenshot();
    });

    test('Should collapse many pages with an ellipsis', async ({ page }) => {
      await paginationStory.goto(page, 'ManyPages');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interaction', () => {
    test('Should navigate to the next page on Next click', async ({ page }) => {
      await paginationStory.goto(page, 'Playground');
      await page.getByRole('button', { name: /next/i }).click();
      await expect(page.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    });

    test('Should disable Previous on the first page', async ({ page }) => {
      await paginationStory.goto(page, 'Playground');
      await expect(page.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    test('Should change the page size', async ({ page }) => {
      await paginationStory.goto(page, 'Playground');
      await page.getByRole('combobox', { name: /rows per page/i }).click();
      await page.getByRole('option', { name: '50' }).click();
      await expect(page.getByRole('combobox', { name: /rows per page/i })).toHaveText(/50/);
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose a navigation landmark', async ({ page }) => {
      await paginationStory.goto(page, 'Full');
      await expect(page.getByRole('navigation', { name: 'Search results' })).toBeVisible();
    });
  });
});
```

- [ ] **Step 3: Generate the baseline screenshots locally (or rely on CI)**

The repo updates snapshots in CI on `main` via the `[update-screenshots]` commit trigger (see CLAUDE.md). Locally, run the e2e suite if the Playwright/Storybook harness is available; otherwise commit with `[update-screenshots]` so CI generates baselines.

Run (if harness available): `pnpm --filter @wallarm-org/design-system exec playwright test src/components/Pagination/Pagination.e2e.ts`
Expected: Interaction + Accessibility tests PASS; Visual tests create new baselines on first run.

- [ ] **Step 4: Format + commit**

```bash
cd /Users/klimovaoks/Projects/work/design-system
npx biome check --write packages/design-system/src/components/Pagination/Pagination.e2e.ts
git add packages/design-system/src/components/Pagination/Pagination.e2e.ts
git commit -m "test: WDS-140 add Pagination e2e tests [update-screenshots]"
```

---

## Final verification

- [ ] Run the full unit suite for the component: `pnpm --filter @wallarm-org/design-system test:run src/components/Pagination`
- [ ] Typecheck: `cd packages/design-system && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] Lint: `cd packages/design-system && pnpm lint`
- [ ] Confirm the public API imports from the package root: `import { Pagination, PaginationList, PaginationItem } from '@wallarm-org/design-system'` resolves.
