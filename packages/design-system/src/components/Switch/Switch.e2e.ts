import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const switchStory = createStoryHelper('inputs-switch', [
  'Basic',
  'Checked',
  'Disabled',
  'With Description',
  'Multiple',
  'Accessibility Mode',
] as const);

test.describe('Component: Switch', () => {
  test.describe('Visual', () => {
    test('Should render basic switch correctly', async ({ page }) => {
      await switchStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render checked switch correctly', async ({ page }) => {
      await switchStory.goto(page, 'Checked');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled switches correctly', async ({ page }) => {
      await switchStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render switch with description correctly', async ({ page }) => {
      await switchStory.goto(page, 'With Description');
      await expect(page).toHaveScreenshot();
    });

    test('Should render multiple switches correctly', async ({ page }) => {
      await switchStory.goto(page, 'Multiple');
      await expect(page).toHaveScreenshot();
    });

    test('Should render accessibility mode correctly', async ({ page }) => {
      await switchStory.goto(page, 'Accessibility Mode');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should toggle on when clicked', async ({ page }) => {
      await switchStory.goto(page, 'Basic');
      const switchEl = page.getByTestId('switch');
      await expect(switchEl).toHaveAttribute('data-state', 'unchecked');

      await switchEl.click();
      await expect(switchEl).toHaveAttribute('data-state', 'checked');
    });

    test('Should toggle off when clicked again', async ({ page }) => {
      await switchStory.goto(page, 'Basic');
      const switchEl = page.getByTestId('switch');

      await switchEl.click();
      await expect(switchEl).toHaveAttribute('data-state', 'checked');

      await switchEl.click();
      await expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be toggleable via keyboard Space key', async ({ page }) => {
      await switchStory.goto(page, 'Basic');
      const switchEl = page.getByTestId('switch');

      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
      await expect(switchEl).toHaveAttribute('data-state', 'checked');
    });
  });
});
