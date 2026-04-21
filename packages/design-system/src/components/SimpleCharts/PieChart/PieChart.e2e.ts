import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const pieChartStory = createStoryHelper('data-display-simplecharts-piechart', [
  'Default',
  'Selectable',
  'Truncated Labels',
  'Truncated Labels With Tooltip',
  'Loading',
  'Single Slice',
  'Two Slices',
  'Custom Colors',
  'Zero Total',
  'Width Variants',
  'Percent Variants',
  'Palette',
] as const);

// `PIE_DONUT_ANIMATION_DURATION` is 400ms with begin=0; wait a hair past it.
const PIE_ANIMATION_MS = 500;
// Number of rows in the `Default` story dataset (`baseRows` in PieChart.stories.tsx).
const DEFAULT_SLICE_COUNT = 5;

test.describe('PieChart', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('Hovered (legend → slice)', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await page.locator('[data-slot=pie-chart-legend-item]').nth(2).hover();
      await expect(page).toHaveScreenshot();
    });

    test('Selected', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await page.locator('[data-slot=pie-chart-legend-item]').nth(2).click();
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('Focus', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      // First Tab → Settings action; second Tab → first legend row.
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(page).toHaveScreenshot();
    });

    test('Loading', async ({ page }) => {
      await pieChartStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('SingleSlice', async ({ page }) => {
      await pieChartStory.goto(page, 'Single Slice');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('TwoSlices', async ({ page }) => {
      await pieChartStory.goto(page, 'Two Slices');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('CustomColors', async ({ page }) => {
      await pieChartStory.goto(page, 'Custom Colors');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('TruncatedLabels', async ({ page }) => {
      await pieChartStory.goto(page, 'Truncated Labels');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('Selectable - DefaultSelected', async ({ page }) => {
      await pieChartStory.goto(page, 'Selectable');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('Selectable - MultiSelected', async ({ page }) => {
      await pieChartStory.goto(page, 'Selectable');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      // Add 2XX to the default {4XX} so the screenshot captures the multi-selection
      // dim — non-selected slices/rows fade, selected ones stay bright.
      await page.locator('[data-slot=pie-chart-legend-item][data-name="2XX"]').click();
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('Selectable - NoneSelected', async ({ page }) => {
      await pieChartStory.goto(page, 'Selectable');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      // Clear the default 4XX selection — every slice/row should return to full opacity.
      await page.getByRole('button', { name: 'Clear selection' }).click();
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('Selectable - Hovered', async ({ page }) => {
      await pieChartStory.goto(page, 'Selectable');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      // Hover takes precedence over selection — only the hovered row stays bright,
      // even when 4XX is the default selection.
      await page.locator('[data-slot=pie-chart-legend-item][data-name="5XX"]').hover();
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('ZeroTotal', async ({ page }) => {
      await pieChartStory.goto(page, 'Zero Total');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });

    test('PercentVariants', async ({ page }) => {
      await pieChartStory.goto(page, 'Percent Variants');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should mark a row as selected when clicked', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      const row = page.locator('[data-slot=pie-chart-legend-item]').first();
      await expect(row).not.toHaveAttribute('aria-current', 'true');
      await row.click();
      await expect(row).toHaveAttribute('aria-current', 'true');
    });

    test('Should activate selection with Enter', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      const row = page.locator('[data-slot=pie-chart-legend-item]').first();
      await row.focus();
      await page.keyboard.press('Enter');
      await expect(row).toHaveAttribute('aria-current', 'true');
    });

    test('Should activate selection with Space', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      const row = page.locator('[data-slot=pie-chart-legend-item]').first();
      await row.focus();
      await page.keyboard.press(' ');
      await expect(row).toHaveAttribute('aria-current', 'true');
    });

    test('Should sync hover from legend row to donut slice', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      await page.waitForTimeout(PIE_ANIMATION_MS);

      const targetName = '5XX';
      const row = page.locator(`[data-slot=pie-chart-legend-item][data-name="${targetName}"]`);
      await row.hover();

      const activeSlice = page.locator(
        `[data-slot=pie-chart-slice][data-name="${targetName}"][data-active="true"]`,
      );
      await expect(activeSlice).toHaveCount(1);

      // Inactive slices omit `data-active` entirely (the component only sets it
      // on the active slice), so attribute-presence is the assertion.
      const inactiveSlices = page.locator('[data-slot=pie-chart-slice]:not([data-active="true"])');
      await expect(inactiveSlices).toHaveCount(DEFAULT_SLICE_COUNT - 1);
    });

    test('Should reset hover state when leaving a legend row', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      await page.waitForTimeout(PIE_ANIMATION_MS);

      const row = page.locator('[data-slot=pie-chart-legend-item]').first();
      await row.hover();
      await expect(row).toHaveAttribute('data-active', 'true');

      await page.locator('[data-slot=chart-title]').hover();
      await expect(row).not.toHaveAttribute('data-active', 'true');
    });

    test('Should render every percent at 0% when total is zero', async ({ page }) => {
      await pieChartStory.goto(page, 'Zero Total');
      const percents = page.locator('[data-slot=pie-chart-legend-percent]');
      const count = await percents.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(percents.nth(i)).toContainText('0');
      }
    });

    test('Should not activate any legend row when hovering the zero-total ring', async ({
      page,
    }) => {
      await pieChartStory.goto(page, 'Zero Total');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      // Hovering the donut wrapper propagates into the placeholder SVG path beneath
      // the cursor — same browser hit-test path as a real user. `.hover()` on the
      // <path> directly is unreliable: recharts' animation pipeline can briefly
      // reset the geometry, so Playwright's actionability check times out.
      await page.locator('[data-slot=pie-chart-donut]').hover();
      const activeRows = page.locator('[data-slot=pie-chart-legend-item][data-active="true"]');
      await expect(activeRows).toHaveCount(0);
    });

    test('Should render the donut as a full ring when only one slice is shown', async ({
      page,
    }) => {
      await pieChartStory.goto(page, 'Single Slice');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      const slices = page.locator('[data-slot=pie-chart-slice]');
      await expect(slices).toHaveCount(1);
      await expect(page.locator('[data-slot=pie-chart-legend-item]')).toHaveCount(1);
      await expect(page.locator('[data-slot=pie-chart-legend-percent]')).toContainText('100');
    });

    test('Should not set role=button on a non-interactive row', async ({ page }) => {
      await pieChartStory.goto(page, 'Two Slices');
      const row = page.locator('[data-slot=pie-chart-legend-item]').first();
      await expect(row).not.toHaveAttribute('role', 'button');
      await expect(row).not.toHaveAttribute('tabindex', '0');
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose interactive rows with role=button', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      const buttons = page.getByRole('button', { name: /XX/ });
      await expect(buttons).toHaveCount(DEFAULT_SLICE_COUNT);
    });

    test('Should reach the first interactive row via forward Tab', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      await page.waitForTimeout(PIE_ANIMATION_MS);
      const row = page.locator('[data-slot=pie-chart-legend-item]').first();
      // Don't hardcode the Tab count: preceding tab stops include Storybook chrome,
      // the Settings action button (whose 0-width hidden state has browser-specific
      // focusability), and recharts' SVG. Tab forward up to 6 times — that's enough
      // to reach the first row in every layout we ship; the assertion is "row is
      // keyboard-reachable", not "row is exactly the Nth tab stop".
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        if (await row.evaluate(el => el === document.activeElement)) break;
      }
      await expect(row).toBeFocused();
    });

    test('Should mark the donut as decorative with aria-hidden', async ({ page }) => {
      await pieChartStory.goto(page, 'Default');
      const donut = page.locator('[data-slot=pie-chart-donut]');
      await expect(donut.locator('[aria-hidden="true"]').first()).toBeVisible();
    });

    test('Should announce the skeleton loading state', async ({ page }) => {
      await pieChartStory.goto(page, 'Loading');
      const skeleton = page.locator('[data-slot=pie-chart-skeleton]');
      await expect(skeleton).toHaveAttribute('aria-busy', 'true');
      await expect(skeleton).toHaveAttribute('aria-live', 'polite');
      await expect(page.locator('[data-slot=pie-chart-skeleton-row]')).toHaveCount(5);
    });
  });
});
