import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const inputGroupStory = createStoryHelper('inputs-inputgroup', [
  'Basic',
  'Disabled',
  'With Error',
  'With Loader',
  'With Kbd',
  'With Tooltip',
  'With Select',
] as const);

test.describe('Component: InputGroup', () => {
  test.describe('Visual', () => {
    test('Should render basic input group correctly', async ({ page }) => {
      await inputGroupStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled input group correctly', async ({ page }) => {
      await inputGroupStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render input group with error correctly', async ({ page }) => {
      await inputGroupStory.goto(page, 'With Error');
      await expect(page).toHaveScreenshot();
    });

    test('Should render input group with loader correctly', async ({ page }) => {
      await inputGroupStory.goto(page, 'With Loader');
      await expect(page).toHaveScreenshot();
    });

    test('Should render input group with kbd correctly', async ({ page }) => {
      await inputGroupStory.goto(page, 'With Kbd');
      await expect(page).toHaveScreenshot();
    });

    test('Should render input group with tooltip correctly', async ({ page }) => {
      await inputGroupStory.goto(page, 'With Tooltip');
      await expect(page).toHaveScreenshot();
    });

    test('Should render input group with select correctly', async ({ page }) => {
      await inputGroupStory.goto(page, 'With Select');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should accept text input when typed into', async ({ page }) => {
      await inputGroupStory.goto(page, 'Basic');
      const inputGroup = page.getByTestId('input-group');
      const input = inputGroup.locator('[data-slot="input"]');

      await input.fill('Hello World');
      await expect(input).toHaveValue('Hello World');
    });

    test('Should show focus state when input is focused', async ({ page }) => {
      await inputGroupStory.goto(page, 'Basic');
      const inputGroup = page.getByTestId('input-group');
      const input = inputGroup.locator('[data-slot="input"]');

      await input.click();
      await expect(input).toBeFocused();
      await expect(page).toHaveScreenshot();
    });
  });
});
