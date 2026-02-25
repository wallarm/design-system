import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const countryStory = createStoryHelper('data-display-country', [
  'Basic',
  'Sizes',
  'Flag Only',
  'Name Only',
  'Examples',
] as const);

test.describe('Country Component', () => {
  test('Sizes', async ({ page }) => {
    await countryStory.goto(page, 'Sizes');
    await expect(page).toHaveScreenshot();
  });

  test('Flag only', async ({ page }) => {
    await countryStory.goto(page, 'Flag Only');
    await expect(page).toHaveScreenshot();
  });

  test('Name only', async ({ page }) => {
    await countryStory.goto(page, 'Name Only');
    await expect(page).toHaveScreenshot();
  });

  test('Examples - multiple countries', async ({ page }) => {
    await countryStory.goto(page, 'Examples');
    await expect(page).toHaveScreenshot();
  });
});
