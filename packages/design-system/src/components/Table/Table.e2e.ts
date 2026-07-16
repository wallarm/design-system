import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tableStory = createStoryHelper('data-display-table', [
  'Manual Sorting',
  'Column Resizing With Overflow List',
  'Bidirectional Infinite Scroll',
  'Bidirectional Infinite Scroll Window',
  'Row Selection Window Scroll',
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

    test('Should prepend older rows without a visible scroll jump in window mode', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Bidirectional Infinite Scroll Window');

      await expect(page.locator('[data-row-id]').first()).toBeVisible();

      // The initial anchor scroll centers a mid-window row, so the document
      // starts scrolled below the top — confirms the anchor scroll has settled.
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

      const initialWindowSize = await readWindowSize(page);
      expect(initialWindowSize).toBeGreaterThan(0);

      // Scroll the document to the very top to trigger onStartReached.
      await page.evaluate(() => window.scrollTo(0, 0));

      await expect
        .poll(() => readWindowSize(page), { timeout: 3000 })
        .toBeGreaterThan(initialWindowSize);

      // Window-mode compensation: the whole document scrollHeight is shared
      // with content outside the table (the story header), which is exactly
      // what skewed the old scrollHeight-diff delta. The offset-based delta
      // must push scrollY back down by the prepended block height only.
      await expect
        .poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 })
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

    test('Should render the action bar pinned to the viewport bottom correctly', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Row Selection Window Scroll');
      const anchor = page.getByTestId('row-selection-window-scroll-table');
      // Not getByTestId: TableActionBar renders inside TableInnerWindow's
      // ScrollArea, which unconditionally re-scopes TestIdProvider to its own
      // (here, unset) data-testid — a pre-existing ScrollArea cascade gap,
      // same class as the previously-found SelectContent one — so the
      // `--action-bar` cascade never reaches this element. role="dialog" is
      // unique on this story regardless.
      const bar = page.getByRole('dialog');

      await anchor.locator('[data-row-id]').first().locator('[data-part="control"]').click();
      await expect(bar).toBeVisible();

      // The bar centers on the table's own width (read from the anchor), not the
      // full browser window — assert this before scrolling changes its position.
      const anchorBox = (await anchor.boundingBox())!;
      const barBox = (await bar.boundingBox())!;
      const anchorCenterX = anchorBox.x + anchorBox.width / 2;
      const barCenterX = barBox.x + barBox.width / 2;
      expect(Math.abs(barCenterX - anchorCenterX)).toBeLessThanOrEqual(2);

      // Scroll partway down the table — the bar should stay at the viewport
      // bottom instead of tracking the table's own document position.
      await page.mouse.wheel(0, 2000);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

      await expect(page).toHaveScreenshot();
    });

    test('Should render the action bar correctly after the table scrolls out of view', async ({
      page,
    }) => {
      await tableStory.goto(page, 'Row Selection Window Scroll');
      const anchor = page.getByTestId('row-selection-window-scroll-table');
      // Not getByTestId: TableActionBar renders inside TableInnerWindow's
      // ScrollArea, which unconditionally re-scopes TestIdProvider to its own
      // (here, unset) data-testid — a pre-existing ScrollArea cascade gap,
      // same class as the previously-found SelectContent one — so the
      // `--action-bar` cascade never reaches this element. role="dialog" is
      // unique on this story regardless.
      const bar = page.getByRole('dialog');

      await anchor.locator('[data-row-id]').first().locator('[data-part="control"]').click();
      await expect(bar).toBeVisible();

      // Scrolling to document.body.scrollHeight is a moving target here:
      // TanStack Virtual's estimateSize (40px) undershoots these rows' real
      // measured height, so the first scroll reveals rows tall enough to grow
      // the document further — confirmed live (scrollHeight grew ~3000px
      // after the initial scroll, then held steady). Retry until it settles.
      await expect(async () => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect(anchor).not.toBeInViewport();
      }).toPass({ timeout: 10000 });

      await expect(page).toHaveScreenshot();
    });
  });
});
