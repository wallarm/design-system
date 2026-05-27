# OverflowList в ресайзабл-контейнерах — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать `OverflowList` плавным при ресайзе контейнера (дровер, ячейка таблицы), убрав DOM-операции из resize-callback, и добавить демо-стори + тесты.

**Architecture:** Чистая арифметика расчёта видимых элементов выносится в отдельную тестируемую функцию `calculateVisibleCount`. Хук `useOverflowItems` меряет ширины (включая индикатор `+N`) один раз через скрытый слой измерения, кэширует их, а `ResizeObserver` через `requestAnimationFrame` запускает только пересчёт по кэшу. `OverflowList` избавляется от O(n²) `indexOf` и `useMemo`-side-effect.

**Tech Stack:** React 19, TypeScript (strict), Vitest + Testing Library (unit/component), Playwright (E2E), Storybook 10, Biome.

**Ветка:** `feature/AS-1033` (уже создана, спека закоммичена).

---

## File Structure

| Файл | Ответственность | Действие |
|------|-----------------|----------|
| `packages/design-system/src/hooks/useOverflowItems.helpers.ts` | Чистая функция `calculateVisibleCount` — без DOM | Create |
| `packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts` | Unit-тесты чистой функции | Create |
| `packages/design-system/src/hooks/useOverflowItems.tsx` | Кэш измерений + rAF-троттлинг RO | Modify |
| `packages/design-system/src/components/OverflowList/OverflowList.tsx` | Index-map вместо `indexOf`, `onOverflow` в `useEffect` | Modify |
| `packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx` | Component-тесты с замоканным хуком | Create |
| `packages/design-system/src/components/OverflowList/OverflowList.stories.tsx` | Стори, включая `ResizableContainer` | Create |
| `packages/design-system/src/components/OverflowList/OverflowList.e2e.ts` | E2E reflow при изменении ширины | Create |
| `packages/design-system/src/components/Drawer/Drawer.stories.tsx` | Стори `ResizableWithOverflowList` | Modify |
| `packages/design-system/src/components/Table/mocks.tsx` | Расширить `tags` для видимого overflow | Modify |
| `packages/design-system/src/components/Table/Table.stories.tsx` | Стори `ColumnResizingWithOverflowList` | Modify |

> **Биом перед каждым коммитом:** запускать `npx biome check --write <изменённые файлы>` и коммитить отформатированный результат (преференс пользователя).

---

## Task 1: Чистая функция `calculateVisibleCount` (TDD)

**Files:**
- Create: `packages/design-system/src/hooks/useOverflowItems.helpers.ts`
- Test: `packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts`

- [ ] **Step 1: Написать падающий тест**

`packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calculateVisibleCount } from '../useOverflowItems.helpers';

describe('calculateVisibleCount', () => {
  it('returns all items when everything fits without an indicator', () => {
    const count = calculateVisibleCount({
      itemWidths: [50, 50, 50],
      gap: 10,
      availableWidth: 1000,
      indicatorWidth: 40,
    });
    expect(count).toBe(3);
  });

  it('reserves indicator space and counts only what fits when overflowing', () => {
    // widths+gaps: 50, +10+50=110, +10+50=170; indicator 40 + gap 10 reserved.
    // availableWidth 130 → maxWidth 80 → fits item0 (50) and item1 (50+10=60 -> 110 > 80) => 1
    const count = calculateVisibleCount({
      itemWidths: [50, 50, 50],
      gap: 10,
      availableWidth: 130,
      indicatorWidth: 40,
    });
    expect(count).toBe(1);
  });

  it('always shows at least one item even if it does not fit', () => {
    const count = calculateVisibleCount({
      itemWidths: [500, 500],
      gap: 0,
      availableWidth: 100,
      indicatorWidth: 40,
    });
    expect(count).toBe(1);
  });

  it('returns all items when availableWidth is not measurable (<= 0)', () => {
    const count = calculateVisibleCount({
      itemWidths: [50, 50],
      gap: 0,
      availableWidth: 0,
      indicatorWidth: 40,
    });
    expect(count).toBe(2);
  });

  it('returns 0 for an empty list', () => {
    const count = calculateVisibleCount({
      itemWidths: [],
      gap: 8,
      availableWidth: 500,
      indicatorWidth: 40,
    });
    expect(count).toBe(0);
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `pnpm --filter @wallarm-org/design-system test -- useOverflowItems.helpers`
Expected: FAIL — `calculateVisibleCount` не определён / модуль не найден.

- [ ] **Step 3: Реализовать функцию**

`packages/design-system/src/hooks/useOverflowItems.helpers.ts`:

```ts
export interface CalculateVisibleCountParams {
  /** Ширина каждого элемента в порядке источника (px). */
  itemWidths: number[];
  /** Gap между flex-детьми контейнера (px). */
  gap: number;
  /** Доступная ширина контейнера (px). */
  availableWidth: number;
  /** Изменённая ширина индикатора "+N" (px); fallback — reserveSpace. */
  indicatorWidth: number;
}

/**
 * Чистая арифметика: сколько ведущих элементов помещается до того, как
 * потребуется индикатор переполнения. Не трогает DOM — безопасно вызывать
 * на каждый кадр ресайза.
 */
export function calculateVisibleCount({
  itemWidths,
  gap,
  availableWidth,
  indicatorWidth,
}: CalculateVisibleCountParams): number {
  if (itemWidths.length === 0) return 0;
  if (availableWidth <= 0) return itemWidths.length;

  // Первый проход: помещается ли всё без индикатора?
  let total = 0;
  for (let i = 0; i < itemWidths.length; i++) {
    total += itemWidths[i] + (i > 0 ? gap : 0);
  }
  if (total <= availableWidth) return itemWidths.length;

  // Второй проход: резервируем место под индикатор, считаем что влезает.
  const maxWidth = availableWidth - indicatorWidth - gap;
  let accumulated = 0;
  let count = 0;
  for (let i = 0; i < itemWidths.length; i++) {
    const widthWithGap = itemWidths[i] + (i > 0 ? gap : 0);
    if (accumulated + widthWithGap <= maxWidth || i === 0) {
      accumulated += widthWithGap;
      count++;
    } else {
      break;
    }
  }
  return Math.max(count, 1); // всегда показываем минимум один
}
```

- [ ] **Step 4: Запустить тест — убедиться, что проходит**

Run: `pnpm --filter @wallarm-org/design-system test -- useOverflowItems.helpers`
Expected: PASS (5 тестов).

- [ ] **Step 5: Коммит**

```bash
npx biome check --write packages/design-system/src/hooks/useOverflowItems.helpers.ts packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts
git add packages/design-system/src/hooks/useOverflowItems.helpers.ts packages/design-system/src/hooks/__tests__/useOverflowItems.helpers.test.ts
git commit -m "feat(overflow-list): AS-1033 pure calculateVisibleCount helper"
```

---

## Task 2: Рефактор `useOverflowItems` на кэш + rAF

**Files:**
- Modify: `packages/design-system/src/hooks/useOverflowItems.tsx` (полная замена тела)

Цель: убрать `document.createElement`-блок и `getComputedStyle` из resize-пути; мерить ширины (включая индикатор) один раз; `ResizeObserver` через `requestAnimationFrame` запускает только `recompute` по кэшу.

- [ ] **Step 1: Заменить содержимое файла**

`packages/design-system/src/hooks/useOverflowItems.tsx`:

```tsx
import {
  type ReactElement,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { calculateVisibleCount } from './useOverflowItems.helpers';

export interface UseOverflowItemsOptions<T> {
  items: T[];
  renderItem: (item: T) => ReactElement;
  renderMeasurementItem?: (item: T) => ReactElement;
  overflowRenderer?: (items: T[]) => ReactElement;
  reserveSpace?: number;
}

export interface UseOverflowItemsResult<T> {
  containerRef: RefObject<HTMLDivElement | null>;
  visibleItems: T[];
  hiddenItems: T[];
  visibleCount: number;
  hiddenCount: number;
  MeasurementContainer: () => ReactElement | null;
}

export function useOverflowItems<T>({
  items,
  renderItem,
  renderMeasurementItem,
  overflowRenderer,
  reserveSpace = 60,
}: UseOverflowItemsOptions<T>): UseOverflowItemsResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  // Скрытый слой измерения: refs на каждый элемент + ref на индикатор "+N".
  const measurementRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  // Кэш измерений — читается один раз на смену items/рендереров, не на тик ресайза.
  const cacheRef = useRef<{ widths: number[]; gap: number; indicatorWidth: number }>({
    widths: [],
    gap: 0,
    indicatorWidth: reserveSpace,
  });

  // Чистый пересчёт из кэша + текущей ширины контейнера. Никаких записей в DOM.
  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { widths, gap, indicatorWidth } = cacheRef.current;
    if (widths.length === 0) {
      setVisibleCount(prev => (prev === items.length ? prev : items.length));
      return;
    }

    const next = calculateVisibleCount({
      itemWidths: widths,
      gap,
      availableWidth: container.offsetWidth,
      indicatorWidth,
    });
    setVisibleCount(prev => (prev === next ? prev : next));
  }, [items.length]);

  // Измеряем один раз при смене items/рендереров. Только чтение DOM.
  useLayoutEffect(() => {
    const container = containerRef.current;

    if (items.length === 0) {
      cacheRef.current = { widths: [], gap: 0, indicatorWidth: reserveSpace };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleCount(0);
      return;
    }

    const gap = container ? Number.parseFloat(getComputedStyle(container).gap || '0') || 0 : 0;
    const widths = measurementRefs.current
      .slice(0, items.length)
      .map(ref => ref?.offsetWidth ?? 0);
    const indicatorWidth = indicatorRef.current?.offsetWidth || reserveSpace;

    cacheRef.current = { widths, gap, indicatorWidth };
    recompute();
  }, [items, renderItem, renderMeasurementItem, overflowRenderer, reserveSpace, recompute]);

  // Наблюдаем за ресайзом контейнера; тяжёлую работу откладываем в rAF,
  // коалесцируя несколько нотификаций кадра в один пересчёт.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        recompute();
      });
    });
    observer.observe(container);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [recompute]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);
  const hiddenCount = hiddenItems.length;

  // Стабильный компонент слоя измерения — не пересоздаётся каждый рендер.
  const MeasurementContainer = useCallback(() => {
    if (items.length === 0) return null;

    const renderMeasure = renderMeasurementItem || renderItem;

    return (
      <div className='absolute invisible pointer-events-none' aria-hidden='true'>
        {items.map((item, index) => {
          const key = `${index}`;
          return (
            <div
              key={key}
              ref={el => {
                measurementRefs.current[index] = el;
              }}
              className='inline-flex'
            >
              {renderMeasure(item)}
            </div>
          );
        })}
        {overflowRenderer && (
          <div ref={indicatorRef} className='inline-flex'>
            {overflowRenderer(items)}
          </div>
        )}
      </div>
    );
  }, [items, renderItem, renderMeasurementItem, overflowRenderer]);

  return {
    containerRef,
    visibleItems,
    hiddenItems,
    visibleCount,
    hiddenCount,
    MeasurementContainer,
  };
}
```

- [ ] **Step 2: Проверить типы и lint**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS — нет ошибок типов.

Run: `npx biome check packages/design-system/src/hooks/useOverflowItems.tsx`
Expected: нет ошибок (предупреждения форматирования исправит `--write` ниже).

- [ ] **Step 3: Прогнать unit-тесты хелпера (регрессия)**

Run: `pnpm --filter @wallarm-org/design-system test -- useOverflowItems`
Expected: PASS.

- [ ] **Step 4: Коммит**

```bash
npx biome check --write packages/design-system/src/hooks/useOverflowItems.tsx
git add packages/design-system/src/hooks/useOverflowItems.tsx
git commit -m "perf(overflow-list): AS-1033 cache measurements, rAF-throttle ResizeObserver"
```

---

## Task 3: Оптимизация `OverflowList` (index-map + useEffect)

**Files:**
- Modify: `packages/design-system/src/components/OverflowList/OverflowList.tsx`

- [ ] **Step 1: Обновить импорты React**

Заменить строки 1-8 (импорт из `react`):

```tsx
import {
  type HTMLAttributes,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
```

- [ ] **Step 2: Заменить `indexOf`-рендереры на index-map (строки 36-51)**

Удалить блок `memoizedItemRenderer` + `memoizedMeasurementRenderer` (текущие строки 36-51) и вставить:

```tsx
  // Карта item → index строится один раз: убирает O(n²) от indexOf в рендерере.
  const indexMap = useMemo(() => {
    const map = new Map<T, number>();
    items.forEach((item, index) => {
      if (!map.has(item)) map.set(item, index);
    });
    return map;
  }, [items]);

  const memoizedItemRenderer = useCallback(
    (item: T) => itemRenderer(item, indexMap.get(item) ?? 0),
    [indexMap, itemRenderer],
  );

  const memoizedMeasurementRenderer = useCallback(
    (item: T) => itemRenderer(item, indexMap.get(item) ?? 0) as ReactElement,
    [indexMap, itemRenderer],
  );
```

- [ ] **Step 3: Заменить `useMemo`-side-effect для `onOverflow` (строки 77-82)**

Удалить блок:

```tsx
  // Call onOverflow when hidden items change
  useMemo(() => {
    if (onOverflow && finalHiddenItems.length > 0) {
      onOverflow(finalHiddenItems);
    }
  }, [finalHiddenItems, onOverflow]);
```

И вставить вместо него:

```tsx
  // Сообщаем о переполнении как side-effect, а не во время рендера.
  useEffect(() => {
    if (onOverflow && finalHiddenItems.length > 0) {
      onOverflow(finalHiddenItems);
    }
  }, [finalHiddenItems, onOverflow]);
```

- [ ] **Step 4: Проверить типы**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

- [ ] **Step 5: Коммит**

```bash
npx biome check --write packages/design-system/src/components/OverflowList/OverflowList.tsx
git add packages/design-system/src/components/OverflowList/OverflowList.tsx
git commit -m "perf(overflow-list): AS-1033 drop O(n^2) indexOf, move onOverflow to effect"
```

---

## Task 4: Component-тесты `OverflowList` (TDD, замоканный хук)

**Files:**
- Create: `packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx`

> В jsdom `offsetWidth` = 0 и `ResizeObserver` замокан no-op (см. `vitest.setup.ts`), поэтому реальный обсчёт не воспроизводится. Мокаем `useOverflowItems`, как сделано в `ParameterPath.test.tsx`, и проверяем логику самого `OverflowList`.

- [ ] **Step 1: Написать падающие тесты**

`packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { type ReactElement, useCallback } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../hooks', () => ({
  useOverflowItems: vi.fn(),
}));

import { useOverflowItems } from '../../../hooks';
import { OverflowList } from '../OverflowList';

type HookReturn = ReturnType<typeof useOverflowItems<string>>;

const mockHook = (visibleItems: string[], hiddenItems: string[]) => {
  const value: HookReturn = {
    containerRef: { current: null },
    visibleItems,
    hiddenItems,
    visibleCount: visibleItems.length,
    hiddenCount: hiddenItems.length,
    MeasurementContainer: () => null as unknown as ReactElement,
  };
  vi.mocked(useOverflowItems).mockReturnValue(value as never);
};

const items = ['a', 'b', 'c', 'd'];
const itemRenderer = (item: string) => <span key={item}>{item}</span>;
const overflowRenderer = (hidden: string[]) => <span>+{hidden.length}</span>;

describe('OverflowList', () => {
  beforeEach(() => {
    vi.mocked(useOverflowItems).mockReset();
  });

  it('renders visible items and the overflow indicator for hidden items', () => {
    mockHook(['a', 'b'], ['c', 'd']);
    render(
      <OverflowList items={items} itemRenderer={itemRenderer} overflowRenderer={overflowRenderer} />,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not render the overflow indicator when nothing is hidden', () => {
    mockHook(items, []);
    render(
      <OverflowList items={items} itemRenderer={itemRenderer} overflowRenderer={overflowRenderer} />,
    );
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('renders the overflow indicator when alwaysRenderOverflow is set even with 0 hidden', () => {
    mockHook(items, []);
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        alwaysRenderOverflow
      />,
    );
    expect(screen.getByText('+0')).toBeInTheDocument();
  });

  it('passes the correct source index to itemRenderer', () => {
    mockHook(['c', 'd'], []);
    const indices: number[] = [];
    render(
      <OverflowList
        items={items}
        itemRenderer={(item, index) => {
          indices.push(index);
          return <span key={item}>{item}</span>;
        }}
        overflowRenderer={overflowRenderer}
      />,
    );
    // 'c' и 'd' имеют индексы 2 и 3 в исходном массиве.
    expect(indices).toEqual([2, 3]);
  });

  it('calls onOverflow with hidden items', () => {
    mockHook(['a'], ['b', 'c', 'd']);
    const onOverflow = vi.fn();
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        onOverflow={onOverflow}
      />,
    );
    expect(onOverflow).toHaveBeenCalledWith(['b', 'c', 'd']);
  });

  it('expands visible items up to minVisibleItems', () => {
    // Хук вернул только 1 видимый, но minVisibleItems=3 → ожидаем 3 первых.
    mockHook(['a'], ['b', 'c', 'd']);
    render(
      <OverflowList
        items={items}
        itemRenderer={itemRenderer}
        overflowRenderer={overflowRenderer}
        minVisibleItems={3}
      />,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Запустить тесты — убедиться, что они зелёные (логика уже реализована в Task 3)**

Run: `pnpm --filter @wallarm-org/design-system test -- OverflowList.test`
Expected: PASS (6 тестов). Если `minVisibleItems`-тест падает — это регрессия логики из строк 60-73 `OverflowList.tsx`; перепроверить, что блок `finalVisibleItems`/`finalHiddenItems` сохранён без изменений.

- [ ] **Step 3: Коммит**

```bash
npx biome check --write packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx
git add packages/design-system/src/components/OverflowList/__tests__/OverflowList.test.tsx
git commit -m "test(overflow-list): AS-1033 component tests for overflow + min visible"
```

---

## Task 5: Стори `OverflowList.stories.tsx`

**Files:**
- Create: `packages/design-system/src/components/OverflowList/OverflowList.stories.tsx`

- [ ] **Step 1: Создать файл стори**

`packages/design-system/src/components/OverflowList/OverflowList.stories.tsx`:

```tsx
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
import { OverflowList } from './OverflowList';

const meta = {
  title: 'Data Display/OverflowList',
  component: OverflowList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders a horizontal list of items and collapses the ones that do not fit into a ' +
          '"+N" overflow indicator. Reflows efficiently when its container is resized.',
      },
    },
  },
} satisfies Meta<typeof OverflowList<string>>;

export default meta;

const TAGS = ['XSS', 'BOLA', 'SQL Injection', 'Scanner', 'CSRF', 'XXE', 'RCE', 'LFI', 'IDOR'];

const renderOverflowPopover = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** Базовый список — в широком контейнере влезают все элементы. */
export const Basic: StoryFn = () => (
  <div className='w-640'>
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/** Узкий контейнер — большая часть элементов уходит в "+N". */
export const Collapsed: StoryFn = () => (
  <div className='w-200'>
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/** Сворачивание с начала списка. */
export const CollapseFromStart: StoryFn = () => (
  <div className='w-240'>
    <OverflowList
      className='gap-4'
      collapseFrom='start'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/** Гарантированный минимум видимых элементов. */
export const MinVisibleItems: StoryFn = () => (
  <div className='w-160'>
    <OverflowList
      className='gap-4'
      minVisibleItems={3}
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);

/**
 * Ресайзабл-контейнер: тяни за правый нижний угол рамки, чтобы увидеть живую
 * перекомпоновку. `data-testid` используется в E2E для программного ресайза.
 */
export const ResizableContainer: StoryFn = () => (
  <div
    data-testid='resizable-wrapper'
    className='resize-x overflow-hidden rounded-2 border border-border-primary p-12'
    style={{ width: 500, minWidth: 80, maxWidth: 800 }}
  >
    <OverflowList
      className='gap-4'
      items={TAGS}
      itemRenderer={item => <Tag key={item}>{item}</Tag>}
      overflowRenderer={renderOverflowPopover}
    />
  </div>
);
```

> Если Tailwind-классов ширины `w-640`/`w-200`/`w-240`/`w-160` нет в конфиге — заменить на inline `style={{ width: N }}`. Проверить наличие: `grep -R "w-640\|w-200" packages/design-system/src` или классов в сборке Storybook.

- [ ] **Step 2: Проверить, что Storybook собирает стори**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

Опционально вручную: `pnpm --filter @wallarm-org/design-system storybook` → открыть `Data Display/OverflowList/Resizable Container`, потянуть угол рамки, убедиться в плавной перекомпоновке без подвисаний.

- [ ] **Step 3: Коммит**

```bash
npx biome check --write packages/design-system/src/components/OverflowList/OverflowList.stories.tsx
git add packages/design-system/src/components/OverflowList/OverflowList.stories.tsx
git commit -m "docs(overflow-list): AS-1033 stories incl. resizable container demo"
```

---

## Task 6: E2E `OverflowList.e2e.ts` (детерминированный ресайз)

**Files:**
- Create: `packages/design-system/src/components/OverflowList/OverflowList.e2e.ts`

> Изменение `style.width` обёртки через `evaluate` запускает `ResizeObserver` детерминированно — не зависим от drag-флака. Story id: `data-display-overflowlist` (Storybook слугифицирует title `Data Display/OverflowList`).

- [ ] **Step 1: Написать E2E-тест**

`packages/design-system/src/components/OverflowList/OverflowList.e2e.ts`:

```ts
import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overflowStory = createStoryHelper('data-display-overflowlist', [
  'Basic',
  'Collapsed',
  'Resizable Container',
] as const);

const setWrapperWidth = (page: Page, width: number) =>
  page
    .getByTestId('resizable-wrapper')
    .evaluate((el, w) => {
      (el as HTMLElement).style.width = `${w}px`;
    }, width);

// Видимые теги — это элементы в основном контейнере, кроме поповер-триггера "+N".
const getVisibleTagCount = (page: Page) =>
  page.locator('[data-slot="overflow-list"] [data-slot="tag"]').count();

test.describe('Component: OverflowList', () => {
  test.describe('Visual', () => {
    test('Should render the full list in a wide container correctly', async ({ page }) => {
      await overflowStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the collapsed list in a narrow container correctly', async ({ page }) => {
      await overflowStory.goto(page, 'Collapsed');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should collapse items into the overflow indicator when the container shrinks', async ({
      page,
    }) => {
      await overflowStory.goto(page, 'Resizable Container');
      const wide = await getVisibleTagCount(page);

      await setWrapperWidth(page, 120);
      await expect
        .poll(() => getVisibleTagCount(page))
        .toBeLessThan(wide);
      await expect(page.getByText(/^\+\d+$/)).toBeVisible();
    });

    test('Should restore items when the container grows back', async ({ page }) => {
      await overflowStory.goto(page, 'Resizable Container');

      await setWrapperWidth(page, 120);
      const narrow = await getVisibleTagCount(page);

      await setWrapperWidth(page, 760);
      await expect
        .poll(() => getVisibleTagCount(page))
        .toBeGreaterThan(narrow);
    });
  });
});
```

> Перед запуском подтвердить, что у `OverflowList` корневой `div` имеет `data-slot="overflow-list"`, а `Tag` — `data-slot="tag"`. Если slug у `OverflowList` отсутствует (в текущем коде его нет — см. `OverflowList.tsx:108`), добавить `data-slot='overflow-list'` к корневому `div` в `OverflowList.tsx` в рамках этого таска и закоммитить вместе. Проверить slug `Tag`: `grep -n "data-slot" packages/design-system/src/components/Tag/Tag.tsx`.

- [ ] **Step 2: При необходимости добавить `data-slot` в `OverflowList.tsx`**

Если корневой `div` (строка ~108) без `data-slot`, заменить:

```tsx
      <div ref={containerRef} className={cn('flex w-full min-w-0', className)} {...props}>
```
на:
```tsx
      <div
        ref={containerRef}
        data-slot='overflow-list'
        className={cn('flex w-full min-w-0', className)}
        {...props}
      >
```

Скорректировать локаторы в тесте под реальные `data-slot` значения (`Tag` может использовать другой slug — поправить селектор `getVisibleTagCount`).

- [ ] **Step 3: Запустить E2E (требует поднятого Storybook)**

Run (локально): `pnpm --filter @wallarm-org/design-system test:e2e -- OverflowList`
Expected: PASS. При первом прогоне визуальных тестов сгенерировать снапшоты (см. README/CI: коммит с `[update-screenshots]` на main или локальный `--update-snapshots`).

- [ ] **Step 4: Коммит**

```bash
npx biome check --write packages/design-system/src/components/OverflowList/OverflowList.e2e.ts packages/design-system/src/components/OverflowList/OverflowList.tsx
git add packages/design-system/src/components/OverflowList/OverflowList.e2e.ts packages/design-system/src/components/OverflowList/OverflowList.tsx
git commit -m "test(overflow-list): AS-1033 e2e reflow on container resize"
```

---

## Task 7: Стори `ResizableWithOverflowList` в Drawer

**Files:**
- Modify: `packages/design-system/src/components/Drawer/Drawer.stories.tsx`

- [ ] **Step 1: Добавить импорты в шапку стори-файла**

В блок импортов `Drawer.stories.tsx` добавить (рядом с существующими импортами компонентов):

```tsx
import { Attribute, AttributeLabel, AttributeValue } from '../Attribute';
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
```

> Проверить точные пути/имена экспортов: `grep -n "export" packages/design-system/src/components/Attribute/index.ts`. Если `Attribute*` экспортируются иначе — поправить импорт.

- [ ] **Step 2: Добавить стори в конец файла (перед закрытием, после `Resizable`)**

```tsx
const DRAWER_TAGS = [
  'api-abuse',
  'account-takeover',
  'credential-stuffing',
  'XSS',
  'SQL Injection',
  'CSRF',
  'scanner',
  'brute-force',
  'data-exfiltration',
];

const renderDrawerOverflow = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** Resizable drawer with an OverflowList — drag the left edge to reflow tags. */
export const ResizableWithOverflowList: StoryFn<DrawerProps> = () => (
  <Drawer defaultOpen>
    <DrawerTrigger asChild>
      <Button>Open Resizable Drawer with OverflowList</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerResizeHandle />
      <DrawerHeader>
        <DrawerTitle>Resizable Drawer with OverflowList</DrawerTitle>
      </DrawerHeader>
      <DrawerBody>
        <p className='mb-16'>Drag the left edge — the tag list reflows live.</p>
        <Attribute>
          <AttributeLabel>Attack types</AttributeLabel>
          <AttributeValue>
            <OverflowList
              className='gap-4'
              items={DRAWER_TAGS}
              itemRenderer={item => <Tag key={item}>{item}</Tag>}
              overflowRenderer={renderDrawerOverflow}
            />
          </AttributeValue>
        </Attribute>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);
```

> Проверить API `Drawer`: поддерживает ли `defaultOpen`. Если нет — использовать контролируемое состояние через `useState`, как в существующих стори (`open`/`onOpenChange`). Сверить с уже написанной стори `Resizable` в этом файле и повторить её паттерн открытия.

- [ ] **Step 3: Проверить типы**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

- [ ] **Step 4: Коммит**

```bash
npx biome check --write packages/design-system/src/components/Drawer/Drawer.stories.tsx
git add packages/design-system/src/components/Drawer/Drawer.stories.tsx
git commit -m "docs(drawer): AS-1033 resizable drawer story with OverflowList"
```

---

## Task 8: Стори `ColumnResizingWithOverflowList` в Table

**Files:**
- Modify: `packages/design-system/src/components/Table/mocks.tsx`
- Modify: `packages/design-system/src/components/Table/Table.stories.tsx`

- [ ] **Step 1: Расширить `tags` в моках для видимого overflow**

В `packages/design-system/src/components/Table/mocks.tsx` массив `securityEvents` сейчас у всех строк `tags: ['api-abuse', 'account-takeover']`. Заменить (для всех вхождений) на более длинный набор, чтобы overflow был заметен:

```tsx
    tags: ['api-abuse', 'account-takeover', 'credential-stuffing', 'scanner', 'brute-force'],
```

Run для проверки числа вхождений: `grep -c "tags: \['api-abuse'" packages/design-system/src/components/Table/mocks.tsx`
Заменить все через редактор/replace_all.

- [ ] **Step 2: Добавить стори в `Table.stories.tsx` (рядом с `ColumnResizing`, после строки ~169)**

Сначала в шапку файла добавить импорты:

```tsx
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
```

Затем стори:

```tsx
const renderTableTagsOverflow = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** Resizable column whose cell hosts an OverflowList — resize it to reflow tags. */
export const ColumnResizingWithOverflowList: StoryFn<typeof meta> = () => {
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({});

  const columns = useMemo<TableColumnDef<SecurityEvent>[]>(
    () => [
      ...securityColumns.slice(0, 1),
      {
        id: 'tags',
        header: 'Tags',
        size: 240,
        cell: ({ row }: { row: { original: SecurityEvent } }) => (
          <OverflowList
            className='gap-4'
            items={row.original.tags}
            itemRenderer={(item: string) => <Tag key={item}>{item}</Tag>}
            overflowRenderer={renderTableTagsOverflow}
          />
        ),
      },
      ...securityColumns.slice(1),
    ],
    [],
  );

  return (
    <Table
      data={securityEvents}
      columns={columns}
      getRowId={row => row.id}
      columnSizing={columnSizing}
      onColumnSizingChange={setColumnSizing}
    />
  );
};
```

> Проверить, что `SecurityEvent`, `TableColumnDef`, `TableColumnSizingState`, `securityColumns`, `securityEvents` уже импортированы в `Table.stories.tsx` (см. существующие `ColumnResizing`/`DynamicColumns` стори — `grep -n "TableColumnDef\|SecurityEvent\|TableColumnSizingState" packages/design-system/src/components/Table/Table.stories.tsx`). Если чего-то нет — добавить в импорты из `./mocks` и `./types`. Сверить точную форму `cell`/`TableColumnDef` с уже существующими стори, использующими `useMemo<TableColumnDef<...>[]>` (строки ~567, ~626, ~709).

- [ ] **Step 3: Проверить типы**

Run: `pnpm --filter @wallarm-org/design-system typecheck`
Expected: PASS.

- [ ] **Step 4: Коммит**

```bash
npx biome check --write packages/design-system/src/components/Table/mocks.tsx packages/design-system/src/components/Table/Table.stories.tsx
git add packages/design-system/src/components/Table/mocks.tsx packages/design-system/src/components/Table/Table.stories.tsx
git commit -m "docs(table): AS-1033 resizable column story with OverflowList"
```

---

## Task 9: E2E drag-ресайз для Drawer и Table

**Files:**
- Modify: `packages/design-system/src/components/Drawer/Drawer.e2e.ts`
- Modify: `packages/design-system/src/components/Table/Table.e2e.ts`

> Drag через `page.mouse` детерминирован при достаточном смещении. Локаторы: ручка дровера — `TooltipTrigger` с `cursor-col-resize`; ресайз колонки — `data-testid`, оканчивающийся на `--resize` (см. `TableResizeHandler.tsx`, `useTestId('resize')`). Перед написанием подтвердить реальные testid/роли через `grep`.

- [ ] **Step 1: Drawer — interaction-тест ресайза**

Добавить в `Drawer.e2e.ts` (в существующий `test.describe('Component: Drawer')`, секция `Interactions`; добавить story в `createStoryHelper`-массив: `'Resizable With Overflow List'`):

```ts
test.describe('Interactions', () => {
  test('Should reflow the OverflowList when the drawer is resized narrower', async ({ page }) => {
    await drawerStory.goto(page, 'Resizable With Overflow List');

    const tagsBefore = await page.locator('[data-slot="overflow-list"] [data-slot="tag"]').count();

    const dialog = page.getByRole('dialog');
    const box = await dialog.boundingBox();
    if (!box) throw new Error('drawer dialog not found');

    // Тянем левую ручку вправо → дровер сужается.
    await page.mouse.move(box.x, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 250, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();

    await expect
      .poll(() => page.locator('[data-slot="overflow-list"] [data-slot="tag"]').count())
      .toBeLessThan(tagsBefore);
  });
});
```

> Сверить селектор тегов с реальными `data-slot` (как в Task 6). Если у дровера несколько `dialog`-ролей — уточнить локатор.

- [ ] **Step 2: Table — interaction-тест ресайза колонки**

Добавить в `Table.e2e.ts` тест-файл (если в нём нет `createStoryHelper` — создать по образцу `Drawer.e2e.ts`; story slug таблицы — `data-display-table` или согласно `meta.title`, проверить `grep -n "title:" packages/design-system/src/components/Table/Table.stories.tsx`):

```ts
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tableStory = createStoryHelper('<table-story-slug>', [
  'Column Resizing With Overflow List',
] as const);

test.describe('Component: Table', () => {
  test.describe('Interactions', () => {
    test('Should reflow the OverflowList cell when the column is resized narrower', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Column Resizing With Overflow List');

      const tagsBefore = await page
        .locator('[data-slot="overflow-list"] [data-slot="tag"]')
        .first()
        .locator('xpath=ancestor::*[@data-slot="overflow-list"]')
        .locator('[data-slot="tag"]')
        .count();

      const handle = page.locator('[data-testid$="--resize"]').first();
      const box = await handle.boundingBox();
      if (!box) throw new Error('resize handle not found');

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x - 160, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();

      await expect
        .poll(() =>
          page.locator('[data-slot="overflow-list"]').first().locator('[data-slot="tag"]').count(),
        )
        .toBeLessThan(tagsBefore);
    });
  });
});
```

> Заменить `<table-story-slug>` на реальный slug. Если у таблицы нет `data-testid` на таблице/стори — `createStoryHelper` всё равно работает по story-id. Упростить локатор подсчёта тегов до первого `[data-slot="overflow-list"]`, если xpath окажется хрупким.

- [ ] **Step 3: Запустить E2E**

Run: `pnpm --filter @wallarm-org/design-system test:e2e -- Drawer Table`
Expected: PASS. При флаке drag — увеличить `steps` и/или добавить `await page.waitForTimeout(50)` между фазами мыши.

- [ ] **Step 4: Коммит**

```bash
npx biome check --write packages/design-system/src/components/Drawer/Drawer.e2e.ts packages/design-system/src/components/Table/Table.e2e.ts
git add packages/design-system/src/components/Drawer/Drawer.e2e.ts packages/design-system/src/components/Table/Table.e2e.ts
git commit -m "test(drawer,table): AS-1033 e2e reflow OverflowList on resize"
```

---

## Task 10: Финальная проверка качества

**Files:** нет (только проверки)

- [ ] **Step 1: Полный typecheck + lint + unit-тесты**

Run:
```bash
pnpm --filter @wallarm-org/design-system typecheck
npx biome check packages/design-system/src
pnpm --filter @wallarm-org/design-system test
```
Expected: всё зелёное, 0 ошибок lint/типов.

- [ ] **Step 2: Регрессия потребителей `OverflowList`**

Вручную убедиться (Storybook), что `Attribute` (`Data Display/Attribute`) и `Select` (multiple) с `OverflowList` отображаются корректно — API не сломан.

- [ ] **Step 3: Создать PR**

```bash
git push -u origin feature/AS-1033
gh pr create --title "feat(overflow-list): AS-1033 resizable container support" --body "<описание>"
```

> Заголовок PR — conventional commit (валидируется CI). Тело — что сделано + ссылка на спеку и тикет.

---

## Self-Review (заполнено автором плана)

**Покрытие спеки:**
- Причина #1 (temp-DOM) → Task 2 (удаление блока). ✅
- Причина #2 (rAF-троттлинг RO) → Task 2. ✅
- Причина #3 (getComputedStyle per tick) → Task 2 (gap читается один раз). ✅
- Причина #4 (O(n²) indexOf) → Task 3. ✅
- Причина #5 (useMemo side-effect) → Task 3. ✅
- Причина #6 (инлайн MeasurementContainer) → Task 2 (`useCallback`). ✅
- Демо Drawer → Task 7; Table → Task 8; standalone → Task 5. ✅
- Component-тесты → Task 4; E2E → Task 6 (standalone), Task 9 (drag). ✅
- Совместимость API → Task 10 Step 2. ✅

**Типы/сигнатуры:** `calculateVisibleCount`/`CalculateVisibleCountParams` определены в Task 1 и используются в Task 2 без расхождений. `UseOverflowItemsOptions`/`Result` не меняются.

**Известные риски (помечены в тасках):**
- Tailwind-классы ширины в Task 5 могут отсутствовать → fallback на inline `style`.
- `data-slot` у `OverflowList`/`Tag` нужно подтвердить перед E2E (Task 6 Step 2 добавляет slug при отсутствии).
- Drag-E2E в Task 9 потенциально флаки → указаны меры (steps, поллинг).
- API открытия `Drawer` (`defaultOpen` vs controlled) — сверить в Task 7.
- Story-slug таблицы — подтвердить в Task 9.
```
