# Analytics-Readiness Contract

## Contract

The design system makes components **available for metrics collection without knowing about any specific analytics library**. It exposes two seams and owns neither the SDK, the event schema, nor the payload:

- `data-*` attributes on the real interactive DOM targets, and
- consumer-supplied callbacks / custom events.

Analytics-ready components are design-system components whose interactive targets preserve arbitrary consumer HTML attributes without introducing analytics-specific APIs.

The contract is intentionally vendor-neutral:

- no DS analytics provider abstraction
- no DS-only analytics props
- no parsing, reshaping, or interpretation of analytics payloads

The canonical examples are `data-analytics-id` and `data-analytics-props`, but the rule applies to arbitrary `data-*`, `aria-*`, `id`, `ref`, and event props.

## Required Criteria

1. **Reachability**: every interactive target is either the root interactive element or an exported sub-component the consumer can render directly.
2. **Real-target pass-through**: arbitrary `data-*`, `aria-*`, `id`, `ref`, and event props land on the actual click target, not only on a wrapper, unless the component is explicitly documented as wrapper-level.
3. **Element-specific typing**: props use the correct native attribute type such as `ButtonHTMLAttributes`, `AnchorHTMLAttributes`, `InputHTMLAttributes`, or `TextareaHTMLAttributes` when the target element is known.
4. **No prop filtering**: no allowlist, manual picking, or prop shaping that can silently drop unknown `data-*` or `aria-*` attributes.
5. **Event composition safety**: internal handlers compose with consumer handlers; they do not silently replace `onClick`, `onKeyDown`, or similar hooks unless the API explicitly documents that behavior.
6. **Polymorphic safety**: `as`, `asChild`, `Slot`, and primitive wrappers preserve attributes on the final rendered interactive element.
7. **State persistence**: analytics attributes survive rerenders, open/close transitions, variant changes, and controlled/uncontrolled state changes.
8. **Orthogonality**: `data-slot`, `data-testid`, and consumer `data-*` attributes can coexist on the same DOM node without collision.
9. **Opaque payload preservation**: `data-analytics-props` is forwarded byte-for-byte; never parse or reserialize it.
10. **Gap declaration**: if an internal target is not reachable, the docs explicitly record the gap, workaround, owner, and escalation path.
11. **Consumer ergonomics**: Storybook examples and public prop types make the target obvious without reading implementation code.

## Decision Tree

Pick the seam by the component's target shape:

| Situation | Seam |
| --- | --- |
| No interactive target (layout / display) | ordinary container props; the component is exempt |
| One real interactive target | native element attribute types + `{...rest}` on that target |
| Multiple interactive targets | exported sub-components, one per target |
| Internal / closed target (not individually reachable) | a consumer callback as the workaround + a documented gap in the component folder |
| Custom interaction with no DOM click (drag, sort, …) | a typed callback (e.g. `onResizeEnd`, `onSortingChange`); the consumer tracks outside the DS |

Typed slot props (`slotProps`, `confirmButtonProps`, …) are not a default seam on this list — see the Public API Rules below for when they are acceptable.

## Public API Rules

### No analytics-specific DS props

Never add `analyticsId`, `analyticsProps`, or any analytics-named prop — that leaks a vendor concept into the DS API.

Do not reach for `slotProps`, `confirmButtonProps`, or similar typed slot props **as an analytics escape hatch**. The default path for making an internal target reachable is an exported sub-component (or one of the other seams in the Decision Tree). A typed slot prop is *not* banned outright — it can be legitimate API for a complex component when it natively forwards arbitrary attributes to a concrete target — but it must exist for genuine composition reasons, not merely to thread analytics attributes through.

### Use native element attribute types

When the interactive target is known, the public props should expose that element's attribute type directly. `HTMLAttributes<HTMLElement>` is not sufficient when the target is concretely a button, anchor, input, or textarea.

### Use composition when multiple targets exist

If a component has multiple independent click targets, the consumer must be able to render those targets directly via exported sub-components or an equivalent composition seam.

### Auto-rendered interactive defaults need a composition seam

When a component auto-renders an interactive default (e.g. a close icon, a show-more control), the consumer must be able to substitute their own analytics-bearing instance through an explicit seam. The mechanism is chosen per component — an exported sub-component, a render prop, a disable-default flag plus child, or a children-scan opt-out (the `DialogClose` / `TourClose` / `TableSettingsMenu` precedent). Auto-rendering an interactive default with no substitution seam is a reachability gap.

### Preserve `data-analytics-props` verbatim

Treat it as an opaque string. The design system must not `JSON.parse`, normalize, or reserialize it.

### Click delegation: `data-ds-suppress-parent-click`

A component that delegates clicks from a container (e.g. `Card`, where the whole surface is clickable) must let descendants that handle their own click opt out of that delegation — without `stopPropagation()`, which would break analytics click capture.

The convention is a marker attribute, `data-ds-suppress-parent-click`:

- A **click-delegating parent** ignores its own delegated click when `event.target.closest('[data-ds-suppress-parent-click]')` resolves to a descendant inside it. Native interactive descendants (`<button>`, `<a href>`, `<input>`, …) are already excluded by the parent's interactive-selector gate; this marker covers the rest.
- An **interactive descendant that is not a native interactive element** (e.g. a click-to-copy `InlineCodeSnippet` rendered as `<code>`) sets the attribute on its real DOM node so the click resolves analytics at document level *and* leaves the parent inert.

This keeps the analytics path (document-level `closest('[data-analytics-id]')`) and the delegated-parent path independent.

## Wrapper-Level Exceptions

Wrapper-level placement is acceptable only when all of these are true:

- the component flags the wrapper-level decision in its **own folder** — in the component's test comments or in an `ANALYTICS_GAPS.md` colocated with it (the `CodeSnippet/ANALYTICS_GAPS.md` precedent)
- that record explains why the actual target is not currently reachable, plus the workaround, the owner, and the next decision point
- tests name the wrapper-level contract directly and assert wrapper placement deliberately

## Closed-Target Gaps

A closed-target gap is an internal interactive surface that is intentionally not individually targetable today (analytics is derived from a callback instead). The same decentralized rule applies: the **component folder** (test comments or an `ANALYTICS_GAPS.md`) records the gap, the callback-based workaround, the owner, and the next decision point.

This contract intentionally does **not** maintain a central per-component list of wrapper-level cases or gaps — it goes stale. The component folder and its tests are the single source of truth for each component's current state.

## Anti-Patterns

- Wrapping a DS component in a parent `<div data-analytics-id="...">` when the actual click target is internal.
- Adding analytics-vendor abstractions or DS-specific analytics props.
- Hiding interactive targets behind string labels, config objects, or internal-only action arrays when consumers need per-target attributes.
- Allowlisting safe props instead of forwarding the full attribute surface.
- Parsing or reserializing `data-analytics-props`.
- Letting internal event handlers overwrite consumer handlers without composition.
- Calling a blanket `event.stopPropagation()` in a `click` handler: it blocks the document-level listener that analytics SDKs use to resolve `closest('[data-analytics-id]')`. To stop an interactive descendant from triggering a click-delegating parent, use the opt-out below — not propagation blocking.

## Non-Goals

- Introducing an analytics SDK integration into the design system.
- Solving every closed target immediately when the product/API cost is not justified.
- Replacing `data-testid` or `data-slot`; those remain orthogonal conventions.

## Testing Rules

1. If the component is simple, tests assert that `data-analytics-id` lands on the real interactive DOM node.
2. If the component is wrapper-level by decision, the test name must say so and must assert wrapper placement deliberately.
3. If the component supports `as`, `asChild`, or similar polymorphism, tests must assert the attribute reaches the final rendered child element.
4. If the interactive root is a `<label>` or similar proxy target, include click-resolution coverage using `captureAnalyticsClicks` or an equivalent closest-based assertion.
5. Add negative checks where confusion is likely:
   - the attr does not land on a hidden input
   - the attr does not get stranded on a non-clickable wrapper
6. Include a verbatim `data-analytics-props` assertion for every component covered by the audit.
7. Verify attribute persistence across at least one meaningful state change when the component has transitions or internal state.

Locator hygiene: never query by the same `data-*` attribute you are asserting. Use `data-testid`, `getByRole`, or `data-slot` to locate the element, then assert the analytics attribute on it.

## Shared Examples

```tsx
render(<Button data-analytics-id="SAVE_CHANGES">Save</Button>);
expect(screen.getByRole('button')).toHaveAttribute('data-analytics-id', 'SAVE_CHANGES');
```

```tsx
const payload = '{"feature":"host","mode":"delete","count":3}';

render(
  <Button
    data-analytics-id="HOST_DELETE_SUBMIT"
    data-analytics-props={payload}
  >
    Delete
  </Button>,
);

expect(screen.getByRole('button')).toHaveAttribute('data-analytics-props', payload);
```

```tsx
render(
  <Button asChild>
    <a href="/docs" data-analytics-id="DOCS_NAV">
      Docs
    </a>
  </Button>,
);

expect(screen.getByRole('link')).toHaveAttribute('data-analytics-id', 'DOCS_NAV');
```

```tsx
const captured = captureAnalyticsClicks();

render(<Checkbox data-analytics-id="ACCEPT_TOS">Accept</Checkbox>);
await userEvent.click(screen.getByTestId('checkbox'));

expect(captured).toHaveBeenCalledWith('ACCEPT_TOS');
```
