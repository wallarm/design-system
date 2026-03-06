import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const EXPECTED_LIST_LENGTH = 4;

const ipStory = createStoryHelper('data-display-ip', ['Basic', 'Multiple Addresses'] as const);

test.describe('Ip Component', () => {
  test('Basic', async ({ page }) => {
    await ipStory.goto(page, 'Basic');
    await expect(page).toHaveScreenshot();
  });

  test('Multiple Addresses - popover open', async ({ page }) => {
    await ipStory.goto(page, 'Multiple Addresses');

    await page.getByText(`+${EXPECTED_LIST_LENGTH} addresses`).click();

    const popover = page.locator('[data-scope="popover"][data-part="content"]');
    await expect(popover).toBeVisible();
    await expect(popover.locator('[data-slot="ip-address"]')).toHaveCount(EXPECTED_LIST_LENGTH);

    await expect(page).toHaveScreenshot();
  });
});
