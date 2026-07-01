import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('data-display-simplecharts-horizontalbar', [
  'Default',
  'No Delta',
  'No Value',
  'With Remainder',
  'Legend Off',
  'Palette',
  'Empty',
] as const);

test.describe('HorizontalBar', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await story.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('With Remainder', async ({ page }) => {
      await story.goto(page, 'With Remainder');
      await expect(page).toHaveScreenshot();
    });

    test('Legend Off', async ({ page }) => {
      await story.goto(page, 'Legend Off');
      await expect(page).toHaveScreenshot();
    });

    test('Empty', async ({ page }) => {
      await story.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Accessibility', () => {
    test('legend mirrors the bar; bar is aria-hidden by default', async ({ page }) => {
      await story.goto(page, 'Default');
      const bar = page.locator('[data-slot=horizontal-bar-bar]');
      await expect(bar).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('[data-slot=horizontal-bar-legend-item]')).toHaveCount(3);
    });

    test('bar carries an aria-label summary when the legend is hidden', async ({ page }) => {
      await story.goto(page, 'Legend Off');
      const bar = page.locator('[data-slot=horizontal-bar-bar]');
      await expect(bar).toHaveAttribute('aria-label', /Critical 42/);
      await expect(page.locator('[data-slot=horizontal-bar-legend]')).toHaveCount(0);
    });
  });
});
