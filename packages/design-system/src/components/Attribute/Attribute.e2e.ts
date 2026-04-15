import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const attributeStory = createStoryHelper('data-display-attribute', [
  'Default',
  'WithActions',
] as const);

test.describe('Component: Attribute', () => {
  test.describe('Visual', () => {
    test('Should render default attribute correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render WithActions closed state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render WithActions open state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      await page.getByTestId('attribute-with-actions--target').click();
      await expect(page.locator('[data-scope="menu"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should open menu when target is clicked', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      const target = page.getByTestId('attribute-with-actions--target');
      await expect(target).toBeVisible();
      await target.click();
      await expect(page.locator('[data-scope="menu"][data-part="content"]')).toBeVisible();
    });

    test('Should close menu after selecting an item', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      await page.getByTestId('attribute-with-actions--target').click();
      await page.getByRole('menuitem', { name: 'Copy value' }).click();
      await expect(page.locator('[data-scope="menu"][data-part="content"]')).toBeHidden();
    });
  });

  test.describe('Accessibility', () => {
    test('Target should be keyboard-operable', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      const target = page.getByTestId('attribute-with-actions--target');
      await target.focus();
      await expect(target).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-scope="menu"][data-part="content"]')).toBeVisible();
    });
  });
});
