import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const inventoryStory = createStoryHelper('templates-api-inventory', [
  'Default',
  'Nothing Selected',
  'Load Error',
  'Loading',
] as const);

test.describe('Template: API inventory', () => {
  test.describe('Visual', () => {
    test('Should render the selected endpoint correctly', async ({ page }) => {
      await inventoryStory.goto(page, 'Default');
      await expect(page.getByTestId('api-inventory-parameters')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the empty inspector correctly', async ({ page }) => {
      await inventoryStory.goto(page, 'Nothing Selected');
      await expect(page.getByTestId('api-inventory-inspector-empty')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the load error correctly', async ({ page }) => {
      await inventoryStory.goto(page, 'Load Error');
      await expect(page.getByTestId('api-inventory-error')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await inventoryStory.goto(page, 'Loading');
      await expect(page.getByTestId('api-inventory-parameters')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open an endpoint in the inspector when its tree row is clicked', async ({
      page,
    }) => {
      await inventoryStory.goto(page, 'Default');
      await page
        .getByTestId('api-inventory-endpoint-auth-login-post')
        .getByText('/oauth/token')
        .click();
      await expect(page.getByTestId('api-inventory-title')).toHaveText('/oauth/token');
    });

    test('Should collapse a host when its tree row is clicked', async ({ page }) => {
      await inventoryStory.goto(page, 'Default');
      const host = page.getByTestId('api-inventory-host-host-api');
      await host.getByText('api.shop-demo.io').click();
      await expect(host).toHaveAttribute('aria-expanded', 'false');
    });

    test('Should show no results and reset when the search matches nothing', async ({ page }) => {
      await inventoryStory.goto(page, 'Default');
      await page.getByTestId('api-inventory-search').getByRole('textbox').fill('zzz');
      const noResults = page.getByTestId('api-inventory-no-results');
      await expect(noResults).toBeVisible();
      await noResults.getByRole('button', { name: 'Reset filters' }).click();
      await expect(page.getByTestId('api-inventory-tree')).toBeVisible();
    });
  });
});
