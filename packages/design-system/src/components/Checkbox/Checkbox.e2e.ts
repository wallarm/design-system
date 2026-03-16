import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const checkboxStory = createStoryHelper('inputs-checkbox', [
  'Basic',
  'Checked',
  'Indeterminate',
  'Disabled',
  'With Description',
  'Group',
  'Card',
  'Form Field',
] as const);

test.describe('Component: Checkbox', () => {
  test.describe('Visual', () => {
    test('Should render basic checkbox correctly', async ({ page }) => {
      await checkboxStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render checked checkbox correctly', async ({ page }) => {
      await checkboxStory.goto(page, 'Checked');
      await expect(page).toHaveScreenshot();
    });

    test('Should render indeterminate checkbox correctly', async ({ page }) => {
      await checkboxStory.goto(page, 'Indeterminate');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled checkboxes correctly', async ({ page }) => {
      await checkboxStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render checkbox with description correctly', async ({ page }) => {
      await checkboxStory.goto(page, 'With Description');
      await expect(page).toHaveScreenshot();
    });

    test('Should render checkbox group correctly', async ({ page }) => {
      await checkboxStory.goto(page, 'Group');
      await expect(page).toHaveScreenshot();
    });

    test('Should render card variant correctly', async ({ page }) => {
      await checkboxStory.goto(page, 'Card');
      await expect(page).toHaveScreenshot();
    });

    test('Should render form field correctly', async ({ page }) => {
      await checkboxStory.goto(page, 'Form Field');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should toggle checked state when clicked', async ({ page }) => {
      await checkboxStory.goto(page, 'Basic');
      const checkbox = page.getByTestId('checkbox');
      await expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      await checkbox.click();
      await expect(checkbox).toHaveAttribute('data-state', 'checked');

      await checkbox.click();
      await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be toggleable via keyboard Space key', async ({ page }) => {
      await checkboxStory.goto(page, 'Basic');
      const checkbox = page.getByTestId('checkbox');

      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
      await expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });
});
