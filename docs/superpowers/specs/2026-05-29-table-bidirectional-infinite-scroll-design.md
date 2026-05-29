# Двунаправленный бесконечный скролл в Table

**Дата:** 2026-05-29
**Статус:** Утверждён дизайн, готов к плану реализации
**Компонент:** `packages/design-system/src/components/Table`

## 1. Цель и принципы

Добавить подгрузку строк **вверх** (по новому параметру ручки `prev_cursor`) симметрично к
существующей подгрузке **вниз** (`next_cursor`). Дополнительно — открывать таблицу вокруг
произвольной anchor-строки и скроллить в обе стороны без «прыжков» вьюпорта.

Данные и курсоры остаются на стороне приложения (consumer-managed, как сейчас). Table отвечает
только за:
- детект приближения к краю (верх/низ);
- scroll anchoring при добавлении строк сверху (prepend);
- начальное позиционирование на anchor-строке.

Сохранение/восстановление курсоров (URL/storage) — на стороне приложения.

## 2. Контекст и текущая реализация

- Стек: **TanStack Table 8.21.3** + **TanStack Virtual 3.13.18**. TanStack Query нет — fetching
  целиком на потребителе.
- Скролл вниз: хук `hooks/useEndReached.ts` слушает `scroll`, при `distanceToBottom <= threshold`
  зовёт `onEndReached`. Потребитель сам добавляет строки в `data`.
- Виртуалайзеры (`TableBody/TableBodyVirtualizedContainer.tsx`, `TableBodyVirtualizedWindow.tsx`)
  **не задают `getItemKey`** → ключи по индексу.
- `TableBody/useResetVirtualizerOnDataChange.ts` зовёт `virtualizer.measure()` при любой смене id
  первой строки.
- Imperative handle `TableHandle.scrollToRow(id, opts)` уже существует.

### Решение по библиотеке

Нативные опции TanStack Virtual `anchorTo: 'end'` / `followOnAppend` появились только в
`@tanstack/virtual-core@3.16.0` (в нашем `@tanstack/react-virtual@3.13.18` их нет) и заточены под
always-end-anchored ленты (чаты/логи). Наш кейс — двунаправленный скролл с произвольным якорем,
поэтому выбран **ручной scroll anchoring на текущей версии** без апгрейда зависимостей.
`@ark-ui/react` в Table не используется и к скроллу отношения не имеет.

## 3. Публичный API (добавления в `TableProps<T>`)

```ts
// --- Infinite scroll (bidirectional) ---
/** Вызывается при скролле к началу (верху) таблицы */
onStartReached?: () => void
/** Дистанция от верха (px) для срабатывания onStartReached (default: 200) */
onStartReachedThreshold?: number

// существующие — без изменений:
onEndReached?: () => void
onEndReachedThreshold?: number

/**
 * Row id для начального позиционирования. Если задан — таблица скроллит к этой строке
 * на маунте и армит детекторы краёв только ПОСЛЕ того, как начальный скролл устоялся.
 * Для deep-link в середину датасета с двунаправленной подгрузкой.
 */
initialScrollToRowId?: string
```

Поведение `onEndReached` / `onEndReachedThreshold` / `scrollToRow(id)` не меняется.
Тип `TableContextValue<T>` расширяется зеркально (`onStartReached`, `onStartReachedThreshold`,
`initialScrollToRowId`), `TableProvider` прокидывает их в контекст.

## 4. Внутренняя архитектура

### 4.1. Детект края — рефактор `useEndReached` → `useScrollEdge`

Обобщить `useEndReached.ts` до `useScrollEdge({ edge: 'start' | 'end', mode, scrollRef, onReached, threshold })`:
- `edge: 'end'` — как сейчас: `distanceToBottom <= threshold`.
- `edge: 'start'` — `scrollTop <= threshold`; ре-арм при `scrollTop > threshold`.
- Тот же cooldown-гард (`SCROLL_EDGE_COOLDOWN_MS`, см. 4.6) и latest-callback ref.

Внутри слайса вызывается дважды (для `start` и `end`); наружу обёрнут оркестратором
`useInfiniteScroll` (см. 4.6), который и потребляют `TableInnerContainer` / `TableInnerWindow`.

### 4.2. Scroll anchoring при prepend — новый хук `usePrependScrollAnchor`

В `useLayoutEffect` (до отрисовки, без мерцания):
- держим `prevFirstRowId` и `prevScrollHeight` в ref-ах, обновляемых в конце каждого layout-эффекта;
- если id первой строки сменился **и** прежняя первая строка всё ещё присутствует в новом наборе →
  это prepend (а не полная замена);
- считаем `delta = newScrollHeight − prevScrollHeight` и компенсируем:
  - container: `scrollEl.scrollTop += delta`;
  - window: `window.scrollBy(0, delta)`.

Использует фактический `scrollHeight`, поэтому устойчив к ошибкам оценки высоты строк.

### 4.3. `getItemKey` в виртуалайзерах

Добавить в `TableBodyVirtualizedContainer` и `TableBodyVirtualizedWindow`:
```ts
getItemKey: useCallback(
  (index) => table.getRowModel().rows[index]?.id ?? index,
  [table],
)
```
Без этого кэш измерений привязан к индексу и мисметчится при prepend.

### 4.4. `useResetVirtualizerOnDataChange` — prepend-aware

Различать:
- прежняя первая строка **исчезла** из набора → новый датасет → `virtualizer.measure()` (как сейчас);
- прежняя первая строка **сместилась вниз** (есть в наборе) → prepend → не сбрасываем измерения,
  отдаём anchoring-хуку.

### 4.5. Арминг при `initialScrollToRowId`

Когда проп задан:
- подавить немедленный `check()` на маунте в `useScrollEdge`;
- скроллить к строке через `virtualizer.scrollToIndex` (или `scrollToRow`);
- `readyRef` флипается в `true` на следующем кадре; детекторы краёв срабатывают только после этого.

Иначе на старте (`scrollTop = 0`) мгновенно стрельнёт `onStartReached`.

## 4.6. Организация файлов (FSD-проверка)

Явного FSD-конфига в репозитории нет, но Table уже следует послойной структуре с
однонаправленными зависимостями и публичным API через `index.ts`-барреллы. Новая логика
встраивается в эту же модель и сама проверяется по принципам FSD: высокая связность внутри
слайса, низкая связанность между слайсами, импорты только «вниз».

### Слои и направление зависимостей (сверху вниз, импорты только вниз)
```
Table.tsx / TableProvider      (корень — собирает всё)
  └─ TableInner/* , TableBody/* (потребляют хуки и lib)
       └─ hooks/infiniteScroll/* (логика фичи; зависит только от lib + react + virtual-core types)
            └─ lib/*             (чистые helpers и константы; без импортов из компонентов/хуков)
                 └─ primitives/* (TBody/Td/Tr/...)
```
Запрет: `hooks/` и `lib/` не импортируют из `TableInner`/`TableBody`/корня — нужные элементы и
значения передаются аргументами (refs, callbacks). Внутренние файлы слайса наружу Table не
реэкспортируются — публичная поверхность только пропсы в корневом `index.ts`.

### Группировка в папку: `hooks/infiniteScroll/`
Вся логика фичи когезивна → объединяется в один слайс-папку с единственным публичным экспортом:
```
hooks/infiniteScroll/
  useInfiniteScroll.ts        # оркестратор: композит start/end + anchor + initial-anchor
  useScrollEdge.ts            # детект края (рефактор useEndReached, edge: 'start' | 'end')
  usePrependScrollAnchor.ts   # дельта-компенсация scrollTop при prepend
  useInitialAnchor.ts         # initialScrollToRowId: scrollToIndex + арминг (readyRef)
  types.ts                    # локальные типы слайса
  index.ts                    # реэкспорт только useInfiniteScroll
```
`TableInnerContainer` и `TableInnerWindow` вместо двух прямых вызовов `useEndReached` зовут один
`useInfiniteScroll({ mode, scrollRef, ... })` — это убирает дублирование и прячет внутренние хуки.
`hooks/index.ts` экспортирует `useInfiniteScroll` (вместо `useEndReached`).

### Вынос в `lib/` (чистые, переиспользуемые единицы)
- `lib/constants.ts`: добавить `TABLE_START_REACHED_THRESHOLD = 200` (зеркало
  `TABLE_END_REACHED_THRESHOLD`) и вынести cooldown из хука в `SCROLL_EDGE_COOLDOWN_MS = 200`
  (сейчас локальная `COOLDOWN_MS` внутри `useEndReached`).
- `lib/detectDataChange.ts`: чистый предикат `detectDataChange(prevFirstRowId, rows): 'prepend' |
  'replace' | 'none'`. Единый источник логики «prepend vs полная замена» — используется
  и в `usePrependScrollAnchor` (4.2), и в `useResetVirtualizerOnDataChange` (4.4); убирает
  дублирование детекта. (`append` и «без изменений» сворачиваются в `'none'` — ни один потребитель
  их не различает.)
- `lib/getRowKey.ts`: helper `getRowKey(rows, index)` для `getItemKey` (4.3) — общий для обоих
  виртуалайзеров вместо инлайна в двух местах.

Всё новое экспортируется через соответствующие `index.ts` (`lib/index.ts`, `hooks/index.ts`,
`hooks/infiniteScroll/index.ts`).

### Компоненты
Новые компоненты не требуются: индикатор загрузки сверху — на стороне потребителя (раздел 8.2),
скелетоны переиспользуют существующий `TableLoadingState`. Если в будущем понадобится top-loader —
он добавляется отдельным компонентом в папку Table, а не инлайном.

### Комментарии
Минимальные и лаконичные: короткий однострочный JSDoc на каждый новый хук/helper (как в текущих
`useEndReached`, `constants.ts`), без построчных комментариев и без описания очевидного. Объяснять
только неочевидное (напр. почему `useLayoutEffect`, почему latest-callback ref).

## 5. Потоки данных

### Top-down (без изменений)
Первая страница → скролл вниз → `onEndReached` → потребитель аппендит по `next_cursor`.

### Deep-link двунаправленный
1. Потребитель грузит окно вокруг anchor (используя `prev_cursor` и `next_cursor` относительно якоря).
2. Передаёт `data` + `initialScrollToRowId={anchorId}`.
3. Таблица скроллит к якорю, армит детекторы.
4. Скролл вверх → `onStartReached` → потребитель prepend'ит старую страницу (`prev_cursor`) →
   anchor-хук компенсирует `scrollTop`, прыжка нет.
5. Скролл вниз → `onEndReached` → append (`next_cursor`).

## 6. Краевые случаи

- Датасет меньше вьюпорта (оба края сразу): cooldown + ре-арм + потребительские гарды `hasPrev`/`hasNext`
  предотвращают зацикливание вызовов.
- Смена сортировки/фильтра = полная замена набора → reset-путь (см. 4.4), скролл к верху, детекторы
  переармятся.
- Non-virtualized режим: anchor-хук работает на scroll-контейнере; `getItemKey` неприменим.
- Window-режим: компенсация через позицию окна с учётом контента над таблицей; основной
  протестированный путь — `container`.

## 7. Тестирование

- **Unit (Vitest):**
  - `lib/detectDataChange`: чистый предикат — основной носитель логики prepend/replace/append/none.
  - `useScrollEdge`: fire/re-arm/cooldown для `start` и `end`.
  - `usePrependScrollAnchor`: дельта-математика компенсации `scrollTop`.
  - `useResetVirtualizerOnDataChange`: reset (replace) vs prepend через `detectDataChange`.
- **E2E (Playwright)** — `Table.e2e.ts`:
  - Новая стори `BidirectionalInfiniteScroll` + `useBidirectionalData` в `mocks.tsx` (отдаёт
    prev/next-курсоры, `fetchPrevPage` / `fetchNextPage`, `initialAnchor`).
  - Сценарии: скролл вверх грузит старые без прыжка (anchor-строка остаётся в вьюпорте), скролл вниз
    грузит новые, комбинированно.
  - Визуальные скриншоты.

## 8. Принятые решения по открытым вопросам

1. Рефактор `useEndReached` → параметризованный `useScrollEdge` (вместо хука-близнеца), чтобы логика
   start/end не разъезжалась.
2. Индикатор загрузки сверху — на стороне потребителя (YAGNI); его высота попадает в `scrollHeight`
   delta, так что anchoring остаётся корректным.
3. `initialScrollToRowId` добавляется как новый проп — чисто решает гонку арминга, не полагаясь на
   тайминг imperative `scrollToRow`.

## 9. Вне скоупа

- Сохранение/восстановление курсоров в URL/storage (на стороне приложения).
- Апгрейд `@tanstack/react-virtual` / нативный `anchorTo`.
- Горизонтальный бесконечный скролл.
