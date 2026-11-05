---
title: Focus
description: Use when an element must show keyboard focus, to pick the ring recipe, the focus color token, and where no ring goes.
components: [Button, Card, CardContent, Input, Textarea, InputGroup, Checkbox, Radio, Switch, DropdownMenu, DropdownMenuItem, Select, SelectOption, NavRail, Slider, Link]
keywords: [focus, focus-visible, ring, focus ring, outline, keyboard, a11y, accessibility, tab, ring-inset, focus-within]
order: 60
---

# Focus

Keyboard focus is a 3px ring in a translucent focus color, shown on `:focus-visible`.
DS components draw it already. Write a ring only on elements your app builds.

## What you use

| Need | Use | Not |
| --- | --- | --- |
| Ring on an app-built control | `outline-none focus-visible:ring-3 focus-visible:ring-focus-primary` | `focus:ring-*` |
| Ring on a brand-colored control | `focus-visible:ring-focus-brand` | `ring-focus-primary` |
| Ring on a destructive control or invalid field | `focus-visible:ring-focus-destructive` | `ring-focus-primary` |
| Ring inside `overflow-hidden` or flush to a container edge | add `focus-visible:ring-inset` | an outer ring, which gets clipped |
| Ring on a wrapper around a native input | `has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-focus-primary` (or `focus-within:`) | a ring on the inner input |
| Input with addons | `InputGroup` | a hand-built wrapper ring |
| Focusable card | `Card` with `onClick` | a `<div tabIndex>` with your own ring |
| Focus color on a DS button | the `Button` `color` prop (default `brand`) | a `className` override |

## Rules

- Use `focus-visible:`, not `focus:`. The ring is for keyboard focus only.
- Pair the ring with `outline-none`, so the browser outline and the ring never show together.
- Use `ring-3`. **Never** copy `ring-2` from Card, Resizable, CodeEditor or SimpleCharts: it is known drift.
- Always set a `ring-focus-*` color. `ring-3` alone draws the default color.
- Keep the element's radius; the ring follows it.
- If a parent has `overflow-hidden`, add `ring-inset`.
- If the control is brand-colored (`Button` with `color='brand'` in any variant, a checked or indeterminate Checkbox, a checked Radio or Switch), use `ring-focus-brand`. Neutral controls (`Button` with `color='neutral'` or `'neutral-alt'`, unchecked Checkbox, Radio or Switch, tabs, tags, inputs) use `ring-focus-primary`.
- If the control is destructive (`Button` with `color='destructive'`, any variant), use `ring-focus-destructive`.
- If you build a text field, match `Input`: on focus, `focus-visible:not-disabled:border-border-strong-primary` plus `ring-focus-primary`. Invalid: keep `border-border-strong-danger`, ring `ring-focus-destructive`, hover `ring-focus-destructive-hover`.
- If an input sits inside a styled wrapper, put the ring on the wrapper.
- If focus moves by arrow keys (menu, listbox), the highlighted row is the indicator. `DropdownMenuItem` and `SelectOption` use `bg-states-primary-hover`; brand and danger items use `bg-states-brand-hover` and `bg-states-danger-hover`.
- `NavRail` items show an overlay (`overlay-states-primary-hover`); the `Slider` thumb scales up with a shadow. Neither gets a ring.
- **Never** add a ring to a menu item or listbox option.
- **Never** add a ring to a popover, dialog or drawer surface (`DropdownMenu`, `Select` content, `Drawer`).
- **Never** use `outline-none` on an interactive element without a replacement indicator.
- **Never** use a border color, `ring-border-*` or a raw palette color as a focus ring.
- **Never** use `ring-focus-ring-primary`. The token exists but nothing uses it.
- **Never** add `ring-offset-*`. DS rings sit flush.
- **Never** override a DS component's ring through `className`. Pick the `color` prop.

### What does not exist

- No bare `ring-focus` token; always add a suffix.
- No `--ring` or ring-width token. Width is the `ring-3` utility.
- No `focusRing` prop on any component.
- No exported focus-ring class helper. Write the class string.
- `Link` has no focus-visible style, only `outline-none`. This is a known gap.

## Examples

A DS button picks its ring color from `color`; no class needed.

```tsx
import { Button } from '@wallarm-org/design-system';

export const DeleteButton = ({ onDelete }: { onDelete: () => void }) => (
  <Button variant='primary' color='destructive' onClick={onDelete}>
    Delete
  </Button>
);
```

A card becomes focusable and draws its ring once it has a click handler.

```tsx
import { Card, CardContent } from '@wallarm-org/design-system';

export const DetailsCard = ({ onOpen }: { onOpen: () => void }) => (
  <Card onClick={onOpen}>
    <CardContent>Open details</CardContent>
  </Card>
);
```

An app-built control uses the standard recipe.

```tsx
export const CustomTrigger = ({ onOpen }: { onOpen: () => void }) => (
  <button
    type='button'
    className='rounded-8 outline-none focus-visible:ring-3 focus-visible:ring-focus-primary'
    onClick={onOpen}
  >
    Custom trigger
  </button>
);
```

A row inside a scroller with `overflow-hidden` uses an inset ring.

```tsx
export const ClippedRow = ({ onSelect }: { onSelect: () => void }) => (
  <div className='overflow-hidden'>
    <button
      type='button'
      className='w-full outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-focus-primary'
      onClick={onSelect}
    >
      Row
    </button>
  </div>
);
```

## Reference

`ring-*` widths are px in Tailwind v4 (`ring-3` is 3px) and do not scale with `--spacing`.

| Token | Utility | Value |
| --- | --- | --- |
| `--color-focus-primary` | `ring-focus-primary` | `slate-400` at 30% |
| `--color-focus-brand` | `ring-focus-brand` | `w-orange-600` at 30% |
| `--color-focus-destructive` | `ring-focus-destructive` | `red-600` at 20% |
| `--color-focus-destructive-hover` | `ring-focus-destructive-hover` | `red-600` at 30% |
