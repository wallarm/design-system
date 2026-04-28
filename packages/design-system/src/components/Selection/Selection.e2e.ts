import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const selectionStory = createStoryHelper('data-display-selection', [
  'Default',
  'With Select All',
  'Grid',
  'With Disabled',
  'Range Selection',
  'Bulk Actions',
  'Empty And Partial',
  'Without Bulk Bar',
] as const);

// `role="checkbox"` lives on ark-ui's hidden input; click targets the visible label.
const getCheckboxes = (page: Page) => page.locator('[data-slot="selection-item"]').locator('label');
const getSelectAll = (page: Page) => page.locator('[data-slot="selection-all"]');
const getBulkBar = (page: Page) => page.locator('[data-slot="selection-bulk-bar"]');

// Visual screenshot tests are added after baselines exist.
// Generate baselines by including [update-screenshots] in a commit on main.

test.describe('Component: Selection', () => {
  test.describe('Interactions', () => {
    test('Should toggle selection when checkbox is clicked', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      const checkboxes = getCheckboxes(page);
      await checkboxes.first().click();
      await expect(checkboxes.first()).toHaveAttribute('data-state', 'checked');

      await checkboxes.first().click();
      await expect(checkboxes.first()).toHaveAttribute('data-state', 'unchecked');
    });

    test('Should select all when SelectionAll is clicked', async ({ page }) => {
      await selectionStory.goto(page, 'With Select All');
      await getSelectAll(page).click();
      const checkboxes = getCheckboxes(page);
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toHaveAttribute('data-state', 'checked');
      }
    });

    test('Should clear selection via Clear link in bulk bar', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      await getCheckboxes(page).first().click();
      await getBulkBar(page).getByText('Clear', { exact: true }).click();
      await expect(getCheckboxes(page).first()).toHaveAttribute('data-state', 'unchecked');
      await expect(getBulkBar(page)).toBeHidden();
    });

    test('Should select range when shift-clicking', async ({ page }) => {
      await selectionStory.goto(page, 'Range Selection');
      const checkboxes = getCheckboxes(page);
      await checkboxes.nth(0).click();
      await checkboxes.nth(2).click({ modifiers: ['Shift'] });

      await expect(checkboxes.nth(0)).toHaveAttribute('data-state', 'checked');
      await expect(checkboxes.nth(1)).toHaveAttribute('data-state', 'checked');
      await expect(checkboxes.nth(2)).toHaveAttribute('data-state', 'checked');
    });

    test('Should not toggle disabled items', async ({ page }) => {
      await selectionStory.goto(page, 'With Disabled');
      const lockedCheckbox = page.locator('[data-slot="selection-item"]').last().locator('label');
      await expect(lockedCheckbox).toHaveAttribute('data-disabled', '');
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose toolbar role on bulk bar', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      await getCheckboxes(page).first().click();
      await expect(page.getByRole('toolbar', { name: 'Bulk actions' })).toBeVisible();
    });

    test('Should toggle via keyboard Space on a checkbox', async ({ page }) => {
      await selectionStory.goto(page, 'Default');
      const first = getCheckboxes(page).first();
      await first.focus();
      await page.keyboard.press('Space');
      await expect(first).toHaveAttribute('data-state', 'checked');
    });

    test('Should expose mixed aria state on indeterminate SelectionAll', async ({ page }) => {
      await selectionStory.goto(page, 'With Select All');
      await getCheckboxes(page).first().click();
      await expect(getSelectAll(page)).toHaveAttribute('data-state', 'indeterminate');
    });
  });
});
