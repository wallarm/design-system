import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const toastStory = createStoryHelper('messaging-toast', ['Custom Icon Colors'] as const);

test.describe('Component: Toast', () => {
  test.describe('Visual', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const type of ['default', 'loading'] as const) {
        test(`Should keep a ${type} custom icon readable in the ${theme} theme`, async ({
          page,
        }) => {
          await toastStory.goto(page, 'Custom Icon Colors');
          await page.evaluate(
            value => document.documentElement.setAttribute('data-theme', value),
            theme,
          );
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          await page.getByTestId(`custom-icon-trigger-${type}`).click();

          const title = page.getByTestId(`custom-icon-${type}--title`);
          const icon = page.getByTestId(`custom-icon-${type}-svg`);
          await expect(title).toBeVisible();
          // Neutral icons share the readable foreground of their toast, even
          // though that surface is the inverse of the surrounding page.
          const foreground = await title.evaluate(element => getComputedStyle(element).color);
          await expect(icon).toHaveCSS('color', foreground);
        });
      }

      test(`Should preserve status and custom icon colours in the ${theme} theme`, async ({
        page,
      }) => {
        await toastStory.goto(page, 'Custom Icon Colors');
        await page.evaluate(
          value => document.documentElement.setAttribute('data-theme', value),
          theme,
        );
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await page.getByTestId('custom-icon-trigger-info').click();
        await expect(page.getByTestId('custom-icon-info-svg')).toHaveCSS(
          'color',
          theme === 'dark' ? 'rgb(21, 93, 252)' : 'rgb(81, 162, 255)',
        );

        await page.getByTestId('custom-icon-trigger-own-color').click();
        await expect(page.getByTestId('custom-icon-own-color-svg')).toHaveCSS(
          'color',
          'rgb(173, 70, 255)',
        );
      });
    }
  });
});
