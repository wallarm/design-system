import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const sliderStory = createStoryHelper('inputs-slider', [
  'Basic',
  'Range',
  'Ticks',
  'Labeled',
  'With Input',
  'Disabled',
  'In Field',
  'Field With Error',
] as const);

// The inline value Input (the slider's own HiddenInput carries no data-slot="input").
// The root is the layout row now, so scope to it (the old slider-input-row wrapper is gone).
const VALUE_INPUT = '[data-slot="slider"] input[data-slot="input"]';

test.describe('Component: Slider', () => {
  test.describe('Visual', () => {
    test('Should render the basic single-value slider correctly', async ({ page }) => {
      await sliderStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the range slider correctly', async ({ page }) => {
      await sliderStory.goto(page, 'Range');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the discrete ticks correctly', async ({ page }) => {
      await sliderStory.goto(page, 'Ticks');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the labeled scale correctly', async ({ page }) => {
      await sliderStory.goto(page, 'Labeled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with the inline input correctly', async ({ page }) => {
      await sliderStory.goto(page, 'With Input');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the disabled slider correctly', async ({ page }) => {
      await sliderStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render inside a field correctly', async ({ page }) => {
      await sliderStory.goto(page, 'In Field');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the field error state correctly', async ({ page }) => {
      await sliderStory.goto(page, 'Field With Error');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should increase the value when the right arrow key is pressed', async ({ page }) => {
      await sliderStory.goto(page, 'Basic');
      const thumb = page.getByRole('slider');
      await thumb.focus();
      await expect(thumb).toHaveAttribute('aria-valuenow', '50');
      await page.keyboard.press('ArrowRight');
      await expect(thumb).toHaveAttribute('aria-valuenow', '51');
    });

    test('Should jump the nearest thumb when a tick label is clicked', async ({ page }) => {
      await sliderStory.goto(page, 'Labeled');
      const thumb = page.getByRole('slider');
      await expect(thumb).toHaveAttribute('aria-valuenow', '50');
      await page.getByText('High', { exact: true }).click();
      await expect(thumb).toHaveAttribute('aria-valuenow', '100');
      await expect(thumb).toHaveAttribute('aria-valuetext', 'High');
    });

    test('Should sync the slider when the inline input changes', async ({ page }) => {
      await sliderStory.goto(page, 'With Input');
      const thumb = page.getByRole('slider');
      const input = page.locator(VALUE_INPUT);
      await input.fill('30');
      await input.blur();
      await expect(thumb).toHaveAttribute('aria-valuenow', '30');
    });

    test('Should clamp an out-of-range inline input entry to the maximum', async ({ page }) => {
      await sliderStory.goto(page, 'With Input');
      const thumb = page.getByRole('slider');
      const input = page.locator(VALUE_INPUT);
      await input.fill('150');
      await input.blur();
      await expect(thumb).toHaveAttribute('aria-valuenow', '100');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via the Tab key', async ({ page }) => {
      await sliderStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('slider')).toBeFocused();
    });

    test('Should jump to the maximum via the End key', async ({ page }) => {
      await sliderStory.goto(page, 'Basic');
      const thumb = page.getByRole('slider');
      await thumb.focus();
      await page.keyboard.press('End');
      await expect(thumb).toHaveAttribute('aria-valuenow', '100');
    });

    test('Should expose two separately-labelled thumbs for a range', async ({ page }) => {
      await sliderStory.goto(page, 'Range');
      await expect(page.getByRole('slider', { name: 'Minimum' })).toBeVisible();
      await expect(page.getByRole('slider', { name: 'Maximum' })).toBeVisible();
    });

    test('Should announce the ordinal mark label as aria-valuetext', async ({ page }) => {
      await sliderStory.goto(page, 'Labeled');
      await expect(page.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Medium');
    });
  });
});
