import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('ai-wallyskeleton', ['Default', 'Narrow', 'Handoff'] as const);

test.describe('Component: WallySkeleton', () => {
  test.describe('Visual', () => {
    test('Should render the loading panel correctly', async ({ page }) => {
      await story.goto(page, 'Default');
      await expect(page.getByTestId('wally-loading')).toHaveScreenshot();
    });

    test('Should render a narrow loading panel correctly', async ({ page }) => {
      await story.goto(page, 'Narrow');
      await expect(page.getByTestId('wally-loading')).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should preserve the image when the next loading stage remounts', async ({ page }) => {
      await story.goto(page, 'Handoff');
      const loading = page.getByTestId('wally-loading');
      const before = await loading.screenshot({ animations: 'allow' });

      await page.getByTestId('next-stage').click();

      expect(await loading.screenshot({ animations: 'allow' })).toEqual(before);
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose a single loading status without keyboard stops', async ({ page }) => {
      await story.goto(page, 'Default');
      const loading = page.getByTestId('wally-loading');
      await expect(loading).toHaveAccessibleName('Loading Wally');
      await expect(page.getByRole('status')).toHaveCount(1);
      await expect(loading).toHaveAttribute('aria-busy', 'true');
      await page.keyboard.press('Tab');
      expect(await loading.evaluate(element => element.contains(document.activeElement))).toBe(
        false,
      );
    });

    test('Should keep visible placeholders without motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await story.goto(page, 'Default');
      const loading = page.getByTestId('wally-loading');
      expect(
        await loading.evaluate(element =>
          Array.from(element.querySelectorAll('*')).every(
            child => getComputedStyle(child).animationName === 'none',
          ),
        ),
      ).toBe(true);
      const first = await loading.screenshot({ animations: 'allow' });
      expect(await loading.screenshot({ animations: 'allow' })).toEqual(first);
    });
  });
});
