# SplitButton Component Design

## Overview

SplitButton — визуальная обёртка, которая "склеивает" ровно 2 кнопки в единую группу. Паттерн: основное действие + chevron-кнопка для открытия дропдаун-меню с дополнительными опциями.

Компонент **не** управляет дропдауном — это ответственность потребителя (через Popover, Menu и т.д.).

**Референсы:**
- [Figma](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8486-11155)
- [Chakra UI Group (attached)](https://chakra-ui.com/docs/components/group#attached)
- [ReUI ButtonGroup](https://reui.io/components/button-group)

## API

```tsx
interface SplitButtonProps extends ComponentPropsWithRef<'div'>, TestableProps {
  children: ReactNode  // ровно 2 Button-элемента
}
```

### Использование

```tsx
// Базовый
<SplitButton>
  <Button variant="primary" color="brand" onClick={handleSave}>Save</Button>
  <Button variant="primary" color="brand"><ChevronDown /></Button>
</SplitButton>

// С Popover
<Popover>
  <SplitButton data-testid="save-split">
    <Button variant="primary" color="brand" onClick={handleSave}>Save</Button>
    <PopoverTrigger asChild>
      <Button variant="primary" color="brand"><ChevronDown /></Button>
    </PopoverTrigger>
  </SplitButton>
  <PopoverContent>...</PopoverContent>
</Popover>
```

### Rendered HTML

```html
<div role="group" data-slot="split-button" data-testid="save-split"
     class="inline-flex items-center gap-1">
  <!-- children -->
</div>
```

## Стили (CSS-only подход)

Всегда `gap-1` (1px) между кнопками.

Border-radius управляется через вложенные CSS-селекторы на `[data-slot=button]`:
- Первый child → `rounded-r-none` (убрать правый border-radius)
- Последний child → `rounded-l-none` (убрать левый border-radius)

Селекторы дублируются для двух случаев:
- Прямой Button-child: `> :first-child[data-slot=button]`
- Button внутри обёртки (PopoverTrigger asChild): `> :first-child [data-slot=button]`

```ts
// classes.ts
import { cva } from 'class-variance-authority'

export const splitButtonVariants = cva([
  'inline-flex items-center gap-1',
  '[&>:first-child_[data-slot=button]]:rounded-r-none [&>:first-child[data-slot=button]]:rounded-r-none',
  '[&>:last-child_[data-slot=button]]:rounded-l-none [&>:last-child[data-slot=button]]:rounded-l-none',
])
```

Без CVA-вариантов — один базовый класс.

## Файловая структура

```
packages/design-system/src/components/SplitButton/
  ├── index.ts              # реэкспорт
  ├── SplitButton.tsx       # компонент (~25 строк)
  ├── classes.ts            # CVA-классы
  ├── SplitButton.stories.tsx
  └── SplitButton.e2e.ts
```

Плюс экспорт из корневого `packages/design-system/src/index.ts`.

## Компонент

```tsx
// SplitButton.tsx
import type { ComponentPropsWithRef, FC, ReactNode } from 'react'
import { type TestableProps, TestIdProvider } from '../../utils/testId'
import { cn } from '../../utils/cn'
import { splitButtonVariants } from './classes'

export interface SplitButtonProps extends ComponentPropsWithRef<'div'>, TestableProps {
  children: ReactNode
}

export const SplitButton: FC<SplitButtonProps> = ({
  'data-testid': testId,
  className,
  children,
  ref,
  ...props
}) => (
  <TestIdProvider value={testId}>
    <div
      {...props}
      ref={ref}
      role="group"
      data-slot="split-button"
      data-testid={testId}
      className={cn(splitButtonVariants(), className)}
    >
      {children}
    </div>
  </TestIdProvider>
)

SplitButton.displayName = 'SplitButton'
```

## Storybook Stories

1. **Default** — primary/brand, текст + chevron
2. **Outline** — outline/neutral
3. **Secondary** — secondary/neutral
4. **Ghost** — ghost/neutral
5. **WithIcon** — иконка + текст в основной кнопке
6. **Sizes** — small, medium, large в одной story
7. **WithPopover** — chevron обёрнут в PopoverTrigger

## E2E тесты

### Screenshot tests
- Визуальные снимки каждого варианта (variant x color)
- Размеры (small, medium, large)
- С иконками

### Interaction tests
- Клик по основной кнопке и по chevron-кнопке работают независимо

### Accessibility tests
- `role="group"` присутствует
- Keyboard navigation: Tab переключает между кнопками
