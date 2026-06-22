import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const wallyIconStory = createStoryHelper('brand-wallyicon', ['Basic', 'Styles', 'Sizes'] as const);

test.describe('Component: WallyIcon', () => {
  test.describe('Visual', () => {
    test('Should render basic variant correctly', async ({ page }) => {
      await wallyIconStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all style variants correctly', async ({ page }) => {
      await wallyIconStory.goto(page, 'Styles');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all sizes correctly', async ({ page }) => {
      await wallyIconStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });
  });
});
