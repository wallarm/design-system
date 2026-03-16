import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const headingStory = createStoryHelper('typography-heading', [
  'Basic',
  'Sizes',
  'Weights',
  'As Child',
  'Polymorphic Elements',
  'As Span',
  'As Div',
] as const);

test.describe('Component: Heading', () => {
  test.describe('Visual', () => {
    test('Should render basic heading correctly', async ({ page }) => {
      await headingStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await headingStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all weight variants correctly', async ({ page }) => {
      await headingStory.goto(page, 'Weights');
      await expect(page).toHaveScreenshot();
    });

    test('Should render as child element correctly', async ({ page }) => {
      await headingStory.goto(page, 'As Child');
      await expect(page).toHaveScreenshot();
    });

    test('Should render polymorphic elements correctly', async ({ page }) => {
      await headingStory.goto(page, 'Polymorphic Elements');
      await expect(page).toHaveScreenshot();
    });

    test('Should render as inline span correctly', async ({ page }) => {
      await headingStory.goto(page, 'As Span');
      await expect(page).toHaveScreenshot();
    });

    test('Should render as div element correctly', async ({ page }) => {
      await headingStory.goto(page, 'As Div');
      await expect(page).toHaveScreenshot();
    });
  });
});
