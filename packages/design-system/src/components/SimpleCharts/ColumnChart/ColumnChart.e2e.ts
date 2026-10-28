import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const columnChartStory = createStoryHelper(
  'data-display-simplecharts-vertical-stacked-columns-chart',
  ['Default', 'Adaptive Width', 'Card Height', 'Clickable Legend', 'Loading', 'Empty'] as const,
);

const getParts = (page: Page, key: string, testId = 'column-chart') =>
  page.getByTestId(`${testId}--part`).and(page.locator(`[data-key="${key}"]`));
const getLegendItem = (page: Page, key: string) =>
  page.getByTestId('column-chart--legend-item').and(page.locator(`[data-key="${key}"]`));
// The popover renders inside the `aria-hidden` plot, so `getByRole('tooltip')` never finds it.
const getHoverPopover = (page: Page) => page.getByTestId('column-chart--hover-popover');

// Moves the pointer onto the third column (3 Jan) — recharts' tooltip follows the pointer
// over the step's band, so the middle of the column's top part is enough. A 0 value draws no
// part, so `nth()` must index a series that is non-zero on every day: `malicious` is.
const hoverThirdColumn = async (page: Page) => {
  const box = await getParts(page, 'malicious').nth(2).boundingBox();
  if (!box) throw new Error('third column has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
};

test.describe('Component: ColumnChart', () => {
  test.describe('Visual', () => {
    test('Should render default state correctly', async ({ page }) => {
      await columnChartStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render hovered column correctly', async ({ page }) => {
      await columnChartStory.goto(page, 'Default');
      await hoverThirdColumn(page);
      await expect(getHoverPopover(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render selected legend item with faded categories correctly', async ({ page }) => {
      await columnChartStory.goto(page, 'Default');
      await getLegendItem(page, 'falsePositive').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render focused legend item correctly', async ({ page }) => {
      await columnChartStory.goto(page, 'Clickable Legend');
      await page.keyboard.press('Tab');
      await expect(getLegendItem(page, 'malicious')).toBeFocused();
      await expect(page).toHaveScreenshot();
    });

    test('Should render adaptive column widths correctly', async ({ page }) => {
      await columnChartStory.goto(page, 'Adaptive Width');
      await expect(page).toHaveScreenshot();
    });

    test('Should render plot following the card height correctly', async ({ page }) => {
      await columnChartStory.goto(page, 'Card Height');
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading state correctly', async ({ page }) => {
      await columnChartStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render empty state correctly', async ({ page }) => {
      await columnChartStory.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should stack the first legend category on top when columns render', async ({ page }) => {
      await columnChartStory.goto(page, 'Default');
      const top = await getParts(page, 'malicious').first().boundingBox();
      const bottom = await getParts(page, 'benign').first().boundingBox();
      if (!top || !bottom) throw new Error('parts have no bounding box');
      expect(top.y).toBeLessThan(bottom.y);
    });

    test('Should show the column breakdown when a column is hovered', async ({ page }) => {
      await columnChartStory.goto(page, 'Default');
      await hoverThirdColumn(page);
      const popover = getHoverPopover(page);
      await expect(popover).toBeVisible();
      await expect(popover).toContainText('3 Jan');
      await expect(popover).toContainText('True positive');
      await expect(popover).toContainText('40');
    });

    test('Should fade the other categories when a legend item is hovered', async ({ page }) => {
      await columnChartStory.goto(page, 'Default');
      await getLegendItem(page, 'falsePositive').hover();
      await expect(getParts(page, 'falsePositive').first()).toHaveAttribute('opacity', '1');
      await expect(getParts(page, 'falsePositive').first()).toHaveAttribute('data-active', 'true');
      await expect(getParts(page, 'malicious').first()).toHaveAttribute('opacity', '0.3');
      await expect(getParts(page, 'benign').first()).toHaveAttribute('opacity', '0.3');
    });

    test('Should narrow the columns when the steps get denser', async ({ page }) => {
      await columnChartStory.goto(page, 'Adaptive Width');
      await expect(getParts(page, 'benign', 'column-chart-week').first()).toHaveAttribute(
        'width',
        '32',
      );
      await expect(getParts(page, 'benign', 'column-chart-two-weeks').first()).toHaveAttribute(
        'width',
        '16',
      );
    });
  });

  test.describe('Accessibility', () => {
    test('Should be hidden from assistive tech via aria-hidden on the plot', async ({ page }) => {
      await columnChartStory.goto(page, 'Default');
      await expect(page.getByTestId('column-chart--body')).toHaveAttribute('aria-hidden', 'true');
    });

    test('Should be announced via role tooltip on the hover popover', async ({ page }) => {
      await columnChartStory.goto(page, 'Default');
      await hoverThirdColumn(page);
      const popover = getHoverPopover(page);
      await expect(popover).toBeVisible();
      await expect(popover).toHaveAttribute('role', 'tooltip');
      await expect(popover).toHaveAttribute('aria-live', 'polite');
    });

    test('Should be operable via keyboard on a clickable legend', async ({ page }) => {
      await columnChartStory.goto(page, 'Clickable Legend');
      await expect(page.getByRole('button', { name: /Malicious anomaly/ })).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(getLegendItem(page, 'malicious')).toBeFocused();
      // Focus fades the other categories, as hover does.
      await expect(getParts(page, 'benign').first()).toHaveAttribute('opacity', '0.3');
    });
  });
});
