---
title: Typography
description: Use when you set text size, weight, line height or font family, or pick between Text, Heading and Code.
components: [Text, Heading, Code]
keywords: [typography, font, font size, text size, line height, leading, weight, heading, body, title, label, caption, mono, tracking, letter spacing]
order: 30
---

# Typography

Set text with the `Text`, `Heading` and `Code` components. Use raw Tailwind classes only inside your own elements.

## What you use

| Need | Use | Not |
| --- | --- | --- |
| Body copy, labels, descriptions | `<Text size="sm">` | `<p className="text-sm">` |
| Secondary or meta text | `<Text size="xs" color="secondary">` | `text-gray-500` |
| A title or section heading | `<Heading as="h2" size="lg">` | `<Text size="xl" weight="bold">` |
| Code, IDs, hashes, paths | `<Code size="m">` | `font-mono` on a `<span>` |
| Text in your own element | `text-sm`, `font-medium`, `leading-20` | `font-regular` |

There are no `heading-*` or `body-*` classes. There is no `font-regular` class. `text-md` is an alias of `text-sm` (14/20); write `text-sm`.

## Rules

- If you need body text in an app screen, pass `size="sm"` (14/20). `Text` defaults to `lg` (16/24).
- If you need a heading, set `as` to the real level. `Heading` defaults to `as="h1"`, `size="xl"` and `weight="bold"`.
- If you see `size="md"` on `Text`, it renders 14/20, the same as `sm`. Write `size="sm"` in new code.
- **Never** pass `className` to `Text`. Its props type omits `className`, so the build fails.
- **Never** pass `className` to `Heading`. The type accepts it, but the component overwrites it.
- If you need a style that `Text` or `Heading` props do not cover, wrap the text in your own element and style that element.
- **Never** pass `lineHeight="none"` to `Text`. `leading-none` resolves to `0px` here, so the lines overlap.
- If you write a `leading-N` class, N is pixels. `leading-20` is 20px, `leading-5` is 5px.
- If you need a line height for a size, use the named step: `leading-sm` is 20px, `leading-xl` is 28px.
- If a `Text` or `Code` sits inside a `<p>`, pass `asChild` with a `<span>` child. Both render a `<p>` by default.
- If you pass `lineClamp`, keep it between 1 and 6. The components build `line-clamp-N` at runtime. Tailwind generates only `line-clamp-1` to `line-clamp-6`, the ones DS source spells out. Higher values get no CSS.
- If you color a `Code`, pass `color="destructive"` for errors. `Code` has no `danger` value; `Text` has no `destructive` value.
- **Never** add letter spacing to text below 20px. `Heading` sets tracking per size for you.
- **Never** use `font-pixel` or `font-serif` in app screens. `font-serif` points at Inter, which the DS does not ship.
- If you need weight 800, write `font-extrabold`. **Never** write `font-extrablod`: it is a misspelled DS token.

| Write | Not |
| --- | --- |
| `<Text size="sm">` | `<Text size="md">` |
| `<Heading as="h2" size="lg" weight="medium">` | `<Heading size="lg">` for a section title (renders `h1`) |
| `<Text size="sm" weight="medium">` | `<Text size="sm" className="font-semibold">` |
| `<div className="text-sm leading-20">` | `<div className="text-sm leading-5">` |
| `<Text asChild><span>…</span></Text>` inside a `<p>` | `<Text>` inside a `<p>` |
| `font-extrabold` | `font-extrablod` |

## Reference

### Font families

| Class | Font | Use for |
| --- | --- | --- |
| `font-sans` | Geist | UI text (the default) |
| `font-sans-display` | Geist (same stack as `font-sans`) | Used by `Text` and `Heading` |
| `font-mono` | Geist Mono | Code, IDs, values. Use `Code` |
| `font-pixel` | Geist Pixel | Decorative only (`EmptyState`) |
| `font-serif` | Inter (not bundled) | Nothing |

The theme self-hosts Geist and Geist Mono. You load no font yourself.

### Size scale

Every `text-*` class sets the font size and its paired line height, in px.

| Class | Size | Line height |
| --- | --- | --- |
| `text-2xs` | 10px | 12px |
| `text-xs` | 12px | 16px |
| `text-sm` | 14px | 20px |
| `text-base` | 16px | 24px |
| `text-lg` | 18px | 24px |
| `text-xl` | 20px | 28px |
| `text-2xl` | 24px | 32px |
| `text-3xl` | 30px | 36px |
| `text-4xl` | 36px | 40px |
| `text-5xl` | 48px | 48px |
| `text-6xl` | 60px | 60px |
| `text-7xl` | 72px | 72px |
| `text-8xl` | 96px | 96px |
| `text-9xl` | 128px | 128px |

`text-md` is an alias of `text-sm`: 14px, 20px line height.

### Line height

| Class | Value |
| --- | --- |
| `leading-2xs` … `leading-9xl` | The paired line height from the size scale (`leading-sm` = 20px) |
| `leading-N` | N px (`leading-16` = 16px) |
| `text-sm/20` | 14px size, 20px line height |
| `leading-none` | 0px. Do not use |
| `leading-tight`, `leading-snug`, `leading-normal`, `leading-relaxed` | Unitless Tailwind ratios |

### Weights

| Class | Value | `Text` / `Heading` `weight` |
| --- | --- | --- |
| `font-light` | 300 | `light` |
| `font-normal` | 400 | `regular` |
| `font-medium` | 450 | `medium` |
| `font-semibold` | 600 | none |
| `font-bold` | 700 | `bold` |
| `font-extrabold` | 800 | none |

`font-medium` is 450, not 500. The `weight` prop has no `semibold` value.

### `Text` sizes

`Text` renders a `<p>`. Its `color` defaults to `inherit`.

| `size` | Size / line height |
| --- | --- |
| `xs` | 12 / 16 |
| `sm` | 14 / 20 |
| `md` | 14 / 20 (alias of `sm`) |
| `lg` (default) | 16 / 24 |
| `xl` | 18 / 28 |

`color` values: `primary`, `primary-alt`, `secondary`, `secondary-alt`, `tertiary-alt`, `danger`, `inherit`. There is no `success`, `warning` or `brand` color on `Text`.

Other props: `align`, `truncate`, `lineClamp`, `inline`, `grow`, `decoration="dashed"`, `textTransform`, `lineHeight`, `asChild`. If `truncate` is false, the text keeps its line breaks (`whitespace-pre-wrap`).

### `Heading` sizes

`Heading` renders the element in `as`, default `h1`.

| `size` | Size / line height | Tracking |
| --- | --- | --- |
| `sm` | 14 / 20 | normal |
| `md` | 16 / 24 | normal |
| `lg` | 18 / 24 | normal |
| `xl` (default) | 20 / 28 | -0.005em |
| `2xl` | 24 / 32 | -0.01em |
| `3xl` | 30 / 36 | -0.01em |
| `4xl` | 36 / 40 | -0.015em |
| `5xl` | 48 / 48 | -0.015em |
| `6xl` | 60 / 60 | -0.02em |
| `7xl` | 72 / 72 | -0.02em |

`color` values: `primary`, `primary-alt`, `secondary`, `secondary-alt`, `inherit` (default).

### `Code` sizes

`Code` renders a `<p>` in Geist Mono. Its `color` defaults to `primary`.

| `size` | Size / line height |
| --- | --- |
| `xs` | 10 / 12 |
| `s` | 12 / 16 |
| `m` | 14 / 20 |
| `l` (default) | 16 / 20 |

`color` values: `primary` (default), `primary-alt`, `secondary`, `destructive`. Other props: `weight`, `italic`, `truncate`, `lineClamp`, `asChild`. `Code` accepts `className` and merges it.

### Example

```tsx
import { Code, Heading, Text } from '@wallarm-org/design-system';

export const RuleSummary = () => (
  <section className='flex flex-col gap-8'>
    <Heading as='h2' size='lg' weight='medium'>
      Blocking rules
    </Heading>
    <Text size='sm' color='secondary'>
      Requests that match these rules are blocked before they reach your API.
    </Text>
    <Code size='m'>/api/v1/users/{'{id}'}</Code>
  </section>
);
```

See [Spacing](../foundations/spacing.md) for gap and padding, and [Color](../foundations/color.md) for text colors.
