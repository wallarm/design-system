import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const paginationStory = createStoryHelper('navigation-pagination', [
  'Full',
  'Simple',
  'LinksOnly',
  'WithPageSize',
  'Sizes',
  'Alignment',
  'ManyPages',
  'Playground',
] as const);

test.describe('Component: Pagination', () => {
  test.describe('Visual', () => {
    test('Should render full pagination correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Full');
      await expect(page).toHaveScreenshot();
    });

    test('Should render simple pagination correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Simple');
      await expect(page).toHaveScreenshot();
    });

    test('Should render links-only pagination correctly', async ({ page }) => {
      await paginationStory.goto(page, 'LinksOnly');
      await expect(page).toHaveScreenshot();
    });

    test('Should render rows-per-page control correctly', async ({ page }) => {
      await paginationStory.goto(page, 'WithPageSize');
      await expect(page).toHaveScreenshot();
    });

    test('Should render medium and small sizes correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render alignments correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Alignment');
      await expect(page).toHaveScreenshot();
    });

    test('Should render many pages with ellipsis correctly', async ({ page }) => {
      await paginationStory.goto(page, 'ManyPages');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the interactive playground correctly', async ({ page }) => {
      await paginationStory.goto(page, 'Playground');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should navigate to next page when Next button is clicked', async ({ page }) => {
      await paginationStory.goto(page, 'Playground');
      await page.getByRole('button', { name: /next/i }).click();
      // Ark sets aria-label="page N" on PaginationItem — use that accessible name
      await expect(page.getByRole('button', { name: /page 2/i })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    test('Should disable Previous button when on the first page', async ({ page }) => {
      await paginationStory.goto(page, 'Playground');
      await expect(page.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    test('Should change the page size when a new option is selected', async ({ page }) => {
      await paginationStory.goto(page, 'Playground');
      // There is only one combobox in this story (the page-size select)
      const pageSizeSelect = page.getByRole('combobox');
      await pageSizeSelect.click();
      await page.getByRole('option', { name: '50' }).click();
      await expect(pageSizeSelect).toHaveText(/50/);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be navigable via navigation landmark', async ({ page }) => {
      await paginationStory.goto(page, 'Full');
      await expect(page.getByRole('navigation', { name: 'Search results' })).toBeVisible();
    });
  });
});
