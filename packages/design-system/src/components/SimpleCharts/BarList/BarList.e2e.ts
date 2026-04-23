import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const barListStory = createStoryHelper('data-display-simplecharts-barlist', [
  'Default',
  'Selectable',
  'Colored',
  'Custom Colors',
  'Percentage',
  'Percent Digits',
  'Percent Variants',
  'Truncated Labels',
  'Overflow',
  'Invalid Max',
  'Loading',
] as const);

// Bars transition their width from `starting:w-0` on mount (duration-300).
// Wait past that before measuring bounding boxes.
const BAR_TRANSITION_MS = 400;

test.describe('BarList', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await barListStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Hovered', async ({ page }) => {
      await barListStory.goto(page, 'Default');
      await page.locator('[data-slot=bar-list-item]').first().hover();
      await expect(page).toHaveScreenshot();
    });

    test('Selected', async ({ page }) => {
      await barListStory.goto(page, 'Selectable');
      await page.locator('[data-slot=bar-list-item]').nth(2).click();
      await expect(page).toHaveScreenshot();
    });

    test('Focus', async ({ page }) => {
      await barListStory.goto(page, 'Default');
      // First tab lands on Settings action; second tab lands on the first row.
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(page).toHaveScreenshot();
    });

    test('Colored', async ({ page }) => {
      await barListStory.goto(page, 'Colored');
      await expect(page).toHaveScreenshot();
    });

    test('CustomColors', async ({ page }) => {
      await barListStory.goto(page, 'Custom Colors');
      await expect(page).toHaveScreenshot();
    });

    test('Percentage', async ({ page }) => {
      await barListStory.goto(page, 'Percentage');
      await expect(page).toHaveScreenshot();
    });

    test('TruncatedLabels', async ({ page }) => {
      await barListStory.goto(page, 'Truncated Labels');
      await expect(page).toHaveScreenshot();
    });

    test('Overflow', async ({ page }) => {
      await barListStory.goto(page, 'Overflow');
      await expect(page).toHaveScreenshot();
    });

    test('InvalidMax', async ({ page }) => {
      await barListStory.goto(page, 'Invalid Max');
      await expect(page).toHaveScreenshot();
    });

    test('Loading', async ({ page }) => {
      await barListStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('PercentVariants', async ({ page }) => {
      await barListStory.goto(page, 'Percent Variants');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should mark a row as selected when clicked', async ({ page }) => {
      await barListStory.goto(page, 'Selectable');
      const row = page.locator('[data-slot=bar-list-item]').first();
      await expect(row).not.toHaveAttribute('aria-current', 'true');
      await row.click();
      await expect(row).toHaveAttribute('aria-current', 'true');
    });

    test('Should mark a row as selected when Enter is pressed', async ({ page }) => {
      await barListStory.goto(page, 'Selectable');
      const row = page.locator('[data-slot=bar-list-item]').first();
      await row.focus();
      await page.keyboard.press('Enter');
      await expect(row).toHaveAttribute('aria-current', 'true');
    });

    test('Should mark a row as selected when Space is pressed', async ({ page }) => {
      await barListStory.goto(page, 'Selectable');
      const row = page.locator('[data-slot=bar-list-item]').first();
      await row.focus();
      await page.keyboard.press(' ');
      await expect(row).toHaveAttribute('aria-current', 'true');
    });

    test('Should keep the bar at its natural ratio when selected', async ({ page }) => {
      await barListStory.goto(page, 'Selectable');
      await page.waitForTimeout(BAR_TRANSITION_MS);

      // Third row value=612, sum(baseRows)=3274 → ≈18.7% → '19%' with digits=0.
      const row = page.locator('[data-slot=bar-list-item]').nth(2);
      await row.click();

      const bar = row.locator('[data-slot=bar-list-bar]');
      const barBox = await bar.boundingBox();
      const rowBox = await row.boundingBox();
      if (!barBox || !rowBox) throw new Error('Missing bounding box');

      const trackWidth = rowBox.width - 16;
      const expected = (612 / 3274) * trackWidth;
      expect(barBox.width).toBeGreaterThan(expected - 4);
      expect(barBox.width).toBeLessThan(expected + 4);

      await expect(row.locator('[data-slot=bar-list-percent]')).toHaveText('19%');
    });

    test('Should change the row background on hover', async ({ page }) => {
      await barListStory.goto(page, 'Default');
      const row = page.locator('[data-slot=bar-list-item]').first();

      const before = await row.evaluate(el => getComputedStyle(el).backgroundColor);
      await row.hover();
      const after = await row.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(after).not.toEqual(before);
    });

    test('Should cap the bar at 100% when value exceeds max', async ({ page }) => {
      await barListStory.goto(page, 'Overflow');
      await page.waitForTimeout(BAR_TRANSITION_MS);

      const row = page.locator('[data-slot=bar-list-item]').first();
      const bar = row.locator('[data-slot=bar-list-bar]');
      const barBox = await bar.boundingBox();
      const rowBox = await row.boundingBox();
      if (!barBox || !rowBox) throw new Error('Missing bounding box');

      const trackWidth = rowBox.width - 16;
      expect(barBox.width).toBeGreaterThan(trackWidth - 2);
      expect(barBox.width).toBeLessThan(trackWidth + 2);
      await expect(row.locator('[data-slot=bar-list-percent]')).toHaveText('100%');
    });

    test('Should render an empty bar and 0% label for a zero value', async ({ page }) => {
      await barListStory.goto(page, 'Overflow');
      await page.waitForTimeout(BAR_TRANSITION_MS);

      const zeroRow = page.locator('[data-slot=bar-list-item]').nth(2);
      const bar = zeroRow.locator('[data-slot=bar-list-bar]');
      const barBox = await bar.boundingBox();
      expect(barBox?.width ?? 0).toBeLessThan(1);
      await expect(zeroRow.locator('[data-slot=bar-list-percent]')).toHaveText('0%');
    });

    test('Should render every row at 0% when max is invalid', async ({ page }) => {
      await barListStory.goto(page, 'Invalid Max');
      await page.waitForTimeout(BAR_TRANSITION_MS);

      const percents = page.locator('[data-slot=bar-list-percent]');
      const percentCount = await percents.count();
      expect(percentCount).toBeGreaterThan(0);
      for (let i = 0; i < percentCount; i++) {
        await expect(percents.nth(i)).toHaveText('0%');
      }

      const bars = page.locator('[data-slot=bar-list-bar]');
      const barCount = await bars.count();
      for (let i = 0; i < barCount; i++) {
        const box = await bars.nth(i).boundingBox();
        expect(box?.width ?? 0).toBeLessThan(1);
      }
    });

    test('Should format the percent with the configured digits', async ({ page }) => {
      await barListStory.goto(page, 'Percent Digits');
      const firstPercent = page.locator('[data-slot=bar-list-percent]').first();
      await expect(firstPercent).toHaveText(/^\d+\.\d%$/);
    });

    test('Should color the value and the % symbol independently in split variant', async ({
      page,
    }) => {
      await barListStory.goto(page, 'Percent Variants');
      // Split is the default variant and the first chart in PercentVariants.
      const splitChart = page.locator('[data-slot=chart]').first();
      const firstPercent = splitChart.locator('[data-slot=bar-list-percent]').first();
      const symbol = firstPercent.locator('[data-slot=bar-list-percent-symbol]');

      const valueColor = await firstPercent.evaluate(el => getComputedStyle(el).color);
      const symbolColor = await symbol.evaluate(el => getComputedStyle(el).color);
      expect(valueColor).not.toEqual(symbolColor);
    });

    test('Should not set role=button or tabIndex on a non-interactive row', async ({ page }) => {
      await barListStory.goto(page, 'Colored');
      const row = page.locator('[data-slot=bar-list-item]').first();
      await expect(row).not.toHaveAttribute('role', 'button');
      await expect(row).not.toHaveAttribute('tabindex', '0');
    });

    test('Should show the focus ring on keyboard focus', async ({ page }) => {
      await barListStory.goto(page, 'Default');
      // First tab lands on Settings action; second tab lands on the first row.
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const row = page.locator('[data-slot=bar-list-item]').first();
      await expect(row).toBeFocused();
      const boxShadow = await row.evaluate(el => getComputedStyle(el).boxShadow);
      expect(boxShadow).not.toBe('none');
    });

    test('Should not show the focus ring on mouse click', async ({ page }) => {
      await barListStory.goto(page, 'Selectable');
      const row = page.locator('[data-slot=bar-list-item]').first();
      await row.click();

      const boxShadow = await row.evaluate(el => getComputedStyle(el).boxShadow);
      expect(boxShadow).toBe('none');
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose each interactive row with role=button', async ({ page }) => {
      await barListStory.goto(page, 'Default');
      const items = page.getByRole('button', { name: /api\/v1/ });
      await expect(items).toHaveCount(5);
    });

    test('Should focus the first interactive row via Tab', async ({ page }) => {
      await barListStory.goto(page, 'Default');
      // First tab lands on Settings action; second tab lands on the first row.
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const row = page.locator('[data-slot=bar-list-item]').first();
      await expect(row).toBeFocused();
    });

    test('Should mark the bar as decorative with aria-hidden', async ({ page }) => {
      await barListStory.goto(page, 'Default');
      const bar = page.locator('[data-slot=bar-list-bar]').first();
      await expect(bar).toHaveAttribute('aria-hidden', 'true');
    });

    test('Should announce the skeleton loading state', async ({ page }) => {
      await barListStory.goto(page, 'Loading');
      const skeleton = page.locator('[data-slot=bar-list-skeleton]');
      await expect(skeleton).toHaveAttribute('aria-busy', 'true');
      await expect(skeleton).toHaveAttribute('aria-live', 'polite');
      await expect(page.locator('[data-slot=bar-list-skeleton-row]')).toHaveCount(5);
    });
  });
});
