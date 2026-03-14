import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const buttonStory = createStoryHelper('actions-button', [
  'Basic',
  'Variants',
  'Sizes',
  'Disabled',
  'Loading',
  'Icons',
  'Badge',
  'Icon Only',
  'Link As Button',
  'Full Width',
] as const);

test.describe('Component: Button', () => {
  test.describe('Visual', () => {
    test('Should render basic button correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all variant and color combinations correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Variants');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all sizes correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled states correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading states correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with icons correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with badge correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Badge');
      await expect(page).toHaveScreenshot();
    });

    test('Should render icon-only buttons correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Icon Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render link as button correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Link As Button');
      await expect(page).toHaveScreenshot();
    });

    test('Should render full width button correctly', async ({ page }) => {
      await buttonStory.goto(page, 'Full Width');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should be clickable when enabled', async ({ page }) => {
      await buttonStory.goto(page, 'Basic');
      const button = page.getByTestId('button');
      await expect(button).toBeVisible();
      await button.click();
    });

    test('Should show focus ring when focused', async ({ page }) => {
      await buttonStory.goto(page, 'Basic');
      const button = page.getByTestId('button');
      await button.focus();
      await expect(button).toBeFocused();
      await expect(page).toHaveScreenshot();
    });
  });
});
