import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const toggleButtonStory = createStoryHelper('actions-togglebutton', [
  'Basic',
  'Variants And Colors',
  'Sizes',
  'Disabled',
  'Loading',
  'Icons',
  'Icon Only',
  'Controlled',
] as const);

test.describe('Component: ToggleButton', () => {
  test.describe('Visual', () => {
    test('Should render basic toggle button correctly', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all variant and color combinations correctly', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Variants And Colors');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all sizes correctly', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled states correctly', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading states correctly', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with icons correctly', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render icon-only toggle buttons correctly', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Icon Only');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should toggle active state when clicked', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Basic');
      const button = page.getByTestId('toggle-button');

      await button.click();
      await expect(page).toHaveScreenshot();

      await button.click();
      await expect(page).toHaveScreenshot();
    });

    test('Should show focus ring when focused', async ({ page }) => {
      await toggleButtonStory.goto(page, 'Basic');
      const button = page.getByTestId('toggle-button');
      await button.focus();
      await expect(button).toBeFocused();
      await expect(page).toHaveScreenshot();
    });
  });
});
