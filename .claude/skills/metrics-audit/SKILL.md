# Metrics Audit

Audit a design-system component against the analytics-readiness contract and output its target inventory, gaps, and the tests it still needs.

## Usage

```
/metrics-audit ComponentName
```

- `ComponentName` — PascalCase component name (e.g., `Drawer`, `Table`, `TimeInput`).

Use this when adding analytics-readiness to an existing component, when reviewing whether a component satisfies the contract, or before recording a wrapper-level / closed-target decision in the component's own folder.

## Canonical References

- [`docs/metrics/contract.md`](../../../docs/metrics/contract.md) — the contract, API semantics, wrapper-level/gap policy, and testing rules (the authority).
- [`docs/metrics/new-component-checklist.md`](../../../docs/metrics/new-component-checklist.md) — the per-target check list this audit applies.
- [`docs/metrics/testing-examples.md`](../../../docs/metrics/testing-examples.md) — copy-ready test snippets.

This skill is **read-only analysis** — it does not modify code. Hand the inventory and gap list to the `design-system` and `test` agents to implement.

## Instructions

### Step 1: Read the source

Read every file in `packages/design-system/src/components/{ComponentName}/`, its `index.ts` barrel (only exported sub-components are reachable by consumers), and any colocated `ANALYTICS_GAPS.md` or analytics-related test comments.

### Step 2: Enumerate interactive targets

List every element a user clicks, types into, or toggles — trigger(s), items, close, clear, submit, per-row actions, drag handles, etc. For each, record:

- the **rendered element** (`<button>`, `<a>`, `<input>`, `<label>`, `<div>` …)
- whether it is the **root**, an **exported sub-component**, an **auto-rendered default**, or **internal only**
- whether it is reachable by the consumer today

### Step 3: Check each target

Run every target against [`docs/metrics/new-component-checklist.md`](../../../docs/metrics/new-component-checklist.md) — every dimension in that checklist. Note each item as pass / fail / not-applicable, with the file and line for failures.

### Step 4: Classify

- **Simple** — every interactive target is the root or directly reachable.
- **Complex (compound-seam)** — multiple targets reachable via exported sub-components.
- **Wrapper-level** — at least one target is genuinely internal and analytics lands on the wrapper (resolved via `closest()`). Allowed **only** if the component folder documents the decision, per [`docs/metrics/contract.md`](../../../docs/metrics/contract.md).
- **Closed-target gap** — a target is unreachable by design; record the callback-based workaround, owner, and next decision point.

### Step 5: Output

1. **Target inventory** table:

   | Target | Element | Reached via | Typed correctly? | Pass-through? | Gap |
   |--------|---------|-------------|------------------|---------------|-----|

2. **Classification** — Simple / Complex / Wrapper-level, with justification.

3. **Gaps & violations** — ordered list; each names the file, the contract rule broken, and the fix (expose a sub-component, widen the prop type, compose the handler, remove a `stopPropagation`, etc.). Distinguish a **must-fix violation** from an **accepted gap** (documented, with workaround).

4. **Tests needed** — which snippets from [testing-examples.md](../../../docs/metrics/testing-examples.md) apply (simple / `asChild` / label-root / wrapper-level / state persistence / event composition / negative), and which are already present.

5. **Component-folder record** — for any wrapper-level case or closed-target gap, the note to add to the component folder (a test comment or an `ANALYTICS_GAPS.md`): the rationale, callback-based workaround, owner, and next decision point.