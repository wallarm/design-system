---
title: Color
description: Use when choosing a background, text, icon, border or hover color, so the value switches correctly between light and dark themes.
components: [Alert, Badge, Banner, Button, Card, CardContent, Drawer, DropdownMenu, Link, Popover, Radio, SegmentedControl, Slider, Table, Tag, Text, ThemeProvider]
keywords: [color, colour, token, background, bg, text color, border, surface, elevation, status, danger, warning, success, info, brand, ai, hover, pressed, states, dark mode, theme, palette, opacity]
order: 20
---

# Color

Use semantic color tokens. Every semantic token except the `-fixed` ones switches value between light and dark themes.

## What you use

| Family | Tailwind class | Use for |
|---|---|---|
| Text | `text-text-*` | Readable copy: body, labels, links, status text |
| Icon | `text-icon-*` | Icon ink. Icons use `currentColor` |
| Page and surface | `bg-bg-page-bg`, `bg-bg-surface-1` … `bg-bg-surface-5` | The page and the layers on top of it |
| Neutral fill | `bg-bg-light-primary`, `bg-bg-primary`, `bg-bg-strong-primary` | Neutral tinted areas inside a surface |
| Status soft fill | `bg-bg-light-<status>`, `bg-bg-<status>`, `bg-bg-strong-<status>` | Tinted status areas with dark text |
| Status solid fill | `bg-bg-fill-<status>` | Solid status areas with `text-text-primary-alt` |
| Border | `border-border-*` | Dividers and outlines |
| States | `bg-states-*`, `overlay-states-*` | Hover, pressed and active layers over a resting fill |
| Component | `bg-component-*` | One component's private color. Read only, never reuse |

`<status>` is one of `brand`, `danger`, `warning`, `success`, `info`, `ai`.

The prefix repeats on purpose. The token `--color-bg-surface-1` becomes the class `bg-bg-surface-1`. The token `--color-text-primary` becomes `text-text-primary`.

## Rules

### Choose a family

| Need | Use | Not |
|---|---|---|
| Body text | `text-text-primary` | `text-slate-900`, `text-black` |
| Supporting text | `text-text-secondary` | `text-text-primary/60`, `text-muted` |
| Placeholder or hint | `text-text-hint` | `text-text-tertiary` for essential content |
| Error message text | `text-text-danger` | `text-red-600` |
| Text on a solid fill | `text-text-primary-alt` | `text-white` |
| Page background | `bg-bg-page-bg` | `bg-white`, `bg-slate-950` |
| Card or panel | `bg-bg-surface-1` | `bg-white` |
| Popover, menu, drawer | `bg-bg-surface-2` | `bg-bg-surface-1` with a heavier shadow |
| Neutral tinted area | `bg-bg-light-primary` or `bg-bg-primary` | `bg-slate-50`, `bg-primary` |
| Soft status box | `bg-bg-light-danger` with `border-border-danger` | `bg-red-50 border-red-300` |
| Solid status block | `bg-bg-fill-danger` | `bg-red-600`, `bg-bg-danger` with white text |
| Default divider | `border-border-primary-light` | `border-slate-200`, `border-gray-200` |
| Input or control outline | `border-border-primary` | `border-border-primary-light` |
| Hover on a transparent item | `hover:bg-states-primary-hover` | `hover:bg-slate-100`, `hover:bg-bg-primary` |
| Hover on a solid fill | `overlay hover:overlay-states-on-fill-hover` | `hover:bg-bg-fill-brand/90`, `hover:brightness-110` |
| Categorical label color | `Badge` with `color` | `bg-violet-100 text-violet-800` on a `div` |
| Status notice | `Alert` with `color` | A `div` with hand-picked status classes |

### Surfaces

- Start every page on `bg-bg-page-bg`. Put content layers on surface levels.
- If the element sits in page flow, use `bg-bg-surface-1`. `Card` uses it.
- If the element floats over content, use `bg-bg-surface-2`. `Popover`, `DropdownMenu` and `Drawer` use it.
- If the element is the raised thumb or indicator of a control, use `bg-bg-surface-3`. The `Slider` thumb, the `SegmentedControl` indicator and the `Radio` indicator use it.
- If the element is a control track inside a surface, use `bg-bg-primary`. The `SegmentedControl` track uses it. A `bg-bg-surface-3` track is white on a white surface in the light theme.
- Use `bg-bg-surface-5` only for a raised strip such as `Banner`.
- In the light theme, surface levels 1 to 4 are all white. They differ only in the dark theme. Separate surfaces with borders and shadows, not with fill.
- Choose the level by elevation. Never choose it by how it looks in the light theme.

### Status colors

- If the area holds dark text, use a soft fill: `bg-bg-light-<status>` or `bg-bg-<status>`.
- If the area holds `text-text-primary-alt`, use a solid fill: `bg-bg-fill-<status>`.
- Pair a soft fill with the matching `border-border-<status>`.
- Use `brand` for the primary action and brand moments only. Use `ai` for assistant content and AI results.
- Pair a status color with an icon or a word. Color alone does not carry meaning.
- Use `danger` for errors. There is no `error`, `destructive` or `critical` text, background or border token. `destructive` exists only as a prop value on `Alert` and `Button` and as the focus token `ring-focus-destructive`.

### Interaction states

- `states-*` tokens are translucent layers. Put them on top of a resting fill.
- If the item is transparent at rest, use `hover:bg-states-primary-hover` and `active:bg-states-primary-pressed`.
- If the item has a solid fill, add `overlay` and use `hover:overlay-states-on-fill-hover` and `active:overlay-states-on-fill-pressed`. The `overlay` utility paints the state on a pseudo-element, so the fill stays.
- If the item is selected, use `bg-states-primary-active`.
- For a brand or danger item, use the matching family: `bg-states-brand-hover`, `bg-states-danger-pressed`.
- On an inverted (`-alt`) surface, use `bg-states-primary-alt-hover` and `bg-states-primary-alt-pressed`.
- Prefer a component with built-in states, such as `Button`, over hand-written state classes.

### Light and dark

- `ThemeProvider` writes `data-theme="dark"` or `data-theme="light"` on `<html>`. Semantic tokens read that attribute.
- Switch the theme with `useTheme().setTheme('dark')`. Do not set the attribute yourself.
- `-alt` tokens are for inverted surfaces. `text-text-primary-alt` is white in light and dark slate in dark.
- `-fixed` tokens keep one value in both themes. Use them only on a surface that also keeps one value.
- **Never** use the `dark:` variant. It follows the OS color scheme, not `data-theme`, so it disagrees with `ThemeProvider`.
- **Never** read a raw palette color for a theme-aware surface. Palette colors do not switch in dark.

### Tokens that do not exist

An agent guesses these names. None of them is part of the system.

- There is no `bg-primary`, `text-primary` or `border-primary` class. Write `bg-bg-primary`, `text-text-primary`, `border-border-primary`.
- There is no `text-muted`, `text-subtle` or `text-disabled`. Write `text-text-secondary`, `text-text-hint` or `text-text-disable-primary`.
- There is no `bg-surface`, `bg-card`, `bg-background` or `bg-muted`. Write `bg-bg-surface-1` or `bg-bg-light-primary`.
- There is no `bg-bg-surface-0` and no `bg-bg-surface-6`. Levels run from 1 to 5.
- There is no `bg-bg-error` or `text-text-error`. Write `danger`.
- There is no `bg-bg-fill-primary`. Neutral solid fills do not exist.
- There is no `border-border-secondary`. Write `border-border-primary-light`.
- Opacity modifiers such as `/90`, `/50` or `/10` are not part of the system. Tailwind compiles them, but the result does not follow the design.
- Raw palette classes such as `bg-red-500` or `text-slate-600` are not part of the system. For a categorical color, use `Badge` with `color`.

**Never** write `bg-bg-fill-brand/90` for a hover. Use `overlay hover:overlay-states-on-fill-hover`.

**Never** reuse a `bg-component-*` token outside its component. It changes when that component changes. One exception: an auth page has no `AppShell` and paints its background with `bg-component-app-shell-bg`, so the signed-out screen matches the shell around the signed-in app. See [Auth page](../patterns/auth-page.md).

**Never** edit `--color-syntax-*` mappings. They are code-managed.

### Raw palette

- If you need one of many categorical colors, use `Badge` with `color` and `type`.
- `Badge` `color` accepts `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `w-orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `fuchsia`, `pink`, `rose`.
- There is no `purple` value on `Badge` `color`. Use `violet`.
- `Tag` has no `color` prop. It always renders the slate secondary badge style.

### Write / Not

| Write | Not |
|---|---|
| `bg-bg-surface-1` | `bg-white` |
| `bg-bg-primary` | `bg-primary` |
| `text-text-secondary` | `text-muted`, `text-gray-500` |
| `text-text-danger` | `text-red-600`, `text-text-error` |
| `text-icon-secondary` | `text-text-secondary` on an icon |
| `border-border-primary-light` | `border-gray-200` |
| `bg-bg-fill-brand` | `bg-orange-500`, `bg-w-orange-600` |
| `overlay hover:overlay-states-on-fill-hover` | `hover:bg-bg-fill-brand/90` |
| `hover:bg-states-primary-hover` | `hover:bg-slate-100` |
| `<Badge color='violet'>` | `<span className='bg-violet-100'>` |
| `useTheme().setTheme('dark')` | `dark:bg-slate-900` |

## Reference

### Text

| Class | Use |
|---|---|
| `text-text-primary` | Body text, titles, values |
| `text-text-secondary` | Supporting text, descriptions, captions |
| `text-text-tertiary` | Decorative or low-priority text. Never essential content |
| `text-text-hint` | Placeholders and hints |
| `text-text-primary-alt`, `text-text-secondary-alt`, `text-text-tertiary-alt` | Text on solid fills and inverted surfaces |
| `text-text-primary-fixed`, `text-text-primary-alt-fixed` | Text that keeps one value in both themes |
| `text-text-brand`, `text-text-danger`, `text-text-warning`, `text-text-success`, `text-text-info`, `text-text-ai` | Status text |
| `text-text-disable-primary`, `text-text-disable-primary-alt` | Disabled text |
| `text-text-disable-brand`, `text-text-disable-danger`, `text-text-disable-warning`, `text-text-disable-succes`, `text-text-disable-info`, `text-text-disable-ai` | Disabled status text. The success token is spelled `succes` |
| `text-text-link-default`, `text-text-link-hover` | Links. Prefer the `Link` component |
| `text-text-link-default-alt`, `text-text-link-hover-alt` | Links on inverted surfaces |

`Text` `color` accepts `primary`, `primary-alt`, `secondary`, `secondary-alt`, `tertiary-alt`, `danger`, `inherit`. Use a raw `text-text-*` class only for other tokens.

### Icon

| Class | Use |
|---|---|
| `text-icon-primary`, `text-icon-secondary` | Default icon ink |
| `text-icon-primary-alt`, `text-icon-secondary-alt` | Icons on solid fills and inverted surfaces |
| `text-icon-primary-fixed`, `text-icon-primary-alt-fixed` | Icons that keep one value in both themes |
| `text-icon-primary-disable`, `text-icon-primary-alt-disable` | Disabled icons |
| `text-icon-brand`, `text-icon-danger`, `text-icon-warning`, `text-icon-success`, `text-icon-info`, `text-icon-ai` | Status icons |

### Background

| Class | Light | Dark | Use |
|---|---|---|---|
| `bg-bg-page-bg` | white | slate-950 | Page |
| `bg-bg-surface-1` | white | #0d1123 | In-flow content: `Card` |
| `bg-bg-surface-2` | white | #141829 | Floating layers: `Popover`, `DropdownMenu`, `Drawer`. Also `Table` body cells and `Alert` `color='primary'` |
| `bg-bg-surface-3` | white | #1b1f30 | Raised thumb or indicator: `Slider` thumb, `SegmentedControl` indicator, `Radio` indicator |
| `bg-bg-surface-4` | white | #1f2334 | Reserved. No component uses it |
| `bg-bg-surface-5` | slate-100 | #262a3b | Raised strip: `Banner` |
| `bg-bg-light-primary` | slate-50 | #1b1f30 | Subtle neutral area. `Card` `color='secondary'` |
| `bg-bg-primary` | slate-100 | #262a3b | Neutral tinted area; control tracks (`SegmentedControl`) |
| `bg-bg-strong-primary` | slate-300 | #333848 | Strong neutral area |
| `bg-bg-light-<status>` | 50 shade | theme value | Lightest status tint. `Alert` uses it |
| `bg-bg-<status>` | 100 shade | theme value | Status tint |
| `bg-bg-strong-<status>` | 300 shade (warning 100) | theme value | Strong status tint |
| `bg-bg-fill-<status>` | 600 shade (warning 500) | 400 shade | Solid status fill. `Button` `color='brand' variant='primary'` uses `bg-bg-fill-brand` |

### Border

| Class | Use |
|---|---|
| `border-border-primary-light` | Default divider, card and popover outline |
| `border-border-primary` | Control outline, stronger divider |
| `border-border-strong-primary` | Emphasised neutral outline |
| `border-border-<status>` | Outline of a soft status area |
| `border-border-strong-<status>` | Emphasised status outline |

Focus rings use `ring-focus-primary`, `ring-focus-brand` and `ring-focus-destructive`. See [Focus](./focus.md).

### States

| Class | Use |
|---|---|
| `bg-states-<family>-default-alt` | Resting tint of a ghost item |
| `bg-states-<family>-hover` | Hover |
| `bg-states-<family>-pressed` | Pressed |
| `bg-states-<family>-active` | Selected or open |
| `overlay-states-on-fill-hover`, `overlay-states-on-fill-pressed`, `overlay-states-on-fill-disabled` | States on a solid fill. Needs `overlay` |
| `bg-states-default-all` | Transparent resting state |

`<family>` is one of `primary`, `primary-alt`, `brand`, `danger`, `warning`, `success`, `info`, `ai`.

### Example

```tsx
import { Badge, Card, CardContent, Text } from '@wallarm-org/design-system';

export const BlockedRequests = () => (
  <Card>
    <CardContent className='flex flex-col gap-8'>
      <Text size='sm' color='secondary'>
        Blocked requests
      </Text>
      <div className='flex items-center gap-8 rounded-8 border-1 border-border-danger bg-bg-light-danger px-12 py-8 text-text-danger'>
        1 204 attacks blocked
      </div>
      <Badge color='violet' type='secondary'>
        API abuse
      </Badge>
    </CardContent>
  </Card>
);
```
