import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const lineChartStory = createStoryHelper('data-display-simplecharts-linechart', [
  'Default',
  'Default Multi',
  'Curves',
  'Line Styling',
  'Edge Cases',
  'Custom Tooltip',
  'Legend Placements',
  'Filterable',
  'Cross Chart Hover Sync',
  'Zoom',
  'Loading',
  'Empty',
] as const);

// Force `prefers-reduced-motion: reduce` for every test in this file. Recharts
// runs `<Line>` with `isAnimationActive='auto'`, which honours the media query
// and skips the 400ms mount animation entirely — so the screenshot reflects the
// final state from the first paint instead of needing an arbitrary sleep.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('LineChart', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await lineChartStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('DefaultMulti', async ({ page }) => {
      await lineChartStory.goto(page, 'Default Multi');
      await expect(page).toHaveScreenshot();
    });

    test('Curves', async ({ page }) => {
      await lineChartStory.goto(page, 'Curves');
      await expect(page).toHaveScreenshot();
    });

    test('LineStyling', async ({ page }) => {
      await lineChartStory.goto(page, 'Line Styling');
      await expect(page).toHaveScreenshot();
    });

    test('EdgeCases', async ({ page }) => {
      await lineChartStory.goto(page, 'Edge Cases');
      await expect(page).toHaveScreenshot();
    });

    test('CustomTooltip', async ({ page }) => {
      await lineChartStory.goto(page, 'Custom Tooltip');
      await expect(page).toHaveScreenshot();
    });

    test('LegendPlacements', async ({ page }) => {
      await lineChartStory.goto(page, 'Legend Placements');
      await expect(page).toHaveScreenshot();
    });

    test('Loading', async ({ page }) => {
      await lineChartStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Empty', async ({ page }) => {
      await lineChartStory.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });

    test('Hovered (legend → line dim)', async ({ page }) => {
      await lineChartStory.goto(page, 'Default Multi');
      await page.locator('[data-slot=line-chart-legend-item][data-key="errors"]').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Filterable - Isolated', async ({ page }) => {
      await lineChartStory.goto(page, 'Filterable');
      // First click on the Filterable story isolates the clicked series.
      await page.locator('[data-slot=line-chart-legend-item][data-key="errors"]').click();
      // Move the cursor away so the hover state doesn't leak into the screenshot.
      await page.locator('[data-slot=chart-title]').hover();
      await expect(page.locator('[data-slot=line-chart-line]')).toHaveCount(1);
      await expect(page.locator('[data-slot=line-chart-line][data-key="errors"]')).toHaveCount(1);
      await expect(page).toHaveScreenshot();
    });

    test('Filterable - PartiallyShown', async ({ page }) => {
      await lineChartStory.goto(page, 'Filterable');
      // Click to isolate `requests`, then click `latency` to add it to the
      // visible set — leaving `errors` as the only hidden series.
      await page.locator('[data-slot=line-chart-legend-item][data-key="requests"]').click();
      await page.locator('[data-slot=line-chart-legend-item][data-key="latency"]').click();
      await page.locator('[data-slot=chart-title]').hover();
      await expect(page.locator('[data-slot=line-chart-line]')).toHaveCount(2);
      await expect(page.locator('[data-slot=line-chart-line][data-key="errors"]')).toHaveCount(0);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should isolate the matching line when a legend row is clicked', async ({ page }) => {
      await lineChartStory.goto(page, 'Filterable');
      const row = page.locator('[data-slot=line-chart-legend-item][data-key="errors"]');
      const line = page.locator('[data-slot=line-chart-line][data-key="errors"]');
      await expect(row).toHaveAttribute('aria-current', 'true');
      await expect(page.locator('[data-slot=line-chart-line]')).toHaveCount(3);

      await row.click();

      await expect(row).toHaveAttribute('aria-current', 'true');
      await expect(line).toHaveCount(1);
      // Siblings are hidden — only the clicked series remains.
      await expect(page.locator('[data-slot=line-chart-line]')).toHaveCount(1);
    });

    test('Should isolate the matching line when Enter is pressed on a focused legend row', async ({
      page,
    }) => {
      await lineChartStory.goto(page, 'Filterable');
      const row = page.locator('[data-slot=line-chart-legend-item][data-key="errors"]');
      const line = page.locator('[data-slot=line-chart-line][data-key="errors"]');
      await row.focus();
      await page.keyboard.press('Enter');
      await expect(row).toHaveAttribute('aria-current', 'true');
      await expect(line).toHaveCount(1);
      await expect(page.locator('[data-slot=line-chart-line]')).toHaveCount(1);
    });

    test('Should isolate the matching line when Space is pressed on a focused legend row', async ({
      page,
    }) => {
      await lineChartStory.goto(page, 'Filterable');
      const row = page.locator('[data-slot=line-chart-legend-item][data-key="latency"]');
      const line = page.locator('[data-slot=line-chart-line][data-key="latency"]');
      await row.focus();
      await page.keyboard.press(' ');
      await expect(row).toHaveAttribute('aria-current', 'true');
      await expect(line).toHaveCount(1);
      await expect(page.locator('[data-slot=line-chart-line]')).toHaveCount(1);
    });

    test('Should sync data-active from a hovered legend row to the matching line', async ({
      page,
    }) => {
      await lineChartStory.goto(page, 'Default Multi');
      const targetKey = 'errors';
      const row = page.locator(`[data-slot=line-chart-legend-item][data-key="${targetKey}"]`);
      await row.hover();

      const activeLine = page.locator(
        `[data-slot=line-chart-line][data-key="${targetKey}"][data-active="true"]`,
      );
      await expect(activeLine).toHaveCount(1);

      // Sibling lines omit `data-active` entirely (the component only sets it
      // on the active line), so attribute-presence is the assertion.
      const inactiveLines = page.locator('[data-slot=line-chart-line]:not([data-active="true"])');
      await expect(inactiveLines).toHaveCount(2);
    });

    test('Should reset data-active on the line when leaving a legend row', async ({ page }) => {
      await lineChartStory.goto(page, 'Default Multi');
      const targetKey = 'errors';
      const row = page.locator(`[data-slot=line-chart-legend-item][data-key="${targetKey}"]`);
      const line = page.locator(`[data-slot=line-chart-line][data-key="${targetKey}"]`);
      await row.hover();
      await expect(line).toHaveAttribute('data-active', 'true');

      await page.locator('[data-slot=chart-title]').hover();
      await expect(line).not.toHaveAttribute('data-active', 'true');
    });

    test('Should lock the hover popover Y across peaks and valleys', async ({ page }) => {
      await lineChartStory.goto(page, 'Default Multi');

      const body = page.locator('[data-slot=line-chart-body]');
      const bodyBox = await body.boundingBox();
      if (!bodyBox) throw new Error('chart body has no bounding box');

      const popover = page.locator('[data-slot=line-chart-hover-popover]');

      // Sample three cursor positions across the plot — the popover Y must not
      // jump even though the cursor crosses peaks and valleys in the data.
      const cy = bodyBox.y + bodyBox.height / 2;
      const samples: number[] = [];
      for (const ratio of [0.25, 0.5, 0.75]) {
        await page.mouse.move(bodyBox.x + bodyBox.width * ratio, cy);
        await expect(popover).toBeVisible();
        const box = await popover.boundingBox();
        if (!box) throw new Error('popover has no bounding box');
        samples.push(Math.round(box.y));
      }

      expect(samples[1]).toBe(samples[0]);
      expect(samples[2]).toBe(samples[0]);
    });

    test('Should lock the zoom popover Y across cursor positions and across drag/pending states', async ({
      page,
    }) => {
      await lineChartStory.goto(page, 'Zoom');

      const body = page.locator('[data-slot=line-chart-body]');
      const bodyBox = await body.boundingBox();
      if (!bodyBox) throw new Error('chart body has no bounding box');

      const popover = page.locator('[data-slot=line-chart-zoom-cursor-popover]');

      // Press near the left edge at plot-middle Y, then sweep across the plot
      // with three different cursor Ys (upper band → middle → lower band). The
      // popover Y must stay locked to the plot centre regardless of cursor Y,
      // both while dragging and after release (pending state).
      await page.mouse.move(bodyBox.x + bodyBox.width * 0.2, bodyBox.y + bodyBox.height * 0.5);
      await page.mouse.down();

      const samples: number[] = [];

      for (const [ratioX, ratioY] of [
        [0.4, 0.2],
        [0.55, 0.5],
        [0.7, 0.8],
      ] as const) {
        await page.mouse.move(
          bodyBox.x + bodyBox.width * ratioX,
          bodyBox.y + bodyBox.height * ratioY,
        );
        await expect(popover).toHaveAttribute('data-zoom-state', 'dragging');
        const box = await popover.boundingBox();
        if (!box) throw new Error('popover has no bounding box');
        samples.push(Math.round(box.y));
      }

      await page.mouse.up();
      await expect(popover).toHaveAttribute('data-zoom-state', 'pending');
      const pendingBox = await popover.boundingBox();
      if (!pendingBox) throw new Error('popover has no bounding box');
      samples.push(Math.round(pendingBox.y));

      expect(samples[1]).toBe(samples[0]);
      expect(samples[2]).toBe(samples[0]);
      expect(samples[3]).toBe(samples[0]);
    });

    test('Should keep the zoom popover anchored to the chart while the page scrolls', async ({
      page,
    }) => {
      const SCROLL_BY = 120;
      await lineChartStory.goto(page, 'Zoom');
      // Force the page taller than the viewport so scrollBy has somewhere to
      // go. Reset on teardown so the bottom-padding doesn't bleed into a
      // sibling test that reuses the same page context.
      await page.evaluate(() => {
        document.body.dataset.scrollAnchorTest = '1';
        document.body.style.minHeight = '200vh';
      });

      try {
        const body = page.locator('[data-slot=line-chart-body]');
        const bodyBox = await body.boundingBox();
        if (!bodyBox) throw new Error('chart body has no bounding box');

        await page.mouse.move(bodyBox.x + bodyBox.width * 0.2, bodyBox.y + bodyBox.height * 0.5);
        await page.mouse.down();
        await page.mouse.move(bodyBox.x + bodyBox.width * 0.7, bodyBox.y + bodyBox.height * 0.5);
        await page.mouse.up();

        const popover = page.locator('[data-slot=line-chart-zoom-cursor-popover]');
        await expect(popover).toHaveAttribute('data-zoom-state', 'pending');

        const surface = page.locator('.recharts-surface');
        const popoverBefore = await popover.boundingBox();
        const surfaceBefore = await surface.boundingBox();
        if (!popoverBefore || !surfaceBefore) throw new Error('missing bounding box');
        const offsetBefore = {
          x: popoverBefore.x - surfaceBefore.x,
          y: popoverBefore.y - surfaceBefore.y,
        };

        await page.evaluate(amount => window.scrollBy(0, amount), SCROLL_BY);

        const popoverAfter = await popover.boundingBox();
        const surfaceAfter = await surface.boundingBox();
        if (!popoverAfter || !surfaceAfter) throw new Error('missing bounding box after scroll');
        const offsetAfter = {
          x: popoverAfter.x - surfaceAfter.x,
          y: popoverAfter.y - surfaceAfter.y,
        };

        // Sanity: the chart should have shifted up by the full scroll amount.
        expect(Math.round(surfaceBefore.y - surfaceAfter.y)).toBe(SCROLL_BY);
        // The popover's offset relative to the chart must stay constant.
        expect(Math.round(offsetAfter.x)).toBe(Math.round(offsetBefore.x));
        expect(Math.round(offsetAfter.y)).toBe(Math.round(offsetBefore.y));
      } finally {
        await page.evaluate(() => {
          document.body.style.minHeight = '';
          delete document.body.dataset.scrollAnchorTest;
        });
      }
    });
  });

  test.describe('Accessibility', () => {
    test('Should mark the chart body as decorative with aria-hidden', async ({ page }) => {
      await lineChartStory.goto(page, 'Default Multi');
      const body = page.locator('[data-slot=line-chart-body]');
      await expect(body).toHaveAttribute('aria-hidden', 'true');
    });

    test('Should expose the hover popover with role=tooltip', async ({ page }) => {
      await lineChartStory.goto(page, 'Default Multi');

      const body = page.locator('[data-slot=line-chart-body]');
      const bodyBox = await body.boundingBox();
      if (!bodyBox) throw new Error('chart body has no bounding box');

      await page.mouse.move(bodyBox.x + bodyBox.width / 2, bodyBox.y + bodyBox.height / 2);
      const popover = page.locator('[data-slot=line-chart-hover-popover]');
      await expect(popover).toBeVisible();
      await expect(popover).toHaveAttribute('role', 'tooltip');
    });

    test('Should expose interactive legend rows with role=button', async ({ page }) => {
      await lineChartStory.goto(page, 'Filterable');
      const rows = page.locator('[data-slot=line-chart-legend-item][role="button"]');
      await expect(rows).toHaveCount(3);
    });

    test('Should reach the first legend row via forward Tab', async ({ page }) => {
      await lineChartStory.goto(page, 'Filterable');
      const row = page.locator('[data-slot=line-chart-legend-item]').first();
      // Don't hardcode the Tab count: preceding tab stops include Storybook
      // chrome and the chart's clear-filter button (mounted only when a row is
      // hidden). Tab forward up to 6 times — that's enough to reach the first
      // row in every layout; the assertion is "row is keyboard-reachable", not
      // "row is exactly the Nth tab stop".
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        if (await row.evaluate(el => el === document.activeElement)) break;
      }
      await expect(row).toBeFocused();
    });
  });
});
