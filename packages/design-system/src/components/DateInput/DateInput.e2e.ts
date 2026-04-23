import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const dateInputStory = createStoryHelper('inputs-date-dateinput', [
  'Basic',
  'With Icon',
  'States',
  'Sizes',
  'Filled',
  'Granularity',
  'With Field Components',
  'Date Order Comparison',
] as const);

test.describe('Component: DateInput', () => {
  test.describe('Visual', () => {
    test('Should render basic date input correctly', async ({ page }) => {
      await dateInputStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with icon and without icon correctly', async ({ page }) => {
      await dateInputStory.goto(page, 'With Icon');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all states correctly', async ({ page }) => {
      await dateInputStory.goto(page, 'States');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await dateInputStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render filled date and datetime correctly', async ({ page }) => {
      await dateInputStory.goto(page, 'Filled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all granularity variants correctly', async ({ page }) => {
      await dateInputStory.goto(page, 'Granularity');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with field components correctly', async ({ page }) => {
      await dateInputStory.goto(page, 'With Field Components');
      await expect(page).toHaveScreenshot();
    });

    test('Should render day-first and month-first orders side by side', async ({ page }) => {
      await dateInputStory.goto(page, 'Date Order Comparison');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show focus highlight when a segment is focused', async ({ page }) => {
      await dateInputStory.goto(page, 'States');
      const firstSegment = page.locator('[data-segment="day"]').first();

      await firstSegment.focus();
      await expect(firstSegment).toBeFocused();
      await expect(page).toHaveScreenshot();
    });

    test('Should accept typed digits into the day segment', async ({ page }) => {
      await dateInputStory.goto(page, 'States');
      const daySegment = page.locator('[data-segment="day"]').first();

      await daySegment.focus();
      await page.keyboard.type('15');

      await expect(daySegment).toHaveText('15');
    });

    test('Should render AM/PM segment in uppercase', async ({ page }) => {
      await dateInputStory.goto(page, 'Filled');
      const dayPeriodSegment = page.locator('[data-segment="dayPeriod"]').first();

      await expect(dayPeriodSegment).toHaveText(/^(AM|PM)$/);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await dateInputStory.goto(page, 'States');
      const firstSegment = page.locator('[data-segment]').first();

      await page.keyboard.press('Tab');
      await expect(firstSegment).toBeFocused();
    });

    test('Should move between segments via ArrowRight', async ({ page }) => {
      await dateInputStory.goto(page, 'States');
      const daySegment = page.locator('[data-segment="day"]').first();
      const monthSegment = page.locator('[data-segment="month"]').first();

      await daySegment.focus();
      await page.keyboard.press('ArrowRight');

      await expect(monthSegment).toBeFocused();
    });
  });
});
