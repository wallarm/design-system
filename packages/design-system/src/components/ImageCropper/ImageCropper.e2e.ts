import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const cropperStory = createStoryHelper('inputs-imagecropper', [
  'Avatar',
  'Landscape',
  'With File Upload',
  'Controlled',
  'Geometry',
] as const);

const waitForImage = async (page: Page) => {
  await expect(page.getByTestId('cropper-save')).toBeEnabled();
};

const readResult = async (page: Page) => {
  const image = page.getByTestId('cropper-result');
  await expect(image).toBeVisible();
  return image.evaluate(async node => {
    if (!(node instanceof HTMLImageElement)) throw new Error('Expected a saved image');
    await node.decode();
    const canvas = document.createElement('canvas');
    canvas.width = node.naturalWidth;
    canvas.height = node.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    context.drawImage(node, 0, 0);
    const pixel = (x: number, y: number) =>
      Array.from(
        context.getImageData(Math.floor(canvas.width * x), Math.floor(canvas.height * y), 1, 1)
          .data,
      );
    return {
      width: canvas.width,
      height: canvas.height,
      topLeft: pixel(0.25, 0.25),
      topRight: pixel(0.75, 0.25),
      bottomLeft: pixel(0.25, 0.75),
    };
  });
};

const save = async (page: Page) => {
  const result = page.getByTestId('cropper-result');
  const oldSrc = (await result.count()) ? await result.getAttribute('src') : null;
  await page.getByTestId('cropper-save').click();
  await expect(page.getByTestId('cropper-result')).toBeVisible();
  if (oldSrc) await expect(page.getByTestId('cropper-result')).not.toHaveAttribute('src', oldSrc);
  return readResult(page);
};

test.describe('Component: ImageCropper', () => {
  test.describe('Visual', () => {
    test('Should render the rounded avatar crop correctly', async ({ page }) => {
      await cropperStory.goto(page, 'Avatar');
      await waitForImage(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the rectangular landscape crop correctly', async ({ page }) => {
      await cropperStory.goto(page, 'Landscape');
      await waitForImage(page);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should export the centered landscape crop at exact dimensions without stretching', async ({
      page,
    }) => {
      await cropperStory.goto(page, 'Geometry');
      await waitForImage(page);
      const image = await page.getByTestId('cropper--image').boundingBox();
      expect(image).not.toBeNull();
      expect(image!.width / image!.height).toBeCloseTo(2);
      expect(await save(page)).toEqual({
        width: 64,
        height: 64,
        topLeft: [0, 255, 0, 255],
        topRight: [0, 0, 255, 255],
        bottomLeft: [0, 255, 0, 255],
      });
    });

    test('Should export the moved region when the image is dragged', async ({ page }) => {
      await cropperStory.goto(page, 'Geometry');
      await waitForImage(page);
      const selection = await page.getByTestId('cropper--selection').boundingBox();
      expect(selection).not.toBeNull();
      const x = selection!.x + selection!.width / 2;
      const y = selection!.y + selection!.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 40, y, { steps: 5 });
      await page.mouse.up();
      const result = await save(page);
      expect(result.topLeft).toEqual([255, 0, 0, 255]);
      expect(result.topRight).toEqual([0, 255, 0, 255]);
    });

    test('Should export the zoomed region without empty margins when dragged past the image edge', async ({
      page,
    }) => {
      await cropperStory.goto(page, 'Geometry');
      await waitForImage(page);
      const thumb = page.getByTestId('cropper-zoom--thumb');
      await thumb.focus();
      await page.keyboard.press('End');
      await expect(thumb).toHaveAttribute('aria-valuenow', '4');
      const selection = await page.getByTestId('cropper--selection').boundingBox();
      expect(selection).not.toBeNull();
      const x = selection!.x + selection!.width / 2;
      const y = selection!.y + selection!.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 500, y + 200, { steps: 5 });
      await page.mouse.up();
      const result = await save(page);
      expect(result.topLeft).toEqual([255, 0, 0, 255]);
      expect(result.topRight).toEqual([255, 0, 0, 255]);
      expect(result.bottomLeft).toEqual([255, 0, 0, 255]);
    });

    test('Should reset transforms and preserve portrait proportions when the source changes', async ({
      page,
    }) => {
      await cropperStory.goto(page, 'Geometry');
      await waitForImage(page);
      await page.getByTestId('cropper-zoom--thumb').focus();
      await page.keyboard.press('End');
      await expect(page.getByTestId('cropper-zoom--thumb')).toHaveAttribute('aria-valuenow', '4');
      await page.getByTestId('cropper-replace').click();
      await waitForImage(page);
      await expect(page.getByTestId('cropper-zoom--thumb')).toHaveAttribute('aria-valuenow', '1');
      const image = await page.getByTestId('cropper--image').boundingBox();
      expect(image).not.toBeNull();
      expect(image!.width / image!.height).toBeCloseTo(0.5);
      const result = await save(page);
      expect(result.topLeft).toEqual([0, 255, 0, 255]);
      expect(result.bottomLeft).toEqual([0, 0, 255, 255]);
    });

    test('Should upscale a crop to the requested output dimensions', async ({ page }) => {
      await cropperStory.goto(page, 'Avatar');
      await waitForImage(page);
      const result = await save(page);
      expect([result.width, result.height]).toEqual([256, 256]);
    });

    test('Should export a rectangular file with the requested aspect ratio', async ({ page }) => {
      await cropperStory.goto(page, 'Landscape');
      await waitForImage(page);
      const result = await save(page);
      expect([result.width, result.height]).toEqual([320, 180]);
    });

    test('Should recover from an unreadable file and crop a new local image', async ({ page }) => {
      await cropperStory.goto(page, 'With File Upload');
      await waitForImage(page);
      const input = page.getByTestId('cropper-upload--hidden-input');
      await input.setInputFiles({
        name: 'broken.png',
        mimeType: 'image/png',
        buffer: Buffer.from('not an image'),
      });
      await expect(page.getByRole('alert')).toContainText('could not be opened');
      await expect(page.getByTestId('cropper-save')).toBeDisabled();

      const png = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 40;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable');
        context.fillStyle = '#800080';
        context.fillRect(0, 0, 80, 40);
        const data = canvas.toDataURL('image/png').split(',')[1];
        if (!data) throw new Error('Canvas encoding returned no image data');
        return data;
      });
      await input.setInputFiles({
        name: 'purple.png',
        mimeType: 'image/png',
        buffer: Buffer.from(png, 'base64'),
      });
      await waitForImage(page);
      await expect(page.getByRole('alert')).toHaveCount(0);
      const result = await save(page);
      expect([result.width, result.height]).toEqual([256, 256]);
      expect(result.topLeft).toEqual([128, 0, 128, 255]);
    });

    test('Should keep the output aspect ratio when the viewport shrinks', async ({ page }) => {
      await cropperStory.goto(page, 'Landscape');
      await waitForImage(page);
      await page.setViewportSize({ width: 240, height: 600 });
      await waitForImage(page);
      await expect(async () => {
        const frame = await page.getByTestId('cropper--selection').boundingBox();
        expect(frame).not.toBeNull();
        expect(frame!.width).toBeLessThan(240);
        expect(frame!.width / frame!.height).toBeCloseTo(320 / 180, 1);
      }).toPass();
      const result = await save(page);
      expect([result.width, result.height]).toEqual([320, 180]);
    });
  });

  test.describe('Accessibility', () => {
    test('Should focus the crop on click and move the image with arrow keys', async ({ page }) => {
      await cropperStory.goto(page, 'Geometry');
      await waitForImage(page);
      const selection = page.getByTestId('cropper--selection');
      await selection.click();
      await expect(selection).toBeFocused();
      await expect(selection).toHaveAccessibleName('Crop image');
      for (let step = 0; step < 4; step += 1) await selection.press('Shift+ArrowRight');
      const result = await save(page);
      expect(result.topLeft).toEqual([255, 0, 0, 255]);
      expect(result.topRight).toEqual([0, 255, 0, 255]);
    });

    test('Should announce the changed image position when panned with the keyboard', async ({
      page,
    }) => {
      await cropperStory.goto(page, 'Geometry');
      await waitForImage(page);
      const selection = page.getByTestId('cropper--selection');
      await selection.focus();
      const initialPosition = await selection.getAttribute('aria-valuetext');
      expect(initialPosition).toBeTruthy();
      await selection.press('Shift+ArrowRight');
      await expect(selection).not.toHaveAttribute('aria-valuetext', initialPosition!);
    });

    test('Should synchronize controlled zoom with keyboard input', async ({ page }) => {
      await cropperStory.goto(page, 'Controlled');
      await waitForImage(page);
      const thumb = page.getByTestId('cropper-zoom--thumb');
      await expect(thumb).toHaveAccessibleName('Zoom image');
      await expect(thumb).toHaveAttribute('aria-valuenow', '1.5');
      await thumb.focus();
      await page.keyboard.press('ArrowRight');
      await expect(thumb).toHaveAttribute('aria-valuenow', '1.6');
      await page.getByTestId('cropper--selection').focus();
      await page.keyboard.press('+');
      await expect(thumb).toHaveAttribute('aria-valuenow', '1.7');
    });

    test('Should preserve the controlled zoom and position when the consumer rejects changes', async ({
      page,
    }) => {
      await cropperStory.goto(page, 'Controlled');
      await waitForImage(page);
      const thumb = page.getByTestId('cropper-zoom--thumb');
      const image = page.getByTestId('cropper--image');
      const before = await image.boundingBox();
      expect(before).not.toBeNull();
      await page.getByTestId('cropper-lock-zoom').click();
      await thumb.focus();
      await thumb.press('Home');
      await page.getByTestId('cropper--selection').focus();
      await page.keyboard.press('+');
      const frame = await page.getByTestId('cropper--frame').boundingBox();
      expect(frame).not.toBeNull();
      await page.mouse.move(frame!.x + frame!.width * 0.75, frame!.y + frame!.height * 0.25);
      await page.mouse.wheel(0, -100);
      // Wait for the next paint so a rejected wheel change cannot hide behind a pending React update.
      await page.evaluate(
        () =>
          new Promise<void>(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      await expect(thumb).toHaveAttribute('aria-valuenow', '1.5');
      expect(await image.boundingBox()).toEqual(before);
    });
  });
});
