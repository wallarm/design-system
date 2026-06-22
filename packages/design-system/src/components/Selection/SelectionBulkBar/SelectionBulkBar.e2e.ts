import { expect, type Locator, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const bulkBarStory = createStoryHelper('data-display-selection', [
  'Default',
  'Bulk Actions',
  'Compound Bulk Bar',
] as const);

// `role="checkbox"` lives on ark-ui's hidden input; the label is the click target.
const getCheckboxes = (page: Page) => page.locator('[data-slot="selection-item"]').locator('label');
const getBulkBarBySlot = (page: Page) => page.locator('[data-slot="selection-bulk-bar"]');
const getBulkBar = (page: Page) => page.getByTestId('selection-bulk-bar');
const getCount = (page: Page) => page.getByTestId('bulk-count');
const getSelectAll = (page: Page) => page.getByTestId('bulk-select-all');
const getClear = (page: Page) => page.getByTestId('bulk-clear');
const getDelete = (page: Page) => page.getByTestId('bulk-delete');

// Bar slides + fades in on mount. `data-state="open"` is set once the
// ArkUiPresence animation pair completes; that is the safe screenshot moment.
const waitForBarStable = async (bar: Locator) => {
  await expect(bar).toBeVisible();
  await expect(bar).toHaveAttribute('data-state', 'open');
};

test.describe('Component: SelectionBulkBar', () => {
  // Baselines live next to this file under `*-snapshots/`. Reference
  // visuals are taken from the deployed Storybook
  // (https://wallarm.github.io/design-system/) — generate by running the
  // Docker e2e with `STORYBOOK_URL=https://wallarm.github.io/design-system`
  // and `--update`.
  test.describe('Visual', () => {
    test('Should render Default correctly', async ({ page }) => {
      await bulkBarStory.goto(page, 'Default');
      await getCheckboxes(page).first().click();
      const bar = getBulkBarBySlot(page);
      await waitForBarStable(bar);
      await expect(bar).toHaveScreenshot('default.png');
    });

    test('Should render Bulk Actions correctly', async ({ page }) => {
      await bulkBarStory.goto(page, 'Bulk Actions');
      await getCheckboxes(page).first().click();
      const bar = getBulkBarBySlot(page);
      await waitForBarStable(bar);
      await expect(bar).toHaveScreenshot('bulk-actions.png');
    });

    test('Should render Compound Bulk Bar correctly', async ({ page, baseURL }) => {
      // CompoundBulkBar is a local-only story until the next deploy.
      test.skip(
        baseURL?.includes('wallarm.github.io') ?? false,
        'CompoundBulkBar story not yet deployed to production Storybook',
      );
      await bulkBarStory.goto(page, 'Compound Bulk Bar');
      await getCheckboxes(page).first().click();
      const bar = getBulkBar(page);
      await waitForBarStable(bar);
      await expect(bar).toHaveScreenshot('compound.png');
    });
  });

  test.describe('Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await bulkBarStory.goto(page, 'Compound Bulk Bar');
    });

    test('Should remain hidden until at least one item is selected', async ({ page }) => {
      await expect(getBulkBar(page)).toBeHidden();

      await getCheckboxes(page).first().click();

      await expect(getBulkBar(page)).toBeVisible();
    });

    test('Should reflect the selected count in the consumer-wired summary', async ({ page }) => {
      await getCheckboxes(page).first().click();
      await expect(getCount(page)).toHaveText('1 selected');

      await getCheckboxes(page).nth(1).click();
      await expect(getCount(page)).toHaveText('2 selected');
    });

    test('Should select every enabled item when Select all is clicked', async ({ page }) => {
      await getCheckboxes(page).first().click();
      await getSelectAll(page).click();

      const checkboxes = getCheckboxes(page);
      const total = await checkboxes.count();
      for (let i = 0; i < total; i++) {
        await expect(checkboxes.nth(i)).toHaveAttribute('data-state', 'checked');
      }
      await expect(getCount(page)).toHaveText(`${total} selected`);
    });

    test('Should disable Select all once everything is selected', async ({ page }) => {
      await getCheckboxes(page).first().click();
      await getSelectAll(page).click();

      await expect(getSelectAll(page)).toBeDisabled();
    });

    test('Should clear selection and hide the bar when Clear is clicked', async ({ page }) => {
      await getCheckboxes(page).first().click();
      await getCheckboxes(page).nth(1).click();
      await expect(getCount(page)).toHaveText('2 selected');

      await getClear(page).click();

      await expect(getBulkBar(page)).toBeHidden();
      const checkboxes = getCheckboxes(page);
      const total = await checkboxes.count();
      for (let i = 0; i < total; i++) {
        await expect(checkboxes.nth(i)).toHaveAttribute('data-state', 'unchecked');
      }
    });

    test('Should fire the consumer action button when clicked', async ({ page }) => {
      await getCheckboxes(page).first().click();
      // Wait for the bar's enter animation to settle before clicking the action.
      await expect(getBulkBar(page)).toHaveAttribute('data-state', 'open');

      const messages: string[] = [];
      page.on('dialog', async d => {
        messages.push(d.message());
        await d.accept();
      });

      await getDelete(page).click();
      await expect.poll(() => messages).toEqual(['Delete 1']);
    });

    test('Should hoist the consumer summary into the summary slot, not the actions row', async ({
      page,
    }) => {
      await getCheckboxes(page).first().click();

      const summary = getBulkBar(page).locator('[data-slot="bulk-bar-summary"]');
      await expect(summary).toBeVisible();
      await expect(summary).toContainText('Select all');
      await expect(summary).toContainText('Clear');
      // Action button must live outside the summary.
      await expect(summary.getByTestId('bulk-delete')).toHaveCount(0);
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await bulkBarStory.goto(page, 'Compound Bulk Bar');
      await getCheckboxes(page).first().click();
    });

    test('Should expose the toolbar role with a default accessible name', async ({ page }) => {
      await expect(page.getByRole('toolbar', { name: 'Bulk actions' })).toBeVisible();
    });

    test('Should land data-analytics-id on the real button elements', async ({ page }) => {
      const selectAll = getSelectAll(page);
      await expect(selectAll).toHaveJSProperty('tagName', 'BUTTON');
      await expect(selectAll).toHaveAttribute('data-analytics-id', 'BULK_SELECT_ALL');

      await expect(getClear(page)).toHaveAttribute('data-analytics-id', 'BULK_CLEAR');
      await expect(getDelete(page)).toHaveAttribute('data-analytics-id', 'BULK_DELETE');
    });

    test('Should activate Select all via keyboard Enter', async ({ page }) => {
      const selectAll = getSelectAll(page);
      await selectAll.focus();
      await page.keyboard.press('Enter');

      const checkboxes = getCheckboxes(page);
      const total = await checkboxes.count();
      for (let i = 0; i < total; i++) {
        await expect(checkboxes.nth(i)).toHaveAttribute('data-state', 'checked');
      }
    });

    test('Should activate Clear via keyboard Space', async ({ page }) => {
      const clear = getClear(page);
      await clear.focus();
      await page.keyboard.press('Space');

      await expect(getBulkBar(page)).toBeHidden();
    });
  });
});
