import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('charts-funnel', [
  'Default',
  'Colors',
  'Gray Start',
  'Steps By Count',
  'Bigger Later Step',
  'Tiny Step',
  'Long Content',
  'With Delta',
  'Loading',
  'Empty',
  'Dark Theme',
  'Entrance',
] as const);

// The bands grow in on mount (CSS keyframes) and dimming fades over 150ms. Force
// `prefers-reduced-motion: reduce` so both are off and every screenshot shows the final state.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

// The cell's labels carry the dimming (the cell itself keeps the tint and focus ring).
const stepLabel = (page: Page, index: number) =>
  page.getByTestId('funnel--step').nth(index).locator('> span').first();

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

    test('Should render every color correctly', async ({ page }) => {
      await story.goto(page, 'Colors');
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
    test('Should dim the other steps while a step is hovered', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.getByTestId('funnel--step').nth(1).hover();
      await expect(stepLabel(page, 0)).toHaveCSS('opacity', '0.3');
      await expect(stepLabel(page, 1)).toHaveCSS('opacity', '1');
      await expect(stepLabel(page, 2)).toHaveCSS('opacity', '0.3');
    });

    test('Should dim the other steps when hovering the band under a step', async ({ page }) => {
      await story.goto(page, 'Default');
      const ribbon = await page.getByTestId('funnel--ribbon').boundingBox();
      if (!ribbon) throw new Error('ribbon not laid out');
      // Centre of the third column, inside the band: the whole column is the hover zone.
      await page.mouse.move(ribbon.x + (ribbon.width * 5) / 6, ribbon.y + ribbon.height / 2);
      await expect(stepLabel(page, 2)).toHaveCSS('opacity', '1');
      await expect(stepLabel(page, 0)).toHaveCSS('opacity', '0.3');
    });

    test('Should bring every step back when the pointer leaves the funnel', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.getByTestId('funnel--step').first().hover();
      await expect(stepLabel(page, 1)).toHaveCSS('opacity', '0.3');
      await page.mouse.move(0, 0);
      for (const i of [0, 1, 2]) await expect(stepLabel(page, i)).toHaveCSS('opacity', '1');
    });

    test('Should dim the other steps on keyboard focus', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.keyboard.press('Tab');
      await expect(stepLabel(page, 0)).toHaveCSS('opacity', '1');
      await expect(stepLabel(page, 1)).toHaveCSS('opacity', '0.3');
    });

    test('Should draw the funnel when the data arrives', async ({ page }) => {
      await story.goto(page, 'Entrance');
      await expect(page.getByTestId('funnel-skeleton')).toBeVisible();
      await page.getByTestId('funnel-load').click();
      await expect(page.getByTestId('funnel--ribbon')).toBeVisible();
      await expect(page.getByTestId('funnel--step')).toHaveCount(3);
    });

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
