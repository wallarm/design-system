import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const EXPECTED_LIST_LENGTH = 4;

const ipStory = createStoryHelper('data-display-ip', [
  'Basic',
  'Horizontal Multiple',
  'Vertical Multiple',
] as const);

test.describe('Ip Component', () => {
  test('Basic', async ({ page }) => {
    await ipStory.goto(page, 'Basic');
    await expect(page).toHaveScreenshot();
  });

  test('Vertical Multiple - popover open', async ({ page }) => {
    await ipStory.goto(page, 'Vertical Multiple');

    await page.getByText(`+${EXPECTED_LIST_LENGTH} addresses`).click();

    const popover = page.locator('[data-scope="popover"][data-part="content"]');
    await expect(popover).toBeVisible();
    await expect(popover.locator('[data-slot="ip-address"]')).toHaveCount(EXPECTED_LIST_LENGTH);

    await expect(page).toHaveScreenshot();
  });

  test('Horizontal Multiple', async ({ page }) => {
    await ipStory.goto(page, 'Horizontal Multiple');
    await expect(page).toHaveScreenshot();
  });

  test('Horizontal Multiple - popover open', async ({ page }) => {
    await ipStory.goto(page, 'Horizontal Multiple');

    const trigger = page.getByTestId('horizontal-ips-overflow-trigger');
    await trigger.click();

    const popover = page.locator('[data-scope="popover"][data-part="content"]');
    await expect(popover).toBeVisible();

    await expect(page).toHaveScreenshot();
  });
});
