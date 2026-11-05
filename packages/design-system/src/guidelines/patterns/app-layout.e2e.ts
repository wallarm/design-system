import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const appLayoutStory = createStoryHelper('patterns-application-layout', [
  'Default',
  'Home',
  'Grouped Product',
  'Settings Section',
  'Drill Down',
  'Loading',
] as const);

test.describe('Pattern: Application layout', () => {
  test.beforeEach(async ({ page }) => {
    // Settle the shell's motion-aware transitions before the screenshots.
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test.describe('Visual', () => {
    test('Should render a standalone product correctly', async ({ page }) => {
      await appLayoutStory.goto(page, 'Default');
      await expect(page.getByTestId('sessions-table--container--row')).toHaveCount(4);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the home page correctly', async ({ page }) => {
      await appLayoutStory.goto(page, 'Home');
      await expect(page.getByTestId('home-page')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render a grouped product correctly', async ({ page }) => {
      await appLayoutStory.goto(page, 'Grouped Product');
      await expect(page.getByTestId('replay-table--container--row')).toHaveCount(2);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the settings section correctly', async ({ page }) => {
      await appLayoutStory.goto(page, 'Settings Section');
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(3);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the drill-down level correctly', async ({ page }) => {
      await appLayoutStory.goto(page, 'Drill Down');
      await expect(page.getByTestId('services-table--container--row')).toHaveCount(3);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await appLayoutStory.goto(page, 'Loading');
      await expect(page.getByTestId('nav-rail--skeleton')).toBeVisible();
      await expect(page.getByTestId('product-shell--panel')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should move the active item and the trail when a panel item is clicked', async ({
      page,
    }) => {
      await appLayoutStory.goto(page, 'Default');
      const panel = page.getByTestId('product-shell--panel');
      await panel.getByText('Attacks', { exact: true }).click();
      await expect(panel.locator('[aria-current="page"]')).toHaveText('Attacks');
      await expect(page.getByTestId('product-shell--breadcrumb')).toContainText('Attacks');
    });

    test('Should expand a group when its label is clicked', async ({ page }) => {
      await appLayoutStory.goto(page, 'Default');
      const panel = page.getByTestId('product-shell--panel');
      await expect(panel.getByText('API Discovery', { exact: true })).toBeHidden();
      await panel.getByRole('button', { name: 'API Security' }).click();
      await expect(panel.getByText('API Discovery', { exact: true })).toBeVisible();
    });

    test('Should show the parent level without navigating when back is clicked', async ({
      page,
    }) => {
      await appLayoutStory.goto(page, 'Drill Down');
      const panel = page.getByTestId('product-shell--panel');
      await panel.getByRole('button', { name: 'Data planes' }).click();
      await expect(panel.getByText('Dashboards', { exact: true })).toBeVisible();
      await expect(page.getByTestId('product-shell--breadcrumb')).toContainText('Services');
    });
  });
});
