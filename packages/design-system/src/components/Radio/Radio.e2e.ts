import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const radioStory = createStoryHelper('inputs-radio', ['Basic', 'Card', 'Form Field'] as const);

test.describe('Component: Radio', () => {
  test.describe('Visual', () => {
    test('Should render basic radio group correctly', async ({ page }) => {
      await radioStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render card variant correctly', async ({ page }) => {
      await radioStory.goto(page, 'Card');
      await expect(page).toHaveScreenshot();
    });

    test('Should render form field correctly', async ({ page }) => {
      await radioStory.goto(page, 'Form Field');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should select a different option when clicked', async ({ page }) => {
      await radioStory.goto(page, 'Basic');
      const reactRadio = page.getByTestId('radio-react');

      // Initially Svelte is selected, React is not
      await expect(reactRadio).toHaveAttribute('data-state', 'unchecked');

      await reactRadio.click();
      await expect(reactRadio).toHaveAttribute('data-state', 'checked');
    });
  });
});
