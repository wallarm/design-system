import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const otpInputStory = createStoryHelper('inputs-otpinput', [
  'Basic',
  'Disabled',
  'With Error',
  'Numeric',
  'Masked',
  'With Field',
] as const);

test.describe('Component: OTPInput', () => {
  test.describe('Visual', () => {
    test('Should render basic OTP input correctly', async ({ page }) => {
      await otpInputStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled OTP input correctly', async ({ page }) => {
      await otpInputStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render OTP input with error correctly', async ({ page }) => {
      await otpInputStory.goto(page, 'With Error');
      await expect(page).toHaveScreenshot();
    });

    test('Should render numeric OTP input correctly', async ({ page }) => {
      await otpInputStory.goto(page, 'Numeric');
      await expect(page).toHaveScreenshot();
    });

    test('Should render masked OTP input correctly', async ({ page }) => {
      await otpInputStory.goto(page, 'Masked');
      await expect(page).toHaveScreenshot();
    });

    test('Should render OTP input with field correctly', async ({ page }) => {
      await otpInputStory.goto(page, 'With Field');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should accept input and auto-advance to next cell', async ({ page }) => {
      await otpInputStory.goto(page, 'Basic');
      const inputs = page.getByRole('textbox');

      await inputs.first().click();
      await page.keyboard.type('A');

      await expect(inputs.nth(0)).toHaveValue('A');
      await expect(inputs.nth(1)).toBeFocused();
    });

    test('Should fill all cells when typing sequentially', async ({ page }) => {
      await otpInputStory.goto(page, 'Basic');
      const inputs = page.getByRole('textbox');

      await inputs.first().click();
      await page.keyboard.type('5A1W0B');

      await expect(inputs.nth(0)).toHaveValue('5');
      await expect(inputs.nth(1)).toHaveValue('A');
      await expect(inputs.nth(2)).toHaveValue('1');
      await expect(inputs.nth(3)).toHaveValue('W');
      await expect(inputs.nth(4)).toHaveValue('0');
      await expect(inputs.nth(5)).toHaveValue('B');
    });

    test('Should move focus back on Backspace', async ({ page }) => {
      await otpInputStory.goto(page, 'Basic');
      const inputs = page.getByRole('textbox');

      await inputs.first().click();
      await page.keyboard.type('AB');
      await expect(inputs.nth(2)).toBeFocused();

      await page.keyboard.press('Backspace');
      await expect(inputs.nth(1)).toBeFocused();
    });

    test('Should show focus state when cell is clicked', async ({ page }) => {
      await otpInputStory.goto(page, 'Basic');
      const inputs = page.getByRole('textbox');

      await inputs.first().click();
      await expect(inputs.first()).toBeFocused();
      await expect(page).toHaveScreenshot();
    });

    test('Should not accept input when disabled', async ({ page }) => {
      await otpInputStory.goto(page, 'Disabled');
      const inputs = page.getByRole('textbox');

      await expect(inputs.first()).toBeDisabled();
    });

    test('Should reject non-numeric input in numeric mode', async ({ page }) => {
      await otpInputStory.goto(page, 'Numeric');
      const inputs = page.getByRole('textbox');

      await inputs.first().click();
      await page.keyboard.type('A');

      await expect(inputs.first()).toHaveValue('');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be navigable via keyboard ArrowLeft/ArrowRight', async ({ page }) => {
      await otpInputStory.goto(page, 'Basic');
      const inputs = page.getByRole('textbox');

      await inputs.first().click();
      await page.keyboard.type('A');
      await expect(inputs.nth(1)).toBeFocused();

      await page.keyboard.press('ArrowLeft');
      await expect(inputs.nth(0)).toBeFocused();

      await page.keyboard.press('ArrowRight');
      await expect(inputs.nth(1)).toBeFocused();
    });
  });
});
