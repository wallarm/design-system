# E2E Test Rules

These rules apply when writing or modifying any E2E test file (`*.e2e.ts`) in this project. All E2E tests use Playwright with `allure-playwright` reporter and follow a strict naming and annotation convention for Allure TestOps integration.

## File & Directory Conventions

- Test files use the pattern `*.e2e.ts` and are colocated with the component source code
- Every test file must import `allure` from `allure-playwright`:
  ```ts
  import { allure } from 'allure-playwright';
  ```
- Every test file must import `test` and `expect` from `@playwright/test`
- Storybook component tests use `createStoryHelper` from `@wallarm-org/playwright-config/storybook`

## Allure Hierarchy

The Allure hierarchy maps directly to Storybook categories:

| Allure Level | Maps To                  | Example                |
| ------------ | ------------------------ | ---------------------- |
| **Epic**     | Storybook top-level category | `Messaging`, `Data Display`, `Inputs` |
| **Feature**  | Component name           | `Alert`, `Toast`, `CodeSnippet` |
| **Story**    | Test scenario group      | `Visual`, `Interactions`, `Accessibility` |

### Storybook Category to Epic Mapping

| Storybook Category   | Allure Epic        |
| -------------------- | ------------------ |
| Actions              | Actions            |
| Data Display         | Data Display       |
| Inputs               | Inputs             |
| Layout               | Layout             |
| Loading              | Loading            |
| Messaging            | Messaging          |
| Navigation           | Navigation         |
| Overlay              | Overlay            |
| Primitives           | Primitives         |
| Status Indication    | Status Indication  |
| Typography           | Typography         |
| *(playground app)*   | Application        |

## Test Naming Rules

### `test.describe` Structure

- **Level 1** (top-level suite): `"Component: {ComponentName}"`
  - Example: `"Component: Alert"`, `"Component: CodeSnippet"`
- **Level 2** (scenario group): One of `"Visual"`, `"Interactions"`, or `"Accessibility"`
  - Visual = screenshot/appearance tests
  - Interactions = user action tests (click, type, toggle)
  - Accessibility = keyboard navigation, screen reader, focus management

### `test()` Title Format

- Starts with **"Should"** followed by a human-readable sentence
- Uses sentence-case (not PascalCase, not kebab-case)
- Describes the expected behavior, not implementation details

### Allure Tags in Test Titles

Append inline Allure labels at the end of the test title when needed:

```ts
test('Should render all color variants @allure.label.severity:critical @allure.label.tag:smoke', ...)
```

Available severity levels: `critical`, `normal`, `minor`, `trivial`
Available tags: `smoke`, `regression`, `visual`, `a11y`

## Allure Metadata Pattern

Every test must include Allure metadata calls at the start of the test body:

```ts
test('Should render default state correctly', async ({ page }) => {
  await allure.epic('Messaging');
  await allure.feature('Alert');
  await allure.story('Visual');
  await allure.severity('normal');
  await allure.tags('visual', 'regression');

  // ... test body
});
```

**Required calls:**
- `allure.epic()` - Always matches the Storybook top-level category
- `allure.feature()` - Always matches the component name
- `allure.story()` - Always matches the describe level 2 group name
- `allure.severity()` - One of: `critical`, `normal`, `minor`, `trivial`

**Optional calls:**
- `allure.tags()` - For filtering: `smoke`, `regression`, `visual`, `a11y`

## Screenshot Test Naming (Visual Group)

- Group under `test.describe('Visual', ...)`
- Title format: `"Should render {variant/state} correctly"`
- Examples:
  - `"Should render all color variants correctly"`
  - `"Should render with title only correctly"`
  - `"Should render close button correctly"`

## Interaction Test Naming (Interactions Group)

- Group under `test.describe('Interactions', ...)`
- Title format: `"Should {action} when {trigger}"`
- Examples:
  - `"Should close alert when close button is clicked"`
  - `"Should copy code when copy button is clicked"`
  - `"Should toggle line wrapping when wrap button is clicked"`

## Accessibility Test Naming (Accessibility Group)

- Group under `test.describe('Accessibility', ...)`
- Title format: `"Should be {accessible behavior} via {method}"`
- Examples:
  - `"Should be dismissible via keyboard Enter key"`
  - `"Should be focusable via Tab key"`

## Severity Guidelines

| Severity     | Use When                                              |
| ------------ | ----------------------------------------------------- |
| `critical`   | Core functionality, rendering of primary variants     |
| `normal`     | Standard features, secondary variants                 |
| `minor`      | Edge cases, optional features, cosmetic details       |
| `trivial`    | Rarely used variants, supplementary visual states     |

## Full Example

```ts
import { expect, type Page, test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const alertStory = createStoryHelper('messaging-alert', [
  'All Colors',
  'Title Only',
  'With Close Button',
] as const);

const getAlerts = (page: Page) => page.getByRole('alert');
const getAlertByColor = (page: Page, color: string) =>
  page.getByRole('alert').and(page.locator(`[data-color="${color}"]`));

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
  });

  test.describe('Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await alertStory.goto(page, 'With Close Button');
    });

    test('Should close alert when close button is clicked', async ({ page }) => {
      await allure.epic('Messaging');
      await allure.feature('Alert');
      await allure.story('Interactions');
      await allure.severity('critical');
      await allure.tags('regression');

      const alerts = getAlerts(page);
      await expect(alerts).toHaveCount(2);

      const infoAlert = getAlertByColor(page, 'info');
      await infoAlert.getByRole('button', { name: 'close' }).click();

      await expect(alerts).toHaveCount(1);
      await expect(infoAlert).toBeHidden();
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
      const infoAlert = getAlertByColor(page, 'info');
      const closeButton = infoAlert.getByRole('button', { name: 'close' });
      await closeButton.focus();
      await expect(closeButton).toBeFocused();

      await page.keyboard.press('Enter');
      await expect(infoAlert).toBeHidden();
    });
  });
});
```
