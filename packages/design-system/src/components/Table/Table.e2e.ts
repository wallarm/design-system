import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tableStory = createStoryHelper('data-display-table', ['Manual Sorting'] as const);

test.describe('Component: Table', () => {
  test.describe('Interactions', () => {
    test('Should reorder rows according to the active sort state in manual mode', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Manual Sorting');

      const table = page.getByTestId('manual-sort-table');
      await expect(table).toBeVisible();

      const rowsBefore = await table.locator('tbody tr').allTextContents();

      // Click the first sort header → consumer re-derives `data`, table renders
      // the new order. Verifies that `manualSorting` defers to the consumer's
      // data ordering rather than running TanStack's client sort.
      await table.getByRole('button', { name: 'Sort column' }).first().click();

      const rowsAfter = await table.locator('tbody tr').allTextContents();
      expect(rowsAfter).not.toEqual(rowsBefore);
      expect(rowsAfter).toHaveLength(rowsBefore.length);
    });

    test('Should toggle the sort icon when a sort header is clicked in manual mode', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Manual Sorting');

      const table = page.getByTestId('manual-sort-table');
      const firstSortButton = table.getByRole('button', { name: /Sort column|Sorted/ }).first();

      await expect(firstSortButton).toHaveAccessibleName('Sort column');
      await firstSortButton.click();
      await expect(firstSortButton).toHaveAccessibleName('Sorted ascending');
      await firstSortButton.click();
      await expect(firstSortButton).toHaveAccessibleName('Sorted descending');
    });
  });
});
