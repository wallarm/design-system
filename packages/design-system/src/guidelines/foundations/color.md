---
title: Color
description: Use when choosing a background, text, icon, border or hover color, so the value switches correctly between light and dark themes.
components: [Alert, AlertTitle, Badge, Banner, Button, Card, CardContent, Drawer, DropdownMenu, Link, Popover, Radio, SegmentedControl, Slider, Tag, Text, ThemeProvider]
keywords: [color, colour, token, background, bg, text color, border, surface, elevation, status, danger, warning, success, info, brand, ai, hover, pressed, states, dark mode, theme, palette, opacity]
order: 20
---

# Color

Use semantic tokens; all but `-fixed` switch with the theme. The prefix repeats: `bg-bg-surface-1`, `text-text-primary`.

## What you use

| Need | Use | Not |
|---|---|---|
| Body text | `text-text-primary` | `text-slate-900` |
| Supporting text | `text-text-secondary` | `text-text-primary/60`, `text-muted` |
| Placeholder or hint | `text-text-hint` | `text-text-tertiary` |
| Error text | `text-text-danger` | `text-red-600` |
| Text on a solid fill | `text-text-primary-alt` | `text-white` |
| Icon ink | `text-icon-secondary` | `text-text-secondary` |
| Page | `bg-bg-page-bg` | `bg-white` |
| Card or panel | `bg-bg-surface-1` | `bg-white` |
| Popover, menu, drawer | `bg-bg-surface-2` | `bg-bg-surface-1` |
| Neutral tinted area | `bg-bg-light-primary`, `bg-bg-primary` | `bg-slate-50` |
| Soft status box | `bg-bg-light-danger` + `border-border-danger` | `bg-red-50 border-red-300` |
| Solid status block | `bg-bg-fill-danger` | `bg-red-600` |
| Divider | `border-border-primary-light` | `border-gray-200` |
| Control outline | `border-border-primary` | `border-border-primary-light` |
| Hover, transparent item | `hover:bg-states-primary-hover` | `hover:bg-slate-100` |
| Hover, solid fill | `overlay hover:overlay-states-on-fill-hover` | `hover:bg-bg-fill-brand/90`, `hover:brightness-110` |
| Categorical color | `Badge` `color` | `bg-violet-100` on a `div` |
| Status notice | `Alert` `color` | A `div` with status classes |

## Rules

**Surfaces**

- If it sits in page flow (`Card`), use `bg-bg-surface-1`.
- If it floats over content (`Popover`, `DropdownMenu`, `Drawer`), use `bg-bg-surface-2`.
- If it is a raised thumb or indicator (`Slider`, `SegmentedControl`, `Radio`), use `bg-bg-surface-3`.
- If it is a control track, use `bg-bg-primary`, never `bg-bg-surface-3`.
- Use `bg-bg-surface-5` only for a raised strip like `Banner`.
- Pick the level by elevation: levels 1–4 are all white in light. Separate them with borders and shadows.

**Status**

- If the area holds dark text, use `bg-bg-light-<status>` or `bg-bg-<status>` with `border-border-<status>`.
- If it holds `text-text-primary-alt`, use `bg-bg-fill-<status>`.
- Use `brand` only for the primary action, `ai` only for assistant content.
- Pair status color with an icon or word.
- Use `danger` for errors. `destructive` is only an `Alert`/`Button` prop and `ring-focus-destructive`.

**States**

- Transparent item: `hover:bg-states-primary-hover`, `active:bg-states-primary-pressed`. Selected: `bg-states-primary-active`.
- Solid fill: add `overlay`, then `hover:overlay-states-on-fill-hover`, `active:overlay-states-on-fill-pressed`.
- Brand/danger item: `bg-states-brand-*`, `bg-states-danger-*`. Inverted surface: `bg-states-primary-alt-*`.
- `states-*` tokens are translucent layers over a resting fill.
- Prefer components with built-in states, like `Button`.

**Theme**

- Switch themes with `useTheme().setTheme()`, never by setting `data-theme`.
- Use `-alt` tokens on inverted surfaces; `-fixed` tokens only on fixed surfaces.
- **Never** use the `dark:` variant. It follows the OS, not `ThemeProvider`.
- **Never** use raw palette classes (`bg-red-500`), which ignore the theme, or opacity modifiers (`/90`).
- **Never** reuse `bg-component-*` outside its component. Exception: an auth page paints `bg-component-app-shell-bg`; see [Auth page](../patterns/auth-page.md).
- **Never** edit `--color-syntax-*` mappings.

**These do not exist**

- `bg-primary`, `text-primary`, `border-primary` → `bg-bg-primary`, `text-text-primary`, `border-border-primary`.
- `text-muted`, `text-subtle`, `text-disabled` → `text-text-secondary`, `text-text-hint`, `text-text-disable-primary`.
- `bg-surface`, `bg-card`, `bg-background`, `bg-muted` → `bg-bg-surface-1`, `bg-bg-light-primary`.
- `bg-bg-surface-0`, `bg-bg-surface-6` → levels run 1–5.
- `error` tokens → `danger`. `bg-bg-fill-primary` → no neutral solid fill. `border-border-secondary` → `border-border-primary-light`.
- `Badge` `color='purple'` → `violet`. `Tag` has no `color` prop.

## Examples

A soft danger box in a card.

```tsx
import { Card, CardContent, Text } from '@wallarm-org/design-system';

export const BlockedRequests = () => (
  <Card>
    <CardContent className='flex flex-col gap-8'>
      <Text size='sm' color='secondary'>Blocked requests</Text>
      <div className='rounded-8 border-1 border-border-danger bg-bg-light-danger px-12 py-8 text-text-danger'>
        1 204 attacks blocked
      </div>
    </CardContent>
  </Card>
);
```

Notices and labels are components.

```tsx
import { Alert, AlertTitle, Badge } from '@wallarm-org/design-system';

export const QuotaNotice = () => (
  <>
    <Alert color='warning'><AlertTitle>Quota at 90%</AlertTitle></Alert>
    <Badge color='violet' type='secondary'>API abuse</Badge>
  </>
);
```

A custom solid fill keeps its color on hover.

```tsx
export const DeployTile = () => (
  <button
    type='button'
    className='overlay bg-bg-fill-brand text-text-primary-alt hover:overlay-states-on-fill-hover active:overlay-states-on-fill-pressed'
  >
    Deploy
  </button>
);
```

Switch themes with `useTheme`.

```tsx
import { Button, useTheme } from '@wallarm-org/design-system';

export const DarkModeButton = () => {
  const { setTheme } = useTheme();
  const handleDark = () => setTheme('dark');

  return <Button onClick={handleDark}>Dark</Button>;
};
```

## Reference

`<status>`: `brand`, `danger`, `warning`, `success`, `info`, `ai`.

| Family | Classes |
|---|---|
| Text | `text-text-` `primary`, `secondary`, `tertiary`, `hint`, `<status>`, `primary-alt`, `secondary-alt`, `tertiary-alt`, `primary-fixed`, `primary-alt-fixed` |
| Disabled text | `text-text-disable-primary`, `-primary-alt`, `-<status>` (success is spelled `succes`) |
| Link | `text-text-link-default`, `-hover`, `-default-alt`, `-hover-alt`; prefer `Link` |
| Icon | `text-icon-` `primary`, `secondary`, `<status>`, `primary-alt`, `secondary-alt`, `primary-fixed`, `primary-alt-fixed`, `primary-disable`, `primary-alt-disable` |
| Surface | `bg-bg-page-bg`, `bg-bg-surface-1`…`5` |
| Neutral fill | `bg-bg-light-primary` < `bg-bg-primary` < `bg-bg-strong-primary` |
| Status fill | `bg-bg-light-<status>` < `bg-bg-<status>` < `bg-bg-strong-<status>`; solid `bg-bg-fill-<status>` |
| Border | `border-border-primary-light`, `-primary`, `-strong-primary`, `-<status>`, `-strong-<status>` |
| States | `bg-states-<family>-default-alt`, `-hover`, `-pressed`, `-active`; `bg-states-default-all` |
| Fill states | `overlay-states-on-fill-hover`, `-pressed`, `-disabled` (need `overlay`) |
| Focus | `ring-focus-primary`, `-brand`, `-destructive`; see [Focus](./focus.md) |

`<family>`: `primary`, `primary-alt`, or a `<status>`. `Text` `color`: `primary`, `primary-alt`, `secondary`, `secondary-alt`, `tertiary-alt`, `danger`, `inherit`. `Badge` `color`: `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `w-orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `fuchsia`, `pink`, `rose`.
