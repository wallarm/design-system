# Analytics-Readiness in `@wallarm-org/design-system`

## Purpose

These documents describe how design-system components support consumer analytics without locking the package to any vendor. They are the long-term source of truth.

The contract is vendor-neutral:

- interactive targets accept arbitrary HTML attributes
- consumers can pass `data-analytics-id`, `data-analytics-props`, `data-testid`, `aria-*`, `id`, `ref`, and event handlers without DS-specific analytics props
- those attributes land on the real interactive target unless the component is explicitly documented as wrapper-level

## Documents

- [contract.md](./contract.md) — the analytics-readiness contract, API rules, anti-patterns, test rules, wrapper-level exceptions, and known closed-target gaps.
- [new-component-checklist.md](./new-component-checklist.md) — the checklist every new interactive component must satisfy before it ships.
- [testing-examples.md](./testing-examples.md) — copy-ready metrics test snippets for each component shape (simple, `asChild`, label-root, wrapper-level, state persistence).

## Classification

- **Simple**: the consumer can already render or directly reach the interactive target, and analytics-readiness is element-typed props plus `{...rest}` on that target.
- **Complex**: at least one interactive target is hidden, internal, polymorphic in a non-trivial way, wrapper-level by current behavior, or requires public API work or an explicit gap decision.

## Ownership

- Design System team owns the contract, API changes, and shared test patterns.
- Component owners own implementation and test corrections for their components.
- Product/UX and analytics stakeholders sign off on wrapper-level exceptions and unresolved closed-target gaps.
