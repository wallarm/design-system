---
title: Focus
description: Use when an element must show keyboard focus, to pick the ring recipe, the focus color token, and where no ring goes.
components: [Button, Input, Textarea, InputGroup, Card, Tabs, Checkbox, Radio, Switch, DropdownMenu, DropdownMenuItem, Select, SelectOption, NavRail, Slider, Link]
keywords: [focus, focus-visible, ring, focus ring, outline, keyboard, a11y, accessibility, tab, ring-inset, focus-within]
order: 60
---

# Focus

Keyboard focus is a 3px box-shadow ring in a translucent focus color.
DS components already draw it. Use the recipes on this page only for elements your app builds itself.

## What you use

| Need | Use |
| --- | --- |
| Focus ring on a standalone control | `outline-none focus-visible:ring-3 focus-visible:ring-focus-primary` |
| Focus ring on a brand-colored control | `focus-visible:ring-focus-brand` instead of `ring-focus-primary` |
| Focus ring on a destructive control or an invalid field | `focus-visible:ring-focus-destructive` |
| Ring on an element clipped by `overflow-hidden` or flush to a container edge | Add `focus-visible:ring-inset` |
| Ring on a wrapper around a native input | `has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-focus-primary` (or `focus-within:`) on the wrapper |
| Clickable card | `Card` with an `onClick` handler |
| Button | `Button` with `color` set; the ring color follows `color` (default `brand`) |

The `ring-*` width utilities are px in Tailwind v4: `ring-3` is 3px, `ring-2` is 2px.
They do not scale with `--spacing`.

## Rules

### Recipe

- Use `focus-visible:`, not `focus:`. The ring shows for keyboard focus only.
- Pair the ring with `outline-none`. The browser outline and the ring never show together.
- Use `ring-3` for new work. `ring-2` in a few components is known drift.
- Set the ring color explicitly. `ring-3` without a `ring-focus-*` color draws the default color.
- If the element has a radius, keep it. The ring follows `border-radius`.
- If a parent has `overflow-hidden`, add `ring-inset`. An outer ring is clipped there.

### Color

| Element | Ring color | Not |
| --- | --- | --- |
| Neutral control (`Button` with `color='neutral'` or `'neutral-alt'`, tabs, tags, inputs) | `ring-focus-primary` | `ring-focus-brand` |
| Brand control (`Button` with `color='brand'` in any variant, checked or indeterminate checkbox, checked switch, checked radio) | `ring-focus-brand` | `ring-focus-primary` |
| Destructive button (`color='destructive'`, any variant) | `ring-focus-destructive` | `ring-focus-brand` |
| Invalid input, focused | `ring-focus-destructive` | `ring-focus-primary` |
| Invalid input, hovered | `ring-focus-destructive-hover` | `ring-focus-destructive` |

### Fields

- If you build a text field, use the `Input` recipe. It sets `focus-visible:not-disabled:border-border-strong-primary` and `focus-visible:ring-focus-primary`.
- If the field is invalid, swap the ring to `ring-focus-destructive` and keep `border-border-strong-danger`.
- If an input sits inside a styled wrapper, put the ring on the wrapper. `InputGroup` does this with `has-[...]:ring-3`.
- If you need an input with addons, use `InputGroup`. Do not rebuild the wrapper ring.

### Where the ring does not go

| Element | Focus treatment | Not |
| --- | --- | --- |
| Menu item (`DropdownMenuItem`) | Background `bg-states-primary-hover` on `data-highlighted` and `focus` (brand and danger items use `bg-states-brand-hover` and `bg-states-danger-hover`) | A ring |
| Listbox option (`SelectOption`) | Background `bg-states-primary-hover` on `data-highlighted` | A ring |
| Navigation item (`NavRail` items) | Overlay `focus-visible:overlay-states-primary-hover` | A ring |
| Slider thumb (`Slider`) | `focus-visible:scale-110 focus-visible:shadow-md`, the same as hover | A ring |
| Popover surfaces (`DropdownMenu` content, `Select` content, `Drawer` panel) | `outline-none`, no indicator | A ring around the whole surface |
| Table cell with an open context menu | `ring-2 ring-inset ring-border-strong-brand` | This is an open state, not focus |

- Inside a menu or listbox, focus moves by arrow keys. The highlighted row is the indicator.
- **Never** add a ring to a menu item or a listbox option.
- **Never** add a ring to a popover, dialog, or drawer surface.

### Never

- **Never** use `focus:ring-*` for the ring. Use `focus-visible:ring-*`.
- **Never** use `outline-none` without a replacement indicator on an interactive element.
- **Never** use `ring-focus-ring-primary`. The `--color-focus-ring-primary` token exists in `semantic.css` but no component uses it.
- **Never** use a border color, `ring-border-*`, or a raw palette color as a focus ring.
- **Never** add `ring-offset-*` to separate the ring. DS rings sit flush to the element.
- **Never** override the ring on a DS component through `className`. Pick the right `color` prop instead.

### What does not exist

- There is no `ring-focus` token without a suffix. Use `ring-focus-primary`, `ring-focus-brand`, `ring-focus-destructive`, or `ring-focus-destructive-hover`.
- There is no `--ring` or ring-width token. Width is the `ring-3` utility.
- There is no `focusRing` prop on any component.
- There is no exported focus-ring class helper. Write the class string.
- `Link` has no focus-visible style. It sets `outline-none` only. This is a known gap.

## Reference

### Focus color tokens

Defined in `src/theme/focus.css`, imported by `theme/index.css`.

| Token | Utility | Value |
| --- | --- | --- |
| `--color-focus-primary` | `ring-focus-primary` | `slate-400` at 30% alpha |
| `--color-focus-brand` | `ring-focus-brand` | `w-orange-600` at 30% alpha |
| `--color-focus-destructive` | `ring-focus-destructive` | `red-600` at 20% alpha |
| `--color-focus-destructive-hover` | `ring-focus-destructive-hover` | `red-600` at 30% alpha |

### Recipes in use

| Recipe | Used by |
| --- | --- |
| `focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary` | Accordion, Avatar, Breadcrumbs, Pagination, Page, Stepper, Tag, Tabs, SegmentedControl, Table header buttons, Attribute, InlineEdit |
| `focus-visible:ring-3` + `ring-focus-{color}` from the `color` variant | Button (via ButtonBase) |
| `focus-visible:ring-3` + `ring-focus-primary` or `ring-focus-destructive` | Input, Textarea |
| `data-focus-visible:ring-3` + `ring-focus-primary` unchecked, `ring-focus-brand` checked | Checkbox, Radio, Switch |
| `has-[...]:ring-3` on the wrapper | InputGroup, FilterDropdown, ChatInput |
| `focus-within:ring-3` on the wrapper | FilterInput field |
| `focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-focus-primary` | Conversation scroller, ImageCropper selection |
| `focus-visible:ring-3 focus-visible:ring-focus-brand` | Chat |

### Known drift (`ring-2`)

These use `ring-2` instead of `ring-3`. Do not copy them.

| Component | Recipe |
| --- | --- |
| Card (interactive) | `focus-visible:ring-2 focus-visible:ring-focus-primary` |
| Resizable handle | `focus-visible:ring-2 focus-visible:ring-focus-primary focus-visible:ring-offset-0` |
| CodeEditor | `focus-within:ring-2 focus-within:ring-focus-primary` |
| SimpleCharts rows and segments | `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-primary` (one LineChart element uses `ring-focus-brand`) |

### Example

```tsx
import { Button, Card, CardContent } from '@wallarm-org/design-system';

export const FocusExamples = ({ onOpen, onDelete }: { onOpen: () => void; onDelete: () => void }) => (
  <>
    {/* DS components draw their own ring. Pick the color through props. */}
    <Button variant='primary' color='destructive' onClick={onDelete}>
      Delete
    </Button>

    {/* Card becomes focusable and draws its ring when it has an on* handler. */}
    <Card onClick={onOpen}>
      <CardContent>Open details</CardContent>
    </Card>

    {/* An app-built control uses the standard recipe. */}
    <button
      type='button'
      className='rounded-8 outline-none focus-visible:ring-3 focus-visible:ring-focus-primary'
      onClick={onOpen}
    >
      Custom trigger
    </button>
  </>
);
```
