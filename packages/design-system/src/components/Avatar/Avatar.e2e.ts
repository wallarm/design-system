import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const STORIES = [
  'Basic',
  'Sizes',
  'Fallback',
  'Custom Icon',
  'Branded',
  'Click To Upload',
  'With Actions',
  'Uploading',
] as const;

const avatarStory = createStoryHelper('data-display-avatar', STORIES);

// 1×1 opaque PNG (8-bit RGB, no alpha, #4b6cb7) — a real image the browser can decode.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGPwztkOAAJ0AW9BSzkTAAAAAElFTkSuQmCC',
  'base64',
);

type VisualStory = Exclude<(typeof STORIES)[number], 'Click To Upload'>;

// Avatar test ids per story: `photo` images must reach data-state=visible; `broken` ones settle on
// the fallback (image hidden, fallback visible). Loading and error render the same pixels.
const SETTLED: Record<VisualStory, { photo?: string[]; broken?: string[] }> = {
  Basic: { photo: ['avatar'] },
  Sizes: { photo: ['avatar-xs-photo', 'avatar-sm-photo'] },
  Fallback: { broken: ['avatar-broken-initials', 'avatar-broken-icon'] },
  'Custom Icon': {},
  Branded: { photo: ['avatar-branded-photo'] },
  'With Actions': { photo: ['avatar'] },
  Uploading: { photo: ['avatar-upload--trigger'] },
};

const waitForSettledImages = async (page: Page, story: VisualStory) => {
  const { photo = [], broken = [] } = SETTLED[story];
  for (const id of photo) {
    await expect(page.getByTestId(`${id}--image`)).toHaveAttribute('data-state', 'visible');
  }
  for (const id of broken) {
    await expect(page.getByTestId(`${id}--image`)).toHaveAttribute('data-state', 'hidden');
    await expect(page.getByTestId(`${id}--fallback`)).toHaveAttribute('data-state', 'visible');
  }
};

const pick = (page: Page, file: { name: string; mimeType: string; buffer: Buffer }) =>
  page.getByTestId('avatar-upload--hidden-input').setInputFiles(file);

test.describe('Component: Avatar', () => {
  test.describe('Visual', () => {
    for (const story of Object.keys(SETTLED) as VisualStory[]) {
      test(`Should render ${story.toLowerCase()} correctly`, async ({ page }) => {
        await avatarStory.goto(page, story);
        // The data-URI photo decodes asynchronously; wait for Ark's data-state, not img.complete,
        // so no screenshot catches a loading frame.
        await waitForSettledImages(page, story);
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
