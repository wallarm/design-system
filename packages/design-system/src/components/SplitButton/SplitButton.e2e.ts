import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const splitButtonStory = createStoryHelper('actions-splitbutton', [
  'Default',
  'Variants',
  'Sizes',
  'Content',
  'With Popover',
] as const);

test.describe('Component: SplitButton', () => {
  test.describe('Visual', () => {
    test('Should render default split button correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all variant combinations correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'Variants');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all sizes correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all content variations correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'Content');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with popover trigger correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'With Popover');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should allow clicking each button independently', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default');
      const splitButton = page.getByTestId('split-button');
      await expect(splitButton).toBeVisible();

      const buttons = splitButton.getByRole('button');
      await expect(buttons).toHaveCount(2);
      await buttons.first().click();
      await buttons.last().click();
    });

    test('Should show focus ring when buttons are focused', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default');
      const splitButton = page.getByTestId('split-button');
      const buttons = splitButton.getByRole('button');

      await buttons.first().focus();
      await expect(buttons.first()).toBeFocused();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Accessibility', () => {
    test('Should have group role', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default');
      const group = page.getByTestId('split-button');
      await expect(group).toHaveRole('group');
    });

    test('Should support keyboard navigation between buttons', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default');
      const splitButton = page.getByTestId('split-button');
      const buttons = splitButton.getByRole('button');

      await buttons.first().focus();
      await expect(buttons.first()).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(buttons.last()).toBeFocused();
    });
  });
});
