import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const formatDurationStory = createStoryHelper('data-display-formatduration', [
  'Units',
  'Truncated',
  'Iso Duration',
  'Null Value',
  'Inherit Typography',
] as const);

test.describe('Component: FormatDuration', () => {
  test.describe('Visual', () => {
    test('Should render units correctly', async ({ page }) => {
      await formatDurationStory.goto(page, 'Units');
      await expect(page).toHaveScreenshot();
    });

    test('Should render truncated durations correctly', async ({ page }) => {
      await formatDurationStory.goto(page, 'Truncated');
      await expect(page).toHaveScreenshot();
    });

    test('Should render ISO durations correctly', async ({ page }) => {
      await formatDurationStory.goto(page, 'Iso Duration');
      await expect(page).toHaveScreenshot();
    });

    test('Should render null value correctly', async ({ page }) => {
      await formatDurationStory.goto(page, 'Null Value');
      await expect(page).toHaveScreenshot();
    });

    test('Should render inherited typography correctly', async ({ page }) => {
      await formatDurationStory.goto(page, 'Inherit Typography');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show the exact duration on hover', async ({ page }) => {
      await formatDurationStory.goto(page, 'Truncated');
      await page.getByTestId('duration-truncated').hover();
      await expect(page.getByRole('tooltip')).toHaveText('1h 4m 30s');
      await expect(page).toHaveScreenshot();
    });
  });
});
