import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('data-display-simplecharts-horizontalbarstack', [
  'Default',
  'No Delta',
  'No Value',
  'With Remainder',
  'Legend Off',
  'Palette',
  'Selectable',
  'Loading',
] as const);

test.describe('HorizontalBarStack', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await story.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('With Remainder', async ({ page }) => {
      await story.goto(page, 'With Remainder');
      await expect(page).toHaveScreenshot();
    });

    test('Legend Off', async ({ page }) => {
      await story.goto(page, 'Legend Off');
      await expect(page).toHaveScreenshot();
    });

    test('Loading', async ({ page }) => {
      await story.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('interactive legend items show the filter-affordance tooltip', async ({ page }) => {
      await story.goto(page, 'Selectable');
      const items = page.getByTestId('horizontal-bar-stack--legend-item');
      // A non-selected item invites filtering...
      await items.filter({ hasText: 'High' }).hover();
      await expect(page.getByText('Click to filter')).toBeVisible();
      // ...the active/selected one offers to clear it.
      await items.filter({ hasText: 'Critical' }).hover();
      await expect(page.getByText('Remove filter')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('legend mirrors the bar; bar is aria-hidden by default', async ({ page }) => {
      await story.goto(page, 'Default');
      const bar = page.getByTestId('horizontal-bar-stack--bar');
      await expect(bar).toHaveAttribute('aria-hidden', 'true');
      await expect(page.getByTestId('horizontal-bar-stack--legend-item')).toHaveCount(3);
    });

    test('bar is a named image (role + aria-label) when the legend is hidden', async ({ page }) => {
      await story.goto(page, 'Legend Off');
      const bar = page.getByTestId('horizontal-bar-stack--bar');
      await expect(bar).toHaveRole('img');
      await expect(bar).toHaveAttribute('aria-label', /Critical 42/);
      await expect(page.getByTestId('horizontal-bar-stack--legend')).toHaveCount(0);
    });

    test('Should announce the skeleton loading state', async ({ page }) => {
      await story.goto(page, 'Loading');
      const skeleton = page.locator('[data-slot=horizontal-bar-stack-skeleton]');
      await expect(skeleton).toHaveAttribute('aria-busy', 'true');
      await expect(skeleton).toHaveAttribute('aria-live', 'polite');
      await expect(
        page.locator('[data-slot=horizontal-bar-stack-skeleton-legend-item]'),
      ).toHaveCount(3);
    });
  });
});
