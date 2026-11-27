# TableOfContents + useScrollSpy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `TableOfContents` compound component (Full / Minimized views) and a public `useScrollSpy` hook, and make `src/hooks` public API (WDS-210).

**Architecture:** `TableOfContents` is a dumb, controlled nav: it renders `TableOfContentsItem` children as row links (Full, popover) or dashes (Minimized) via a context `mode`, and reports clicks through `onValueChange`. `useScrollSpy` is an independent hook in `src/hooks` that computes the active section from scroll position; pages wire the two together.

**Tech Stack:** React 19 (+ React Compiler), TypeScript strict, Tailwind + CVA, Ark UI `Popover`, Rstest + Testing Library, Playwright (CI only), Storybook 10.

**Spec:** `docs/superpowers/specs/2026-11-27-table-of-contents-design.md` — read it in full first; this plan does not repeat it.

All paths below are relative to `packages/design-system/` unless they start with `docs/`.
Run commands from `/Users/ilyapashkov/orca/workspaces/wallarm-design-system/feat-WDS-210/packages/design-system`.

## Global Constraints

- No new dependencies. No `any`. No `React.forwardRef`, no default exports, no inline styles, no hardcoded colors, no hand memoization (`useMemo`/`useCallback`/`memo`).
- Rules of React (React Compiler): no `ref.current` reads/writes in render.
- CVA for variants, `cn()` for class merging, `data-slot` on every root, `displayName` on every component.
- Test IDs per `docs/test-id-pattern.md`; tests locate by `data-testid` / role, never `data-slot`.
- Metrics contract (`docs/metrics/contract.md`): consumer `data-*`/`aria-*`/`id`/`ref`/handlers land on the item `<a>` and the root `<nav>`; handlers composed, never replaced.
- Icons only from `src/icons` (no inline SVG). No Figma URLs outside `*.figma.ts`.
- Stories: no local wrapper components, no inline arrow callbacks in JSX (named handlers before `return`); overlays closed by default; story names spaced (`'With Scroll Spy'`).
- E2E runs in CI only — never run `e2e:docker` locally; baselines via a commit with `[update-screenshots]`.
- Conventional commits ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Item click with a consumer `onClick` that calls `preventDefault()` → `onValueChange` NOT called (Task 3 test `respects consumer preventDefault`).
2. `useScrollSpy` with `root: null` (container not mounted yet) → no listeners on window, `activeId` stays initial; then switching to the element attaches (Task 1 test `stays idle while root is null`).
3. `ids` change between renders (sections added/removed) → hook re-measures, never returns an id no longer in `ids` (Task 1 test `drops removed ids`).
4. `value` matching no item → no item has `aria-current`, no dash is active, nothing throws (Task 3 test `unknown value activates nothing`).
5. Popover open and an item clicked → popover closes and `onValueChange` fires once (Task 4 test `item click in popover closes it`).

---

### Task 1: `useScrollSpy` hook

**Files:**
- Create: `src/hooks/useScrollSpy.ts`
- Create: `src/hooks/__tests__/useScrollSpy.test.tsx`
- Modify: `src/hooks/index.ts` (add export + types)

**Interfaces:**
- Produces:
  ```ts
  export interface UseScrollSpyOptions {
    ids: string[];
    root?: HTMLElement | null; // undefined → window; null → idle
    offset?: number;           // default 0
    behavior?: ScrollBehavior; // default 'smooth'
  }
  export interface UseScrollSpyResult {
    activeId: string | undefined;
    scrollTo: (id: string) => void;
  }
  export function useScrollSpy(options: UseScrollSpyOptions): UseScrollSpyResult;
  ```

- [ ] **Step 1: Write failing tests** (`renderHook` from Testing Library; mock each section's `getBoundingClientRect` and `window.scrollY`/`innerHeight`/`document.documentElement.scrollHeight`; dispatch `scroll` and flush rAF):
  - `returns the first id before any section passes the line`
  - `returns the last section whose top is at or above offset` (offset 80, tops [-200, 40, 300] → second id)
  - `returns the last id when scrolled to the bottom` (scrollY + innerHeight >= scrollHeight)
  - `skips ids with no element`
  - `scrollTo sets activeId immediately and ignores scroll until settled` (call `scrollTo('c')`, fire scroll with geometry pointing at 'b' → still 'c'; fire `scrollend` → re-measures)
  - `user wheel cancels the scrollTo lock`
  - `measures against a custom root element` (listener on the element, positions relative to `root.getBoundingClientRect().top`)
  - `stays idle while root is null` (spy `window.addEventListener`: no `scroll` listener)
  - `drops removed ids` (rerender with fewer ids → activeId ∈ new ids)
  - `removes listeners on unmount`
- [ ] **Step 2: Run** `pnpm exec rstest run src/hooks/__tests__/useScrollSpy.test.tsx` → FAIL (module not found).
- [ ] **Step 3: Implement** per spec §useScrollSpy: passive `scroll` + `resize` listeners in `useEffect`, rAF-throttled measure, lock flag in a ref (written only in handlers/effects), unlock on `scrollend` or 100ms without scroll, cancel on `wheel`/`touchstart`/`keydown`. `scrollTo` uses `scrollTo({ top, behavior })` on root/window with `top = elTop - containerTop + currentScroll - offset`. JSDoc on the hook with a usage example wiring `TableOfContents`.
- [ ] **Step 4: Run** the test file → PASS.
- [ ] **Step 5: Commit** `feat(hooks): add useScrollSpy (WDS-210)`.

### Task 2: Make hooks public

**Files:**
- Modify: `src/index.ts` (add `export * from './hooks';` or explicit named re-exports — match the file's explicit style)
- Modify: `package.json` `exports` — add `"./hooks"` before `"./*"`, mirroring `"./icons"` (`development: ./src/hooks/index.ts`, `types: ./dist/hooks/index.d.ts`, `import`/`require`/`default: ./dist/hooks/index.js`)
- Modify: each file in `src/hooks/*.ts(x)` lacking a JSDoc on its exported hook — add a short one.
- Test: `src/hooks/__tests__/publicApi.test.ts`

**Interfaces:**
- Consumes: Task 1 `useScrollSpy`.
- Produces: root + `@wallarm-org/design-system/hooks` exports `useArrowNav`, `useControlled`, `useCopyToClipboard`, `useIsKeyPressed`, `useOverflowItems`, `useScrollSpy` + `UseOverflowItemsOptions`, `UseOverflowItemsResult`, `UseScrollSpyOptions`, `UseScrollSpyResult`.

- [ ] **Step 1: Write failing test** `exports every hook from the package root`: `import * as root from '../../index'`; assert each of the six names is a function.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement**. First `grep` `src/index.ts` for each hook name to rule out a clash. Check the metadata/MCP build (`grep -rn "hooks\|components" scripts/ | grep -i metadata`) — if it only scans components, note that in the PR body as a known gap; do not extend it here.
- [ ] **Step 4: Run** test → PASS; `pnpm build` → `dist/hooks/index.js` and `dist/hooks/index.d.ts` exist.
- [ ] **Step 5: Commit** `feat(hooks): export design-system hooks publicly (WDS-210)`.

### Task 3: `TableOfContents` — Full view + item

**Files:**
- Create: `src/components/TableOfContents/{TableOfContents.tsx, TableOfContentsItem.tsx, TableOfContentsContext.ts, classes.ts, index.ts}`
- Create: `src/components/TableOfContents/{TableOfContents.test.tsx, TableOfContents.a11y.test.tsx, TableOfContents.analytics.test.tsx, TableOfContents.testid.test.tsx}`
- Modify: `src/index.ts` (export components + Props types, alphabetical block)

**Interfaces:**
- Consumes: `useControlled` (`src/hooks/useControlled.ts`), `TestIdProvider`/`useTestId` (`src/utils/testId.ts`), `cn`.
- Produces:
  ```ts
  export type TableOfContentsView = 'full' | 'minimized';
  export interface TableOfContentsProps extends Omit<ComponentProps<'nav'>, 'onChange'>, TestableProps {
    value?: string;
    onValueChange?: (value: string) => void;
    view?: TableOfContentsView;
    defaultView?: TableOfContentsView; // 'full'
    onViewChange?: (view: TableOfContentsView) => void;
    title?: string; // 'On this page'
    ref?: Ref<HTMLElement>;
  }
  export interface TableOfContentsItemProps extends ComponentProps<'a'> {
    value: string;
    level?: 1 | 2;   // 1
    number?: ReactNode;
    ref?: Ref<HTMLAnchorElement>;
  }
  // context (internal)
  interface TableOfContentsContextValue {
    value: string | undefined;
    onValueChange: ((value: string) => void) | undefined;
    mode: 'row' | 'dash';
    onItemSelect?: () => void; // Task 4 popover close
  }
  ```

- [ ] **Step 1: Get the Figma reference.** Load `/figma-design-to-code`, then `get_design_context` (fileKey `VKb5gW46uSGw0rqrhZsbXT`) on `toc-item` (`12994:5965`) and `toc-progress` Type=Full (`13000:7595`). Map to existing tokens; rows reuse the NavPanel row recipe in `src/components/NavPanel/classes.ts` for hover/pressed/focus. Collapse icon: pick from `src/icons` matching Figma's `Button` instance (likely `ListCollapse` / `PanelRight…`).
- [ ] **Step 2: Write failing tests** (`TableOfContents.test.tsx`):
  - `renders a nav named by title` (`getByRole('navigation', { name: 'On this page' })`)
  - `calls onValueChange with the item value on click`
  - `respects consumer preventDefault` (consumer `onClick={e => e.preventDefault()}` → not called)
  - `keeps browser navigation on ctrl/meta click` (`onValueChange` not called, event not default-prevented)
  - `does not intercept when href is not a fragment` (`href="/other"`)
  - `does not intercept without onValueChange` (event not default-prevented)
  - `marks only the active item with aria-current="location"`
  - `unknown value activates nothing`
  - `level 2 item carries data-level="2"`; `renders number before the label`
  - `toggle switches to minimized (uncontrolled) and calls onViewChange`; `controlled view follows the prop`
  - `label is clamped to two lines` (class `line-clamp-2` on the label span)
  - a11y file: `list semantics` (`list` / `listitem` roles), `toggle has an accessible name and aria-expanded`.
  - analytics file: per `docs/metrics/testing-examples.md` — item `data-analytics-id`/`-props` byte-for-byte on the `<a>`, root attrs on `<nav>`, consumer `onClick` still fires.
  - testid file: root `toc` → `toc--toggle`, `toc--list`, `toc--item`; no testids when root has none; per-item override wins.
- [ ] **Step 3: Run** `pnpm exec rstest run src/components/TableOfContents` → FAIL.
- [ ] **Step 4: Implement** Full view only (Minimized renders nothing yet besides the toggle). Click logic exactly per spec §TableOfContentsItem.
- [ ] **Step 5: Run** → PASS; `pnpm lint` and `pnpm typecheck` clean for touched files.
- [ ] **Step 6: Commit** `feat(table-of-contents): add TableOfContents full view (WDS-210)`.

### Task 4: Minimized view + popover

**Files:**
- Create: `src/components/TableOfContents/TableOfContentsMinimized.tsx`
- Modify: `TableOfContents.tsx`, `TableOfContentsItem.tsx` (dash mode), `classes.ts`, test files from Task 3.

**Interfaces:**
- Consumes: Task 3 context; `Popover`/`PopoverContent` from `src/components/Popover` (or Ark `Popover` directly with the same surface classes if `PopoverContent` doesn't fit — spec leaves it to you).
- Produces: testid slots `{base}--dashes`, `{base}--popover`.

- [ ] **Step 1: Figma.** `get_design_context` on `toc-progress` Type=Mini (`13000:7594`), dash symbols (`13000:7538`, `13000:7556`, `13000:7550`, `13000:7558`) and the "Minimized" doc frame (`13005:805`) for popover placement (220px, `dropdown-menu` surface, under the button, pinned top-right, grows left).
- [ ] **Step 2: Write failing tests:**
  - `minimized renders one aria-hidden dash per item, none focusable`
  - `active dash has data-active`; `dash level from item level`
  - `hover on dashes opens the popover after the open delay` (fake timers, `pointerType: 'mouse'`)
  - `pointer leaving dashes and popover closes it`
  - `tap on dashes toggles the popover` (`pointerType: 'touch'`), `tap outside closes`, `Escape closes`
  - `popover shows the same items as rows, no header`
  - `item click in popover closes it` (and `onValueChange` called once)
  - `toggle from minimized back to full keeps aria-current on the same item`
  - testid: `toc--dashes`, `toc--popover`.
- [ ] **Step 3: Run** → FAIL.
- [ ] **Step 4: Implement.** Controlled popover `open` state in `TableOfContentsMinimized`; mouse: `pointerenter`/`pointerleave` on dashes + content with open ~100ms / close ~300ms timers (cleared in effect cleanup); touch/pen: `click` toggles. Dashes copy renders `children` under a provider with `mode: 'dash'`; popover copy with `mode: 'row'` + `onItemSelect` closing it.
- [ ] **Step 5: Run** → PASS; lint + typecheck clean.
- [ ] **Step 6: Commit** `feat(table-of-contents): add minimized view with popover (WDS-210)`.

### Task 5: Stories, docs, Code Connect, E2E

**Files:**
- Create: `src/components/TableOfContents/{TableOfContents.stories.tsx, TableOfContents.e2e.ts, TableOfContents.figma.ts, TableOfContentsItem.figma.ts}`

**Interfaces:**
- Consumes: Tasks 1–4 public API.

- [ ] **Step 1: Stories** (category per `docs/adding-components.md`, `satisfies Meta<typeof TableOfContents>`, every story has `data-testid`): `Basic`, `Numbered`, `Levels`, `Minimized`, `Long Labels`, `Long List` (fixed-height parent), `With Scroll Spy` (scrollable container element via callback-ref state → `useScrollSpy({ root })` → `TableOfContents`), `With Segmented Tabs` (same hook driving `SegmentedTabs`). Named handlers, no wrappers.
- [ ] **Step 2: Overview** — run `/storybook-docs` for TableOfContents.
- [ ] **Step 3: Code Connect** `TableOfContents.figma.ts` → `toc-progress` (`13000:7596` set), `TableOfContentsItem.figma.ts` → `toc-item` (`12994:5965` set), modelled on `src/components/Stepper/StepperItem.figma.ts`. `pnpm exec tsc -p tsconfig.figma.json --noEmit` clean.
- [ ] **Step 4: E2E** per `docs/e2e-test-rules.md`: Screenshot (Full, Numbered, Levels, Minimized, popover open, Long Labels, focus ring), Interaction (click → `aria-current` moves; toggle keeps active; hover opens popover; With Scroll Spy: clicking an item scrolls and activates it), Accessibility (axe on Full and Minimized). Do NOT run locally; `pnpm exec tsc -p tsconfig.e2e.json --noEmit` clean.
- [ ] **Step 5: Commit** `feat(table-of-contents): add stories, docs, code connect and e2e (WDS-210)`.

### Task 6: Final verification

- [ ] Run in parallel: `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm compiler:audit` — all clean (no new bailouts in `TableOfContents/` or `useScrollSpy`).
- [ ] Commit any fixes.
