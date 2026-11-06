import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const dashboardStory = createStoryHelper('templates-security-dashboard', [
  'Default',
  'Loading',
  'No Data',
] as const);

test.describe('Template: Security dashboard', () => {
  test.describe('Visual', () => {
    test('Should render the full dashboard correctly', async ({ page }) => {
      await dashboardStory.goto(page, 'Default');
      await expect(page.getByTestId('threats-table')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await dashboardStory.goto(page, 'Loading');
      await expect(page.getByTestId('threats-table')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the no data state correctly', async ({ page }) => {
      await dashboardStory.goto(page, 'No Data');
      await expect(page.getByTestId('threats-empty')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should update the KPI tiles when the period changes', async ({ page }) => {
      await dashboardStory.goto(page, 'Default');
      const incidents = page.getByTestId('kpi-incidents');
      await expect(incidents).toContainText('vs previous 24 hours');
      await page.getByTestId('dashboard-period').getByText('7 days').click();
      await expect(incidents).toContainText('14');
      await expect(incidents).toContainText('vs previous 7 days');
    });

    test('Should open the row menu of a threat', async ({ page }) => {
      await dashboardStory.goto(page, 'Default');
      const row = page.getByTestId('threats-table--container--row').first();
      await row.hover();
      await row.getByRole('button', { name: 'Actions for atk-7f3a21' }).click();
      const menu = page.getByTestId('threats-row-menu--content');
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('menuitem', { name: 'Block source IP' })).toBeVisible();
    });
  });
});
