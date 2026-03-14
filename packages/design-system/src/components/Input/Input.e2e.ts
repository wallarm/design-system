import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const inputStory = createStoryHelper('inputs-input', [
  'Basic',
  'Focused',
  'Disabled',
  'With Value',
  'With Error',
] as const);

test.describe('Component: Input', () => {
  test.describe('Visual', () => {
    test('Should render basic input correctly', async ({ page }) => {
      await inputStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render focused input correctly', async ({ page }) => {
      await inputStory.goto(page, 'Focused');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled input correctly', async ({ page }) => {
      await inputStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render input with value correctly', async ({ page }) => {
      await inputStory.goto(page, 'With Value');
      await expect(page).toHaveScreenshot();
    });

    test('Should render input with error correctly', async ({ page }) => {
      await inputStory.goto(page, 'With Error');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should accept text input when typed into', async ({ page }) => {
      await inputStory.goto(page, 'Basic');
      const input = page.getByTestId('input');
      await input.fill('Hello World');
      await expect(input).toHaveValue('Hello World');
    });

    test('Should show focus state when clicked', async ({ page }) => {
      await inputStory.goto(page, 'Basic');
      const input = page.getByTestId('input');
      await input.click();
      await expect(input).toBeFocused();
      await expect(page).toHaveScreenshot();
    });
  });
});
