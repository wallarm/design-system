# Attribute: Nested Interactivity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `AttributeActions`-wrapped values forward clicks: clicking a built-in interactive descendant (e.g. `+N` IpList overflow popover, `Link`, `InlineCodeSnippet` copy button) triggers only that descendant; clicking elsewhere on the value opens the attribute dropdown menu. Also fix hover-background rounded corners so all four sides render fully.

**Architecture:** `AttributeActionsTarget` is the seam. Currently it disables descendant pointer events with `[&_*]:pointer-events-none` and bleeds vertically with `-my-6`. We drop the pointer-events block and lower the bleed to `-my-4`, then add merged event handlers (`onPointerDown` / `onClick` / `onKeyDown`) that call `event.preventDefault()` when the event originates from a descendant interactive element — Radix's `DropdownMenuTrigger asChild` composes handlers and respects `defaultPrevented`, so the dropdown does not open. Inner interactive handlers fire normally because they run in bubble before the event reaches our handler.

**Tech Stack:** React 19+, TypeScript, Tailwind CSS, Radix UI primitives (DropdownMenu, Popover), Vitest, Playwright (e2e), Storybook 10+, pnpm workspace.

**Reference spec:** `docs/superpowers/specs/2026-05-05-attribute-nested-interactivity-design.md`

---

## File Structure

| File | Change | Responsibility |
| --- | --- | --- |
| `packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx` | Modify | Routing logic + corrected vertical bleed; the only behavioural change. |
| `packages/design-system/src/components/Attribute/Attribute.stories.tsx` | Already modified (committed) — the `IPs` row inside `HorizontalWithActions` is the regression scenario. May need a new dedicated story for e2e-friendly assertions. | Visual + e2e fixture. |
| `packages/design-system/src/components/Attribute/Attribute.e2e.ts` | Modify | New `Interactions` describe with three tests; updated story list. |
| `packages/design-system/src/components/Attribute/Attribute.e2e.ts-snapshots/` | Regenerate | Existing horizontal screenshots may shift slightly because target's vertical bleed changes from −24 to −16 (this affects only hover state visuals, not idle layout). Regenerate where needed. |

No other component files change. No new files. No public API changes.

---

## Task 1: Pin down the regression with a story dedicated to e2e

The existing `HorizontalWithActions` story renders three rows. For e2e selectors and to keep the screenshot small and stable, we add a new focused story that contains _only_ the IPs row with overflow.

### Task 1: Add `HorizontalWithActionsIpOverflow` story

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.stories.tsx`

- [ ] **Step 1: Add the story export**

Append after the existing `HorizontalWithActions` export (currently ends around the IPs block we already added). Use a stable `data-testid` on the Attribute root so e2e can locate descendants by derived ids.

```tsx
export const HorizontalWithActionsIpOverflow: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute orientation='horizontal' data-testid='attr-ip-overflow'>
      <AttributeLabel>IPs</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <IpList type='horizontal'>
              <Ip>
                <IpCountry code='US' />
                <IpAddress>142.198.167.52</IpAddress>
                <IpProvider>Azure</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='US' />
                <IpAddress>34.74.73.20</IpAddress>
                <IpProvider>AWS</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='DE' />
                <IpAddress>34.74.73.20</IpAddress>
                <IpProvider>GCP</IpProvider>
              </Ip>
              <Ip>
                <IpCountry code='NL' />
                <IpAddress>10.0.0.1</IpAddress>
              </Ip>
              <Ip>
                <IpCountry code='JP' />
                <IpAddress>192.168.1.1</IpAddress>
              </Ip>
            </IpList>
          </AttributeActionsTarget>
          <AttributeActionsContent>
            <AttributeActionsItem
              onSelect={() => {
                /* story mock */
              }}
            >
              <Filter />
              Investigate by this value
            </AttributeActionsItem>
            <AttributeActionsItem
              onSelect={() => {
                /* story mock */
              }}
            >
              <Copy />
              Copy value
            </AttributeActionsItem>
          </AttributeActionsContent>
        </AttributeActions>
      </AttributeValue>
    </Attribute>
  </div>
);
```

- [ ] **Step 2: Verify Storybook renders the story**

Run: `pnpm --filter @wallarm/design-system storybook` (background) and open `Data Display / Attribute / Horizontal With Actions Ip Overflow`. Expected: 1 row, 3 visible IPs and a `+2` badge inside a single hover-zone.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/Attribute/Attribute.stories.tsx
git commit -m "test(attribute): WDS-74 add IP overflow story for nested interactivity"
```

---

## Task 2: Failing e2e — `+N` should NOT open the attribute dropdown

We pin the bug behaviour with a Playwright test that fails today.

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.e2e.ts`

### Step plan

- [ ] **Step 1: Extend the story helper list**

Replace the helper init at the top of the file:

```ts
const attributeStory = createStoryHelper('data-display-attribute', [
  'Horizontal',
  'Horizontal Label Truncation',
  'Horizontal Value Truncation',
  'Horizontal Composition',
  'Horizontal Loading',
  'Horizontal With Actions Ip Overflow',
] as const);
```

- [ ] **Step 2: Add Interactions describe and the failing test**

Append after the `Visual` describe block, still inside `test.describe('Component: Attribute', ...)`:

```ts
  test.describe('Interactions', () => {
    test('Should open IP overflow popover when +N badge is clicked, not the actions dropdown', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Ip Overflow');

      // The IpList sits under Attribute(testid="attr-ip-overflow") → AttributeActionsTarget,
      // and IpList's overflow trigger derives its testid via TestIdProvider as
      // "{root}--list-overflow-trigger".
      const overflowTrigger = page.getByTestId('attr-ip-overflow--list-overflow-trigger');
      const overflowContent = page.getByTestId('attr-ip-overflow--list-overflow-content');
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(overflowTrigger).toBeVisible();
      await overflowTrigger.click();

      // Expected: IpList popover visible, dropdown NOT visible.
      await expect(overflowContent).toBeVisible();
      await expect(dropdownContent).toBeHidden();
    });
  });
```

- [ ] **Step 3: Run the test — it must FAIL**

Run from repo root:

```bash
pnpm --filter @wallarm/design-system exec playwright test \
  packages/design-system/src/components/Attribute/Attribute.e2e.ts \
  -g "Should open IP overflow popover when \+N badge is clicked"
```

Expected: FAIL. Likely failure modes:
- `overflowTrigger` not found / not clickable (because today `[&_*]:pointer-events-none` swallows hits).
- `dropdownContent` is visible (because the click bubbles into `DropdownMenuTrigger`).

If it incidentally passes, the test is wrong — stop and re-check selectors before continuing.

- [ ] **Step 4: Do NOT commit yet**

We commit the failing test together with the implementation in Task 4 (TDD red→green in one commit keeps history clean for this small change).

---

## Task 3: Add complementary failing e2e — empty area still opens dropdown

This is the regression guard: clicking outside any interactive descendant must continue to open the dropdown.

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.e2e.ts`

- [ ] **Step 1: Append the second interaction test**

Inside the same `Interactions` describe added in Task 2, after the previous test:

```ts
    test('Should open actions dropdown when clicking a non-interactive area of the value', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Ip Overflow');

      const target = page.getByTestId('attr-ip-overflow--target');
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      // Click the right edge of the target — past all visible IPs and past the +N badge.
      const box = await target.boundingBox();
      if (!box) throw new Error('target box not measurable');
      await page.mouse.click(box.x + box.width - 4, box.y + box.height / 2);

      await expect(dropdownContent).toBeVisible();
    });
```

- [ ] **Step 2: Run only this test — expected behaviour today**

Run:

```bash
pnpm --filter @wallarm/design-system exec playwright test \
  packages/design-system/src/components/Attribute/Attribute.e2e.ts \
  -g "Should open actions dropdown when clicking a non-interactive area"
```

Expected: PASS today (current behaviour already opens the dropdown when clicking anywhere). This test guards against future regressions when we change the handlers.

- [ ] **Step 3: Do NOT commit yet** — bundles with Task 4.

---

## Task 4: Implement the fix in `AttributeActionsTarget`

This is the core change. Drop the pointer-events block, fix the bleed, add the merged handlers.

**Files:**
- Modify: `packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx`

- [ ] **Step 1: Read the current file to anchor the edit**

```bash
cat packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx
```

Confirm it matches the expected starting state (single `AttributeActionsTarget` FC, `useTestId('target')`, classNames including `-mx-4 -my-6`, `[&_*]:pointer-events-none`).

- [ ] **Step 2: Replace file content**

Overwrite with:

```tsx
import {
  type FC,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { DropdownMenuTrigger } from '../DropdownMenu';

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemradio"]',
  '[role="menuitemcheckbox"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="tab"]',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[data-attribute-actions-skip]',
].join(',');

const isFromInternalInteractive = (
  event: PointerEvent<HTMLElement> | MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
): boolean => {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  const match = target.closest(INTERACTIVE_SELECTOR);
  return match !== null && match !== event.currentTarget;
};

export interface AttributeActionsTargetProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const AttributeActionsTarget: FC<AttributeActionsTargetProps> = ({
  ref,
  children,
  className,
  onPointerDown,
  onClick,
  onKeyDown,
  ...props
}) => {
  const testId = useTestId('target');

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented) return;
    if (isFromInternalInteractive(event)) {
      event.preventDefault();
    }
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isFromInternalInteractive(event)) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if ((event.key === 'Enter' || event.key === ' ') && isFromInternalInteractive(event)) {
      event.preventDefault();
    }
  };

  return (
    <DropdownMenuTrigger asChild>
      <div
        {...props}
        ref={ref}
        data-testid={testId}
        data-slot='attribute-actions-target'
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          '-mx-4 -my-4 flex w-full cursor-pointer items-center rounded-8 px-6 py-4 transition-colors',
          'hover:bg-states-primary-hover active:bg-states-primary-pressed',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
          className,
        )}
      >
        {children}
      </div>
    </DropdownMenuTrigger>
  );
};

AttributeActionsTarget.displayName = 'AttributeActionsTarget';
```

Key diffs vs. previous version:
- Imported event types from `react`.
- Added `INTERACTIVE_SELECTOR` and `isFromInternalInteractive`.
- Destructured `onPointerDown`/`onClick`/`onKeyDown` from props so we can compose them.
- Three handler functions; each first calls user-provided handler, then short-circuits on `defaultPrevented`, then calls `preventDefault()` if internal-interactive.
- Removed `[&_*]:pointer-events-none`.
- Changed `-my-6` → `-my-4` so the rounded-8 corners render fully on all four sides.

- [ ] **Step 3: Type-check**

Run:

```bash
pnpm --filter @wallarm/design-system typecheck
```

Expected: PASS, zero errors.

- [ ] **Step 4: Lint / format**

Run:

```bash
npx biome check --write packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx
```

Expected: no errors. If formatter changes anything (single quotes, no semicolons, etc.), that's fine — biome is the source of truth.

- [ ] **Step 5: Re-run the e2e tests from Tasks 2 and 3**

Run:

```bash
pnpm --filter @wallarm/design-system exec playwright test \
  packages/design-system/src/components/Attribute/Attribute.e2e.ts \
  -g "Interactions"
```

Expected: BOTH tests PASS.

- [ ] **Step 6: Commit (red+green together)**

```bash
git add packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx \
        packages/design-system/src/components/Attribute/Attribute.e2e.ts
git commit -m "fix(attribute): WDS-74 forward clicks on built-in interactive descendants"
```

---

## Task 5: Update visual snapshots affected by `-my-4`

The previous `-my-6` made the target's hover area extend further vertically. Idle screenshots are unaffected (no hover applied), but `Horizontal Composition` and the new IP-overflow story include hover-state pixels indirectly only if `:hover` were active during capture — by default Playwright does not hover. So idle snapshots should not change.

We still verify and regenerate proactively, because the layout's effective row height does not change but Tailwind class diff might cause sub-pixel differences in some browsers.

- [ ] **Step 1: Run visual suite without updates first**

```bash
pnpm --filter @wallarm/design-system exec playwright test \
  packages/design-system/src/components/Attribute/Attribute.e2e.ts \
  -g "Visual"
```

Expected: PASS (no diffs). If diffs appear, inspect them — they should be tiny anti-alias differences only.

- [ ] **Step 2: If any snapshot diffs, update them**

```bash
pnpm --filter @wallarm/design-system exec playwright test \
  packages/design-system/src/components/Attribute/Attribute.e2e.ts \
  -g "Visual" --update-snapshots
```

- [ ] **Step 3: Commit only if snapshots changed**

```bash
git status packages/design-system/src/components/Attribute/Attribute.e2e.ts-snapshots
# If files changed:
git add packages/design-system/src/components/Attribute/Attribute.e2e.ts-snapshots
git commit -m "test(attribute): WDS-74 refresh visual snapshots after target bleed fix"
```

If `git status` shows nothing — skip the commit, no-op.

---

## Task 6: Add a hover-state visual regression for the rounded corners

Spec calls for a screenshot that proves all four corners render. We can do this without a new story — just hover the existing IP overflow story before taking the screenshot.

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.e2e.ts`

- [ ] **Step 1: Append the hover screenshot test**

Inside the existing `test.describe('Visual', ...)` block (Task 0 left it intact), at the bottom:

```ts
    test('Should render hover state with full rounded corners on the actions target', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Ip Overflow');
      const target = page.getByTestId('attr-ip-overflow--target');
      // Hover an empty area to keep the IpList +N popover closed.
      const box = await target.boundingBox();
      if (!box) throw new Error('target box not measurable');
      await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2);
      await expect(page).toHaveScreenshot();
    });
```

- [ ] **Step 2: Generate the baseline snapshot**

```bash
pnpm --filter @wallarm/design-system exec playwright test \
  packages/design-system/src/components/Attribute/Attribute.e2e.ts \
  -g "Should render hover state with full rounded corners" --update-snapshots
```

Expected: a new PNG appears under `Attribute.e2e.ts-snapshots/`.

- [ ] **Step 3: Re-run without `--update` to confirm stability**

```bash
pnpm --filter @wallarm/design-system exec playwright test \
  packages/design-system/src/components/Attribute/Attribute.e2e.ts \
  -g "Should render hover state with full rounded corners"
```

Expected: PASS.

- [ ] **Step 4: Visually inspect the snapshot**

Open the new PNG in your image viewer. Confirm: the hover background shows fully rounded corners on all four sides; no top/bottom clipping.

If clipping is still visible, the bleed is still wrong — go back to Task 4 step 2 and double-check the className change took effect (search the bundle for `-my-6`).

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Attribute/Attribute.e2e.ts \
        packages/design-system/src/components/Attribute/Attribute.e2e.ts-snapshots
git commit -m "test(attribute): WDS-74 add hover state regression for rounded corners"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full Attribute e2e suite**

```bash
pnpm --filter @wallarm/design-system exec playwright test \
  packages/design-system/src/components/Attribute/Attribute.e2e.ts
```

Expected: ALL PASS (Visual + Interactions).

- [ ] **Step 2: Repo-wide lint, typecheck, unit tests**

Run in parallel from repo root:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

Expected: all green.

- [ ] **Step 3: Manual smoke in Storybook**

If not already running: `pnpm --filter @wallarm/design-system storybook`. Then verify by hand:

1. `Data Display / Attribute / Horizontal With Actions Ip Overflow`:
   - Click the `+2` badge → IPs popover opens, NO dropdown menu.
   - Click an IP address (text inside an `Ip` block) → dropdown opens.
   - Click empty right padding of the target row → dropdown opens.
   - Hover the row → background has rounded corners on all four sides.
2. `Data Display / Attribute / Horizontal With Actions`:
   - First two rows (Source IP text, Status badge) → click anywhere → dropdown opens (regression guard for non-interactive descendants).
3. `Data Display / Attribute / With Actions` (vertical):
   - Same as horizontal — clicks open the dropdown.

- [ ] **Step 4: No additional commit**

Verification produces no artifacts. Stop here.

---

## Self-Review Notes

**Spec coverage:**
- "Detection rule" with full SELECTOR — Task 4 step 2 includes the exact list.
- "Handlers via Radix Slot composition, preventDefault skips" — implemented exactly that way in Task 4 step 2.
- "Drop `[&_*]:pointer-events-none`" — Task 4 step 2.
- "Hover-bleed `-my-6` → `-my-4`" — Task 4 step 2 + Task 6 verifies visually.
- "Backward compatibility — Text/Badge cases still open dropdown" — Task 3 covers this; Task 7 step 3 manual smoke.
- E2E test plan in spec — Tasks 2, 3, 6.

**Placeholder scan:** No "TBD"/"TODO". Every code step has full code. Every command has expected output stated. Files paths are absolute-from-repo-root or fully qualified.

**Type consistency:** Method names in the new file match across plan steps. `INTERACTIVE_SELECTOR`, `isFromInternalInteractive`, `handlePointerDown/handleClick/handleKeyDown` are introduced once and referred to consistently.
