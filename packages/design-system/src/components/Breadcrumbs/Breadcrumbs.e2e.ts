import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const breadcrumbsStory = createStoryHelper('navigation-breadcrumbs', [
  'Basic',
  'Single Item',
  'With Icons',
  'With Interactive Items',
  'Icons Only',
  'With Truncation',
  'Long Breadcrumbs',
] as const);

test.describe('Component: Breadcrumbs', () => {
  test.describe('Visual', () => {
    test('Should render basic breadcrumbs correctly', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render single item breadcrumbs correctly', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'Single Item');
      await expect(page).toHaveScreenshot();
    });

    test('Should render breadcrumbs with icons correctly', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'With Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render breadcrumbs with interactive items correctly', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'With Interactive Items');
      await expect(page).toHaveScreenshot();
    });

    test('Should render icon-only breadcrumbs correctly', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'Icons Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render breadcrumbs with truncation correctly', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'With Truncation');
      await expect(page).toHaveScreenshot();
    });

    test('Should render long breadcrumbs correctly', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'Long Breadcrumbs');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should expand truncated breadcrumbs when ellipsis is clicked', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'With Truncation');
      // Ellipsis button should be visible (BreadcrumbsEllipsis renders a button with "...")
      const ellipsis = page.getByRole('button', { name: 'Show more breadcrumbs' });
      await expect(ellipsis).toBeVisible();

      await ellipsis.click();

      // After clicking, the hidden levels should be revealed
      await expect(page.getByText('Level 2')).toBeVisible();
      await expect(page.getByText('Level 3')).toBeVisible();
      // Ellipsis should be gone
      await expect(ellipsis).toBeHidden();
    });

    test('Should navigate breadcrumb links correctly', async ({ page }) => {
      await breadcrumbsStory.goto(page, 'Basic');
      const homeLink = page.getByTestId('breadcrumbs').locator('a').filter({ hasText: 'Home' });
      await expect(homeLink).toHaveAttribute('href', '#home');

      const productsLink = page
        .getByTestId('breadcrumbs')
        .locator('a')
        .filter({ hasText: 'Products' });
      await expect(productsLink).toHaveAttribute('href', '#products');
    });
  });
});
