import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const appShellStory = createStoryHelper('navigation-appshell', ['Basic'] as const);

// ThemeProvider reads the stored Frame style on mount, so seed it before the story loads.
const seedBrandedFrame = (page: Page) =>
  page.addInitScript(() => localStorage.setItem('wasd-frame-style', 'branded'));

// Storybook's theme decorator owns data-theme; flipping it after load is enough for a screenshot.
const switchToDarkTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

test.describe('Component: AppShell', () => {
  test.beforeEach(async ({ page }) => {
    // The Ambient drifts on 60–90 s loops and stills itself under reduced motion.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seedBrandedFrame(page);
  });

  test.describe('Visual', () => {
    test('Should render branded frame correctly', async ({ page }) => {
      await appShellStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render branded frame in dark theme correctly', async ({ page }) => {
      await appShellStory.goto(page, 'Basic');
      await switchToDarkTheme(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should render branded second rail correctly after opening a product', async ({
      page,
    }) => {
      await appShellStory.goto(page, 'Basic');
      // .first(): the rail label comes before any portalled tooltip, and "Overview" also
      // appears in the breadcrumb and page title once the product opens.
      await page.getByText('Edge', { exact: true }).first().click();
      await expect(page.getByText('Overview', { exact: true }).first()).toBeVisible();
      // Park the pointer on the canvas so no rail tooltip is open in the shot.
      await page.mouse.move(800, 400);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });
});
