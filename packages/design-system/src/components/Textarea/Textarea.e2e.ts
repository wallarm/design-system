import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const textareaStory = createStoryHelper('inputs-textarea', [
  'Basic',
  'Sizes',
  'Focused',
  'Disabled',
  'With Value',
  'With Error',
  'Auto Resize',
  'With Footer',
  'With Footer Resizable',
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

    test('Should render auto-resize textarea correctly', async ({ page }) => {
      await textareaStory.goto(page, 'Auto Resize');
      await expect(page).toHaveScreenshot();
    });

    test('Should render textarea with footer correctly', async ({ page }) => {
      await textareaStory.goto(page, 'With Footer');
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

    test('Should not accept input when disabled', async ({ page }) => {
      await textareaStory.goto(page, 'Disabled');
      const textarea = page.locator('textarea');
      await expect(textarea).toBeDisabled();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await textareaStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      const textarea = page.getByTestId('textarea');
      await expect(textarea).toBeFocused();
    });

    test('Should have aria-invalid when in error state', async ({ page }) => {
      await textareaStory.goto(page, 'With Error');
      const textarea = page.locator('textarea');
      await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
