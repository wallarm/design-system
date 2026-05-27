# AS-1033 — OverflowList в ресайзабл-контейнерах

**Дата:** 2026-05-27
**Тикет:** [AS-1033](https://wallarm.atlassian.net/browse/AS-1033)
**Статус:** дизайн утверждён

## Проблема

`OverflowList` (через хук `useOverflowItems`) должен корректно и плавно
перекомпоновываться, когда ширина контейнера меняется в реальном времени:
внутри ресайзабл-дровера (`DrawerResizeHandle`) и в ячейке ресайзабл-колонки
таблицы (TanStack column resizing). Сейчас при перетаскивании ручки ресайза
интерфейс «подвисает».

## Корневые причины

| # | Где | Проблема |
|---|-----|----------|
| 1 | `hooks/useOverflowItems.tsx:84-109` | На **каждый тик** `ResizeObserver` внутри цикла создаётся/вставляется/удаляется временный DOM (`document.createElement` → `appendChild` → чтение `offsetWidth` → `removeChild`). Принудительный синхронный reflow на каждый кадр перетаскивания — главный источник лагов. |
| 2 | `hooks/useOverflowItems.tsx:131` | Callback `ResizeObserver` выполняется синхронно много раз в секунду и вызывает `setState`, что провоцирует новый layout, который снова наблюдает RO. Нет батчинга через `requestAnimationFrame` — риск warning «ResizeObserver loop completed with undelivered notifications». |
| 3 | `hooks/useOverflowItems.tsx:64` | `getComputedStyle(container)` на каждый тик — лишний forced style recalc. |
| 4 | `components/OverflowList/OverflowList.tsx:39,47` | `items.indexOf(item)` в рендерере вызывается на каждый элемент → O(n²) на рендер. |
| 5 | `components/OverflowList/OverflowList.tsx:78-82` | `useMemo` используется как side-effect для `onOverflow` — небезопасно в React 19 (выполняется во время рендера). |
| 6 | `hooks/useOverflowItems.tsx:144` | `MeasurementContainer` — инлайн-компонент, пересоздаётся каждый рендер. |

## Подход

Выбран: **оптимизация текущего движка** (скрытый слой измерения +
`ResizeObserver`), без перехода на IntersectionObserver.

Принципы (best practices из ресёрча — см. «Источники»):
- **Разделить read и write**: внутри resize-callback — только чтение/арифметика
  по кэшу, никакого создания/удаления DOM.
- **rAF-батчинг**: всю работу из callback `ResizeObserver` выносим в один
  `requestAnimationFrame`, коалесцируя несколько нотификаций кадра в один проход.
- **Кэш измерений**: ширины элементов, gap и ширину индикатора `+N` меряем один
  раз (при смене `items`/рендереров), а не на каждый тик ресайза.

### Изменения в `useOverflowItems`

1. **Мерить индикатор через слой измерения**, а не temp-DOM. Рендерим
   overflow-индикатор в скрытом контейнере со своим ref и меряем его
   `offsetWidth` один раз. Весь блок `document.createElement` (строки ~84-109)
   удаляется.
2. **Кэш измерений**: ширины элементов + gap + ширина индикатора хранятся в ref;
   пересчёт только при изменении `items`/рендереров.
3. **rAF-троттлинг `ResizeObserver`**: callback планирует один
   `requestAnimationFrame`, в котором выполняется `calculateVisibleItems`;
   pending rAF отменяется в cleanup. Это документированный фикс и от jank,
   и от warning'а «ResizeObserver loop».
4. **gap читаем один раз** на этапе измерения, не на каждый тик.
5. **Guard на setState**: `setVisibleCount` вызывается только если значение
   реально изменилось — меньше ререндеров и нет RO-feedback-петли.
6. `MeasurementContainer` стабилизируем через `useCallback`.

### Изменения в `OverflowList`

1. Карта `item → index` через `useMemo` (или прямой `map` по индексам) вместо
   `indexOf` — убираем O(n²).
2. `onOverflow` переносим из `useMemo` в `useEffect`.
3. Overflow-индикатор передаётся хуку для измерения через уже существующий
   `overflowRenderer`.

### Совместимость API

Публичные сигнатуры `OverflowListProps` и `useOverflowItems` **не меняются**.
`reserveSpace` становится fallback-полом (используется, пока реальный индикатор
не измерен, либо когда `overflowRenderer` не задан). Существующие потребители —
`Attribute`, `SelectInput` — продолжают работать без изменений.

## Демо (Storybook)

- **Drawer** (`Drawer.stories.tsx`): новая стори `ResizableWithOverflowList` —
  дровер с `DrawerResizeHandle`, в теле `Attribute` с `OverflowList` тегов;
  перетаскивание ручки реально перекомпоновывает список.
- **Table** (`Table.stories.tsx`): новая стори `ColumnResizingWithOverflowList` —
  колонка, чья ячейка рендерит `OverflowList` над `row.original.tags` (набор
  тегов расширяется в `mocks.tsx` для видимого overflow), с включённым ресайзом
  колонок.
- **OverflowList** (новый файл `OverflowList.stories.tsx`): `Basic`,
  `CollapseFromStart`, `MinVisibleItems` и `ResizableContainer` (обёртка с CSS
  `resize: horizontal`) для standalone-демо живой перекомпоновки.

## Тесты

- **Component (Vitest + Testing Library)**: логика с замоканными `offsetWidth` и
  `ResizeObserver` — корректность карты индексов, `minVisibleItems`,
  срабатывание `onOverflow` через `useEffect`.
- **E2E (Playwright)** по правилам `docs/e2e-test-rules.md`:
  - standalone resizable-стори: сжать контейнер → появляется `+N`, растёт
    hiddenCount; растянуть → элементы возвращаются;
  - drag ручки дровера → перекомпоновка;
  - drag ресайза колонки таблицы → перекомпоновка ячейки;
  - визуальные скриншоты узких/широких состояний.

## Критерии готовности

1. При перетаскивании ручки ресайза дровера и колонки таблицы нет видимых
   подвисаний; внутри resize-callback не создаётся/не удаляется DOM.
2. `OverflowList` корректно сворачивает/разворачивает элементы при изменении
   ширины контейнера в обе стороны.
3. Нет O(n²) и нет side-effect в `useMemo`.
4. Демо-стори добавлены в Drawer, Table и отдельный `OverflowList.stories.tsx`.
5. Component- и E2E-тесты зелёные; lint/typecheck без ошибок.

## Источники (ресёрч производительности)

- [MDN — ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [Avoiding pitfalls with the resize event (OpenReplay)](https://blog.openreplay.com/avoiding-resize-event-pitfalls-js/)
- [TrackJS — Fix `ResizeObserver loop limit exceeded`](https://trackjs.com/javascript-errors/resizeobserver-loop-limit-exceeded/)
