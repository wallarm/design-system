import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tableStory = createStoryHelper('data-display-table', [
  'Manual Sorting',
  'Column Resizing With Overflow List',
  'Bidirectional Infinite Scroll',
] as const);

// The Bidirectional story header renders "Window of {N} rows around the anchor".
// Under `virtualized='container'` the rendered `[data-row-id]` count stays bounded
// by the viewport, so it does NOT grow when a page is fetched — the loaded window
// size is the reliable signal that prepend/append actually pulled more rows.
const readWindowSize = async (page: Page): Promise<number> => {
  const text = await page.getByText(/Window of \d+ rows/).textContent();
  return Number(text?.match(/Window of (\d+) rows/)?.[1] ?? 0);
};

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
      await expect(scrollContainer.locator('[data-row-id]').first()).toBeVisible();

      // The initial anchor scroll centers a mid-window row, so the viewport starts
      // below the top — this also confirms the anchor scroll has settled.
      await expect.poll(() => scrollContainer.evaluate(el => el.scrollTop)).toBeGreaterThan(0);

      const initialWindowSize = await readWindowSize(page);
      expect(initialWindowSize).toBeGreaterThan(0);

      // Scroll to the very top to trigger onStartReached.
      await scrollContainer.evaluate((el: HTMLElement) => {
        el.scrollTop = 0;
      });

      // Wait for older rows to be prepended. The rendered `[data-row-id]` count is
      // bounded by the viewport under container virtualization, so assert the loaded
      // window grew instead.
      await expect
        .poll(() => readWindowSize(page), { timeout: 3000 })
        .toBeGreaterThan(initialWindowSize);

      // The "no visible jump" guarantee: usePrependScrollAnchor compensates scrollTop
      // by the prepended block height, keeping the viewport anchored to the rows the
      // user was looking at. Without compensation scrollTop would stay 0 and the view
      // would jump to the freshly inserted top rows; with it, scrollTop is pushed back
      // down. (A row-position check is unusable here — scrolling to the top pushes any
      // previously visible row out of the virtual window, so it unmounts.)
      await expect
        .poll(() => scrollContainer.evaluate(el => el.scrollTop), { timeout: 3000 })
        .toBeGreaterThan(0);
    });

    test('Should append newer rows when scrolled to the bottom', async ({ page }) => {
      await tableStory.goto(page, 'Bidirectional Infinite Scroll');

      const scrollContainer = page.locator('[data-table-scroll-container]');
      await expect(scrollContainer).toBeVisible();
      await expect(scrollContainer.locator('[data-row-id]').first()).toBeVisible();

      const initialWindowSize = await readWindowSize(page);
      expect(initialWindowSize).toBeGreaterThan(0);

      // Scroll the container to the very bottom to trigger onEndReached
      await scrollContainer.evaluate((el: HTMLElement) => {
        el.scrollTop = el.scrollHeight;
      });

      // Wait for newer rows to be appended. The rendered row count is bounded by
      // the viewport under container virtualization, so assert the loaded window
      // grew instead.
      await expect
        .poll(() => readWindowSize(page), { timeout: 3000 })
        .toBeGreaterThan(initialWindowSize);
    });
  });

  test.describe('Visual', () => {
    test('Should render the bidirectional infinite scroll table correctly', async ({ page }) => {
      await tableStory.goto(page, 'Bidirectional Infinite Scroll');

      const scrollContainer = page.locator('[data-table-scroll-container]');
      await expect(scrollContainer).toBeVisible();
      await expect(scrollContainer.locator('[data-row-id]').first()).toBeVisible();
      // Initial anchor scroll centers a mid-window row → viewport is no longer at the top.
      await expect.poll(() => scrollContainer.evaluate(el => el.scrollTop)).toBeGreaterThan(0);

      await expect(page).toHaveScreenshot();
    });
  });
});
