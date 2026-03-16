import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const textareaStory = createStoryHelper('inputs-textarea', [
  'Basic',
  'Sizes',
  'Focused',
  'Disabled',
  'With Value',
  'With Error',
] as const);

test.describe('Component: Textarea', () => {
  test.describe('Visual', () => {
    test('Should render basic textarea correctly', async ({ page }) => {
      await textareaStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all sizes correctly', async ({ page }) => {
      await textareaStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render focused textarea correctly', async ({ page }) => {
      await textareaStory.goto(page, 'Focused');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled textarea correctly', async ({ page }) => {
      await textareaStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render textarea with value correctly', async ({ page }) => {
      await textareaStory.goto(page, 'With Value');
      await expect(page).toHaveScreenshot();
    });

    test('Should render textarea with error correctly', async ({ page }) => {
      await textareaStory.goto(page, 'With Error');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should accept text input when typed into', async ({ page }) => {
      await textareaStory.goto(page, 'Basic');
      const textarea = page.getByTestId('textarea');
      await textarea.fill('Hello World\nMultiple lines');
      await expect(textarea).toHaveValue('Hello World\nMultiple lines');
    });

    test('Should show focus state when clicked', async ({ page }) => {
      await textareaStory.goto(page, 'Basic');
      const textarea = page.getByTestId('textarea');
      await textarea.click();
      await expect(textarea).toBeFocused();
      await expect(page).toHaveScreenshot();
    });
  });
});
