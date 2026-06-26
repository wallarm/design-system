import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const calendarStory = createStoryHelper('inputs-date-calendar', [
  'Single',
  'Range',
  'Range With Presets',
  'Range With Input',
  'Range Full Featured',
  'Single With Input',
  'Single With Date Time',
  'Single With Presets',
  'Single Readonly',
  'Range Readonly',
  'Range Readonly With Presets',
] as const);

/** Open the calendar popover by clicking the trigger button. */
async function openCalendar(page: Page): Promise<void> {
  // Ark UI's DatePicker.Trigger forces aria-label="Open calendar", overriding
  // the visible button text — selecting by data-part is more stable.
  await page.locator('[data-scope="date-picker"][data-part="trigger"]').first().click();
  // Popover animates in — wait for the grid to appear.
  await expect(
    page.locator('[data-scope="date-picker"][data-part="content"]').first(),
  ).toBeVisible();
}

test.describe('Component: Calendar', () => {
  test.describe('Visual', () => {
    test('Should render single readonly calendar correctly', async ({ page }) => {
      await calendarStory.goto(page, 'Single Readonly');
      await expect(page).toHaveScreenshot();
    });

    test('Should render range readonly calendar correctly', async ({ page }) => {
      await calendarStory.goto(page, 'Range Readonly');
      await expect(page).toHaveScreenshot();
    });

    test('Should render range readonly with presets correctly', async ({ page }) => {
      await calendarStory.goto(page, 'Range Readonly With Presets');
      await expect(page).toHaveScreenshot();
    });

    test('Should render single calendar when opened', async ({ page }) => {
      await calendarStory.goto(page, 'Single');
      await openCalendar(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render range calendar when opened', async ({ page }) => {
      await calendarStory.goto(page, 'Range');
      await openCalendar(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render range calendar with presets when opened', async ({ page }) => {
      await calendarStory.goto(page, 'Range With Presets');
      await openCalendar(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render range calendar with input header when opened', async ({ page }) => {
      await calendarStory.goto(page, 'Range With Input');
      await openCalendar(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render full-featured range calendar when opened', async ({ page }) => {
      await calendarStory.goto(page, 'Range Full Featured');
      await openCalendar(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render single calendar with input header when opened', async ({ page }) => {
      await calendarStory.goto(page, 'Single With Input');
      await openCalendar(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render single calendar with presets when opened', async ({ page }) => {
      await calendarStory.goto(page, 'Single With Presets');
      await openCalendar(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render single calendar with datetime input header when opened', async ({
      page,
    }) => {
      await calendarStory.goto(page, 'Single With Date Time');
      await openCalendar(page);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open popover when trigger is clicked', async ({ page }) => {
      await calendarStory.goto(page, 'Single');
      const content = page.locator('[data-scope="date-picker"][data-part="content"]');
      await expect(content).toBeHidden();

      await openCalendar(page);
      await expect(content.first()).toBeVisible();
    });

    test('Should not make readOnly segments tabbable', async ({ page }) => {
      await calendarStory.goto(page, 'Single Readonly');
      // In readOnly mode segment spans are aria-hidden and carry no segmentProps,
      // so none of them should be focusable.
      const focusableSegments = page.locator('[data-segment][tabindex="0"]');
      await expect(focusableSegments).toHaveCount(0);
    });
  });

  test.describe('Accessibility', () => {
    test('Should render month/year header correctly', async ({ page }) => {
      await calendarStory.goto(page, 'Single Readonly');
      // Readonly calendar with fixed defaultValue (Jan 2025) — header should show "January" + "2025".
      const popover = page.locator('[data-scope="date-picker"][data-part="content"]').first();
      await expect(popover).toContainText('January');
      await expect(popover).toContainText('2025');
    });
  });
});
