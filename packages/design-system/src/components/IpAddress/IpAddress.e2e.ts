import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const EXPECTED_LIST_LENGTH = 4;

const ipAddressStory = createStoryHelper('data-display-ipaddress', [
  'Basic',
  'Multiple Addresses',
] as const);

test.describe('IpAddress Component', () => {
  test('Basic', async ({ page }) => {
    await ipAddressStory.goto(page, 'Basic');
    await expect(page).toHaveScreenshot();
  });

  test('Multiple Addresses - popover open', async ({ page }) => {
    await ipAddressStory.goto(page, 'Multiple Addresses');

    await page.getByText(`+${EXPECTED_LIST_LENGTH} addresses`).click();

    const popover = page.locator('[data-scope="popover"][data-part="content"]');
    await expect(popover).toBeVisible();
    await expect(popover.locator('[data-slot="ip-address"]')).toHaveCount(EXPECTED_LIST_LENGTH);

    await expect(page).toHaveScreenshot();
  });
});
