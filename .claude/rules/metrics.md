# Metrics / Analytics-Readiness Rules

Every interactive design-system component must be analytics-ready: arbitrary consumer `data-*` / `aria-*` / `id` / `ref` / event props (canonically `data-analytics-id` and `data-analytics-props`) land on the **real interactive DOM node**, with no analytics-specific DS props.

**The canonical contract is [`docs/metrics/contract.md`](../../docs/metrics/contract.md)** — rules, API semantics, anti-patterns, wrapper-level exceptions, closed-target gaps, and testing rules all live there. This file is a pointer, not a second copy.

- [`docs/metrics/contract.md`](../../docs/metrics/contract.md) — the contract (read this).
- [`docs/metrics/new-component-checklist.md`](../../docs/metrics/new-component-checklist.md) — author checklist for every new interactive component.
- [`docs/metrics/testing-examples.md`](../../docs/metrics/testing-examples.md) — copy-ready test snippets per component shape.

## Hard nevers (full rationale in the contract)

- No analytics-named DS props (`analyticsId`, `analyticsProps`) and no analytics provider / vendor SDK, ever. Don't add `slotProps` / `confirmButtonProps` *as an analytics escape hatch* — composition (exported sub-components) is the default seam; a typed slot prop is allowed only when it exists for genuine composition and natively forwards attributes to a concrete target.
- No allowlisting or shaping props — the full attribute surface forwards to the real target.
- Never parse, normalize, or reserialize `data-analytics-props`.
- Never silently replace consumer handlers, and never add a blanket `stopPropagation()` that blocks document-level click capture.
- Never place analytics on a wrapper when the target is internal — unless the component's own folder documents a wrapper-level decision (the `CodeSnippet/ANALYTICS_GAPS.md` precedent).

> During an active rollout an ephemeral `docs/metrics/plan/` directory may exist; it is deleted when the rollout completes.