---
title: Spacing
description: Use when choosing a gap, padding or margin value, a Stack or Flex gap prop, or the inner spacing of a page, card, drawer or dialog.
components: [Stack, HStack, VStack, Flex, Page, Card, Drawer, Dialog]
keywords: [spacing, gap, padding, margin, space, px, scale, inset, gutter, Stack, HStack, VStack, Flex, layout, whitespace]
order: 10
---

# Spacing

Every numeric spacing utility in Wallarm Design System counts in pixels, not in 4px steps.

## What you use

| Need | Use | Not |
| --- | --- | --- |
| Space between children in a column | `<VStack gap={16}>` | `space-y-4`, `flex flex-col gap-4` copied from Tailwind docs |
| Space between children in a row | `<HStack gap={8}>` | `space-x-2`, margins on each child |
| A row or column with `basis`, `grow` or `shrink` control | `<Flex gap={12} basis='1/2'>` | A raw `div` with `flex basis-1/2` |
| Padding on your own element | `p-16`, `px-24`, `py-8` | `p-4` meaning 16px |
| Page chrome | `Page`, `PageHeader`, `PageToolbar`, `PageContent` | Your own `px-*` on the page wrapper |
| A bordered tile | `Card`, `CardHeader`, `CardContent`, `CardFooter` | A `div` with `p-16 rounded-8 border` |
| Side panel or modal spacing | `DrawerHeader`, `DrawerBody`, `DrawerFooter` and the `Dialog*` equivalents | Padding classes inside the header, body or footer |

`p-16` is 16px. `gap-24` is 24px. `p-4` is 4px.

## Rules

- Read every number in a spacing class as pixels. `--spacing` is `1px`, so `p-16` is 16px.
- Stay on the scale in the Reference section. If a value is not in the scale, round to the nearest step.
- **Never** translate a Tailwind docs value as-is. `p-4` in Tailwind docs is 16px; here write `p-16`.
- If children sit in a line, use `Stack`, `HStack` or `VStack` with `gap`. **Never** add margins to each child.
- If you need `className` on the flex container, use `Stack`. `Flex` does not accept `className`.
- If you pass `gap` to `Stack`, `HStack` or `VStack`, pass a scale number. Other numbers fail type-checking.
- If you omit `gap` on `Stack`, `HStack` or `VStack`, the gap is 4px. If you omit `gap` on `Flex`, there is no gap.
- If you want no gap on `Stack`, pass `gap={0}`. `Flex` has no `gap={0}`; omit the prop instead.
- If you build a page, let `PageHeader` and `PageContent` own the 24px side padding. **Never** wrap `Page` in a padded container.
- If you build a card, let `Card` own its 16px padding. **Never** add `p-*` to `Card`.
- If you build a drawer or dialog, put content straight into `DrawerBody` or `DialogBody`. Their padding is fixed.
- **Never** pass `className` to `DrawerHeader`, `DrawerBody` or `DrawerFooter`. They accept only `children` and `ref`.
- Off-scale classes such as `p-10` or `gap-3` still compile to 10px and 3px. The build does not stop you; the rule does.

There is no `gap-3`, `p-5` or `p-10` step on the scale. There is no `--spacing-10` token. There is no `space-*` component prop. There is no `padding` prop on `Stack`, `Flex`, `Card` or `Page`.

### Write / Not

| Write | Not | Why |
| --- | --- | --- |
| `gap-8` | `gap-2` | `gap-2` is 2px here |
| `p-16` | `p-4` | `p-4` is 4px here |
| `px-24 py-12` | `px-6 py-3` | Tailwind's 24px/12px is `px-24 py-12` |
| `mt-32` | `mt-8` | `mt-8` is 8px here |
| `<VStack gap={16}>` | `<div className='space-y-4'>` | Use the layout component |
| `<HStack gap={8}>` | `<HStack className='gap-2'>` | Use the `gap` prop with a scale number |
| `h-32` | `h-8` | Sizing utilities use the same 1px base |

### Translation from Tailwind habits

| Tailwind default class | Pixels | Write here |
| --- | --- | --- |
| `p-0.5` / `gap-0.5` | 2px | `p-2` / `gap-2` |
| `p-1` / `gap-1` | 4px | `p-4` / `gap-4` |
| `p-1.5` / `gap-1.5` | 6px | `p-6` / `gap-6` |
| `p-2` / `gap-2` | 8px | `p-8` / `gap-8` |
| `p-3` / `gap-3` | 12px | `p-12` / `gap-12` |
| `p-4` / `gap-4` | 16px | `p-16` / `gap-16` |
| `p-5` / `gap-5` | 20px | `p-20` / `gap-20` |
| `p-6` / `gap-6` | 24px | `p-24` / `gap-24` |
| `p-8` / `gap-8` | 32px | `p-32` / `gap-32` |
| `p-10` / `gap-10` | 40px | `p-40` / `gap-40` |
| `p-12` / `gap-12` | 48px | `p-48` / `gap-48` |
| `p-16` / `gap-16` | 64px | `p-64` / `gap-64` |
| `space-y-4` | 16px | `<VStack gap={16}>` |
| `space-x-2` | 8px | `<HStack gap={8}>` |

The same mapping applies to `m-*`, `px-*`, `py-*`, `pt-*`, `w-*`, `h-*`, `size-*`, `inset-*` and `top-*`.

## Reference

### Scale

Each step is a theme variable and a utility suffix. `p-16`, `gap-16`, `m-16` and `w-16` all read `--spacing-16`.

| Token | Value | Token | Value |
| --- | --- | --- | --- |
| `--spacing-none` | 0px | `--spacing-32` | 32px |
| `--spacing-1` | 1px | `--spacing-36` | 36px |
| `--spacing-2` | 2px | `--spacing-40` | 40px |
| `--spacing-4` | 4px | `--spacing-44` | 44px |
| `--spacing-6` | 6px | `--spacing-48` | 48px |
| `--spacing-8` | 8px | `--spacing-56` | 56px |
| `--spacing-12` | 12px | `--spacing-64` | 64px |
| `--spacing-16` | 16px | `--spacing-80` | 80px |
| `--spacing-20` | 20px | `--spacing-96` | 96px |
| `--spacing-24` | 24px | `--spacing-112` | 112px |
| `--spacing-28` | 28px | `--spacing-128` | 128px |
| | | `--spacing-144` | 144px |

### Layout component gaps

| Component | `gap` values | Default `gap` | Default direction | Accepts `className` |
| --- | --- | --- | --- | --- |
| `Stack` | `0`, then every scale step from `1` to `144` | `4` | `column` | Yes |
| `VStack` | Same as `Stack` | `4` | `column` (fixed) | Yes |
| `HStack` | Same as `Stack` | `4` | `row` (fixed), `align='center'` | Yes |
| `Flex` | Every scale step from `1` to `144`; no `0` | none | `row` | No |

### Spacing built into components

These values come from the components. Do not repeat them on the outside or the inside.

| Component | Part | Spacing |
| --- | --- | --- |
| `PageHeader` | Header row | `px-24 py-8`, `gap-12` between items; `pb-6` when `PageContent` follows |
| `PageToolbar` | Toolbar row | `px-24 pb-8`, `gap-12`; `pb-6` when `PageContent` follows |
| `PageActions` | Action group | `gap-8` |
| `PageContent` | Scrolling body | `px-24 pt-8 pb-24`; `pt-6` after `PageHeader` or `PageToolbar` |
| `Card` | Root | `py-16`, `gap-8` between header, content and footer |
| `CardHeader` | Header row | `px-16`, `gap-8` |
| `CardTitle` | Title row | `gap-8` |
| `CardContent` | Body | `px-16` |
| `CardFooter` | Footer row | `px-16`, `gap-12` |
| `DrawerPositioner` | Inset from the viewport | `p-8` |
| `DrawerHeader` | Header | `pt-16 pb-12 pl-24 pr-16`, `gap-12` |
| `DrawerBody` | Scrolling body | `px-24`, `pt-8`; `pb-24`, or `pb-8` when a `DrawerFooter` exists |
| `DrawerFooter` | Footer | `px-24 py-16`, `gap-8` |
| `DialogPositioner` | Inset from the viewport | `p-32` |
| `DialogHeader` | Header | `pt-20 pb-16 px-24`, `gap-12` |
| `DialogBody` | Scrolling body | Same as `DrawerBody` |
| `DialogFooter` | Footer | Same as `DrawerFooter` |

`Page` adds no padding of its own. `Dialog*` parts import from `@wallarm-org/design-system/Dialog`; `Dialog` is not exported from the package root.

### Example

```tsx
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  HStack,
  Page,
  PageActions,
  PageContent,
  PageHeader,
  PageTitle,
  VStack,
} from '@wallarm-org/design-system';

export const OverviewPage = () => (
  <Page name='overview' fullSize fixedHeight>
    <PageHeader>
      <PageTitle>Overview</PageTitle>
      <PageActions>
        <Button size='small'>Settings</Button>
      </PageActions>
    </PageHeader>
    <PageContent>
      <VStack gap={24}>
        <HStack gap={16} align='stretch'>
          <Card>
            <CardHeader>
              <CardTitle>Requests</CardTitle>
            </CardHeader>
            <CardContent>1,204</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Attacks</CardTitle>
            </CardHeader>
            <CardContent>37</CardContent>
          </Card>
        </HStack>
      </VStack>
    </PageContent>
  </Page>
);
```
