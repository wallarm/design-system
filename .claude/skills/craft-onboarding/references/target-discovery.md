# Target discovery — find the real anchor elements (don't guess selectors)

This is the no-code "click the element" gesture, done for the requester. A tour step
that points at an element that doesn't exist (or mounts later) is the #1 way these
break. Confirm every anchor before you wire it.

Output of this step is a **target map**: for each area to anchor, `{ accessible name,
data-testid (if any), how to reference it, exists now vs mounts-after-interaction }`.
That map feeds Step 3 (shape) and Step 7 (wiring).

## Mode A — there is a running app (preferred)
Drive it the way a no-code element-picker would, via the Playwright MCP (this repo
already uses it):
1. `browser_navigate` to the route/URL from intake.
2. `browser_snapshot()` — returns the accessibility tree (roles + accessible names + a
   `ref` per element; ~200–400 tokens, cheap). Prefer this over a screenshot.
3. Pick each anchor **by accessible name + role** (e.g. the button named "Add
   integration"). Record its **`data-testid`** if present — this repo mandates a
   `data-testid` cascade through compound components, so most real anchors have one.
4. Note the element's accessible name — you'll use it to obey the copy rule "don't
   restate the visible label."
5. **Deferred mounts:** elements inside a dialog/menu/expander won't appear in the
   snapshot until you interact. After a `browser_click`, re-snapshot to confirm the
   next target exists. Mark any such target "mounts after <action>" → its step must use
   `waitForStepEvent` (see the deferred-mount recipe).

## Mode B — static repo, no running app
Find existing anchors in source instead:
1. Locate the screen's component(s) from the route/intake.
2. Grep them for existing handles: `ref={`, `data-testid=`, `data-slot=`.
3. Map each area to an existing `ref` (the generated tour uses `target: () => ref.current`).
4. **If a needed anchor has no `ref`,** emit the *minimal* one-line diff to add one
   (the `useRef` declaration + `ref={…}` on the element) — don't restructure the
   component. Flag it as the one code change engineering must apply.

## Notes
- The generated React always anchors via a **React `ref`** (`target: () => ref.current`),
  never a CSS/`data-testid` selector string — discovery just *confirms the element and
  its name*; `data-testid` is the durable identity you use to find it again.
- Keep snapshots minimal; don't dump the whole tree into context — pick the few anchors
  and move on.
- If you cannot find or confirm a target, **park it in `FIELD_NOTES.md`** and say so in
  the hand-off rather than inventing a ref.
