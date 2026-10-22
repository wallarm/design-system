# E2E Test Rules

These rules apply when writing or modifying any E2E test file (`*.e2e.ts`) in this project. All E2E tests use Playwright and follow a strict naming convention.

## File & Directory Conventions

- Test files use the pattern `*.e2e.ts` and are colocated with the component source code
- Every test file must import `test` and `expect` from `@playwright/test`
- Storybook component tests use `createStoryHelper` from `@wallarm-org/playwright-config/storybook`

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

## Locators

- Locate elements by `data-testid` (`page.getByTestId(...)`); compound components cascade it to sub-components (`{base}--{slot}`) — see [`test-id-pattern.md`](./test-id-pattern.md)
- `getByRole` is fine for accessibility assertions (role, accessible name)
- Never use `data-slot` — it is a styling hook. Existing `[data-slot=…]` locators are legacy; migrate them when you touch the file

## Full Example

```ts
import { expect, type Page, test } from '@playwright/test';
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
      await alertStory.goto(page, 'All Colors');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with title only correctly', async ({ page }) => {
      await alertStory.goto(page, 'Title Only');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await alertStory.goto(page, 'With Close Button');
    });

    test('Should close alert when close button is clicked', async ({ page }) => {
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
