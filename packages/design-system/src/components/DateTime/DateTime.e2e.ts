import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const dateTimeStory = createStoryHelper('data-display-datetime', [
  'Relative',
  'Date Format',
  'Datetime Format',
  'With Description',
  'Null Value',
  'Future Date',
] as const);

test.describe('Component: DateTime', () => {
  test.describe('Visual', () => {
    test('Should render date format correctly', async ({ page }) => {
      await dateTimeStory.goto(page, 'Date Format');
      await expect(page).toHaveScreenshot();
    });

    test('Should render datetime format correctly', async ({ page }) => {
      await dateTimeStory.goto(page, 'Datetime Format');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with description correctly', async ({ page }) => {
      await dateTimeStory.goto(page, 'With Description');
      await expect(page).toHaveScreenshot();
    });

    test('Should render null value correctly', async ({ page }) => {
      await dateTimeStory.goto(page, 'Null Value');
      await expect(page).toHaveScreenshot();
    });
  });
});
