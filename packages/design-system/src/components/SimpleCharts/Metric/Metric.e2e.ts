import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('data-display-simplecharts-metric', [
  'Gallery',
  'Loading',
  'Sparkline',
  'Sparkline Colors',
  'Sparkline Curve',
] as const);

/** Hover the sparkline at `ratio` of its width (0 = first point, 1 = last). */
const hoverSparkline = async (page: Page, ratio: number) => {
  const plot = page.getByTestId('sparkline--plot');
  const box = await plot.boundingBox();
  if (!box) throw new Error('sparkline plot has no layout box');
  // The right edge is exclusive for hit-testing — stay 1px inside.
  await plot.hover({
    position: { x: Math.min(box.width * ratio, box.width - 1), y: box.height / 2 },
  });
};

test.describe('Component: Metric', () => {
  test.describe('Visual', () => {
    // Metric itself is display-only, so the gallery covers every brick combination;
    // the sparkline adds the hover state.
    test('Should render all brick combinations correctly', async ({ page }) => {
      await story.goto(page, 'Gallery');
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading state correctly', async ({ page }) => {
      await story.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with sparkline correctly', async ({ page }) => {
      await story.goto(page, 'Sparkline');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all sparkline colors correctly', async ({ page }) => {
      await story.goto(page, 'Sparkline Colors');
      await expect(page).toHaveScreenshot();
    });

    test('Should render monotone sparkline curve correctly', async ({ page }) => {
      await story.goto(page, 'Sparkline Curve');
      await expect(page).toHaveScreenshot();
    });

    test('Should render hovered sparkline correctly', async ({ page }) => {
      await story.goto(page, 'Sparkline');
      await hoverSparkline(page, 0.5);
      await expect(page.getByTestId('sparkline--popover')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render hovered sparkline on the right half correctly', async ({ page }) => {
      await story.goto(page, 'Sparkline');
      await hoverSparkline(page, 0.9);
      await expect(page.getByTestId('sparkline--popover')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await story.goto(page, 'Sparkline');
    });

    test('Should show the nearest point date and value when sparkline is hovered', async ({
      page,
    }) => {
      // 9 points → 0.5 of the width is the 5th point (5 Jan, 16).
      await hoverSparkline(page, 0.5);
      const popover = page.getByTestId('sparkline--popover');
      await expect(popover).toContainText('5 Jan, 2026');
      await expect(popover).toContainText('Attacks');
      await expect(popover).toContainText('16');

      await hoverSparkline(page, 1);
      await expect(popover).toContainText('9 Jan, 2026');
      await expect(popover).toContainText('13');
    });

    test('Should hide the popover when pointer leaves the sparkline', async ({ page }) => {
      await hoverSparkline(page, 0.5);
      await expect(page.getByTestId('sparkline--popover')).toBeVisible();
      await page.mouse.move(0, 0);
      await expect(page.getByTestId('sparkline--popover')).toBeHidden();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be announced as busy via aria-busy while loading', async ({ page }) => {
      await story.goto(page, 'Loading');
      const skeleton = page.getByTestId('metric-skeleton');
      await expect(skeleton).toHaveAttribute('aria-busy', 'true');
      await expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });

    test('Should be announced as a tooltip via role on sparkline hover', async ({ page }) => {
      await story.goto(page, 'Sparkline');
      await hoverSparkline(page, 0.5);
      await expect(page.getByRole('tooltip')).toContainText('5 Jan, 2026');
    });
  });
});
