import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const numericBadgeStory = createStoryHelper('status-indication-numericbadge', [
  'Basic',
  'Types',
  'Content',
  'Clickable',
] as const);

const appearances = [
  'solid brand',
  'solid danger',
  'secondary neutral',
  'secondary neutral-alt',
  'secondary info',
  'secondary success',
  'secondary danger',
  'secondary brand',
  'outline neutral',
  'outline success',
  'outline danger',
  'outline brand',
] as const;

test.describe('Component: NumericBadge', () => {
  test.describe('Visual', () => {
    test('Should render basic numeric badge correctly', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all type variants correctly', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Types');
      await expect(page).toHaveScreenshot();
    });

    test('Should render numbers glyphs and icons correctly', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Content');
      await expect(page).toHaveScreenshot();
    });

    test('Should render badge and icon sizes correctly', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Content');
      const badges = page.locator('[data-slot="numeric-badge"]');
      await expect(badges).toHaveCount(10);
      const badgeHeights = await badges.evaluateAll(elements =>
        elements.map(element => element.getBoundingClientRect().height).sort((a, b) => a - b),
      );
      expect(badgeHeights).toEqual([16, 16, 16, 16, 16, 20, 20, 20, 20, 20]);

      const icons = page.getByLabel('Completed').locator('svg');
      await expect(icons).toHaveCount(2);
      const iconSizes = await icons.evaluateAll(elements =>
        elements
          .map(element => {
            const { width, height } = element.getBoundingClientRect();
            return [width, height];
          })
          .sort((a, b) => a[0]! - b[0]!),
      );
      expect(iconSizes).toEqual([
        [12, 12],
        [16, 16],
      ]);
    });
  });

  test.describe('Interactions', () => {
    test('Should activate every appearance when clicked', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Clickable');
      const activations = page.getByLabel('Activations');
      await expect(activations).toHaveText('0');

      for (const [index, appearance] of appearances.entries()) {
        await page.getByRole('button', { name: appearance, exact: true }).click();
        await expect(activations).toHaveText(String(index + 1));
      }
    });

    test('Should show hover feedback when the pointer enters each appearance', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Clickable');

      for (const appearance of appearances) {
        const badge = page.getByRole('button', { name: appearance, exact: true });
        const initialOverlay = await badge.evaluate(
          element => getComputedStyle(element, '::before').backgroundColor,
        );
        await badge.hover();
        await expect(badge).toHaveCSS('cursor', 'pointer');
        await expect
          .poll(() =>
            badge.evaluate(element => getComputedStyle(element, '::before').backgroundColor),
          )
          .not.toBe(initialOverlay);
      }
    });

    test('Should show a ring when a clickable badge is pressed', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Clickable');
      const badge = page.getByRole('button', { name: 'solid brand', exact: true });
      await badge.hover();
      await page.mouse.down();
      await expect(badge).not.toHaveCSS('box-shadow', 'none');
      await page.mouse.up();
      await expect(page.getByLabel('Activations')).toHaveText('1');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable with a visible ring via Tab key', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Clickable');
      const firstBadge = page.getByRole('button').first();
      await page.keyboard.press('Tab');

      await expect(firstBadge).toBeFocused();
      await expect(firstBadge).not.toHaveCSS('box-shadow', 'none');
    });

    test('Should be activatable once via Enter and Space keys', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Clickable');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(page.getByLabel('Activations')).toHaveText('1');
      await page.keyboard.press('Space');
      await expect(page.getByLabel('Activations')).toHaveText('2');
    });
  });
});
