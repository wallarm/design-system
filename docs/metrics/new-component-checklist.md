# New Interactive Component — Analytics-Readiness Checklist

Run this before marking any new (or newly-interactive) design-system component complete. It is the operational form of [contract.md](./contract.md); the enduring rules live in [`.claude/rules/metrics.md`](../../.claude/rules/metrics.md). Non-interactive layout/display components (no click/type/toggle target) are exempt — note that and move on.

## 1. Targets

- [ ] **Listed every interactive target** — each element a user clicks, types into, or toggles (trigger, items, close, clear, submit, per-row actions…).
- [ ] **Every target is reachable** — it is either the root interactive element or an **exported sub-component** the consumer can render directly. No click target is buried behind a config array, string label, or internal-only action list.
- [ ] **Auto-rendered defaults have a composition seam** — if the component auto-renders an interactive default (e.g. a close icon), the consumer can substitute their own analytics-bearing instance through an explicit seam. Pick the mechanism per component — exported sub-component, render prop, `disable-default` flag + child, or a children-scan opt-out (the `DialogClose` / `TourClose` / `TableSettingsMenu` precedent).

## 2. Typing & pass-through

- [ ] **Element-specific prop types** — each interactive target's props extend the native attribute type of its rendered element (`ButtonHTMLAttributes<HTMLButtonElement>`, `AnchorHTMLAttributes<HTMLAnchorElement>`, `InputHTMLAttributes<HTMLInputElement>`, `TextareaHTMLAttributes<HTMLTextAreaElement>`). Generic `HTMLAttributes<HTMLDivElement>` only for a genuinely non-interactive container.
- [ ] **`{...rest}` lands on the real node** — arbitrary `data-*` / `aria-*` / `id` / `ref` reach the actual interactive DOM element, not just a wrapper. No allowlist, no manual prop picking, no shaping.
- [ ] **Opaque payload** — `data-analytics-props` is forwarded byte-for-byte; never `JSON.parse`, normalize, or reserialize it.
- [ ] **Orthogonality** — `data-slot`, `data-testid`, and consumer `data-*` coexist on the same node; consumer-passed `data-testid` wins over any context cascade (`testIdProp ?? contextTestId`).

## 3. Behavior

- [ ] **Event composition** — internal handlers compose with consumer `onClick` / `onKeyDown` (run the consumer handler, short-circuit the internal one on `event.defaultPrevented`, or use `composeEventHandlers`). No silent replacement.
- [ ] **No blanket `stopPropagation()`** — the component does not block document-level (`closest()`-based) analytics click capture.
- [ ] **Polymorphic safety** — `as` / `asChild` / `Slot` preserve attributes on the final rendered child.
- [ ] **State persistence** — analytics attributes survive rerenders, open/close transitions, variant changes, and controlled/uncontrolled changes.

## 4. Forbidden

- [ ] **No analytics-specific DS props** — no `analyticsId` / `analyticsProps` (analytics-named props) ever. No `slotProps` / `confirmButtonProps` added *just* to thread analytics through — composition (exported sub-components) is the default seam. A typed slot prop is fine only when it natively forwards attributes to a concrete target for genuine composition reasons.
- [ ] **No analytics provider / vendor SDK** in the design system.

## 5. Documentation & tests

- [ ] **Gaps & exceptions are explicit** — any wrapper-level decision or unreachable (closed) target is recorded in the **component folder** (test comments or an `ANALYTICS_GAPS.md`, per the `CodeSnippet/ANALYTICS_GAPS.md` precedent), each with its workaround, owner, and next decision point; the wrapper-level conditions in [contract.md](./contract.md) are met.
- [ ] **Storybook** shows where `data-analytics-id` goes (consumer ergonomics — target obvious without reading source).
- [ ] **Tests** copied from [testing-examples.md](./testing-examples.md): id on the real node, verbatim `data-analytics-props`, plus polymorphic / label-root / negative / state-persistence coverage as applicable. Locator hygiene observed.
