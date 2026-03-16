import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tabsStory = createStoryHelper('navigation-tabs', [
  'Basic',
  'Variants',
  'Icons',
  'Icons Only',
  'Badge',
  'Sizes',
  'Scrollable',
  'Controlled',
  'Disabled',
  'With Separator',
  'With Line Actions',
] as const);

const getTabsTrigger = (page: Page, name: string) => page.getByRole('tab', { name });
const getTabsContent = (page: Page, text: string) => page.getByText(text);

test.describe('Component: Tabs', () => {
  test.describe('Visual', () => {
    test('Should render basic tabs correctly', async ({ page }) => {
      await tabsStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tab variants correctly', async ({ page }) => {
      await tabsStory.goto(page, 'Variants');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tabs with icons correctly', async ({ page }) => {
      await tabsStory.goto(page, 'Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render icon-only tabs correctly', async ({ page }) => {
      await tabsStory.goto(page, 'Icons Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tabs with badges correctly', async ({ page }) => {
      await tabsStory.goto(page, 'Badge');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tab sizes correctly', async ({ page }) => {
      await tabsStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render scrollable tabs correctly', async ({ page }) => {
      await tabsStory.goto(page, 'Scrollable');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled tabs correctly', async ({ page }) => {
      await tabsStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tabs with separator correctly', async ({ page }) => {
      await tabsStory.goto(page, 'With Separator');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tabs with line actions correctly', async ({ page }) => {
      await tabsStory.goto(page, 'With Line Actions');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should switch tab content when tab is clicked', async ({ page }) => {
      await tabsStory.goto(page, 'Basic');
      await expect(getTabsContent(page, 'Content for Tab 1')).toBeVisible();

      await getTabsTrigger(page, 'Tab 2').click();
      await expect(getTabsContent(page, 'Content for Tab 2')).toBeVisible();
      await expect(getTabsContent(page, 'Content for Tab 1')).toBeHidden();

      await getTabsTrigger(page, 'Tab 3').click();
      await expect(getTabsContent(page, 'Content for Tab 3')).toBeVisible();
      await expect(getTabsContent(page, 'Content for Tab 2')).toBeHidden();
    });

    test('Should not switch to disabled tab when clicked', async ({ page }) => {
      await tabsStory.goto(page, 'Disabled');
      await expect(getTabsContent(page, 'Content for Tab 1')).toBeVisible();

      await getTabsTrigger(page, 'Tab 2 (Disabled)').click({ force: true });
      // Content should not change - Tab 1 should still be visible
      await expect(getTabsContent(page, 'Content for Tab 1')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should navigate tabs via ArrowRight key', async ({ page }) => {
      await tabsStory.goto(page, 'Basic');
      await getTabsTrigger(page, 'Tab 1').click();

      await page.keyboard.press('ArrowRight');
      await expect(getTabsTrigger(page, 'Tab 2')).toBeFocused();

      await page.keyboard.press('ArrowRight');
      await expect(getTabsTrigger(page, 'Tab 3')).toBeFocused();
    });

    test('Should navigate tabs via ArrowLeft key', async ({ page }) => {
      await tabsStory.goto(page, 'Basic');
      await getTabsTrigger(page, 'Tab 3').click();

      await page.keyboard.press('ArrowLeft');
      await expect(getTabsTrigger(page, 'Tab 2')).toBeFocused();

      await page.keyboard.press('ArrowLeft');
      await expect(getTabsTrigger(page, 'Tab 1')).toBeFocused();
    });
  });
});
