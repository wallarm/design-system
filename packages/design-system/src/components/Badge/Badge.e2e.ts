import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const badgeStory = createStoryHelper('status-indication-badge', [
  'Basic',
  'Dotted',
  'Sizes',
  'Types',
  'Text Variants',
  'With Icons Left',
  'With Icons Right',
  'Icons Only',
  'Color Variants',
  'Muted Variants',
  'Content Variants',
] as const);

const getBadges = (page: Parameters<typeof badgeStory.goto>[0]) =>
  page.locator('[data-slot="badge"]');

test.describe('Badge Component', () => {
  test.describe('Screenshots', () => {
    test('Basic', async ({ page }) => {
      await badgeStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Dotted', async ({ page }) => {
      await badgeStory.goto(page, 'Dotted');
      await expect(page).toHaveScreenshot();
    });

    test('Sizes', async ({ page }) => {
      await badgeStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Types', async ({ page }) => {
      await badgeStory.goto(page, 'Types');
      await expect(page).toHaveScreenshot();
    });

    test('Text Variants', async ({ page }) => {
      await badgeStory.goto(page, 'Text Variants');
      await expect(page).toHaveScreenshot();
    });

    test('With Icons Left', async ({ page }) => {
      await badgeStory.goto(page, 'With Icons Left');
      await expect(page).toHaveScreenshot();
    });

    test('With Icons Right', async ({ page }) => {
      await badgeStory.goto(page, 'With Icons Right');
      await expect(page).toHaveScreenshot();
    });

    test('Icons Only', async ({ page }) => {
      await badgeStory.goto(page, 'Icons Only');
      await expect(page).toHaveScreenshot();
    });

    test('Muted Variants', async ({ page }) => {
      await badgeStory.goto(page, 'Muted Variants');
      await expect(page).toHaveScreenshot();
    });

    test('Color Variants', async ({ page }) => {
      await badgeStory.goto(page, 'Color Variants');
      await expect(page).toHaveScreenshot({ fullPage: true });

      // 21 colors × 5 types = 105 badges
      const badges = getBadges(page);
      await expect(badges).toHaveCount(105);
    });

    test('Content Variants', async ({ page }) => {
      await badgeStory.goto(page, 'Content Variants');
      await expect(page).toHaveScreenshot();

      // 21 colors × 8 content rows × 5 types = 840
      // + muted row: 5 colors × 5 types = 25, but isMutedSupported filters to 6 (5 solid + 1 outline-slate)
      // Total: 840 + 6 = 846
      const badges = getBadges(page);
      await expect(badges).toHaveCount(846);
    });
  });
});
