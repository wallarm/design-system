import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const areaChartStory = createStoryHelper('data-display-simplecharts-areachart', [
  'Default',
  'Standard',
  'With Metric',
  'Filterable',
  'Zoom',
  'Loading',
  'Empty',
] as const);

const LEGEND_ITEM = 'area-chart--legend-item';
const AREA = 'area-chart--area';
const byKey = (page: Page, testId: string, key: string) =>
  page.getByTestId(testId).and(page.locator(`[data-key="${key}"]`));

// Force `prefers-reduced-motion: reduce` for every test in this file. Recharts
// runs `<Area>` with `isAnimationActive='auto'`, which honours the media query
// and skips the 400ms mount animation entirely — so the screenshot reflects the
// final state from the first paint instead of needing an arbitrary sleep.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('Component: AreaChart', () => {
  test.describe('Visual', () => {
    test('Should render stacked variant correctly', async ({ page }) => {
      await areaChartStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render standard variant correctly', async ({ page }) => {
      await areaChartStory.goto(page, 'Standard');
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading state correctly', async ({ page }) => {
      await areaChartStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render empty state correctly', async ({ page }) => {
      await areaChartStory.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with metric correctly', async ({ page }) => {
      await areaChartStory.goto(page, 'With Metric');
      await expect(page).toHaveScreenshot();
    });

    test('Should render hovered legend with area dim correctly', async ({ page }) => {
      await areaChartStory.goto(page, 'Default');
      await byKey(page, LEGEND_ITEM, 'errors').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render filtered state correctly', async ({ page }) => {
      await areaChartStory.goto(page, 'Filterable');
      await byKey(page, LEGEND_ITEM, 'errors').click();
      await page.getByTestId('chart--title').hover();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should isolate the matching area when a legend row is clicked', async ({ page }) => {
      await areaChartStory.goto(page, 'Filterable');
      const row = byKey(page, LEGEND_ITEM, 'errors');
      // Recharts renders two <path> elements per Area (fill + stroke); use
      // .recharts-area-area to match only the fill path and avoid double-counting.
      const areas = page.getByTestId(AREA).and(page.locator('.recharts-area-area'));
      await expect(areas).toHaveCount(3);

      await row.click();

      // Only the clicked series remains visible.
      await expect(areas).toHaveCount(1);
      await expect(
        byKey(page, AREA, 'errors').and(page.locator('.recharts-area-area')),
      ).toHaveCount(1);
    });

    test('Should show hover tooltip when mousing over the plot', async ({ page }) => {
      await areaChartStory.goto(page, 'Default');

      const body = page.getByTestId('area-chart--body');
      const bodyBox = await body.boundingBox();
      if (!bodyBox) throw new Error('chart body has no bounding box');

      await page.mouse.move(bodyBox.x + bodyBox.width / 2, bodyBox.y + bodyBox.height / 2);

      const popover = page.getByTestId('area-chart--hover-popover');
      await expect(popover).toBeVisible();
    });

    test('Should sync data-active from a hovered legend row to the matching area', async ({
      page,
    }) => {
      await areaChartStory.goto(page, 'Default');
      const targetKey = 'errors';
      const row = byKey(page, LEGEND_ITEM, targetKey);
      await row.hover();

      // Use .recharts-area-area to match only the fill path (Recharts renders
      // two <path> elements per Area — fill + stroke — both receiving data-*).
      const activeArea = byKey(page, AREA, targetKey).and(
        page.locator('.recharts-area-area[data-active="true"]'),
      );
      await expect(activeArea).toHaveCount(1);

      const inactiveAreas = page
        .getByTestId(AREA)
        .and(page.locator('.recharts-area-area:not([data-active="true"])'));
      await expect(inactiveAreas).toHaveCount(2);
    });
  });

  test.describe('Accessibility', () => {
    test('Should mark the chart body as decorative with aria-hidden', async ({ page }) => {
      await areaChartStory.goto(page, 'Default');
      const body = page.getByTestId('area-chart--body');
      await expect(body).toHaveAttribute('aria-hidden', 'true');
    });

    test('Should expose the hover popover with role=tooltip', async ({ page }) => {
      await areaChartStory.goto(page, 'Default');

      const body = page.getByTestId('area-chart--body');
      const bodyBox = await body.boundingBox();
      if (!bodyBox) throw new Error('chart body has no bounding box');

      await page.mouse.move(bodyBox.x + bodyBox.width / 2, bodyBox.y + bodyBox.height / 2);
      const popover = page.getByTestId('area-chart--hover-popover');
      await expect(popover).toBeVisible();
      await expect(popover).toHaveAttribute('role', 'tooltip');
    });

    test('Should expose interactive legend rows with role=button', async ({ page }) => {
      await areaChartStory.goto(page, 'Filterable');
      const rows = page.getByTestId(LEGEND_ITEM).and(page.locator('[role="button"]'));
      await expect(rows).toHaveCount(3);
    });
  });
});
