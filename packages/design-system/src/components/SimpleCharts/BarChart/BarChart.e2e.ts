import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const barChartStory = createStoryHelper('data-display-simplecharts-horizontal-stacked-bars-chart', [
  'Default',
  'Totals',
  'Long Labels',
  'Row Count',
  'Clickable Legend',
  'Loading',
  'Empty',
] as const);

const getParts = (page: Page, key: string, testId = 'bar-chart') =>
  page.getByTestId(`${testId}--part`).and(page.locator(`[data-key="${key}"]`));
const getLegendItem = (page: Page, key: string) =>
  page.getByTestId('bar-chart--legend-item').and(page.locator(`[data-key="${key}"]`));
// Located by test id — role queries would also match other tooltips on the page.
const getHoverPopover = (page: Page, testId = 'bar-chart') =>
  page.getByTestId(`${testId}--hover-popover`);

// Moves the pointer onto the first bar (Payments API) — the popover opens over the bar's parts
// only, so aim at the middle of one.
const hoverFirstBar = async (page: Page, testId = 'bar-chart') => {
  const box = await getParts(page, 'falsePositive', testId).first().boundingBox();
  if (!box) throw new Error('first bar has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
};

// Moves the pointer onto the first row's label column, left of the bar.
const hoverFirstLabel = async (page: Page, testId = 'bar-chart') => {
  const box = await getParts(page, 'malicious', testId).first().boundingBox();
  const body = await page.getByTestId(`${testId}--body`).boundingBox();
  if (!box || !body) throw new Error('first row has no bounding box');
  await page.mouse.move(body.x + 24, box.y + box.height / 2);
};

test.describe('Component: BarChart', () => {
  test.describe('Visual', () => {
    test('Should render default state correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render hovered bar correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      await hoverFirstBar(page);
      await expect(getHoverPopover(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render selected legend item with faded series correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      await getLegendItem(page, 'falsePositive').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render focused legend item correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Clickable Legend');
      await page.keyboard.press('Tab');
      await expect(getLegendItem(page, 'malicious')).toBeFocused();
      await expect(page).toHaveScreenshot();
    });

    test('Should render hovered row without the popover correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      await hoverFirstLabel(page);
      await expect(page.getByTestId('bar-chart--row-hover')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render total placements correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Totals');
      await expect(page).toHaveScreenshot();
    });

    test('Should render truncated long labels correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Long Labels');
      await expect(page).toHaveScreenshot();
    });

    test('Should render card growing with the row count correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Row Count');
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading state correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render empty state correctly', async ({ page }) => {
      await barChartStory.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should stack the first legend series on the left when bars render', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      const first = await getParts(page, 'malicious').first().boundingBox();
      const last = await getParts(page, 'benign').first().boundingBox();
      if (!first || !last) throw new Error('parts have no bounding box');
      expect(first.x).toBeLessThan(last.x);
    });

    test('Should keep the given category order from top to bottom', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      const parts = getParts(page, 'malicious');
      const top = await parts.first().boundingBox();
      const bottom = await parts.last().boundingBox();
      if (!top || !bottom) throw new Error('parts have no bounding box');
      expect(top.y).toBeLessThan(bottom.y);
    });

    test('Should show the bar breakdown when a bar is hovered', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      await hoverFirstBar(page);
      const popover = getHoverPopover(page);
      await expect(popover).toBeVisible();
      await expect(popover).toContainText('Payments API');
      await expect(popover).toContainText('True positive');
      await expect(popover).toContainText('40');
    });

    test('Should highlight the row without the popover when its label is hovered', async ({
      page,
    }) => {
      await barChartStory.goto(page, 'Default');
      await hoverFirstLabel(page);
      await expect(page.getByTestId('bar-chart--row-hover')).toBeVisible();
      await expect(getHoverPopover(page)).toBeHidden();
    });

    test('Should move the total before the bar when total is start', async ({ page }) => {
      await barChartStory.goto(page, 'Totals');
      const end = await getParts(page, 'malicious', 'bar-chart-total-end').first().boundingBox();
      const start = await getParts(page, 'malicious', 'bar-chart-total-start')
        .first()
        .boundingBox();
      if (!end || !start) throw new Error('parts have no bounding box');
      expect(start.x).toBeGreaterThan(end.x);
    });

    test('Should show the full category when a truncated bar is hovered', async ({ page }) => {
      await barChartStory.goto(page, 'Long Labels');
      await hoverFirstBar(page, 'bar-chart-narrow');
      await expect(getHoverPopover(page, 'bar-chart-narrow')).toContainText(
        'api.payments.example.com',
      );
    });

    test('Should fade the other series when a legend item is hovered', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      await getLegendItem(page, 'falsePositive').hover();
      await expect(getParts(page, 'falsePositive').first()).toHaveAttribute('opacity', '1');
      await expect(getParts(page, 'falsePositive').first()).toHaveAttribute('data-active', 'true');
      await expect(getParts(page, 'malicious').first()).toHaveAttribute('opacity', '0.3');
      await expect(getParts(page, 'benign').first()).toHaveAttribute('opacity', '0.3');
    });

    test('Should grow the plot with the number of categories', async ({ page }) => {
      await barChartStory.goto(page, 'Row Count');
      const two = await page.getByTestId('bar-chart-two--body').boundingBox();
      const ten = await page.getByTestId('bar-chart-ten--body').boundingBox();
      if (!two || !ten) throw new Error('bodies have no bounding box');
      // 32px per row + the 8px under the last one.
      expect(two.height).toBe(2 * 32 + 8);
      expect(ten.height).toBe(10 * 32 + 8);
    });

    test('Should size the loading frame like the loaded chart', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      const loaded = await page.getByTestId('bar-chart--body').boundingBox();
      await barChartStory.goto(page, 'Loading');
      const loading = await page.getByTestId('bar-chart-empty').boundingBox();
      if (!loaded || !loading) throw new Error('frames have no bounding box');
      expect(loading.height).toBe(loaded.height);
    });

    test('Should show the message inside the empty frame', async ({ page }) => {
      await barChartStory.goto(page, 'Empty');
      await expect(page.getByTestId('bar-chart-empty')).toContainText('No findings in this period');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be hidden from assistive tech via aria-hidden on the plot', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      await expect(page.getByTestId('bar-chart--body')).toHaveAttribute('aria-hidden', 'true');
    });

    test('Should be announced via role tooltip on the hover popover', async ({ page }) => {
      await barChartStory.goto(page, 'Default');
      await hoverFirstBar(page);
      const popover = getHoverPopover(page);
      await expect(popover).toBeVisible();
      await expect(popover).toHaveAttribute('role', 'tooltip');
      await expect(popover).toHaveAttribute('aria-live', 'polite');
    });

    test('Should be operable via keyboard on a clickable legend', async ({ page }) => {
      await barChartStory.goto(page, 'Clickable Legend');
      await expect(page.getByRole('button', { name: /Malicious anomaly/ })).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(getLegendItem(page, 'malicious')).toBeFocused();
      // Focus fades the other series, as hover does.
      await expect(getParts(page, 'benign').first()).toHaveAttribute('opacity', '0.3');
    });
  });
});
