import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const formatNumberStory = createStoryHelper('data-display-formatnumber', [
  'Compact',
  'Standard',
  'With Unit',
  'Percent',
  'Bytes',
  'Negative Values',
  'Null Value',
  'Special Values',
] as const);

test.describe('Component: FormatNumber', () => {
  test.describe('Visual', () => {
    test('Should render compact notation correctly', async ({ page }) => {
      await formatNumberStory.goto(page, 'Compact');
      await expect(page).toHaveScreenshot();
    });

    test('Should render standard notation correctly', async ({ page }) => {
      await formatNumberStory.goto(page, 'Standard');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with unit correctly', async ({ page }) => {
      await formatNumberStory.goto(page, 'With Unit');
      await expect(page).toHaveScreenshot();
    });

    test('Should render percent values correctly', async ({ page }) => {
      await formatNumberStory.goto(page, 'Percent');
      await expect(page).toHaveScreenshot();
    });

    test('Should render byte values correctly', async ({ page }) => {
      await formatNumberStory.goto(page, 'Bytes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render negative values correctly', async ({ page }) => {
      await formatNumberStory.goto(page, 'Negative Values');
      await expect(page).toHaveScreenshot();
    });

    test('Should render null value correctly', async ({ page }) => {
      await formatNumberStory.goto(page, 'Null Value');
      await expect(page).toHaveScreenshot();
    });

    test('Should render special values correctly', async ({ page }) => {
      await formatNumberStory.goto(page, 'Special Values');
      await expect(page).toHaveScreenshot();
    });
  });
});
