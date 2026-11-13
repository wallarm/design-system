---
title: Typography
description: Use when you set text size, weight, line height or font family, or pick between Text, Heading and Code.
components: [Text, Heading, Code]
keywords: [typography, font, font size, text size, line height, leading, weight, heading, body, title, label, caption, mono, tracking, letter spacing]
order: 30
---

# Typography

Set text with `Text`, `Heading` and `Code`; raw classes go only on your own elements.

## What you use

| Need | Use | Not |
| --- | --- | --- |
| Body copy, labels, descriptions | `<Text size="sm">` | `<p className="text-sm">` |
| Secondary or meta text | `<Text size="xs" color="secondary">` | `text-gray-500` |
| A title or section heading | `<Heading as="h2" size="lg">` | `<Text size="xl" weight="bold">` |
| Code, IDs, hashes, paths | `<Code size="m">` | `font-mono` on a `<span>` |
| Text in your own element | `text-sm`, `font-medium`, `leading-20` | `font-regular` |

There are no `heading-*` or `body-*` classes, no `font-regular`, and no `semibold` value on the `weight` prop.

## Rules

- If you need body text in an app screen, pass `size="sm"` (14/20). `Text` defaults to `lg` (16/24).
- If you see `size="md"` on `Text` or `text-md`, write `sm` / `text-sm`. They render the same 14/20.
- If you need a heading, set `as` to the real level. `Heading` defaults to `h1`, `size="xl"`, `weight="bold"`.
- **Never** pass `className` to `Text` (the build fails) or `Heading` (it is ignored). Style a wrapper element instead.
- If a `Text` or `Code` sits inside a `<p>`, pass `asChild` with a `<span>` child. Both render a `<p>`. Still pass `size`: `asChild` keeps the default (16px).
- `leading-N` is N pixels (`leading-5` is 5px). For a size's paired line height, use the named step (`leading-sm` = 20px).
- **Never** use `leading-none` or `lineHeight="none"`: 0px, lines overlap.
- Keep `lineClamp` 1–6; higher values get no CSS.
- If you mark an error, use `color="danger"` on `Text` and `color="destructive"` on `Code`. Neither accepts the other's value.
- **Never** add letter spacing below 20px. `Heading` sets tracking per size.
- **Never** use `font-pixel` yourself (decorative: `EmptyState` titles and `HoverCardTitle variant='agent'` only) or `font-serif` (points at Inter, not bundled) in app screens.
- If you need weight 800, write `font-extrabold`, **never** the misspelled `font-extrablod`.
- `font-medium` is 450, not 500. You load no font: the theme ships Geist and Geist Mono.

## Examples

A section header with a secondary description and a code value.

```tsx
import { Code, Heading, Text } from '@wallarm-org/design-system';

<section className='flex flex-col gap-8'>
  <Heading as='h2' size='lg' weight='medium'>Blocking rules</Heading>
  <Text size='sm' color='secondary'>Requests that match are blocked.</Text>
  <Code size='m'>/api/v1/users/{'{id}'}</Code>
</section>
```

Inline text inside a paragraph you own, with its size set to match.

```tsx
<p className='text-sm leading-20'>
  Last seen <Text asChild size='sm' weight='medium'><span>2 min ago</span></Text>
</p>
```

A style the props lack goes on a wrapper.

```tsx
<div className='tabular-nums'>
  <Text size='sm'>1,204 requests</Text>
</div>
```

## Reference

### Size scale (`text-*` sets size and paired line height, px)

| Class | Size / LH | Class | Size / LH |
| --- | --- | --- | --- |
| `text-2xs` | 10 / 12 | `text-3xl` | 30 / 36 |
| `text-xs` | 12 / 16 | `text-4xl` | 36 / 40 |
| `text-sm` | 14 / 20 | `text-5xl` | 48 / 48 |
| `text-base` | 16 / 24 | `text-6xl` | 60 / 60 |
| `text-lg` | 18 / 24 | `text-7xl` | 72 / 72 |
| `text-xl` | 20 / 28 | `text-8xl` | 96 / 96 |
| `text-2xl` | 24 / 32 | `text-9xl` | 128 / 128 |

### Weights

| Class | Value | `weight` prop |
| --- | --- | --- |
| `font-light` | 300 | `light` |
| `font-normal` | 400 | `regular` |
| `font-medium` | 450 | `medium` |
| `font-semibold` | 600 | none |
| `font-bold` | 700 | `bold` |
| `font-extrabold` | 800 | none |

### Component sizes (size / line height)

| Component | Sizes | Default |
| --- | --- | --- |
| `Text` | `xs` 12/16, `sm` 14/20, `md` 14/20, `lg` 16/24, `xl` 18/28 | `lg` |
| `Heading` | `sm`, `md`, `lg`, `xl`, `2xl`…`7xl` = `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`…`text-7xl` | `xl` |
| `Code` | `xs` 10/12, `s` 12/16, `m` 14/20, `l` 16/20 | `l` |

### Component colors

| Component | `color` values | Default |
| --- | --- | --- |
| `Text` | `primary`, `primary-alt`, `secondary`, `secondary-alt`, `tertiary-alt`, `danger`, `inherit` | `inherit` |
| `Heading` | `primary`, `primary-alt`, `secondary`, `secondary-alt`, `inherit` | `inherit` |
| `Code` | `primary`, `primary-alt`, `secondary`, `destructive` | `primary` |

`Text` has no `success`, `warning` or `brand`. Without `truncate`, `Text` keeps line breaks. `Code` accepts `className`.

Related: [Spacing](../foundations/spacing.md), [Color](../foundations/color.md).
