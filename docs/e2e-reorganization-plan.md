# E2E Test Reorganization Plan for Allure TestOps

This document describes the concrete steps to rename and restructure existing E2E tests to follow the rules defined in [`docs/e2e-test-rules.md`](./e2e-test-rules.md).

## Current State Analysis

| Metric                  | Value |
| ----------------------- | ----- |
| Test files              | 4     |
| Total test cases        | 60    |
| Allure annotations      | 0     |
| Naming convention       | Mixed (PascalCase screenshots, sentence-case interactions) |
| Severity classification | None  |
| Tag classification      | None  |

### Issues Found

1. **No Allure annotations** - No `allure.epic/feature/story/severity/tags` calls anywhere
2. **No `allure-playwright` import** - Missing from all test files
3. **Inconsistent naming** - CodeSnippet screenshots use PascalCase (`WithLineNumbers`, `LineAnnotations`), Alert/Toast use sentence-case (`All color variants`, `Success toast`)
4. **No "Should" prefix** - No test titles follow the "Should..." convention
5. **No scenario group standardization** - Varying group names: `View`, `Screenshots`, `Close Button`, `View - All Types`
6. **No severity or tag classification** - No tests have severity or tag metadata

## Storybook Category to Epic Mapping

| Storybook Category | Allure Epic   | Components Covered         |
| ------------------ | ------------- | -------------------------- |
| Messaging          | Messaging     | Alert, Toast               |
| Data Display       | Data Display  | CodeSnippet, InlineCodeSnippet |
| *(playground app)* | Application   | App                        |

## File-by-File Rename Plan

---

### 1. `packages/design-system/src/components/Alert/Alert.e2e.ts`

**Epic:** Messaging | **Feature:** Alert | **Tests:** 13

#### Describe Block Renames

| Current                     | New                          |
| --------------------------- | ---------------------------- |
| `Alert Component`           | `Component: Alert`           |
| `View`                      | `Visual`                     |
| `Close Button`              | *(split across Visual, Interactions, Accessibility)* |
| `With Controls`             | *(split across Visual, Interactions)* |
| `With Bottom Actions`       | *(split across Visual, Interactions)* |

#### Test Renames

**Visual group:**

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `All color variants` | `Should render all color variants correctly` | critical | visual, smoke |
| `With title only` | `Should render with title only correctly` | normal | visual, regression |
| `Min Max width` | `Should render min and max width correctly` | normal | visual, regression |
| `Max lines` | `Should render max lines correctly` | normal | visual, regression |
| `With code` | `Should render with code correctly` | normal | visual, regression |
| `Close button - view` | `Should render close button correctly` | normal | visual, regression |
| `With controls - view` | `Should render with controls correctly` | normal | visual, regression |
| `With bottom actions - view` | `Should render with bottom actions correctly` | normal | visual, regression |

**Interactions group:**

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Close button - clicked` | `Should close alert when close button is clicked` | critical | regression |
| `With controls - clickable buttons` | `Should activate control when Learn more button is clicked` | normal | regression |
| `With controls - both controls and close button` | `Should display both control and close buttons` | normal | regression |
| `With bottom actions - clickable buttons` | `Should activate action when primary action button is clicked` | normal | regression |

**Accessibility group:**

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Close button - keyboard accessible` | `Should be dismissible via keyboard Enter key` | critical | a11y, regression |

#### Before/After Code

<details>
<summary>Click to expand Alert before/after</summary>

**Before:**
```ts
import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

test.describe('Alert Component', () => {
  test.describe('View', () => {
    test('All color variants', async ({ page }) => {
      await alertStory.goto(page, 'All Colors');
      await expect(page).toHaveScreenshot();
    });
    // ...
  });
  test.describe('Close Button', () => {
    test('Close button - clicked', async ({ page }) => { /* ... */ });
    test('Close button - keyboard accessible', async ({ page }) => { /* ... */ });
  });
});
```

**After:**
```ts
import { expect, type Page, test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

test.describe('Component: Alert', () => {
  test.describe('Visual', () => {
    test('Should render all color variants correctly', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Visual');
      await allure.severity('critical');
      await allure.tags('visual', 'smoke');

      await alertStory.goto(page, 'All Colors');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with title only correctly', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Visual');
      await allure.severity('normal');
      await allure.tags('visual', 'regression');

      await alertStory.goto(page, 'Title Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render min and max width correctly', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Visual');
      await allure.severity('normal');
      await allure.tags('visual', 'regression');

      await alertStory.goto(page, 'Min Max Width');
      await expect(page).toHaveScreenshot();
    });

    test('Should render max lines correctly', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Visual');
      await allure.severity('normal');
      await allure.tags('visual', 'regression');

      await alertStory.goto(page, 'Max Lines');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with code correctly', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Visual');
      await allure.severity('normal');
      await allure.tags('visual', 'regression');

      await alertStory.goto(page, 'With Code');
      await expect(page).toHaveScreenshot();
    });

    test('Should render close button correctly', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Visual');
      await allure.severity('normal');
      await allure.tags('visual', 'regression');

      await alertStory.goto(page, 'With Close Button');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with controls correctly', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Visual');
      await allure.severity('normal');
      await allure.tags('visual', 'regression');

      await alertStory.goto(page, 'With Controls');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with bottom actions correctly', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Visual');
      await allure.severity('normal');
      await allure.tags('visual', 'regression');

      await alertStory.goto(page, 'With Bottom Actions');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should close alert when close button is clicked', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Interactions');
      await allure.severity('critical');
      await allure.tags('regression');

      await alertStory.goto(page, 'With Close Button');
      const alerts = getAlerts(page);
      await expect(alerts).toHaveCount(2);

      const infoAlert = getAlertByColor(page, 'info');
      await infoAlert.getByRole('button', { name: 'close' }).click();

      await expect(alerts).toHaveCount(1);
      await expect(infoAlert).toBeHidden();
      await expect(getAlertByColor(page, 'warning')).toBeVisible();
    });

    test('Should activate control when Learn more button is clicked', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Interactions');
      await allure.severity('normal');
      await allure.tags('regression');

      await alertStory.goto(page, 'With Controls');
      // ... test body unchanged
    });

    test('Should display both control and close buttons', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Interactions');
      await allure.severity('normal');
      await allure.tags('regression');

      await alertStory.goto(page, 'With Controls');
      // ... test body unchanged
    });

    test('Should activate action when primary action button is clicked', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Interactions');
      await allure.severity('normal');
      await allure.tags('regression');

      await alertStory.goto(page, 'With Bottom Actions');
      // ... test body unchanged
    });
  });

  test.describe('Accessibility', () => {
    test('Should be dismissible via keyboard Enter key', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Accessibility');
      await allure.severity('critical');
      await allure.tags('a11y', 'regression');

      await alertStory.goto(page, 'With Close Button');
      // ... test body unchanged
    });
  });
});
```

</details>

**Structural change:** The current file groups tests by feature (Close Button, With Controls, With Bottom Actions) with mixed visual/interaction/accessibility tests in each group. The new structure groups by test type (Visual, Interactions, Accessibility), with `beforeEach` hooks removed in favor of explicit `goto` calls in each test. This is necessary to flatten the hierarchy into the 3-group standard.

---

### 2. `packages/design-system/src/components/CodeSnippet/CodeSnippet.e2e.ts`

**Epic:** Data Display | **Features:** CodeSnippet, InlineCodeSnippet | **Tests:** 29

#### Describe Block Renames — CodeSnippet

| Current            | New                            |
| ------------------ | ------------------------------ |
| `CodeSnippet`      | `Component: CodeSnippet`       |
| `Screenshots`      | `Visual`                       |
| `Interactions`     | `Interactions` *(unchanged)*   |

#### Test Renames — CodeSnippet Visual

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Default` | `Should render default state correctly` | critical | visual, smoke |
| `WithLineNumbers` | `Should render with line numbers correctly` | normal | visual, regression |
| `Sizes` | `Should render all sizes correctly` | normal | visual, regression |
| `LineAnnotations` | `Should render line annotations correctly` | normal | visual, regression |
| `LineColors` | `Should render line colors correctly` | normal | visual, regression |
| `LineRanges` | `Should render line ranges correctly` | normal | visual, regression |
| `TextStyles` | `Should render text styles correctly` | normal | visual, regression |
| `LineWithPrefix` | `Should render line with prefix correctly` | normal | visual, regression |
| `LineWrapping` | `Should render line wrapping correctly` | normal | visual, regression |
| `WithBothScrolls` | `Should render with both scrolls correctly` | normal | visual, regression |
| `CustomStartingLine` | `Should render custom starting line correctly` | minor | visual, regression |
| `JSONWithShiki` | `Should render JSON with Shiki highlighting correctly` | normal | visual, regression |
| `TypescriptWithPrism` | `Should render TypeScript with Prism highlighting correctly` | normal | visual, regression |
| `BashWithPrism` | `Should render Bash with Prism highlighting correctly` | normal | visual, regression |
| `HTMLWithHighlightJs` | `Should render HTML with Highlight.js highlighting correctly` | normal | visual, regression |
| `WithHeader` | `Should render with header correctly` | normal | visual, regression |
| `WithTabsAndActions` | `Should render with tabs and actions correctly` | normal | visual, regression |
| `WithFloatingActions` | `Should render with floating actions correctly` | normal | visual, regression |
| `ShowMore` | `Should render show more state correctly` | normal | visual, regression |

#### Test Renames — CodeSnippet Interactions

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Copy button - copies code and shows tooltip` | `Should copy code and show tooltip when copy button is clicked` | critical | regression, smoke |
| `Wrap button - toggles line wrapping` | `Should toggle line wrapping when wrap button is clicked` | normal | regression |
| `Fullscreen button - enters and exits fullscreen` | `Should enter and exit fullscreen when fullscreen button is clicked` | normal | regression |
| `Show more/less - expands and collapses` | `Should expand and collapse when show more/less is clicked` | normal | regression |
| `Tab switching - changes displayed code` | `Should change displayed code when tab is switched` | normal | regression |

#### Describe Block Renames — InlineCodeSnippet

| Current              | New                                  |
| -------------------- | ------------------------------------ |
| `InlineCodeSnippet`  | `Component: InlineCodeSnippet`       |
| `Screenshots`        | `Visual`                             |
| `Interactions`       | `Interactions` *(unchanged)*         |

#### Test Renames — InlineCodeSnippet Visual

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Default` | `Should render default state correctly` | critical | visual, smoke |
| `Sizes` | `Should render all sizes correctly` | normal | visual, regression |
| `NonCopyable` | `Should render non-copyable variant correctly` | normal | visual, regression |
| `VariousContent` | `Should render various content correctly` | normal | visual, regression |

#### Test Renames — InlineCodeSnippet Interactions

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Click copies when copyable, no copy when non-copyable` | `Should copy text when clicked on copyable and not copy when non-copyable` | critical | regression, smoke |

---

### 3. `packages/design-system/src/components/Toast/Toast.e2e.ts`

**Epic:** Messaging | **Feature:** Toast | **Tests:** 17

#### Describe Block Renames

| Current                         | New                          |
| ------------------------------- | ---------------------------- |
| `Toast Component`               | `Component: Toast`           |
| `View - All Types`              | `Visual`                     |
| `Update Toast`                  | *(merged into Interactions)* |
| `Simple With Actions`           | *(merged into Visual + Interactions)* |
| `Extended Variant With Actions` | *(merged into Visual + Interactions)* |
| `Long Text`                     | *(merged into Visual)*       |
| `Custom Icon`                   | *(merged into Visual)*       |
| `Close Button`                  | *(split into Interactions + Accessibility)* |

#### Test Renames — Visual

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Success toast` | `Should render success toast correctly` | critical | visual, smoke |
| `Error toast` | `Should render error toast correctly` | critical | visual, smoke |
| `Warning toast` | `Should render warning toast correctly` | normal | visual, regression |
| `Info toast` | `Should render info toast correctly` | normal | visual, regression |
| `Loading toast` | `Should render loading toast correctly` | normal | visual, regression |
| `Default toast` | `Should render default toast correctly` | normal | visual, regression |
| `Simple toast with actions - single` | `Should render simple toast with single action correctly` | normal | visual, regression |
| `Simple toast with actions - double` | `Should render simple toast with double actions correctly` | normal | visual, regression |
| `Extended toast with actions - single` | `Should render extended toast with single action correctly` | normal | visual, regression |
| `Extended toast with actions - double` | `Should render extended toast with double actions correctly` | normal | visual, regression |
| `Long text - simple toast` | `Should render simple toast with long text correctly` | minor | visual, regression |
| `Long text - extended toast` | `Should render extended toast with long text correctly` | minor | visual, regression |
| `Custom icon - own color` | `Should render custom icon with own color correctly` | minor | visual, regression |
| `Custom icon - without color` | `Should render custom icon without color correctly` | minor | visual, regression |
| `Non-closable toast - no close button visible` | `Should render non-closable toast without close button` | normal | visual, regression |

#### Test Renames — Interactions

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Update toast - loading to success` | `Should update toast from loading to success` | normal | regression |

#### Test Renames — Accessibility

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `Close button - keyboard accessible` | `Should be dismissible via keyboard Enter key` | critical | a11y, regression |

**Note on Toast tests:** Many Toast "view" tests include interactions (clicking buttons to trigger toasts, then verifying with screenshots). These remain in the Visual group because the primary assertion is `toHaveScreenshot()`. The toast triggering is setup, not the assertion under test.

---

### 4. `apps/playground/tests/e2e/app.e2e.ts`

**Epic:** Application | **Feature:** App | **Tests:** 1

#### Describe Block Renames

| Current          | New               |
| ---------------- | ----------------- |
| `App E2E Tests`  | `Component: App`  |

#### Test Renames

| Current | New | Severity | Tags |
| ------- | --- | -------- | ---- |
| `should load homepage` | `Should load homepage successfully` | critical | smoke |

#### Before/After Code

**Before:**
```ts
import { expect, test } from '@playwright/test';

test.describe('App E2E Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(true).toBeTruthy();
  });
});
```

**After:**
```ts
import { expect, test } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('Component: App', () => {
  test('Should load homepage successfully', async ({ page }) => {
    await allure.epic('Application');
    await allure.feature('App');
    await allure.story('Visual');
    await allure.severity('critical');
    await allure.tags('smoke');

    await page.goto('/');
    await expect(true).toBeTruthy();
  });
});
```

---

## Migration Steps

### Step 1: Add `allure-playwright` import

Add to all 4 test files:
```ts
import { allure } from 'allure-playwright';
```

### Step 2: Rename top-level describe blocks

| File | Current | New |
| ---- | ------- | --- |
| Alert.e2e.ts | `Alert Component` | `Component: Alert` |
| CodeSnippet.e2e.ts | `CodeSnippet` | `Component: CodeSnippet` |
| CodeSnippet.e2e.ts | `InlineCodeSnippet` | `Component: InlineCodeSnippet` |
| Toast.e2e.ts | `Toast Component` | `Component: Toast` |
| app.e2e.ts | `App E2E Tests` | `Component: App` |

### Step 3: Restructure scenario group describes

Flatten the current per-feature grouping into the standardized 3-group hierarchy:
- `Visual` — all screenshot/appearance tests
- `Interactions` — all user action tests
- `Accessibility` — all keyboard/screen reader tests

This requires moving tests from current feature-based groups (e.g., `Close Button`, `With Controls`) into the appropriate scenario group.

### Step 4: Rename test titles to "Should..." format

Apply the naming conventions from the tables above. Key patterns:
- Screenshot tests: `"Should render {description} correctly"`
- Interaction tests: `"Should {action} when {trigger}"`
- Accessibility tests: `"Should be {behavior} via {method}"`

### Step 5: Add Allure metadata to every test

Add the 4 required calls at the start of each test body:
```ts
await allure.epic('...');
await allure.feature('...');
await allure.story('...');
await allure.severity('...');
await allure.tags('...');
```

### Step 6: Remove `beforeEach` hooks where structure changes

Tests in Alert.e2e.ts currently use `beforeEach` for story navigation within feature-based groups. When restructuring to Visual/Interactions/Accessibility groups, move the `goto` call into each individual test since tests in the same group now navigate to different stories.

### Step 7: Add clipboard mocking for copy interaction tests

CodeSnippet and InlineCodeSnippet copy tests require clipboard API mocking **before navigation** for headless/Docker environments:

```ts
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: () => Promise.resolve() },
    writable: true,
    configurable: true,
  });
});
await componentStory.goto(page, 'Story Name');
```

This applies to:
- CodeSnippet: `Should copy code and show tooltip when copy button is clicked`
- InlineCodeSnippet: `Should copy text when clicked on copyable and not copy when non-copyable`

### Step 8: Ensure syntax highlighting readiness for CodeSnippet screenshots

CodeSnippet uses async syntax highlighters (Shiki, Prism, Highlight.js). Before taking screenshots, wait for highlight tokens to appear in the DOM to avoid capturing un-highlighted code. This is especially important for tests like `Should render JSON with Shiki highlighting correctly` and other language-specific visual tests.

### Step 9: Update screenshot file references

Renaming `test.describe` and `test()` titles will change the generated snapshot paths. The current snapshot path template is:
```
{testDir}/{testFileDir}/{testFileName}-snapshots/{testName}-{projectName}{ext}
```

Since `{testName}` includes the full describe chain + test title, **all existing screenshots will be invalidated**.

### Step 10: Regenerate screenshots

After all renames are complete, create a commit with `[update-screenshots]` in the message to trigger CI/CD screenshot regeneration:
```
refactor: reorganize E2E tests for Allure TestOps [update-screenshots]
```

## CI/CD Considerations

Tests that pass locally may fail in CI due to different configurations:

| Setting            | Local              | Docker (CI)           |
| ------------------ | ------------------ | --------------------- |
| Test timeout       | 30s                | 60s                   |
| Action timeout     | none               | 10s                   |
| Navigation timeout | none               | 30s                   |
| Retries            | 0                  | 2                     |
| Workers            | auto (CPU cores)   | 1                     |

Key implications for this migration:
- **Action timeout (10s in CI)**: Clipboard operations and toast animations must complete within 10s
- **Workers: 1 in CI**: Tests run sequentially, so total suite time increases — keep individual tests fast
- **Retries: 2 in CI**: Flaky tests may appear to pass locally but still cause intermittent CI failures

## Screenshot Path Impact

**All screenshot assertions will need new baseline images.** This is expected and unavoidable when renaming tests.

Current snapshot path example:
```
Alert.e2e.ts-snapshots/Alert-Component-View-All-color-variants-chromium.png
```

New snapshot path example:
```
Alert.e2e.ts-snapshots/Component-Alert-Visual-Should-render-all-color-variants-correctly-chromium.png
```

The `[update-screenshots]` commit trigger in CI/CD will automatically regenerate all baselines.

## Summary

| Metric | Before | After |
| ------ | ------ | ----- |
| Test files | 4 | 4 |
| Total test cases | 60 | 60 |
| Allure annotations | 0 | 60 (all tests) |
| Naming convention | Mixed | Consistent "Should..." |
| Describe hierarchy | Feature-based (mixed) | Visual/Interactions/Accessibility |
| Severity classification | None | All classified |
| Tag classification | None | All tagged |
| Allure epics | 0 | 3 (Messaging, Data Display, Application) |
| Allure features | 0 | 5 (Alert, CodeSnippet, InlineCodeSnippet, Toast, App) |
