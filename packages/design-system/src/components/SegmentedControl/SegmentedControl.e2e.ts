import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const segmentedControlStory = createStoryHelper('inputs-segmentedcontrol', [
  'Basic',
  'Disabled',
  'Icons',
  'Icon Only',
  'More Button',
  'Many',
  'Badge',
  'Full Width',
  'Controlled',
  'Form Field',
] as const);

const getSegmentItem = (page: Page, name: string) =>
  page.locator('[data-scope="segment-group"][data-part="item"]', { hasText: name });

test.describe('Component: SegmentedControl', () => {
  test.describe('Visual', () => {
    test('Should render basic segmented control correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled segmented control correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render segmented control with icons correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render icon-only segmented control correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Icon Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render segmented control with more button correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'More Button');
      await expect(page).toHaveScreenshot();
    });

    test('Should render many items segmented control correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Many');
      await expect(page).toHaveScreenshot();
    });

    test('Should render segmented control with badges correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Badge');
      await expect(page).toHaveScreenshot();
    });

    test('Should render full width segmented control correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Full Width');
      await expect(page).toHaveScreenshot();
    });

    test('Should render segmented control in form field correctly', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Form Field');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should switch segment when item is clicked', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Basic');
      const headersItem = getSegmentItem(page, 'Headers');
      await expect(headersItem).toHaveAttribute('data-state', 'checked');

      const parametersItem = getSegmentItem(page, 'Parameters');
      await parametersItem.click();
      await expect(parametersItem).toHaveAttribute('data-state', 'checked');
      await expect(headersItem).toHaveAttribute('data-state', 'unchecked');

      const schemaItem = getSegmentItem(page, 'Schema');
      await schemaItem.click();
      await expect(schemaItem).toHaveAttribute('data-state', 'checked');
      await expect(parametersItem).toHaveAttribute('data-state', 'unchecked');
    });

    test('Should not switch to disabled segment when clicked', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Disabled');
      const activeItem = getSegmentItem(page, 'Active');
      await expect(activeItem).toHaveAttribute('data-state', 'checked');

      const disabledItem = getSegmentItem(page, 'Disabled');
      await disabledItem.click({ force: true });
      await expect(activeItem).toHaveAttribute('data-state', 'checked');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await segmentedControlStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      const firstItem = getSegmentItem(page, 'Headers');
      await expect(firstItem).toBeFocused();
    });
  });
});
