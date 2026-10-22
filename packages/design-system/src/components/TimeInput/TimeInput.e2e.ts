import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const timeInputStory = createStoryHelper('inputs-date-timeinput', [
  'Basic',
  'States',
  'Sizes',
  'Filled',
  'Granularity',
  'Time Dropdown Steps',
  'Read Only',
] as const);

test.describe('Component: TimeInput', () => {
  test.describe('Visual', () => {
    test('Should render basic time input correctly', async ({ page }) => {
      await timeInputStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all states correctly', async ({ page }) => {
      await timeInputStory.goto(page, 'States');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await timeInputStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render filled 12h and 24h correctly', async ({ page }) => {
      await timeInputStory.goto(page, 'Filled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all granularity variants correctly', async ({ page }) => {
      await timeInputStory.goto(page, 'Granularity');
      await expect(page).toHaveScreenshot();
    });

    test('Should render time dropdown steps correctly', async ({ page }) => {
      await timeInputStory.goto(page, 'Time Dropdown Steps');
      await expect(page).toHaveScreenshot();
    });

    test('Should render read-only state without a clear button', async ({ page }) => {
      await timeInputStory.goto(page, 'Read Only');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show focus highlight when hour segment is focused', async ({ page }) => {
      await timeInputStory.goto(page, 'States');
      const hourSegment = page.locator('[data-segment="hour"]').first();

      await hourSegment.focus();
      await expect(hourSegment).toBeFocused();
      await expect(page).toHaveScreenshot();
    });

    test('Should accept typed digits into the hour segment', async ({ page }) => {
      await timeInputStory.goto(page, 'States');
      const hourSegment = page.locator('[data-segment="hour"]').first();

      await hourSegment.focus();
      await page.keyboard.type('09');

      await expect(hourSegment).toHaveText('09');
    });

    test('Should render AM/PM segment in uppercase', async ({ page }) => {
      await timeInputStory.goto(page, 'Filled');
      const dayPeriodSegment = page.locator('[data-segment="dayPeriod"]').first();

      await expect(dayPeriodSegment).toHaveText(/^(AM|PM)$/);
    });

    test('Should open time dropdown when hour segment is focused', async ({ page }) => {
      await timeInputStory.goto(page, 'Time Dropdown Steps');
      const firstHourSegment = page.locator('[data-segment="hour"]').first();

      await firstHourSegment.click();
      const dropdown = page.getByRole('listbox', { name: 'Time selection' }).first();

      await expect(dropdown).toBeVisible();
    });

    test('Should not render a clear button in read-only mode', async ({ page }) => {
      await timeInputStory.goto(page, 'Read Only');
      for (const testId of [
        'time-input-read-only',
        'time-input-read-only-12h',
        'time-input-read-only-24h',
      ]) {
        await expect(page.getByTestId(testId)).toBeVisible();
        await expect(page.getByTestId(testId).locator('button[type="button"]')).toHaveCount(0);
      }
    });

    test('Should not allow focusing segments in read-only mode', async ({ page }) => {
      await timeInputStory.goto(page, 'Read Only');
      const hourSegment = page.getByTestId('time-input-read-only').locator('[data-segment="hour"]');

      await expect(hourSegment).toHaveAttribute('aria-hidden', 'true');
      await expect(hourSegment).not.toHaveAttribute('tabindex', /.*/);

      await hourSegment.focus().catch(() => undefined);
      await expect(hourSegment).not.toBeFocused();
    });
  });

  test.describe('Accessibility', () => {
    test('Should move between segments via ArrowRight', async ({ page }) => {
      await timeInputStory.goto(page, 'States');
      const hourSegment = page.locator('[data-segment="hour"]').first();
      const minuteSegment = page.locator('[data-segment="minute"]').first();

      await hourSegment.focus();
      await page.keyboard.press('ArrowRight');

      await expect(minuteSegment).toBeFocused();
    });
  });
});
