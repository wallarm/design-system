---
title: Radius and elevation
description: Use when choosing a border radius or a shadow for your own element, or when matching the corners and depth of a design-system surface.
components: [Button, Input, Select, Card, Tag, Badge, Tooltip, Avatar, DropdownMenu, Popover, Calendar, Drawer, Dialog, SearchModal, Alert, Table, Accordion, Toast, ChatInput, UserMessage, ApprovalCard, Checkbox, Radio, Switch, Kbd, NavRail, NumericBadge, SegmentedControl, Skeleton, Tour, EmptyState, SplitButton, Breadcrumbs, Pagination, InputGroup, NumberInput, FilterDropdown, ToggleButton, Progress, Slider, Indicator]
keywords: [radius, border-radius, rounded, corners, shadow, box-shadow, elevation, depth, drop shadow, raised, floating, dark mode, rounded-8, rounded-12, shadow-md, shadow-xl]
order: 40
---

# Radius and elevation

Radius utilities are named in pixels, and shadows are named by size and do not change in dark mode.

## What you use

| Need | Use | Not |
| --- | --- | --- |
| Corners on a control-sized element | `rounded-8` | `rounded-lg`, `rounded-md`, `rounded` |
| Corners on a menu item or a small inline chip | `rounded-6` | `rounded-md` |
| Corners on a panel, a floating surface or a bordered block | `rounded-12` | `rounded-xl` |
| A circle or a pill | `rounded-full` | `rounded-[50%]`, `rounded-[999px]` |
| A bordered tile with a shadow | `Card` | A `div` with `rounded-8 border shadow-sm` |
| A floating panel anchored to a trigger | `Popover`, `PopoverTrigger`, `PopoverContent` | A `div` with `rounded-12 shadow-md` and your own positioning |
| A side panel or a modal | `Drawer` or `Dialog` | A `div` with `rounded-12 shadow-xl` |
| A loading placeholder with matching corners | `<Skeleton rounded={8} />` | `<Skeleton className='rounded-8' />` |
| Depth on your own floating element | `shadow-md` with `border border-border-primary-light bg-bg-surface-2` | `shadow-md` alone, `drop-shadow-*` |

`rounded-8` is 8px. `rounded-12` is 12px. `rounded-lg` is not part of the scale.

## Rules

- Read every number in a `rounded-*` class as pixels. `rounded-12` is 12px.
- If you need a radius, pick a step from the radius table in the Reference section. If a value is not in the table, round to the nearest step.
- **Never** use Tailwind's named radii: `rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-4xl`. They still compile to Tailwind's rem defaults and drift from the scale.
- **Never** use bare `rounded`. Write the step explicitly.
- **Never** write an arbitrary radius or shadow such as `rounded-[15px]` or `shadow-[0_2px_4px_rgba(0,0,0,0.1)]`.
- If your element sits next to a design-system component, copy that component's radius from the usage table. A custom button-sized element next to `Button` gets `rounded-8`.
- If you nest a rounded element inside a padded rounded container, give the inner element a smaller radius. `SegmentedControl` uses `rounded-12` outside, 4px padding, `rounded-8` inside.
- If you round only some corners, use side or corner variants of the same step: `rounded-t-12`, `rounded-b-12`, `rounded-tl-12`.
- If an element stays in the page flow, give it no shadow. `Card` is the one in-flow surface with a shadow (`shadow-sm`).
- If an element floats over content, give it a shadow from the elevation table that matches its layer.
- If you add a shadow to your own floating element, pair it with `border border-border-primary-light` and a surface fill such as `bg-bg-surface-2`. The border and the fill carry the depth in dark mode.
- **Never** add `shadow-*` to `Card`, `Input`, `Button` or another design-system component. They own their shadow.
- **Never** add a dark-mode shadow variant such as `dark:shadow-lg`. Shadow tokens are the same in light and dark.
- If you need a focus ring, follow [Focus](./focus.md). **Never** use a shadow as a focus indicator.

There is no `--elevation-*` token. There is no `shadow-card`, `shadow-popover` or `shadow-modal` utility. There is no dark-mode value for `--shadow-2xs` through `--shadow-2xl`.

## Reference

### Radius scale

Defined in `src/theme/radius.css`. Each token generates a `rounded-*` utility.

| Utility | Token | Value | Used by |
| --- | --- | --- | --- |
| `rounded-none` | none | 0 | Joined edges inside `InputGroup`, `SplitButton`, `NumberInput` |
| `rounded-2` | `--radius-2` | 2px | `Indicator`, the dot of `Badge` variant `dotted`, chart hover card dots, `Table` cell focus ring, `Progress` size `sm` |
| `rounded-4` | `--radius-4` | 4px | `Checkbox` box, `Kbd`, `Switch` thumb, `Slider` thumb, `Progress` size `md` |
| `rounded-6` | `--radius-6` | 6px | `DropdownMenu` items, `Breadcrumbs` items, inline `CodeSnippet`, `Badge` size `small`, `Progress` size `lg`, `Skeleton` default |
| `rounded-8` | `--radius-8` | 8px | `Button`, `Input`, `Select` input, `Tag`, `Tooltip`, `Card`, `Badge` sizes `medium` and `large`, `Avatar` sizes `sm` and `md`, `Switch` track, `SegmentedControl` item, `Pagination` |
| `rounded-10` | `--radius-10` | 10px | `NavRail` items, nav panel items |
| `rounded-12` | `--radius-12` | 12px | `Popover`, `DropdownMenu`, `Calendar`, chart hover card, `Drawer`, `Dialog`, `SearchModal`, `Alert`, `Table` container, `Accordion`, `SegmentedControl` track, `Avatar` size `lg`, `Tour` dialog step |
| `rounded-16` | `--radius-16` | 16px | `Toast`, `Table` bulk action bar, `ChatInput`, `UserMessage`, `ApprovalCard`, `Tour` tooltip step |
| `rounded-24` | `--radius-24` | 24px | `Skeleton` only |
| `rounded-32` | `--radius-32` | 32px | `Skeleton` only |
| `rounded-full` | `--radius-full` | 9999px | `Radio`, `NumericBadge`, `Progress` size `xs` (default), country flags, resize handles |

`Skeleton` accepts `rounded` as `'none'`, `'full'`, `2`, `4`, `6`, `8`, `10`, `12`, `16`, `24` or `32`. The default is `6`.

### Elevation scale

Defined in `src/theme/shadow.css`. Each token generates a `shadow-*` utility.

| Utility | Value | Layer | Used by |
| --- | --- | --- | --- |
| `shadow-none` | none | Reset | Fields inside `InputGroup`, `ChatInput` on focus |
| `shadow-2xs` | `0 1px 0 0 rgba(0,0,0,0.05)` | Hairline lift | `FilterDropdown` bordered trigger |
| `shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Raised control | `Button` variants `primary` and `outline`, `ToggleButton` variant `outline`, `Input`, `Select` input, `Checkbox` box, `Radio`, `ChatInput` |
| `shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)` | In-flow tile, moving thumb | `Card`, `Switch` thumb, `SegmentedControl` indicator, `Slider` thumb |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.1)` | Anchored floating surface | `Popover`, `DropdownMenu`, `Calendar`, chart hover card, `Tour` tooltip step |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | Notification, dragged item | `Toast`, `Table` bulk action bar, dragged `Table` row |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | Modal layer | `Drawer`, `Dialog`, `SearchModal`, `Tour` dialog step |
| `shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Unused | No component uses it. **Never** reach for it. |

### Dark mode

The `--shadow-2xs` to `--shadow-2xl` tokens are defined once, in `src/theme/shadow.css`. The `[data-theme="dark"]` block in `src/theme/semantic.css` does not redefine them. Every `shadow-*` utility renders the same in light and dark.

The one shadow that changes in dark is `--shadow-empty-state-medallion`. It belongs to `EmptyState` and is not for app use.

### Example

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

See [Spacing](./spacing.md) for padding inside rounded surfaces.
