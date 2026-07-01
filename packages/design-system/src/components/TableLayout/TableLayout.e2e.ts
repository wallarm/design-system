import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tableLayoutStory = createStoryHelper('data-display-tablelayout', [
  'Basic',
  'Alignment',
  'Column Pinning',
  'Column Resizing',
  'Column Visibility',
  'Full Featured',
] as const);

const getTable = (page: Page) => page.getByRole('table', { name: 'Endpoints' });

// Readout text in the Column Resizing story: "endpoint: {n}px · method: {n}px".
const readEndpointWidth = async (page: Page): Promise<number> => {
  const text = (await page.getByTestId('sizing-readout').textContent()) ?? '';
  return Number(text.match(/endpoint:\s*(\d+)px/)?.[1] ?? 0);
};

test.describe('Component: TableLayout', () => {
  test.describe('Visual', () => {
    test('Should render a basic markup-only table correctly', async ({ page }) => {
      await tableLayoutStory.goto(page, 'Basic');
      await expect(getTable(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render column alignment correctly', async ({ page }) => {
      await tableLayoutStory.goto(page, 'Alignment');
      await expect(getTable(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render a pinned column correctly', async ({ page }) => {
      await tableLayoutStory.goto(page, 'Column Pinning');
      await expect(getTable(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the full-featured table correctly', async ({ page }) => {
      await tableLayoutStory.goto(page, 'Full Featured');
      await expect(getTable(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should widen the column when the resize handle is dragged right', async ({ page }) => {
      await tableLayoutStory.goto(page, 'Column Resizing');
      await expect(getTable(page)).toBeVisible();

      const before = await readEndpointWidth(page);
      expect(before).toBeGreaterThan(0);

      const endpointHeader = page.getByRole('columnheader', { name: 'Endpoint' });
      const handle = endpointHeader.locator('[data-slot="resize-handle"]');
      const box = await handle.boundingBox();
      if (!box) throw new Error('Endpoint column resize handle not found');

      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await expect(handle).toHaveAttribute('data-resizing', 'true');
      // onChange resize mode updates the width live as the pointer moves.
      await page.mouse.move(startX + 120, startY, { steps: 10 });
      await page.mouse.up();

      await expect.poll(() => readEndpointWidth(page), { timeout: 5000 }).toBeGreaterThan(before);
    });

    test('Should hide a column across header and body when its toggle is clicked', async ({
      page,
    }) => {
      await tableLayoutStory.goto(page, 'Column Visibility');
      await expect(getTable(page)).toBeVisible();

      await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
      const statusCellCountBefore = await page.getByRole('cell', { name: 'Active' }).count();
      expect(statusCellCountBefore).toBeGreaterThan(0);

      await page.getByRole('button', { name: 'Status' }).click();

      await expect(page.getByRole('columnheader', { name: 'Status' })).toBeHidden();
      await expect(page.getByRole('cell', { name: 'Active' })).toHaveCount(0);
      // Sibling columns stay put.
      await expect(page.getByRole('columnheader', { name: 'Endpoint' })).toBeVisible();
    });
  });
});
