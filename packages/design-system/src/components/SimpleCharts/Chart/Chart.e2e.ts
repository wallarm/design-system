import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const chartStory = createStoryHelper('data-display-simplecharts-chart', [
  'Default',
  'With Always Visible Actions',
  'Custom Size',
  'Long Title',
  'Empty',
  'Empty With Custom Message',
] as const);

test.describe('Chart', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await chartStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Default (hovered)', async ({ page }) => {
      await chartStory.goto(page, 'Default');
      await page.locator('[data-slot=chart]').hover();
      await expect(page.locator('[data-slot=chart-actions]')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Default (focus)', async ({ page }) => {
      await chartStory.goto(page, 'Default');
      await page.keyboard.press('Tab');
      await expect(page).toHaveScreenshot();
    });

    test('WithAlwaysVisibleActions', async ({ page }) => {
      await chartStory.goto(page, 'With Always Visible Actions');
      await expect(page).toHaveScreenshot();
    });

    test('CustomSize', async ({ page }) => {
      await chartStory.goto(page, 'Custom Size');
      await expect(page).toHaveScreenshot();
    });

    test('LongTitle', async ({ page }) => {
      await chartStory.goto(page, 'Long Title');
      await expect(page).toHaveScreenshot();
    });

    test('Empty', async ({ page }) => {
      await chartStory.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });

    test('EmptyWithCustomMessage', async ({ page }) => {
      await chartStory.goto(page, 'Empty With Custom Message');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should reveal actions when card is hovered', async ({ page }) => {
      await chartStory.goto(page, 'Default');

      const actions = page.locator('[data-slot=chart-actions]');
      await expect(actions).toHaveCSS('opacity', '0');

      await page.locator('[data-slot=chart]').hover();

      await expect(actions).toHaveCSS('opacity', '1');
    });

    test('Should keep always-visible actions shown without hover', async ({ page }) => {
      await chartStory.goto(page, 'With Always Visible Actions');

      const actions = page.locator('[data-slot=chart-actions]');
      await expect(actions).toHaveCSS('opacity', '1');
    });
  });

  test.describe('Accessibility', () => {
    test('Should reveal actions when an element inside the card gains focus', async ({ page }) => {
      await chartStory.goto(page, 'Default');

      const actions = page.locator('[data-slot=chart-actions]');
      await expect(actions).toHaveCSS('opacity', '0');

      await page.keyboard.press('Tab');

      await expect(actions).toHaveCSS('opacity', '1');
    });
  });
});
