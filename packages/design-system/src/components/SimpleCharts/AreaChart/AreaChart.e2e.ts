import { expect, test } from '@playwright/test';
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
      await page.locator('[data-slot=line-chart-legend-item][data-key="errors"]').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render filtered state correctly', async ({ page }) => {
      await areaChartStory.goto(page, 'Filterable');
      await page.locator('[data-slot=line-chart-legend-item][data-key="errors"]').click();
      await page.locator('[data-slot=chart-title]').hover();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should isolate the matching area when a legend row is clicked', async ({ page }) => {
      await areaChartStory.goto(page, 'Filterable');
      const row = page.locator('[data-slot=line-chart-legend-item][data-key="errors"]');
      await expect(page.locator('[data-slot=area-chart-area]')).toHaveCount(3);

      await row.click();

      // Only the clicked series remains visible.
      await expect(page.locator('[data-slot=area-chart-area]')).toHaveCount(1);
      await expect(page.locator('[data-slot=area-chart-area][data-key="errors"]')).toHaveCount(1);
    });

    test('Should show hover tooltip when mousing over the plot', async ({ page }) => {
      await areaChartStory.goto(page, 'Default');

      const body = page.locator('[data-slot=area-chart-body]');
      const bodyBox = await body.boundingBox();
      if (!bodyBox) throw new Error('chart body has no bounding box');

      await page.mouse.move(bodyBox.x + bodyBox.width / 2, bodyBox.y + bodyBox.height / 2);

      const popover = page.locator('[data-slot=chart-hover-card]');
      await expect(popover).toBeVisible();
    });

    test('Should sync data-active from a hovered legend row to the matching area', async ({
      page,
    }) => {
      await areaChartStory.goto(page, 'Default');
      const targetKey = 'errors';
      const row = page.locator(`[data-slot=line-chart-legend-item][data-key="${targetKey}"]`);
      await row.hover();

      const activeArea = page.locator(
        `[data-slot=area-chart-area][data-key="${targetKey}"][data-active="true"]`,
      );
      await expect(activeArea).toHaveCount(1);

      const inactiveAreas = page.locator('[data-slot=area-chart-area]:not([data-active="true"])');
      await expect(inactiveAreas).toHaveCount(2);
    });
  });

  test.describe('Accessibility', () => {
    test('Should mark the chart body as decorative with aria-hidden', async ({ page }) => {
      await areaChartStory.goto(page, 'Default');
      const body = page.locator('[data-slot=area-chart-body]');
      await expect(body).toHaveAttribute('aria-hidden', 'true');
    });

    test('Should expose the hover popover with role=tooltip', async ({ page }) => {
      await areaChartStory.goto(page, 'Default');

      const body = page.locator('[data-slot=area-chart-body]');
      const bodyBox = await body.boundingBox();
      if (!bodyBox) throw new Error('chart body has no bounding box');

      await page.mouse.move(bodyBox.x + bodyBox.width / 2, bodyBox.y + bodyBox.height / 2);
      const popover = page.locator('[data-slot=chart-hover-card]');
      await expect(popover).toBeVisible();
      await expect(popover).toHaveAttribute('role', 'tooltip');
    });

    test('Should expose interactive legend rows with role=button', async ({ page }) => {
      await areaChartStory.goto(page, 'Filterable');
      const rows = page.locator('[data-slot=line-chart-legend-item][role="button"]');
      await expect(rows).toHaveCount(3);
    });
  });
});
