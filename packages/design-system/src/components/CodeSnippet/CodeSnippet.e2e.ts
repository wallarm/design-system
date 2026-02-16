import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const codeSnippetStory = createStoryHelper('data-display-codesnippet-codesnippet', [
  'Default',
  'With Line Numbers',
  'Sizes',
  'Line Annotations',
  'Line Colors',
  'Line Ranges',
  'Text Styles',
  'Line With Prefix',
  'Line Wrapping',
  'With Both Scrolls',
  'Custom Starting Line',
  'JSON With Shiki',
  'Typescript With Prism',
  'Bash With Prism',
  'HTML With Highlight Js',
  'With Header',
  'With Tabs And Actions',
  'With Floating Actions',
  'Show More',
] as const);

test.describe('CodeSnippet', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('WithLineNumbers', async ({ page }) => {
      await codeSnippetStory.goto(page, 'With Line Numbers');
      await expect(page).toHaveScreenshot();
    });

    test('Sizes', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('LineAnnotations', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Line Annotations');
      await expect(page).toHaveScreenshot();
    });

    test('LineColors', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Line Colors');
      await expect(page).toHaveScreenshot();
    });

    test('LineRanges', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Line Ranges');
      await expect(page).toHaveScreenshot();
    });

    test('TextStyles', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Text Styles');
      await expect(page).toHaveScreenshot();
    });

    test('LineWithPrefix', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Line With Prefix');
      await expect(page).toHaveScreenshot();
    });

    test('LineWrapping', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Line Wrapping');
      await expect(page).toHaveScreenshot();
    });

    test('WithBothScrolls', async ({ page }) => {
      await codeSnippetStory.goto(page, 'With Both Scrolls');
      await expect(page).toHaveScreenshot();
    });

    test('CustomStartingLine', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Custom Starting Line');
      await expect(page).toHaveScreenshot();
    });

    test('JSONWithShiki', async ({ page }) => {
      await codeSnippetStory.goto(page, 'JSON With Shiki');
      await expect(page.locator('.text-green-600').first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('TypescriptWithPrism', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Typescript With Prism');
      await expect(page.locator('.text-purple-600').first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('BashWithPrism', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Bash With Prism');
      await expect(page.locator('.text-green-600').first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('HTMLWithHighlightJs', async ({ page }) => {
      await codeSnippetStory.goto(page, 'HTML With Highlight Js');
      await expect(page.locator('.text-red-600').first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('WithHeader', async ({ page }) => {
      await codeSnippetStory.goto(page, 'With Header');
      await expect(page).toHaveScreenshot();
    });

    test('WithTabsAndActions', async ({ page }) => {
      await codeSnippetStory.goto(page, 'With Tabs And Actions');
      await expect(page).toHaveScreenshot();
    });

    test('WithFloatingActions', async ({ page }) => {
      await codeSnippetStory.goto(page, 'With Floating Actions');
      await expect(page).toHaveScreenshot();
    });

    test('ShowMore', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Show More');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Copy button - copies code and shows tooltip', async ({ page }) => {
      // Mock clipboard API before navigation for headless/Docker environments
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: { writeText: () => Promise.resolve() },
          writable: true,
          configurable: true,
        });
      });
      await codeSnippetStory.goto(page, 'With Tabs And Actions');

      const copyButton = page.getByRole('button', { name: 'Copy code' });
      await expect(copyButton).toBeVisible();
      await copyButton.click();

      // Tooltip should show "Copied"
      await expect(page.getByText('Copied')).toBeVisible();
    });

    test('Wrap button - toggles line wrapping', async ({ page }) => {
      await codeSnippetStory.goto(page, 'With Tabs And Actions');

      const wrapButton = page.getByRole('button', { name: 'Toggle line wrapping' });
      await expect(wrapButton).toBeVisible();

      // Before wrap: code content should not have whitespace-pre-wrap
      const codeContent = page.locator('code:not(#error-stack)').first();
      await expect(codeContent).not.toHaveCSS('white-space', 'pre-wrap');

      await wrapButton.click();

      // After wrap: code content should have whitespace-pre-wrap
      await expect(codeContent).toHaveCSS('white-space', 'pre-wrap');
    });

    test('Fullscreen button - enters and exits fullscreen', async ({ page }) => {
      await codeSnippetStory.goto(page, 'With Tabs And Actions');

      const fullscreenButton = page.getByRole('button', { name: 'Fullscreen' });
      await expect(fullscreenButton).toBeVisible();
      await fullscreenButton.click();

      // Should now show "Exit fullscreen" button
      const exitButton = page.getByRole('button', { name: 'Exit fullscreen' });
      await expect(exitButton).toBeVisible();

      // Press Escape to exit
      await page.keyboard.press('Escape');

      // Should be back to "Fullscreen" button
      await expect(page.getByRole('button', { name: 'Fullscreen' })).toBeVisible();
    });

    test('Show more/less - expands and collapses', async ({ page }) => {
      await codeSnippetStory.goto(page, 'Show More');

      // Should show "Show more (5 lines)" button (12 total - 7 maxLines = 5 hidden)
      const showMoreButton = page.getByRole('button', { name: /Show more/ });
      await expect(showMoreButton).toBeVisible();
      await expect(showMoreButton).toContainText('5 lines');

      // Count visible code lines before expanding
      const codeLines = page.locator('code:not(#error-stack) > div');
      await expect(codeLines).toHaveCount(7);

      // Click to expand
      await showMoreButton.click();

      // All 12 lines should now be visible
      await expect(codeLines).toHaveCount(12);

      // Button should now say "Show less"
      const showLessButton = page.getByRole('button', { name: /Show less/ });
      await expect(showLessButton).toBeVisible();

      // Click to collapse
      await showLessButton.click();
      await expect(codeLines).toHaveCount(7);
    });

    test('Tab switching - changes displayed code', async ({ page }) => {
      await codeSnippetStory.goto(page, 'With Tabs And Actions');

      // Default tab is npm
      const codeElement = page.locator('code:not(#error-stack)').first();
      await expect(codeElement).toContainText('npx wasd-new@latest');

      // Click pnpm tab
      await page.getByRole('tab', { name: 'pnpm' }).click();
      await expect(codeElement).toContainText('pnpm dlx wasd-new@latest');

      // Click yarn tab
      await page.getByRole('tab', { name: 'yarn' }).click();
      await expect(codeElement).toContainText('yarn dlx wasd-new@latest');

      // Click bun tab
      await page.getByRole('tab', { name: 'bun' }).click();
      await expect(codeElement).toContainText('bunx wasd-new@latest');
    });
  });
});

const inlineStory = createStoryHelper('data-display-codesnippet-inlinecodesnippet', [
  'Default',
  'Sizes',
  'Non Copyable',
  'Various Content',
] as const);

test.describe('InlineCodeSnippet', () => {
  test.describe('Screenshots', () => {
    test('Default', async ({ page }) => {
      await inlineStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Sizes', async ({ page }) => {
      await inlineStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('NonCopyable', async ({ page }) => {
      await inlineStory.goto(page, 'Non Copyable');
      await expect(page).toHaveScreenshot();
    });

    test('VariousContent', async ({ page }) => {
      await inlineStory.goto(page, 'Various Content');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Click copies when copyable, no copy when non-copyable', async ({ page }) => {
      // Mock clipboard API before navigation for headless/Docker environments
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: { writeText: () => Promise.resolve() },
          writable: true,
          configurable: true,
        });
      });

      // Test copyable: Default story has copyable inline snippets
      await inlineStory.goto(page, 'Default');
      const copyableSnippet = page.locator('[data-slot="inline-code-snippet"]').first();
      await copyableSnippet.click();
      await expect(page.getByText('Copied')).toBeVisible();

      // Test non-copyable: NonCopyable story has copyable={false}
      await inlineStory.goto(page, 'Non Copyable');
      const nonCopyableSnippet = page.locator('[data-slot="inline-code-snippet"]').first();
      await nonCopyableSnippet.click();

      // "Copied" tooltip should NOT appear
      await expect(page.getByText('Copied')).not.toBeVisible();
    });
  });
});
