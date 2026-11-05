---
title: Spacing
description: Use when choosing a gap, padding or margin value, a Stack or Flex gap prop, or the inner spacing of a page, card, drawer or dialog.
components: [Stack, HStack, VStack, Flex, Page, PageHeader, PageToolbar, PageContent, PageTitle, PageActions, Card, CardHeader, CardTitle, CardContent, CardFooter, Drawer, DrawerHeader, DrawerBody, DrawerFooter, Dialog, DialogBody, DialogFooter]
keywords: [spacing, gap, padding, margin, space, px, scale, inset, gutter, Stack, HStack, VStack, Flex, layout, whitespace]
order: 10
---

# Spacing

Every numeric spacing and sizing utility counts in pixels. `p-16` is 16px; `p-4` is 4px.

## What you use

| Need | Use | Not |
| --- | --- | --- |
| Children in a column | `<VStack gap={16}>` | `space-y-4`, `flex flex-col gap-4` |
| Children in a row | `<HStack gap={8}>` | `space-x-2`, per-child margins |
| A row or column with `basis`, `grow` or `shrink` | `<Flex gap={12} basis='1/2'>` | A raw `div` with `flex basis-1/2` |
| Padding on your own element | `p-16`, `px-24`, `py-8` | `p-4` meaning 16px |
| Page gutters | `PageHeader`, `PageToolbar`, `PageContent` | Your own `px-*` on the page wrapper |
| A bordered tile | `Card` with `CardHeader`, `CardContent`, `CardFooter` | A `div` with `p-16 rounded-8 border` |
| Side panel or modal body | `DrawerBody`, `DialogBody` | Padding classes inside header, body or footer |

## Rules

- Read every number in a spacing or sizing class (`p-*`, `m-*`, `gap-*`, `w-*`, `h-*`, `size-*`, `inset-*`, `top-*`) as pixels.
- **Never** copy a Tailwind docs value as-is. Multiply it by 4: Tailwind `p-4` is `p-16` here, `mt-8` is `mt-32`, `h-8` is `h-32`.
- Stay on the scale. If a value is off it, round to the nearest step. Off-scale classes such as `p-10` still compile; the rule stops you, not the build.
- If children sit in a line, use `Stack`, `HStack` or `VStack` with `gap`. **Never** use per-child margins or `space-*`.
- Pass `gap` as a scale-number prop, not a `gap-*` class. Off-scale numbers fail type-checking.
- If you omit `gap` on `Stack`, `HStack` or `VStack`, you get 4px. If you omit it on `Flex`, you get none.
- If you want no gap on `Stack`, pass `gap={0}`. `Flex` has no `gap={0}`; omit the prop.
- If you need `className` on the flex container, use `Stack`. `Flex` does not accept `className`.
- `PageHeader`, `PageToolbar` and `PageContent` own the 24px side gutter. **Never** wrap `Page` in a padded container.
- `Card` owns its 16px padding. **Never** add `p-*` to `Card` or its parts.
- Put drawer and dialog content straight into `DrawerBody` or `DialogBody`. Their 24px gutter is fixed.
- **Never** pass `className` to `DrawerHeader`, `DrawerBody` or `DrawerFooter`. They accept only `children` and `ref`.
- Import `Dialog` parts from `@wallarm-org/design-system/Dialog`. `Dialog` is not exported from the package root.
- **Never** reach for a `--spacing-10` token, a `space-*` component prop, or a `padding` prop on `Stack`, `Flex`, `Card` or `Page`. None exist.

## Examples

A column of sections uses `VStack`, not per-child margins.

```tsx
import { Text, VStack } from '@wallarm-org/design-system';

<VStack gap={24}>
  <Text>Profile</Text>
  <Text>Security</Text>
</VStack>;
```

Padding on your own element uses the pixel number, not the Tailwind docs number.

```tsx
<div className='px-24 py-12'>Content</div>; // not 'px-6 py-3'
```

A page puts cards straight into `PageContent`, with no padding of its own.

```tsx
import {
  Card, CardContent, CardHeader, CardTitle, HStack,
  Page, PageContent, PageHeader, PageTitle,
} from '@wallarm-org/design-system';

<Page name='overview' fullSize fixedHeight>
  <PageHeader>
    <PageTitle>Overview</PageTitle>
  </PageHeader>
  <PageContent>
    <HStack gap={16} align='stretch'>
      <Card>
        <CardHeader><CardTitle>Requests</CardTitle></CardHeader>
        <CardContent>1,204</CardContent>
      </Card>
    </HStack>
  </PageContent>
</Page>;
```

## Reference

### Scale

Each step is a `--spacing-N` token and a utility suffix (`p-N`, `gap-N`, `w-N`), N in pixels. Zero is `--spacing-none` (`p-0`).

| Range | Steps (px) |
| --- | --- |
| Tight | 1, 2, 4, 6, 8, 12 |
| Component | 16, 20, 24, 28, 32, 36, 40, 44, 48 |
| Layout | 56, 64, 80, 96, 112, 128, 144 |

### Layout components

| Component | `gap` values | Default `gap` | Direction | `className` |
| --- | --- | --- | --- | --- |
| `Stack` | `0` and every step `1`–`144` | `4` | `column` | Yes |
| `VStack` | Same as `Stack` | `4` | `column` (fixed) | Yes |
| `HStack` | Same as `Stack` | `4` | `row` (fixed), `align='center'` | Yes |
| `Flex` | Every step `1`–`144`, no `0` | none | `row` | No |

### Built into components

Do not repeat these.

| Component | Side gutter | Gap between items |
| --- | --- | --- |
| `PageHeader`, `PageToolbar`, `PageContent` | 24px | 12px (header, toolbar) |
| `PageActions` | — | 8px |
| `Card` | 16px all round | 8px between parts; 12px in `CardFooter` |
| `DrawerHeader`, `DialogHeader` | 24px left | 12px |
| `DrawerBody`, `DialogBody` | 24px | — |
| `DrawerFooter`, `DialogFooter` | 24px, 16px vertical | 8px |
| Drawer / Dialog inset from viewport | 8px / 32px | — |
