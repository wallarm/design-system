import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const numberInputStory = createStoryHelper('inputs-numberinput', [
  'Basic',
  'Disabled',
  'With Value',
  'With Error',
] as const);

test.describe('Component: NumberInput', () => {
  test.describe('Visual', () => {
    test('Should render basic number input correctly', async ({ page }) => {
      await numberInputStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled number input correctly', async ({ page }) => {
      await numberInputStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render number input with value correctly', async ({ page }) => {
      await numberInputStory.goto(page, 'With Value');
      await expect(page).toHaveScreenshot();
    });

    test('Should render number input with error correctly', async ({ page }) => {
      await numberInputStory.goto(page, 'With Error');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should increment value when increment button is clicked', async ({ page }) => {
      await numberInputStory.goto(page, 'Basic');
      const root = page.getByTestId('number-input');
      const input = root.locator('input');
      const incrementButton = root.locator('[data-part="increment-trigger"]');

      await expect(input).toHaveValue('0');
      await incrementButton.click();
      await expect(input).toHaveValue('1');
    });

    test('Should decrement value when decrement button is clicked', async ({ page }) => {
      await numberInputStory.goto(page, 'Basic');
      const root = page.getByTestId('number-input');
      const input = root.locator('input');
      const decrementButton = root.locator('[data-part="decrement-trigger"]');

      await expect(input).toHaveValue('0');
      await decrementButton.click();
      await expect(input).toHaveValue('-1');
    });
  });
});
