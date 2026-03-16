import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const fieldStory = createStoryHelper('inputs-field', [
  'Basic',
  'Inputs',
  'Textareas',
  'Fieldset',
  'Switches',
  'Radios',
  'Checkboxes',
  'Number Inputs',
  'Selects',
] as const);

test.describe('Component: Field', () => {
  test.describe('Visual', () => {
    test('Should render basic form layout correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render input fields correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Inputs');
      await expect(page).toHaveScreenshot();
    });

    test('Should render textarea fields correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Textareas');
      await expect(page).toHaveScreenshot();
    });

    test('Should render fieldset correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Fieldset');
      await expect(page).toHaveScreenshot();
    });

    test('Should render switch fields correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Switches');
      await expect(page).toHaveScreenshot();
    });

    test('Should render radio fields correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Radios');
      await expect(page).toHaveScreenshot();
    });

    test('Should render checkbox fields correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Checkboxes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render number input fields correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Number Inputs');
      await expect(page).toHaveScreenshot();
    });

    test('Should render select fields correctly', async ({ page }) => {
      await fieldStory.goto(page, 'Selects');
      await expect(page).toHaveScreenshot();
    });
  });
});
