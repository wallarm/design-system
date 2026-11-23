import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('data-display-simplecharts-funnel', [
  'Default',
  'All Hues',
  'Rare Hues',
  'Gray Start',
  'Steps By Count',
  'Bigger Later Step',
  'Tiny Step',
  'Long Content',
  'With Delta',
  'Loading',
  'Empty',
  'Dark Theme',
] as const);

test.describe('Component: Funnel', () => {
  // No Selected screenshot: the funnel has no selection state.
  test.describe('Visual', () => {
    test('Should render default correctly', async ({ page }) => {
      await story.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render hovered step correctly', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.getByTestId('funnel--step').first().hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render focused step correctly', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('funnel--step').first()).toBeFocused();
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading correctly', async ({ page }) => {
      await story.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render empty correctly', async ({ page }) => {
      await story.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });

    test('Should render every main hue correctly', async ({ page }) => {
      await story.goto(page, 'All Hues');
      await expect(page).toHaveScreenshot();
    });

    test('Should render every rare hue correctly', async ({ page }) => {
      await story.goto(page, 'Rare Hues');
      await expect(page).toHaveScreenshot();
    });

    test('Should render gray and tint start correctly', async ({ page }) => {
      await story.goto(page, 'Gray Start');
      await expect(page).toHaveScreenshot();
    });

    test('Should render 2 to 6 steps correctly', async ({ page }) => {
      await story.goto(page, 'Steps By Count');
      await expect(page).toHaveScreenshot();
    });

    test('Should render dark theme correctly', async ({ page }) => {
      await story.goto(page, 'Dark Theme');
      await expect(page).toHaveScreenshot();
    });

    test('Should render long content correctly', async ({ page }) => {
      await story.goto(page, 'Long Content');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should run the step action when a step is clicked', async ({ page }) => {
      await story.goto(page, 'Default');
      const log = page.getByTestId('funnel-last-action');
      await expect(log).toHaveText('Last action: none');
      await page.getByTestId('funnel--step').first().click();
      await expect(log).toHaveText('Last action: Detected');
    });
  });

  test.describe('Accessibility', () => {
    // Stands in for an axe run (no axe tooling in this repo's e2e, see HoverCard.e2e.ts): a11y is
    // covered by role/keyboard assertions.
    test('Should be operable via keyboard Tab, Enter and Space', async ({ page }) => {
      await story.goto(page, 'Default');
      const steps = page.getByTestId('funnel--step');
      const log = page.getByTestId('funnel-last-action');

      await page.keyboard.press('Tab');
      await expect(steps.nth(0)).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(log).toHaveText('Last action: Detected');

      await page.keyboard.press('Tab');
      await expect(steps.nth(1)).toBeFocused();
      await page.keyboard.press('Space');
      await expect(log).toHaveText('Last action: Reviewed');
    });

    test('Should be hidden from assistive tech via aria-hidden on the ribbon', async ({ page }) => {
      await story.goto(page, 'Default');
      await expect(page.getByTestId('funnel--ribbon')).toHaveAttribute('aria-hidden', 'true');
    });

    test('Should be exposed as a list via listitem steps', async ({ page }) => {
      await story.goto(page, 'Default');
      const list = page.getByRole('list');
      await expect(list).toHaveCount(1);
      await expect(list.getByRole('listitem')).toHaveCount(3);
    });
  });
});
