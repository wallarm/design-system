# Attribute Component Design Spec

**Date:** 2026-04-09
**Figma:** https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8404-128600
**Reference:** https://chakra-ui.com/docs/components/data-list

## Overview

Displays a labeled read-only value for a single object attribute. Used in detail panels, drawers, and forms to present structured information — timestamps, IPs, statuses, identifiers, and other object properties. The value slot accepts text, badges, tags, code snippets, links, and other display components.

## Architecture

Compound component pattern (like Alert, Card).

### File Structure

```
packages/design-system/src/components/Attribute/
├── Attribute.tsx          # Root — flex-col wrapper, loading prop, TestIdProvider
├── AttributeLabel.tsx     # Label with description, info (Tooltip), link
├── AttributeValue.tsx     # Slot for value content, empty state ("—")
├── index.ts               # Barrel exports
├── Attribute.stories.tsx  # Storybook stories
└── Attribute.e2e.ts       # E2E tests
```

## Components

### `Attribute` (root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Shows Skeleton placeholders instead of children |
| `children` | `ReactNode` | — | AttributeLabel + AttributeValue |
| `data-testid` | `string` | — | Cascades via TestIdProvider |
| `ref` | `Ref<HTMLDivElement>` | — | Forwarded to root element |
| `className` | `string` | — | Merged via cn() |

**Renders:**
```
div.flex.flex-col    data-slot="attribute"
├── [loading=true]:  Skeleton (82px x 16px) + Skeleton (100% x 24px)
└── [loading=false]: {children}
```

When `loading=true`, renders two Skeleton components (label-sized and value-sized) instead of children.

### `AttributeLabel`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Label text |
| `description` | `ReactNode` | — | Hint text below the label |
| `info` | `ReactNode` | — | Content for Tooltip with Info icon |
| `infoSide` | `'left' \| 'right'` | `'right'` | Which side to place the info icon |
| `link` | `ReactNode` | — | Slot for Link component after label text |
| `ref` | `Ref<HTMLDivElement>` | — | Forwarded to root element |
| `className` | `string` | — | Merged via cn() |

**Renders:**
```
div.flex.flex-col.gap-0                   data-slot="attribute-label"
├── div.flex.items-center.gap-4
│   ├── [infoSide='left']:  Tooltip > Info icon (16px, text-secondary)
│   ├── Text size="sm" color="secondary"  — {children}
│   ├── [infoSide='right']: Tooltip > Info icon (16px, text-secondary)
│   └── [link]:              {link}
└── [description]: Text size="sm" color="secondary" — {description}
```

### `AttributeValue`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Value content; if empty, renders en-dash |
| `ref` | `Ref<HTMLDivElement>` | — | Forwarded to root element |
| `className` | `string` | — | Merged via cn() |

**Renders:**
```
div.pt-4.min-h-[28px]                    data-slot="attribute-value"
├── [has children]: {children}
└── [empty]:        Text size="sm" color="secondary" — "—"
```

Empty detection: renders the en-dash when `children` is `undefined`, `null`, or `false` (standard React empty children check).

## TestId Cascade

| Component | TestId |
|-----------|--------|
| `Attribute` | `{testId}` |
| `AttributeLabel` | `{testId}--label` |
| `AttributeValue` | `{testId}--value` |

## Design Decisions

1. **No color variants** — the component has no semantic color theming. It is a neutral data display container.
2. **Value is a pure slot** — no special rendering logic for different content types. Users compose with existing components (Badge, FormatDateTime, Ip, CodeSnippet, etc.).
3. **Automatic empty state** — when AttributeValue has no children, it renders an en-dash (`—`) in secondary text color.
4. **Loading replaces children** — when `loading=true` on root, Skeleton placeholders are rendered instead of children. Uses existing Skeleton component.
5. **Info via Tooltip** — the info icon on the label uses the existing Tooltip component.

## Storybook

**Category:** `Data Display/Attribute`

**Stories:**
- `Default` — plain text value
- `WithDescription` — label + description text
- `WithInfoRight` — label + info tooltip on the right
- `WithInfoLeft` — label + info tooltip on the left
- `WithLink` — label + link
- `Empty` — empty value showing en-dash
- `Loading` — skeleton state
- `WithBadge` — Badge as value
- `WithTags` — multiple Badge/Tag components in a row
- `WithCodeSnippet` — CodeSnippet as value
- `WithDateTime` — FormatDateTime as value
- `WithIP` — Ip component as value
- `Composition` — two-column grid with multiple Attributes (real-world layout from Figma)

## Usage Example

```tsx
<div className="grid grid-cols-2 gap-x-8 gap-y-0">
  <Attribute>
    <AttributeLabel info="Request timestamp">Created at</AttributeLabel>
    <AttributeValue>
      <FormatDateTime value={date} />
    </AttributeValue>
  </Attribute>

  <Attribute>
    <AttributeLabel>Source IP</AttributeLabel>
    <AttributeValue>
      <Ip value="34.74.73.20" />
    </AttributeValue>
  </Attribute>

  <Attribute>
    <AttributeLabel description="Not yet assigned">Region</AttributeLabel>
    <AttributeValue />
  </Attribute>

  <Attribute loading>
    <AttributeLabel>Status</AttributeLabel>
    <AttributeValue />
  </Attribute>
</div>
```
