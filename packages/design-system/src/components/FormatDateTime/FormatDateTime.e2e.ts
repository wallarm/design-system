import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const formatDateTimeStory = createStoryHelper('data-display-formatdatetime', [
  'Relative',
  'Date Format',
  'Datetime Format',
  'With Description',
  'Null Value',
  'Future Date',
] as const);

test.describe('Component: FormatDateTime', () => {
  test.describe('Visual', () => {
    test('Should render date format correctly', async ({ page }) => {
      await formatDateTimeStory.goto(page, 'Date Format');
      await expect(page).toHaveScreenshot();
    });

    test('Should render datetime format correctly', async ({ page }) => {
      await formatDateTimeStory.goto(page, 'Datetime Format');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with description correctly', async ({ page }) => {
      await formatDateTimeStory.goto(page, 'With Description');
      await expect(page).toHaveScreenshot();
    });

    test('Should render null value correctly', async ({ page }) => {
      await formatDateTimeStory.goto(page, 'Null Value');
      await expect(page).toHaveScreenshot();
    });
  });
});
