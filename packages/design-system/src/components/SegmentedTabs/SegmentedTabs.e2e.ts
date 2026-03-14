import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const segmentedTabsStory = createStoryHelper('navigation-segmentedtabs', [
  'Basic',
  'Disabled',
  'With Numeric Badge',
  'With Icons',
  'With Context Action',
  'With Separator',
  'Full Width',
  'Controlled',
] as const);

const getTabTrigger = (page: Page, name: string) =>
  page.locator('[data-scope="tabs"][data-part="trigger"]').filter({ hasText: name });

test.describe('Component: SegmentedTabs', () => {
  test.describe('Visual', () => {
    test('Should render basic segmented tabs correctly', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled segmented tabs correctly', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render segmented tabs with numeric badge correctly', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'With Numeric Badge');
      await expect(page).toHaveScreenshot();
    });

    test('Should render segmented tabs with icons correctly', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'With Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render segmented tabs with context action correctly', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'With Context Action');
      await expect(page).toHaveScreenshot();
    });

    test('Should render segmented tabs with separator correctly', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'With Separator');
      await expect(page).toHaveScreenshot();
    });

    test('Should render full width segmented tabs correctly', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'Full Width');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should switch tab content when tab is clicked', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'Basic');
      await expect(page.getByText('React Content')).toBeVisible();

      await getTabTrigger(page, 'Vue').click();
      await expect(page.getByText('Vue Content')).toBeVisible();
      await expect(page.getByText('React Content')).toBeHidden();

      await getTabTrigger(page, 'Solid').click();
      await expect(page.getByText('Solid Content')).toBeVisible();
      await expect(page.getByText('Vue Content')).toBeHidden();
    });

    test('Should not switch to disabled tab when clicked', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'Disabled');
      // React is default but disabled - it's selected by default
      await expect(page.getByText('React Content')).toBeVisible();

      // Click Vue which is not disabled
      await getTabTrigger(page, 'Vue').click();
      await expect(page.getByText('Vue Content')).toBeVisible();

      // Try to click disabled React tab
      await getTabTrigger(page, 'React').click({ force: true });
      // Vue content should still be visible since React is disabled
      await expect(page.getByText('Vue Content')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should navigate tabs via ArrowRight key', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'Basic');
      await getTabTrigger(page, 'React').click();

      await page.keyboard.press('ArrowRight');
      await expect(getTabTrigger(page, 'Vue')).toBeFocused();
    });

    test('Should navigate tabs via ArrowLeft key', async ({ page }) => {
      await segmentedTabsStory.goto(page, 'Basic');
      await getTabTrigger(page, 'Vue').click();

      await page.keyboard.press('ArrowLeft');
      await expect(getTabTrigger(page, 'React')).toBeFocused();
    });
  });
});
