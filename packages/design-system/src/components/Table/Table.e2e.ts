import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tableStory = createStoryHelper('data-display-table', [
  'Manual Sorting',
  'Column Resizing With Overflow List',
  'Bidirectional Infinite Scroll',
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

    test('Should prepend older rows without a visible scroll jump when scrolled to the top', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Bidirectional Infinite Scroll');

      const scrollContainer = page.locator('[data-table-scroll-container]');
      await expect(scrollContainer).toBeVisible();

      // Wait for the initial anchor to be rendered and loading to settle
      await expect(page.getByText('— loading...')).toBeHidden({ timeout: 3000 });

      // Count initial rows and pick a stable reference row that is currently visible
      const rows = scrollContainer.locator('[data-row-id]');
      const initialRowCount = await rows.count();
      expect(initialRowCount).toBeGreaterThan(0);

      // Use the middle row as scroll anchor reference (it should remain visible after prepend)
      const referenceRow = rows.nth(Math.floor(initialRowCount / 2));
      const rowId = await referenceRow.getAttribute('data-row-id');
      expect(rowId).toBeTruthy();

      const boxBefore = await referenceRow.boundingBox();
      expect(boxBefore).not.toBeNull();

      // Scroll the container to the very top to trigger onStartReached
      await scrollContainer.evaluate((el: HTMLElement) => {
        el.scrollTop = 0;
      });

      // Wait for new rows to be prepended (row count increases)
      await expect
        .poll(() => scrollContainer.locator('[data-row-id]').count(), { timeout: 3000 })
        .toBeGreaterThan(initialRowCount);

      // The reference row should still exist and its Y position must not have jumped
      const referenceRowAfter = scrollContainer.locator(`[data-row-id="${rowId}"]`);
      await expect(referenceRowAfter).toBeVisible();

      const boxAfter = await referenceRowAfter.boundingBox();
      expect(boxAfter).not.toBeNull();

      // usePrependScrollAnchor guarantees the viewport does not jump: the row's
      // on-screen Y coordinate must not change by more than 4px.
      expect(Math.abs(boxAfter!.y - boxBefore!.y)).toBeLessThanOrEqual(4);
    });

    test('Should append newer rows when scrolled to the bottom', async ({ page }) => {
      await tableStory.goto(page, 'Bidirectional Infinite Scroll');

      const scrollContainer = page.locator('[data-table-scroll-container]');
      await expect(scrollContainer).toBeVisible();

      // Wait for the initial loading to settle
      await expect(page.getByText('— loading...')).toBeHidden({ timeout: 3000 });

      const rows = scrollContainer.locator('[data-row-id]');
      const initialRowCount = await rows.count();
      expect(initialRowCount).toBeGreaterThan(0);

      // Scroll the container to the very bottom to trigger onEndReached
      await scrollContainer.evaluate((el: HTMLElement) => {
        el.scrollTop = el.scrollHeight;
      });

      // Wait for new rows to be appended (row count increases)
      await expect
        .poll(() => scrollContainer.locator('[data-row-id]').count(), { timeout: 3000 })
        .toBeGreaterThan(initialRowCount);
    });
  });

  test.describe('Visual', () => {
    test('Should render the bidirectional infinite scroll table correctly', async ({ page }) => {
      await tableStory.goto(page, 'Bidirectional Infinite Scroll');

      const scrollContainer = page.locator('[data-table-scroll-container]');
      await expect(scrollContainer).toBeVisible();

      // Wait for the initial loading to finish (status line no longer shows "— loading...")
      await expect(page.getByText('— loading...')).toBeHidden({ timeout: 3000 });

      await expect(page).toHaveScreenshot();
    });
  });
});
