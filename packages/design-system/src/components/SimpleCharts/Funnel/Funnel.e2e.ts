import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('data-display-simplecharts-funnel', [
  'Default',
  'Static',
  'Hues',
  'Gray Start',
  'Step Counts',
  'Bigger Later Step',
  'Tiny Step',
  'Long Content',
  'With Delta',
  'Loading',
  'Empty',
  'Dark',
] as const);

test.describe('Component: Funnel', () => {
  // No `Selected` screenshot: the funnel has no selection state.
  test.describe('Visual', () => {
    test('Should render default state correctly', async ({ page }) => {
      await story.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render hover state correctly', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.getByTestId('funnel--step').nth(1).hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render focus state correctly', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('funnel--step').first()).toBeFocused();
      await expect(page).toHaveScreenshot();
    });

    test('Should render every hue correctly', async ({ page }) => {
      await story.goto(page, 'Hues');
      await expect(page).toHaveScreenshot();
    });

    test('Should render gray start correctly', async ({ page }) => {
      await story.goto(page, 'Gray Start');
      await expect(page).toHaveScreenshot();
    });

    test('Should render 2 to 6 steps correctly', async ({ page }) => {
      await story.goto(page, 'Step Counts');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a bigger later step correctly', async ({ page }) => {
      await story.goto(page, 'Bigger Later Step');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a tiny step correctly', async ({ page }) => {
      await story.goto(page, 'Tiny Step');
      await expect(page).toHaveScreenshot();
    });

    test('Should render long content correctly', async ({ page }) => {
      await story.goto(page, 'Long Content');
      await expect(page).toHaveScreenshot();
    });

    test('Should render delta correctly', async ({ page }) => {
      await story.goto(page, 'With Delta');
      await expect(page).toHaveScreenshot();
    });

    test('Should render loading state correctly', async ({ page }) => {
      await story.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });

    test('Should render empty state correctly', async ({ page }) => {
      await story.goto(page, 'Empty');
      await expect(page).toHaveScreenshot();
    });

    test('Should render dark theme correctly', async ({ page }) => {
      await story.goto(page, 'Dark');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should run the step action when its title is clicked', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.getByTestId('funnel--step').nth(1).click();
      await expect(page.getByTestId('funnel-opened')).toHaveText('Opened: Reviewed');
    });

    test('Should not make the ribbon clickable', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.getByTestId('funnel--ribbon').first().click();
      await expect(page.getByTestId('funnel-opened')).toHaveText('Click a step to open its list');
    });

    test('Should give every step the same width', async ({ page }) => {
      await story.goto(page, 'Default');
      const ribbons = page.getByTestId('funnel--ribbon');
      const widths = await ribbons.evaluateAll(nodes =>
        nodes.map(node => node.getBoundingClientRect().width),
      );
      expect(widths).toHaveLength(3);
      for (const width of widths) {
        expect(Math.abs(width - (widths[0] ?? 0))).toBeLessThan(1);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('Should be operable via Enter and Space', async ({ page }) => {
      await story.goto(page, 'Default');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('funnel-opened')).toHaveText('Opened: Detected');

      await page.keyboard.press('Tab');
      await page.keyboard.press(' ');
      await expect(page.getByTestId('funnel-opened')).toHaveText('Opened: Reviewed');
    });

    test('Should be read as a list of buttons via roles', async ({ page }) => {
      await story.goto(page, 'Default');
      const funnel = page.getByTestId('funnel');
      await expect(funnel).toHaveRole('list');
      await expect(funnel.getByRole('listitem')).toHaveCount(3);
      await expect(funnel.getByRole('button')).toHaveCount(3);
      await expect(funnel.getByRole('button').first()).toContainText('Detected');
      await expect(page.getByTestId('funnel--ribbon').first()).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    test('Should be skipped by the keyboard when steps have no action', async ({ page }) => {
      await story.goto(page, 'Static');
      await expect(page.getByTestId('funnel').getByRole('button')).toHaveCount(0);
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('funnel--step').first()).not.toBeFocused();
    });
  });
});
