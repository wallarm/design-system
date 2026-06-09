import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';
import type { BannerColor } from './Banner';

const bannerStory = createStoryHelper('messaging-banner', [
  'All Colors',
  'With Description',
  'With Inline Link',
  'Long Text',
  'With Actions',
  'Closable',
  'No Icon',
] as const);

const getBanners = (page: Page) => page.getByRole('status');
const getBannerByColor = (page: Page, color: BannerColor) =>
  page.getByRole('status').and(page.locator(`[data-color="${color}"]`));

test.describe('Banner Component', () => {
  test.describe('View', () => {
    test('All color variants', async ({ page }) => {
      await bannerStory.goto(page, 'All Colors');
      await expect(page).toHaveScreenshot();
    });

    test('With description', async ({ page }) => {
      await bannerStory.goto(page, 'With Description');
      await expect(page).toHaveScreenshot();
    });

    test('With inline link', async ({ page }) => {
      await bannerStory.goto(page, 'With Inline Link');
      await expect(page).toHaveScreenshot();
    });

    test('Long text clamped to two lines', async ({ page }) => {
      await bannerStory.goto(page, 'Long Text');
      await expect(page).toHaveScreenshot();
    });

    test('With actions', async ({ page }) => {
      await bannerStory.goto(page, 'With Actions');
      await expect(page).toHaveScreenshot();
    });

    test('Without icon', async ({ page }) => {
      await bannerStory.goto(page, 'No Icon');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Inline Link', () => {
    test('Inline link is rendered and clickable', async ({ page }) => {
      await bannerStory.goto(page, 'With Inline Link');

      const link = getBannerByColor(page, 'warning').getByRole('link', {
        name: 'Learn more',
      });
      await expect(link).toBeVisible();
      await link.click();
    });
  });

  test.describe('Close Button', () => {
    test.beforeEach(async ({ page }) => {
      await bannerStory.goto(page, 'Closable');
    });

    test('Close button - view', async ({ page }) => {
      await expect(page).toHaveScreenshot();
    });

    test('Close button - clicked dismisses banner', async ({ page }) => {
      const banner = getBannerByColor(page, 'primary');
      await expect(banner).toBeVisible();

      await banner.getByRole('button', { name: 'close' }).click();

      await expect(getBanners(page)).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Show banner' })).toBeVisible();
    });

    test('Close button - keyboard accessible', async ({ page }) => {
      const banner = getBannerByColor(page, 'primary');
      const closeButton = banner.getByRole('button', { name: 'close' });
      await closeButton.focus();
      await expect(closeButton).toBeFocused();

      await page.keyboard.press('Enter');

      await expect(getBanners(page)).toHaveCount(0);
    });
  });

  test.describe('Actions', () => {
    test('Action buttons are clickable', async ({ page }) => {
      await bannerStory.goto(page, 'With Actions');

      const banner = getBannerByColor(page, 'destructive');
      const renewButton = banner.getByRole('button', { name: 'Renew' });
      await expect(renewButton).toBeEnabled();
      await renewButton.click();
    });
  });
});
