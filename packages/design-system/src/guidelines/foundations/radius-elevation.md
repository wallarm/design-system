---
title: Radius and elevation
description: Use when choosing a border radius or a shadow for your own element, or when matching the corners and depth of a design-system surface.
components: [Button, Input, Select, Card, CardContent, Tag, Tooltip, Avatar, DropdownMenu, Popover, PopoverTrigger, PopoverContent, Drawer, Dialog, SearchModal, Alert, Table, Toast, ChatInput, Checkbox, Radio, Switch, Kbd, NavRail, SegmentedControl, Skeleton, InputGroup, SplitButton]
keywords: [radius, border-radius, rounded, corners, shadow, box-shadow, elevation, depth, drop shadow, raised, floating, dark mode, rounded-8, rounded-12, shadow-md, shadow-xl]
order: 40
---

# Radius and elevation

Radius utilities are named in pixels. Shadows are named by size and do not change in dark mode.

## What you use

| Need | Use | Not |
| --- | --- | --- |
| Corners on a control-sized element | `rounded-8` | `rounded-lg`, `rounded-md`, `rounded` |
| Corners on a menu item or a small inline chip | `rounded-6` | `rounded-md` |
| Corners on a panel or floating surface | `rounded-12` | `rounded-xl` |
| A circle or a pill | `rounded-full` | `rounded-[50%]`, `rounded-[999px]` |
| A bordered tile with a shadow | `Card` | A `div` with `rounded-8 border shadow-sm` |
| A floating panel anchored to a trigger | `Popover`, `PopoverTrigger`, `PopoverContent` | A positioned `div` with `rounded-12 shadow-md` |
| A side panel or a modal | `Drawer` or `Dialog` | A `div` with `rounded-12 shadow-xl` |
| A loading placeholder with matching corners | `<Skeleton rounded={8} />` | `<Skeleton className='rounded-8' />` |
| Depth on your own floating element | `shadow-md` + `border border-border-primary-light bg-bg-surface-2` | `shadow-md` alone, `drop-shadow-*` |

## Rules

- Read `rounded-*` numbers as pixels. If a value is off the scale, round to the nearest step.
- **Never** use Tailwind's named radii (`rounded-xs` … `rounded-4xl`) or bare `rounded`. They compile to rem defaults off the scale.
- **Never** write an arbitrary radius or shadow such as `rounded-[15px]` or `shadow-[0_2px_4px_rgba(0,0,0,0.1)]`.
- If your element sits next to a design-system component, copy that component's radius. A custom button-sized element next to `Button` gets `rounded-8`.
- If you nest a rounded element inside a padded rounded container, use a smaller inner radius: `rounded-12` outside, 4px padding, `rounded-8` inside.
- If you round only some corners, use side or corner variants of the same step: `rounded-t-12`, `rounded-tl-12`.
- If an element stays in the page flow, give it no shadow. `Card` is the one in-flow surface with a shadow (`shadow-sm`).
- If an element floats, use the shadow for its layer below.
- If you add a shadow to your own floating element, pair it with `border border-border-primary-light` and a surface fill such as `bg-bg-surface-2`. They carry the depth in dark mode.
- **Never** add `shadow-*` to `Card`, `Input`, `Button` or another design-system component. They own their shadow.
- **Never** add a dark-mode shadow (`dark:shadow-lg`) or use `shadow-2xl`.
- **Never** use a shadow as a focus indicator. See [Focus](./focus.md).

There is no `--elevation-*` token, no `shadow-card`/`shadow-popover`/`shadow-modal` utility, and no dark-mode shadow value.

## Examples

A placeholder takes its corners from the `rounded` prop.

```tsx
import { Card, CardContent, Skeleton } from '@wallarm-org/design-system';

export const UsageTile = ({ loading }: { loading: boolean }) => (
  <Card>
    <CardContent>
      {loading ? (
        <Skeleton width='100%' height='120px' rounded={8} />
      ) : (
        <div className='h-120 rounded-8 border border-border-primary-light' />
      )}
    </CardContent>
  </Card>
);
```

A custom floating element pairs its shadow with a border and fill.

```tsx
<div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12 shadow-md'>
  …
</div>
```

A nested item steps the radius down.

```tsx
<div className='flex rounded-12 bg-bg-surface-2 p-4'>
  <div className='rounded-8 bg-bg-surface-1 px-12 py-6'>Day</div>
</div>
```

## Reference

### Radius scale

| Utility | Value | Used by |
| --- | --- | --- |
| `rounded-none` | 0 | Joined edges in `InputGroup`, `SplitButton` |
| `rounded-2` | 2px | Indicators, status dots |
| `rounded-4` | 4px | `Checkbox` box, `Kbd`, `Switch` thumb |
| `rounded-6` | 6px | `DropdownMenu` items, small badges, `Skeleton` default |
| `rounded-8` | 8px | `Button`, `Input`, `Select`, `Tag`, `Tooltip`, `Card`, `Avatar` sm/md |
| `rounded-10` | 10px | `NavRail` items |
| `rounded-12` | 12px | `Popover`, `DropdownMenu`, `Dialog`, `Drawer`, `Alert`, `Table` container |
| `rounded-16` | 16px | `Toast`, `ChatInput`, chat messages |
| `rounded-24`, `rounded-32` | 24px, 32px | `Skeleton` only |
| `rounded-full` | 9999px | `Radio`, numeric badges, pills |

`Skeleton` `rounded` accepts `'none'`, `'full'`, `2`, `4`, `6`, `8`, `10`, `12`, `16`, `24`, `32`.

### Elevation scale

| Utility | Layer | Used by |
| --- | --- | --- |
| `shadow-none` | Reset | Fields inside `InputGroup` |
| `shadow-2xs` | Hairline lift | Bordered filter triggers |
| `shadow-xs` | Raised control | `Button` primary/outline, `Input`, `Select`, `Checkbox` |
| `shadow-sm` | In-flow tile, moving thumb | `Card`, `Switch` thumb, `SegmentedControl` indicator |
| `shadow-md` | Anchored floating surface | `Popover`, `DropdownMenu`, tooltip tour steps |
| `shadow-lg` | Notification, dragged item | `Toast`, `Table` bulk action bar, dragged rows |
| `shadow-xl` | Modal layer | `Drawer`, `Dialog`, `SearchModal` |

See [Spacing](./spacing.md) for padding inside rounded surfaces.
