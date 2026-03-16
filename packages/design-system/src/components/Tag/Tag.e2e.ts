import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tagStory = createStoryHelper('status-indication-tag', [
  'Basic',
  'Sizes',
  'Disabled',
  'Closable',
  'Selectable',
  'With Icons',
  'With On Click',
] as const);

test.describe('Component: Tag', () => {
  test.describe('Visual', () => {
    test('Should render basic tag correctly', async ({ page }) => {
      await tagStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await tagStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled state correctly', async ({ page }) => {
      await tagStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render closable tag correctly', async ({ page }) => {
      await tagStory.goto(page, 'Closable');
      await expect(page).toHaveScreenshot();
    });

    test('Should render selectable tag correctly', async ({ page }) => {
      await tagStory.goto(page, 'Selectable');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tags with icons correctly', async ({ page }) => {
      await tagStory.goto(page, 'With Icons');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should dismiss tag when close button is clicked', async ({ page }) => {
      await tagStory.goto(page, 'Closable');

      const tag = page.getByTestId('tag');
      await expect(tag).toBeVisible();

      const closeButton = page.getByTestId('tag--close');
      await closeButton.click();

      await expect(tag).toBeHidden();
    });
  });
});
