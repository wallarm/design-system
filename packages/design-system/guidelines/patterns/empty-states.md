---
title: Empty states
description: Use when a list, table, or search has no data to show — explain why and offer the next action.
components: [EmptyState, EmptyStateTitle, EmptyStateDescription, EmptyStateActions, Button]
keywords: [empty, no data, no results, zero state, blank]
order: 80
---

# Empty states

<!-- placeholder: replaced by content track -->

## When to use

A collection has no items yet, or a search/filter returned nothing.

## Anatomy

`EmptyState` > `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateActions`.

## Layout and spacing

Center the empty state inside the area the data would occupy. See [Spacing](../foundations/spacing.md).

## States

- No data yet: offer the create action.
- No results: offer to clear filters.

## Rules

- Never leave a blank area where data would be.

## Example

```tsx
import { Button, EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateTitle } from '@wallarm-org/design-system';

<EmptyState>
  <EmptyStateTitle>No rules yet</EmptyStateTitle>
  <EmptyStateDescription>Create a rule to start filtering traffic.</EmptyStateDescription>
  <EmptyStateActions>
    <Button>Create rule</Button>
  </EmptyStateActions>
</EmptyState>;
```

## What your app owns

Copy text and the action handlers.

## Related

- [Spacing](../foundations/spacing.md)
