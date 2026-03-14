import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const selectStory = createStoryHelper('inputs-select', [
  'Basic',
  'Different Buttons',
  'Multiple',
  'Multiple With Icons',
  'Grouped',
  'Disabled',
  'Loading',
  'With Select Input',
  'With Separator',
  'With Icons',
  'With Footer',
  'With Search',
  'With Form Field',
  'With Tags',
] as const);

test.describe('Component: Select', () => {
  test.describe('Visual', () => {
    test('Should render basic select correctly', async ({ page }) => {
      await selectStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render different button variants correctly', async ({ page }) => {
      await selectStory.goto(page, 'Different Buttons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render multiple select correctly', async ({ page }) => {
      await selectStory.goto(page, 'Multiple');
      await expect(page).toHaveScreenshot();
    });

    test('Should render multiple select with icons correctly', async ({ page }) => {
      await selectStory.goto(page, 'Multiple With Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render grouped select correctly', async ({ page }) => {
      await selectStory.goto(page, 'Grouped');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled select correctly', async ({ page }) => {
      await selectStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading select correctly', async ({ page }) => {
      await selectStory.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render select with input correctly', async ({ page }) => {
      await selectStory.goto(page, 'With Select Input');
      await expect(page).toHaveScreenshot();
    });

    test('Should render select with separator correctly', async ({ page }) => {
      await selectStory.goto(page, 'With Separator');
      await expect(page).toHaveScreenshot();
    });

    test('Should render select with icons correctly', async ({ page }) => {
      await selectStory.goto(page, 'With Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render select with footer correctly', async ({ page }) => {
      await selectStory.goto(page, 'With Footer');
      await expect(page).toHaveScreenshot();
    });

    test('Should render select with search correctly', async ({ page }) => {
      await selectStory.goto(page, 'With Search');
      await expect(page).toHaveScreenshot();
    });

    test('Should render select with form field correctly', async ({ page }) => {
      await selectStory.goto(page, 'With Form Field');
      await expect(page).toHaveScreenshot();
    });

    test('Should render select with tags correctly', async ({ page }) => {
      await selectStory.goto(page, 'With Tags');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open dropdown when trigger is clicked', async ({ page }) => {
      await selectStory.goto(page, 'Basic');
      const select = page.getByTestId('select');
      const trigger = select.locator('[data-part="trigger"]');

      await trigger.click();

      const content = page.locator('[data-scope="select"][data-part="content"]').first();
      await expect(content).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should select an option when option is clicked', async ({ page }) => {
      await selectStory.goto(page, 'Basic');
      const select = page.getByTestId('select');
      const trigger = select.locator('[data-part="trigger"]');

      await trigger.click();

      const option = page.locator('[data-part="item"]').filter({ hasText: 'React' });
      await option.click();

      await expect(trigger).toHaveText(/React/);
    });
  });
});
