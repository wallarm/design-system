# Drawer and Dialog `onExitComplete` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `onExitComplete` prop to the DS `Drawer` and `Dialog` that fires once, after both the panel's and the backdrop's exit animations have finished.

**Architecture:** `Drawer` takes the prop and passes it to `DrawerRoot`. `DrawerRoot` gives the backdrop a known id through Ark's `ids` and forwards a handler to `Dialog.Root onExitComplete`, which covers the content's presence only. It also listens, in the capture phase, for zag's non-bubbling `exitcomplete` event on the backdrop node. Whichever of the two presences finishes last (the other one's node is already gone from the document) calls the consumer's callback. `Dialog` gets the prop for free, because `DialogProps = DrawerProps` and `Dialog` renders `Drawer`.

**Tech Stack:** React 19 with React Compiler, Ark UI 5.39.2 (`@ark-ui/react/dialog`), zag 1.43.3 presence, Rstest with Testing Library on jsdom, Playwright (in CI only), Storybook 10.

**Spec:** `docs/superpowers/specs/2026-11-17-overlay-manager-design.md`, section "Change 1: `onExitComplete` on Drawer and Dialog". This plan file lives on `feat/modal-manager`. The work itself happens on its own branch, created from `main`.

## Global Constraints

- **Branch.** Use `feat/drawer-exit-complete`, created from `origin/main` in its own worktree. Before the first push, rename it to carry the Jira key the user supplies: `git branch -m feat/<KEY>-drawer-exit-complete`.
- **Commits.** Use `feat(drawer): …` (the user's decision: a minor bump). The PR title is `feat(drawer): forward onExitComplete on Drawer and Dialog (<KEY>)`.
- **Additive only.** No existing default, class or duration changes. The shared `Overlay` backdrop (`components/Overlay/Overlay.tsx`), which Tour and SearchModal also render, keeps its 200ms fade.
- **React rules.** No `ref.current` reads or writes during render, and no hand memoization. Use only `useId` and `useEffect`, which keeps the code React 18-compatible for Claude Design's canvas.
- **Types.** No `any`.
- **Test locators.** Use `data-testid`; never use `data-slot`. In unit tests the backdrop may be located through Ark's `[data-scope="dialog"][data-part="backdrop"]`, as `DrawerRoot.tsx` itself does for content.
- **E2E.** Runs in CI only, never locally (user rule).

## Review Focus

1. **Two Drawers open at once**, nested or siblings: closing one must not fire the other's callback, and closing both fires each one once. Tested in Task 1, Step 2.
2. **A fresh `onExitComplete` function on every render** (a consumer not compiled by React Compiler): it still fires exactly once, calling the latest function. Tested in Task 1, Step 2.
3. **A reopen before the backdrop finishes, then a close:** exactly one call in total, with no stale call from the first close. Tested in Task 1, Step 2.
4. **The Drawer unmounts while open or mid-exit:** no call, and no error from the document listener afterwards. Tested in Task 1, Step 2.
5. **`Dialog` gets the same semantics** as `Drawer`. Tested in Task 1, Step 3.

---

### Task 1: Forward `onExitComplete` through Drawer and Dialog

**Files:**
- Modify: `packages/design-system/src/components/Drawer/Drawer.tsx`. The `DrawerProps` interface is at lines 8-39, the destructuring at 41-56, and the `<DrawerRoot>` element at 68-74.
- Modify: `packages/design-system/src/components/Drawer/DrawerRoot.tsx`. The `DrawerRootProps` interface is at lines 58-65, and the component at 67-101.
- Test: `packages/design-system/src/components/Drawer/Drawer.test.tsx`. Add a new `describe('Exit complete')` at the end of the file, and reuse the module-level `flushLayers` at line 383.
- Test: `packages/design-system/src/components/Dialog/Dialog.test.tsx`.

**Interfaces:**
- Produces: `DrawerProps.onExitComplete?: () => void`, and therefore `DialogProps.onExitComplete`. The overlay-manager plan consumes it as `controller.rootProps.onExitComplete`.

- [ ] **Step 1: Set up the branch.** Create a worktree for the new branch `feat/drawer-exit-complete` from `origin/main` (superpowers:using-git-worktrees). Then run `pnpm install --frozen-lockfile` at its root.

  Expected: the install exits 0, and `pnpm --filter @wallarm-org/design-system test:run src/components/Drawer` passes on the untouched code.

- [ ] **Step 2: Write the failing Drawer tests.** In `Drawer.test.tsx`, add `waitFor` to the `@testing-library/react` import, then append:

```tsx
describe('Exit complete', () => {
  const BACKDROP = '[data-scope="dialog"][data-part="backdrop"]';

  const ExitDrawer = ({
    open,
    overlay,
    onExitComplete,
    testId = 'exit-drawer',
  }: {
    open: boolean;
    overlay?: boolean;
    onExitComplete?: () => void;
    testId?: string;
  }) => (
    <Drawer open={open} overlay={overlay} onExitComplete={onExitComplete} data-testid={testId}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>Body {testId}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  it('fires once after the drawer closes', async () => {
    const onExitComplete = rs.fn();
    const { rerender } = render(<ExitDrawer open onExitComplete={onExitComplete} />);
    rerender(<ExitDrawer open={false} onExitComplete={onExitComplete} />);
    await waitFor(() => expect(onExitComplete).toHaveBeenCalledTimes(1));
    await flushLayers();
    expect(onExitComplete).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('exit-drawer--content')).toBeNull();
    expect(document.querySelector(BACKDROP)).toBeNull();
  });

  it('waits for the backdrop when it outlives the content', async () => {
    // jsdom has no CSS animations; make only the backdrop "animate" so it finishes last, as in a browser.
    // zag caches computed styles per node, so the spy must exist before the drawer mounts.
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    const spy = rs.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
      if (!element.matches(BACKDROP)) return realGetComputedStyle(element, pseudo);
      return {
        get animationName() {
          return element.getAttribute('data-state') === 'closed' ? 'exit' : 'enter';
        },
        animationDuration: '0.2s',
        display: 'block',
      } as unknown as CSSStyleDeclaration;
    });
    const onExitComplete = rs.fn();
    const { rerender } = render(<ExitDrawer open onExitComplete={onExitComplete} />);
    rerender(<ExitDrawer open={false} onExitComplete={onExitComplete} />);
    await waitForElementToBeRemoved(() => screen.queryByTestId('exit-drawer--content'));
    expect(onExitComplete).not.toHaveBeenCalled();
    fireEvent.animationEnd(document.querySelector(BACKDROP) as Element);
    await waitFor(() => expect(onExitComplete).toHaveBeenCalledTimes(1));
    spy.mockRestore();
  });
```

  Add these to the same `describe`, each with the assertion given:

| Test | Arrange and act | Assert |
|---|---|---|
| `'fires once with overlay={false}'` | `overlay={false}`, then close | `toHaveBeenCalledTimes(1)` after `waitFor`, still 1 after `flushLayers()` |
| `'fires once in total when the drawer reopens before the backdrop finishes'` | The same `getComputedStyle` spy. Close, wait for the content to be removed, reopen (`open`), close again, then `fireEvent.animationEnd` on the backdrop | called once |
| `'never fires for a drawer that was never opened'` | render `open={false}`, `flushLayers()` | `not.toHaveBeenCalled()` |
| `'never fires when the drawer unmounts while open'` | render `open`, `unmount()`, `flushLayers()` | `not.toHaveBeenCalled()`, and no error is thrown |
| `'fires only the closed drawer callback when two drawers are open'` | two `ExitDrawer`s with `testId` `'a'` and `'b'` and separate spies; close `'a'` only | spy `a` called once, spy `b` not called |
| `'calls the latest callback when the handler changes during the exit'` | close with `first`, then immediately `rerender` (still closed) with `second` | `second` called once, `first` not called |

- [ ] **Step 3: Write the failing Dialog test.** In `Dialog.test.tsx`, add `'forwards onExitComplete'`: render `<Dialog open onExitComplete={spy}>` with a `DialogContent` and a `DialogTitle`, rerender it with `open={false}`, then `await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))`.

- [ ] **Step 4: Run the tests and confirm they fail.**

  Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Drawer src/components/Dialog`

  Expected: the new tests FAIL with a TypeScript or runtime error, because `onExitComplete` is not a `Drawer` prop yet. The existing tests pass.

- [ ] **Step 5: Add the prop to `DrawerProps` in `Drawer.tsx`.** Put it with the other callbacks, then destructure it and pass it to `<DrawerRoot onExitComplete={onExitComplete} …>`. Use this JSDoc verbatim, because it flows to MCP, the website and Claude Design:

```ts
  /**
   * Fires once the drawer has finished closing: after the panel's and the backdrop's exit
   * animations end, or right away when there is no animation. Not fired when the drawer
   * reopens before the exit ends, when it never opened, or when it unmounts while open or closing.
   */
  onExitComplete?: () => void;
```

- [ ] **Step 6: Implement the "last presence fires" logic in `DrawerRoot.tsx`.** Add `onExitComplete?: () => void` to `DrawerRootProps`. Add `useEffect` and `useId` to the `react` import. Inside the component, after the `useNonModalFocusReturn` call (line 77), add:

```tsx
  const backdropId = useId();

  // The backdrop (200ms) has its own presence and outlives the content (150ms); Ark's Root
  // onExitComplete covers only the content. Report once, from whichever finishes last: the first
  // to finish still finds the other's node. zag dispatches a non-bubbling `exitcomplete` on each
  // presence node, so listen in the capture phase.
  useEffect(() => {
    if (!onExitComplete) return;
    const handleBackdropExitComplete = (event: Event) => {
      const { target } = event;
      if (target instanceof Element && target.id === backdropId && !document.getElementById(contentId)) {
        onExitComplete();
      }
    };
    document.addEventListener('exitcomplete', handleBackdropExitComplete, true);
    return () => document.removeEventListener('exitcomplete', handleBackdropExitComplete, true);
  }, [onExitComplete, backdropId, contentId]);

  const handleContentExitComplete = () => {
    if (!document.getElementById(backdropId)) onExitComplete?.();
  };
```

  On `<Dialog.Root>`, change `ids={{ content: contentId }}` to `ids={{ content: contentId, backdrop: backdropId }}` and add `onExitComplete={handleContentExitComplete}`.

  Setting `ids.backdrop` is safe: zag reads the backdrop through the same id for `--layer-index` (`@zag-js/dialog` `dialog.dom.mjs` `getBackdropId`), and nothing in the repo reads the backdrop's id. `useNonModalFocusReturn.ts` is the precedent for document capture listeners and `getElementById(contentId)`.

- [ ] **Step 7: Run the tests and confirm they pass.**

  Run: `pnpm --filter @wallarm-org/design-system test:run src/components/Drawer src/components/Dialog`

  Expected: PASS, every test in both files.

- [ ] **Step 8: Run the static checks.**

  Run:
  - `pnpm turbo run typecheck --filter=@wallarm-org/design-system`, expected exit 0;
  - `pnpm exec biome check packages/design-system/src/components/Drawer packages/design-system/src/components/Dialog`, expected no errors (the 4 warnings that already exist are fine);
  - `pnpm --filter @wallarm-org/design-system compiler:audit | grep -E 'Drawer(Root)?\.tsx'`, expected no new bailout lines (compare with `main`).

- [ ] **Step 9: Commit.**

```bash
git add packages/design-system/src/components/Drawer packages/design-system/src/components/Dialog/Dialog.test.tsx
git commit -m "feat(drawer): forward onExitComplete on Drawer and Dialog"
```

### Task 2: Exit-complete story, e2e check and PR

**Files:**
- Modify: `packages/design-system/src/components/Drawer/Drawer.stories.tsx`. Add a story after `Controlled` (line 635).
- Modify: `packages/design-system/src/components/Drawer/Drawer.e2e.ts`. Extend the story list at lines 4-24, and add a test under `'Interactions'` (line 108).

**Interfaces:**
- Consumes: `DrawerProps.onExitComplete` from Task 1.

- [ ] **Step 1: Add the `ExitComplete` story.** It starts closed, uses a named handler and has no wrapper component. `useState`, `VStack` and `Text` are already imported.

```tsx
/** `onExitComplete` fires once the panel and its backdrop have finished animating out. */
export const ExitComplete: StoryFn<DrawerProps> = () => {
  const [exits, setExits] = useState(0);
  const handleExitComplete = () => setExits(count => count + 1);

  return (
    <VStack gap={12} align='start'>
      <Drawer data-testid='drawer' onExitComplete={handleExitComplete}>
        <DrawerTrigger asChild>
          <Button variant='outline' color='neutral'>
            Open Drawer
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <ContentPlaceholder fillHeight />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Text data-testid='exit-count'>Exits finished: {exits}</Text>
    </VStack>
  );
};
```

- [ ] **Step 2: Add the e2e test.** Append `'Exit Complete'` to the `createStoryHelper('overlay-drawer', [...])` list. Under `'Interactions'`, add `'Should report one finished exit per close when the drawer closes'`:
  1. `goto` the story, open it with the existing `openDrawer(page)`, then `page.keyboard.press('Escape')`;
  2. `await expect(getDrawerContent(page)).toBeHidden()`;
  3. `await expect(page.getByTestId('exit-count')).toHaveText('Exits finished: 1')`;
  4. open and close again, then expect `'Exits finished: 2'`.

  Also add `'Should report the finished exit when reduced motion is preferred'`. It calls `page.emulateMedia({ reducedMotion: 'reduce' })` before `goto`, then repeats steps 1-3. This is the spec's check that an exit never gets stuck.

  The precise ordering against the backdrop is covered by the unit test, so neither test needs a screenshot.

- [ ] **Step 3: Typecheck the e2e file locally.** Do not run Playwright locally.

  Run: `cd packages/design-system && pnpm exec tsc -p tsconfig.e2e.json --noEmit --composite false --incremental false`

  Expected: exit 0.

- [ ] **Step 4: Commit.**

```bash
git add packages/design-system/src/components/Drawer/Drawer.stories.tsx packages/design-system/src/components/Drawer/Drawer.e2e.ts
git commit -m "test(drawer): cover onExitComplete in a story and e2e"
```

- [ ] **Step 5: Rename, push and check CI.** Rename the branch with the user's Jira key (`git branch -m feat/<KEY>-drawer-exit-complete`) and push it.

  Expected: the CI quality, build and e2e jobs are green. The new test needs no baseline, so there is no `[update-screenshots]`.

- [ ] **Step 6: Open the PR.** Run `/vestige-audit`; the `gh pr create` hook requires it. Then open the PR:
  - title `feat(drawer): forward onExitComplete on Drawer and Dialog (<KEY>)`;
  - the body names the overlay-manager spec as the consumer;
  - it states what was checked for stuck exits: reduced motion by e2e, and a hidden tab by reading the code (zag 1.43.3 `syncPresence` unmounts at once when `visibilityState` is `'hidden'`);
  - it ends with the Claude Code attribution line.
