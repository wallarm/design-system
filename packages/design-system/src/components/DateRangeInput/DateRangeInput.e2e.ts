import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const dateRangeInputStory = createStoryHelper('inputs-date-daterangeinput', [
  'Basic',
  'With Icon',
  'States',
  'Sizes',
  'Filled',
  'Granularity',
  'Date Order Comparison',
  'Hour Cycle By Context',
  'Read Only',
] as const);

test.describe('Component: DateRangeInput', () => {
  test.describe('Visual', () => {
    test('Should render basic date range input correctly', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with icon and without icon correctly', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'With Icon');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all states correctly', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'States');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render filled date range and datetime range correctly', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Filled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all granularity variants correctly', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Granularity');
      await expect(page).toHaveScreenshot();
    });

    test('Should render day-first and month-first orders side by side', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Date Order Comparison');
      await expect(page).toHaveScreenshot();
    });

    test('Should render 12h and 24h cycles driven by DateFormatProvider', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Hour Cycle By Context');
      await expect(page).toHaveScreenshot();
    });

    test('Should render read-only state without a clear button', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Read Only');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show focus highlight on start segment when clicked', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'States');
      const startDaySegment = page
        .locator('[data-field-type="start"] [data-segment="day"]')
        .first();

      await startDaySegment.click();
      await expect(startDaySegment).toBeFocused();
      await expect(page).toHaveScreenshot();
    });

    test('Should render separator as text arrow between fields', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Filled');
      const separator = page.locator('[data-slot="date-range-group"] > span').first();

      await expect(separator).toHaveText('→');
    });

    test('Should accept typed digits into the start day segment', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'States');
      const startDaySegment = page
        .locator('[data-field-type="start"] [data-segment="day"]')
        .first();

      await startDaySegment.focus();
      await page.keyboard.type('10');

      await expect(startDaySegment).toHaveText('10');
    });

    test('Should not render a clear button in read-only mode', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'Read Only');
      // The clear button is the only click-path to setValue(null) — verifying
      // it's absent guarantees the value can't be wiped by a user click.
      const clearButton = page.locator('[data-slot="date-range-input"] button[type="button"]');
      await expect(clearButton).toHaveCount(0);
    });
  });

  test.describe('Accessibility', () => {
    test('Should move from start to end segments via ArrowRight', async ({ page }) => {
      await dateRangeInputStory.goto(page, 'States');
      const startYearSegment = page
        .locator('[data-field-type="start"] [data-segment="year"]')
        .first();
      const endDaySegment = page.locator('[data-field-type="end"] [data-segment="day"]').first();

      await startYearSegment.focus();
      await page.keyboard.press('ArrowRight');

      await expect(endDaySegment).toBeFocused();
    });
  });
});
