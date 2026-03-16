import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overflowTooltipStory = createStoryHelper('overlay-overflowtooltip', [
  'Auto Detection',
  'Multi Line Auto Detection',
  'Nested Elements',
  'Custom Tooltip Content',
  'Force Tooltip',
  'Different Sides',
  'Dynamic Content',
] as const);

test.describe('Component: OverflowTooltip', () => {
  test.describe('Visual', () => {
    test('Should render auto detection story correctly', async ({ page }) => {
      await overflowTooltipStory.goto(page, 'Auto Detection');
      await expect(page).toHaveScreenshot();
    });

    test('Should render multi line auto detection correctly', async ({ page }) => {
      await overflowTooltipStory.goto(page, 'Multi Line Auto Detection');
      await expect(page).toHaveScreenshot();
    });

    test('Should render force tooltip correctly', async ({ page }) => {
      await overflowTooltipStory.goto(page, 'Force Tooltip');
      await expect(page).toHaveScreenshot();
    });

    test('Should render force tooltip correctly when hovered', async ({ page }) => {
      await overflowTooltipStory.goto(page, 'Force Tooltip');
      // Force tooltip always shows on hover regardless of overflow
      const trigger = page.locator('[data-scope="tooltip"][data-part="trigger"]').first();
      await trigger.hover();
      await expect(page.locator('[data-scope="tooltip"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should show tooltip when force tooltip is enabled', async ({ page }) => {
      await overflowTooltipStory.goto(page, 'Force Tooltip');
      // Force tooltip always shows on hover regardless of overflow
      const trigger = page.locator('[data-scope="tooltip"][data-part="trigger"]').first();
      await trigger.hover();
      await expect(page.locator('[data-scope="tooltip"][data-part="content"]')).toBeVisible();
    });

    test('Should not show tooltip when non-overflowing text is hovered', async ({ page }) => {
      await overflowTooltipStory.goto(page, 'Auto Detection');
      const shortText = page.locator('[data-scope="tooltip"][data-part="trigger"]').first();
      await shortText.hover();
      // Short text doesn't overflow, tooltip should not appear
      await page.waitForTimeout(500);
      await expect(page.locator('[data-scope="tooltip"][data-part="content"]')).toBeHidden();
    });

    test('Should render different tooltip sides correctly', async ({ page }) => {
      await overflowTooltipStory.goto(page, 'Different Sides');
      await expect(page).toHaveScreenshot();
    });
  });
});
