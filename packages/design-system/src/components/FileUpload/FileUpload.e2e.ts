import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const fileUploadStory = createStoryHelper('inputs-fileupload', [
  'Basic',
  'Button Trigger',
  'In Field',
  'Multiple',
  'Single File Chosen',
  'With Description',
  'Uploading',
  'Validation',
  'Disabled',
  'Read Only',
  'Stored File',
  'Long File Name',
  'Form Submission',
] as const);

const file = (name: string, size = 16) => ({
  name,
  mimeType: 'application/octet-stream',
  buffer: Buffer.alloc(size),
});

const pick = (page: Page, ...files: ReturnType<typeof file>[]) =>
  page.getByTestId('file-upload--hidden-input').setInputFiles(files);

test.describe('Component: FileUpload', () => {
  test.describe('Visual', () => {
    test('Should render the drop area correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the drop area hover state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      await page.getByTestId('file-upload--dropzone').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the drag-over state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      const dataTransfer = await page.evaluateHandle(() => {
        const dt = new DataTransfer();
        dt.items.add(new File(['x'], 'dragged.wasm'));
        return dt;
      });
      await page.getByTestId('file-upload--dropzone').dispatchEvent('dragover', { dataTransfer });
      await expect(page.getByTestId('file-upload--dropzone')).toHaveAttribute('data-dragging', '');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the button trigger correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Button Trigger');
      await expect(page).toHaveScreenshot();
    });

    test('Should render inside a field with label and description correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'In Field');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a list of files correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Multiple');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a chosen single file with the picker hidden correctly', async ({
      page,
    }) => {
      await fileUploadStory.goto(page, 'Single File Chosen');
      await expect(page.getByTestId('file-upload--dropzone')).toHaveCount(0);
      await expect(page).toHaveScreenshot();
    });

    test('Should render an item with a description correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'With Description');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the uploading state with a locked picker correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Uploading');
      await expect(page.getByTestId('file-upload--dropzone')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      await expect(page).toHaveScreenshot();
    });

    test('Should render the rejected state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Validation');
      await pick(page, file('policy.txt'));
      await expect(page.getByTestId('file-upload--error')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the disabled state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the read-only state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Read Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a stored file row correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Stored File');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a truncated long file name with its tooltip correctly', async ({
      page,
    }) => {
      await fileUploadStory.goto(page, 'Long File Name');
      const name = page.getByTestId('file-upload--item-name');
      await name.hover();
      // OverflowTooltipTrigger only starts measuring on the first pointer-enter,
      // so nudge the pointer once more inside the element.
      const box = await name.boundingBox();
      if (!box) throw new Error('item name has no bounding box');
      await page.mouse.move(box.x + 5, box.y + 5);
      await page.mouse.move(box.x + 6, box.y + 5);
      await expect(page.getByRole('tooltip')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the row action tooltip correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Multiple');
      await page.getByTestId('file-upload--item-replace-trigger').first().hover();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toHaveText('Replace');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should list a file when it is picked', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      await pick(page, file('policy.wasm'));
      await expect(page.getByTestId('file-upload--item-name')).toHaveText('policy.wasm');
      await expect(page.getByTestId('file-upload--dropzone')).toHaveCount(0);
    });

    test('Should list a file when it is dropped', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      const dataTransfer = await page.evaluateHandle(() => {
        const dt = new DataTransfer();
        dt.items.add(new File(['x'], 'dropped.wasm'));
        return dt;
      });
      await page.getByTestId('file-upload--dropzone').dispatchEvent('drop', { dataTransfer });
      await expect(page.getByTestId('file-upload--item-name')).toHaveText('dropped.wasm');
    });

    test('Should reject a file when its type is not accepted', async ({ page }) => {
      await fileUploadStory.goto(page, 'Validation');
      await pick(page, file('policy.txt'));
      await expect(page.getByTestId('file-upload--error')).toHaveText(
        'policy.txt — Not a .so / .dylib file',
      );
      await expect(page.getByTestId('file-upload--item')).toHaveCount(0);
    });

    test('Should reject a file when it is over the size limit', async ({ page }) => {
      await fileUploadStory.goto(page, 'Validation');
      await pick(page, file('big.so', 40 * 1024));
      await expect(page.getByTestId('file-upload--error')).toHaveText(
        'big.so — Too large: 40 KB; the limit is 32 KB',
      );
    });

    test('Should remove a file when delete is clicked', async ({ page }) => {
      await fileUploadStory.goto(page, 'Multiple');
      await page.getByTestId('file-upload--item-delete-trigger').first().click();
      await expect(page.getByTestId('file-upload--item')).toHaveCount(1);
      await expect(page.getByTestId('file-upload--item-name')).toHaveText('headers.lua');
    });

    test('Should swap the file when replace is used in single mode', async ({ page }) => {
      await fileUploadStory.goto(page, 'Single File Chosen');
      const chooser = page.waitForEvent('filechooser');
      await page.getByTestId('file-upload--item-replace-trigger').click();
      await (await chooser).setFiles(file('replacement.wasm'));
      await expect(page.getByTestId('file-upload--item-name')).toHaveText('replacement.wasm');
    });

    test('Should submit the held file with the form when saved', async ({ page }) => {
      await fileUploadStory.goto(page, 'Form Submission');
      await pick(page, file('artifact.so', 2048));
      await page.getByTestId('submit').click();
      await expect(page.getByTestId('submitted')).toHaveText('Submitted: artifact.so (2 KB)');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be operable via keyboard on the drop area', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('file-upload--dropzone')).toBeFocused();
      const chooser = page.waitForEvent('filechooser');
      await page.keyboard.press('Enter');
      await chooser;
    });

    test('Should be named by the field label via aria-labelledby', async ({ page }) => {
      await fileUploadStory.goto(page, 'In Field');
      await expect(
        page.getByRole('button', { name: 'WASM module * Choose a .wasm module or drop it here' }),
      ).toBeVisible();
    });

    test('Should be reachable via keyboard for row actions', async ({ page }) => {
      await fileUploadStory.goto(page, 'Single File Chosen');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('file-upload--item-replace-trigger')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('file-upload--item-delete-trigger')).toBeFocused();
    });
  });
});
