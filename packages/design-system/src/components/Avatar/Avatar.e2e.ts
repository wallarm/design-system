import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const avatarStory = createStoryHelper('data-display-avatar', [
  'Basic',
  'Sizes',
  'Fallback',
  'Custom Icon',
  'Branded',
  'Click To Upload',
  'With Actions',
  'Uploading',
] as const);

// 1×1 transparent PNG — a real image the browser can decode.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

const pick = (page: Page, file: { name: string; mimeType: string; buffer: Buffer }) =>
  page.getByTestId('avatar-upload--hidden-input').setInputFiles(file);

test.describe('Component: Avatar', () => {
  test.describe('Visual', () => {
    for (const story of [
      'Basic',
      'Sizes',
      'Fallback',
      'Custom Icon',
      'Branded',
      'With Actions',
      'Uploading',
    ] as const) {
      test(`Should render ${story.toLowerCase()} correctly`, async ({ page }) => {
        await avatarStory.goto(page, story);
        // The data-URI photo decodes asynchronously; wait until Ark has settled every image
        // (loaded → visible, broken/absent → error), so no screenshot catches a loading frame.
        await page.waitForFunction(() =>
          [...document.querySelectorAll('[data-slot="avatar-image"]')].every(
            img => (img as HTMLImageElement).complete,
          ),
        );
        await expect(page).toHaveScreenshot();
      });
    }

    test('Should render the empty avatar hover state correctly', async ({ page }) => {
      await avatarStory.goto(page, 'Click To Upload');
      await page.getByTestId('avatar-upload--trigger').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the photo hover state correctly', async ({ page }) => {
      await avatarStory.goto(page, 'Click To Upload');
      await pick(page, { name: 'me.png', mimeType: 'image/png', buffer: PNG });
      await expect(page.getByTestId('avatar-upload--trigger--image')).toHaveAttribute(
        'data-state',
        'visible',
      );
      await page.getByTestId('avatar-upload--trigger').hover();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show the picked photo when a file is chosen', async ({ page }) => {
      await avatarStory.goto(page, 'Click To Upload');
      await pick(page, { name: 'me.png', mimeType: 'image/png', buffer: PNG });
      await expect(page.getByTestId('avatar-upload--trigger--image')).toHaveAttribute(
        'data-state',
        'visible',
      );
      await expect(page.getByTestId('avatar-upload--trigger--fallback')).toBeHidden();
    });

    test('Should show an error when a file that is too large is chosen', async ({ page }) => {
      await avatarStory.goto(page, 'Click To Upload');
      await pick(page, {
        name: 'huge.png',
        mimeType: 'image/png',
        buffer: Buffer.alloc(600 * 1024),
      });
      await expect(page.getByTestId('avatar-upload--rejections')).toBeVisible();
    });

    test('Should return to the fallback when remove button is clicked', async ({ page }) => {
      await avatarStory.goto(page, 'With Actions');
      await expect(page.getByTestId('avatar--image')).toHaveAttribute('data-state', 'visible');
      await page.getByTestId('avatar-remove').click();
      await expect(page.getByTestId('avatar--fallback')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable with the overlay shown via Tab key', async ({ page }) => {
      await avatarStory.goto(page, 'Click To Upload');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('avatar-upload--trigger')).toBeFocused();
      await expect(page.getByTestId('avatar-upload--trigger--overlay')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should be focusable over a photo with the wash shown via Tab key', async ({ page }) => {
      await avatarStory.goto(page, 'Click To Upload');
      await pick(page, { name: 'me.png', mimeType: 'image/png', buffer: PNG });
      await expect(page.getByTestId('avatar-upload--trigger--image')).toHaveAttribute(
        'data-state',
        'visible',
      );
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('avatar-upload--trigger')).toBeFocused();
      await expect(page).toHaveScreenshot();
    });
  });
});
