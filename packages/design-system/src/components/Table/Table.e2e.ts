import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tableStory = createStoryHelper('data-display-table', [
  'Manual Sorting',
  'Column Resizing With Overflow List',
] as const);

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

    test('Should reflow the OverflowList when the Tags column is resized wider', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Column Resizing With Overflow List');

      const countVisibleTagsInFirstRow = () =>
        page
          .locator('[data-slot="overflow-list"]')
          .first()
          .locator('[data-slot="tag"]')
          .filter({ hasNotText: /^\+\d+$/ })
          .count();

      // Wait for the table to fully render; initial state shows 1 visible tag (overflowed)
      await expect(page.locator('[data-slot="overflow-list"]').first()).toBeVisible();

      const before = await countVisibleTagsInFirstRow();
      expect(before).toBeGreaterThan(0);

      // Locate the resize handle in the Tags column header
      const tagsHeader = page.getByRole('columnheader', { name: 'Tags' });
      await expect(tagsHeader).toBeVisible();

      const handle = tagsHeader.locator('[data-slot="resize-handle"]');
      const box = await handle.boundingBox();
      if (!box) throw new Error('Tags column resize handle not found');

      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      // Wait for TanStack to set isResizingColumn in state, which React reflects as
      // data-resizing="true" on the handle element — more reliable than a fixed timeout.
      await expect(handle).toHaveAttribute('data-resizing', 'true');
      // Moving the handle to the right expands the Tags column (TanStack measures delta from mousedown)
      await page.mouse.move(startX + 200, startY, { steps: 15 });
      await page.mouse.up();

      await expect.poll(countVisibleTagsInFirstRow, { timeout: 5000 }).toBeGreaterThan(before);
    });
  });
});
