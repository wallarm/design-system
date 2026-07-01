# HorizontalBar Header-only (no-data) Mode — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When `HorizontalBar` receives no label data (`data.length === 0`), render only the header (headline value + delta badge) with no bar track and no legend.

**Architecture:** Infer the mode from `data` — no new prop. Gate the existing `horizontal-bar-bar-wrapper` block on `data.length > 0`. The legend and `barAriaLabel` are already segment-driven, so they no-op naturally when data is empty. Repurpose the existing `Empty` story to the meaningful header-only state and regenerate its screenshot.

**Tech Stack:** React 19, TypeScript, Tailwind, Vitest + Testing Library (unit), Playwright (E2E), Storybook.

## Global Constraints

- Component rules: `data-slot` on root, `cn()` for classes, no `any`, no inline styles for colors (existing inline `backgroundColor` for chart fills is pre-existing and untouched), `displayName` set, named exports. (from `.claude/rules/component-development.md`)
- Run all commands from the repo root `/Users/sergei/code/wallarm/design-system` unless noted.
- Unit test command: `pnpm --filter @wallarm-org/design-system test -- HorizontalBar` (Vitest, run from repo root).
- Do NOT hand-edit snapshot PNGs — regenerate them with Playwright.
- After changing chart behaviour, update the chart's doc in the same change (SimpleCharts CLAUDE.md rule).

---

### Task 1: Header-only rendering + unit tests

**Files:**
- Modify: `packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.tsx`
- Modify: `packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.test.tsx`

**Interfaces:**
- Consumes: existing `HorizontalBarProps` (`data`, `value`, `delta`, `total`, `legend`). No signature change.
- Produces: no new exported symbol. Behavioural contract — when `data.length === 0`, `[data-slot="horizontal-bar-bar-wrapper"]` and `[data-slot="horizontal-bar-bar"]` are absent from the DOM; the header renders iff `value` or `delta` is present.

- [ ] **Step 1: Update the failing/obsolete empty-data unit test**

In `HorizontalBar.test.tsx`, replace the test at (currently) lines 144–148:

```tsx
  it('omits aria-label entirely (not empty string) when there are no non-remainder segments', () => {
    render(<HorizontalBar data={[]} legend={false} />);
    const bar = document.querySelector('[data-slot="horizontal-bar-bar"]') as HTMLElement;
    expect(bar).not.toHaveAttribute('aria-label');
  });
```

with:

```tsx
  it('renders no bar at all when data is empty (even with legend={false})', () => {
    render(<HorizontalBar data={[]} legend={false} />);
    expect(document.querySelector('[data-slot="horizontal-bar-bar-wrapper"]')).toBeNull();
    expect(document.querySelector('[data-slot="horizontal-bar-bar"]')).toBeNull();
  });
```

- [ ] **Step 2: Add a header-only test**

Add this test to the `HorizontalBar — bar rendering` describe block in `HorizontalBar.test.tsx`:

```tsx
  it('renders header-only (no bar, no legend) when data is empty but value/delta are present', () => {
    render(<HorizontalBar data={[]} value={91} delta={{ value: 10, trend: 'up' }} />);
    expect(document.querySelector('[data-slot="horizontal-bar-bar-wrapper"]')).toBeNull();
    expect(document.querySelector('[data-slot="horizontal-bar-legend"]')).toBeNull();
    expect(document.querySelector('[data-slot="horizontal-bar-value"]')).toHaveTextContent('91');
    expect(screen.getByLabelText('up 10')).toBeInTheDocument();
  });
```

- [ ] **Step 3: Run the tests to verify the new empty-data expectations fail**

Run: `pnpm --filter @wallarm-org/design-system test -- HorizontalBar`
Expected: FAIL — the two tests above fail because the bar wrapper still renders when `data` is empty (`horizontal-bar-bar-wrapper` is found, so `toBeNull()` fails).

- [ ] **Step 4: Gate the bar wrapper on non-empty data**

In `HorizontalBar.tsx`, add a `hasBar` flag next to the other derived flags (near `const hasValue = ...`):

```tsx
  const hasBar = data.length > 0;
```

Then wrap the bar-wrapper block so it only renders when `hasBar`. Change:

```tsx
        <div data-slot='horizontal-bar-bar-wrapper' className={horizontalBarBarWrapperClasses}>
          <div
            data-slot='horizontal-bar-bar'
            data-testid={barTestId}
            aria-hidden={legend ? 'true' : undefined}
            aria-label={barAriaLabel}
            className={horizontalBarBarClasses}
          >
            {segments.map(seg => (
              <div
                key={seg.key}
                data-slot='horizontal-bar-segment'
                data-name={seg.isRemainder ? undefined : seg.key}
                data-remainder={seg.isRemainder ? 'true' : undefined}
                className={cn(horizontalBarSegmentClasses, seg.className)}
                style={{
                  flexGrow: seg.value,
                  flexBasis: 0,
                  backgroundColor: seg.isRemainder
                    ? 'var(--color-bg-strong-primary)'
                    : seg.className
                      ? undefined
                      : resolveChartColor(seg.color),
                }}
              />
            ))}
          </div>
        </div>
```

to:

```tsx
        {hasBar && (
          <div data-slot='horizontal-bar-bar-wrapper' className={horizontalBarBarWrapperClasses}>
            <div
              data-slot='horizontal-bar-bar'
              data-testid={barTestId}
              aria-hidden={legend ? 'true' : undefined}
              aria-label={barAriaLabel}
              className={horizontalBarBarClasses}
            >
              {segments.map(seg => (
                <div
                  key={seg.key}
                  data-slot='horizontal-bar-segment'
                  data-name={seg.isRemainder ? undefined : seg.key}
                  data-remainder={seg.isRemainder ? 'true' : undefined}
                  className={cn(horizontalBarSegmentClasses, seg.className)}
                  style={{
                    flexGrow: seg.value,
                    flexBasis: 0,
                    backgroundColor: seg.isRemainder
                      ? 'var(--color-bg-strong-primary)'
                      : seg.className
                        ? undefined
                        : resolveChartColor(seg.color),
                  }}
                />
              ))}
            </div>
          </div>
        )}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @wallarm-org/design-system test -- HorizontalBar`
Expected: PASS — all tests in the file pass, including the two new/updated empty-data tests.

- [ ] **Step 6: Commit**

```bash
git add packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.tsx \
        packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.test.tsx
git commit -m "feat(simple-charts): HorizontalBar renders header-only when data is empty"
```

---

### Task 2: Story, E2E snapshot, and docs

**Files:**
- Modify: `packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.stories.tsx`
- Modify: `packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.e2e.ts`
- Regenerate: `packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.e2e.ts-snapshots/HorizontalBar-Screenshots-Empty-chromium.png`
- Modify: `packages/design-system/src/components/SimpleCharts/docs/HorizontalBar.md`

**Interfaces:**
- Consumes: behaviour from Task 1 (empty data → header-only). Story id stays `data-display-simplecharts-horizontalbar--empty`.
- Produces: an `Empty` story that renders the header-only state (value + delta, no bar).

- [ ] **Step 1: Repurpose the `Empty` story to the header-only state**

In `HorizontalBar.stories.tsx`, replace:

```tsx
export const Empty: StoryFn<HorizontalBarProps> = Frame.bind({});
Empty.args = { data: [] };
```

with:

```tsx
export const Empty: StoryFn<HorizontalBarProps> = Frame.bind({});
Empty.args = { data: [], value: 91, delta: { value: 10, trend: 'up' } };
```

- [ ] **Step 2: Confirm the E2E `Empty` screenshot test needs no code change**

Open `HorizontalBar.e2e.ts`. The `Empty` screenshot test (`await story.goto(page, 'Empty'); await expect(page).toHaveScreenshot();`) and the story-id list already cover the `Empty` story. No code edit is needed here — only the snapshot image is regenerated in the next step. Verify by reading the file; make no change if the `Empty` entry is present in the `createStoryHelper([...])` array and the screenshot test exists.

- [ ] **Step 3: Regenerate the Empty screenshot**

The `Empty` story now renders header-only, so its baseline PNG is stale. Regenerate only that snapshot.

Run (from repo root):
```bash
pnpm --filter @wallarm-org/design-system exec playwright test HorizontalBar.e2e.ts -g "Empty" --update-snapshots
```
Expected: the test passes and `HorizontalBar-Screenshots-Empty-chromium.png` is rewritten. If the local run cannot reach a running Storybook, instead push the branch and let CI regenerate via a commit message containing `[update-screenshots]` (note this in the PR), then pull the updated snapshot.

- [ ] **Step 4: Verify the full E2E file still passes**

Run: `pnpm --filter @wallarm-org/design-system exec playwright test HorizontalBar.e2e.ts`
Expected: PASS — Default / With Remainder / Legend Off screenshots unchanged; Empty matches the new baseline; both accessibility tests (which use `Default` and `Legend Off`, not `Empty`) pass.

- [ ] **Step 5: Update the chart doc**

In `docs/HorizontalBar.md`, update the `Empty` row of the States table. Replace:

```markdown
| Empty | `data.length === 0` | Bar renders an empty rounded track; legend hidden. Prefer swapping in `<ChartEmpty />` for an explicit empty body. |
```

with:

```markdown
| Empty / no data | `data.length === 0` | Header-only: value + delta render, but the bar wrapper and legend are not rendered at all (no empty track). Holds even when `total` is set. If `value` and `delta` are also absent, nothing renders — prefer `<ChartEmpty />` for an explicit empty body. |
```

Then, in the `Edge cases & unclear states` section, replace the `Zero total` bullet:

```markdown
- **Zero total** (all values 0, no positive `total`): the bar renders an empty track; no console warnings.
```

with:

```markdown
- **No data** (`data.length === 0`): the bar wrapper is not rendered — only the header (value/delta) shows. A `total` with empty `data` still draws no bar (no labels → no bar).
- **Zero total with data present** (all values 0, no positive `total`): the bar renders an empty track; no console warnings.
```

- [ ] **Step 6: Commit**

```bash
git add packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.stories.tsx \
        packages/design-system/src/components/SimpleCharts/HorizontalBar/HorizontalBar.e2e.ts-snapshots/HorizontalBar-Screenshots-Empty-chromium.png \
        packages/design-system/src/components/SimpleCharts/docs/HorizontalBar.md
git commit -m "docs(simple-charts): HorizontalBar header-only story, snapshot, and doc"
```

---

### Task 3: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Lint + typecheck the package**

Run: `pnpm --filter @wallarm-org/design-system lint && pnpm --filter @wallarm-org/design-system typecheck`
Expected: zero errors.

- [ ] **Step 2: Run the HorizontalBar unit tests once more**

Run: `pnpm --filter @wallarm-org/design-system test -- HorizontalBar`
Expected: PASS.

- [ ] **Step 3: Confirm the target screenshot visually**

Open the story `/story/data-display-simplecharts-horizontalbar--empty` (or `--default` per the request — both now support empty data). Confirm it shows the `ChartTitle`, headline value, and delta chip with no bar/legend, matching the target design.
