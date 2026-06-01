import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const parameterPathStory = createStoryHelper('data-display-parameterpath', [
  'Full Path',
  'No Encoding',
  'Path Index Bola',
  'Header',
  'Cookie',
  'Deep Nested Truncated',
  'No Method',
  'Gallery',
  'Expandable Truncated',
] as const);

test.describe('Component: ParameterPath', () => {
  test.describe('Visual', () => {
    test('Should render full path with method, segments and encoding correctly', async ({
      page,
    }) => {
      await parameterPathStory.goto(page, 'Full Path');
      await expect(page).toHaveScreenshot();
    });

    test('Should render path without encoding correctly', async ({ page }) => {
      await parameterPathStory.goto(page, 'No Encoding');
      await expect(page).toHaveScreenshot();
    });

    test('Should render path index (BOLA) correctly', async ({ page }) => {
      await parameterPathStory.goto(page, 'Path Index Bola');
      await expect(page).toHaveScreenshot();
    });

    test('Should render header path correctly', async ({ page }) => {
      await parameterPathStory.goto(page, 'Header');
      await expect(page).toHaveScreenshot();
    });

    test('Should render cookie path correctly', async ({ page }) => {
      await parameterPathStory.goto(page, 'Cookie');
      await expect(page).toHaveScreenshot();
    });

    test('Should render truncated deep nested path correctly', async ({ page }) => {
      await parameterPathStory.goto(page, 'Deep Nested Truncated');
      await expect(page).toHaveScreenshot();
    });

    test('Should render path without method (SOAP/MCP) correctly', async ({ page }) => {
      await parameterPathStory.goto(page, 'No Method');
      await expect(page).toHaveScreenshot();
    });

    test('Should render gallery of all variants correctly', async ({ page }) => {
      await parameterPathStory.goto(page, 'Gallery');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show full path tooltip when truncated', async ({ page }) => {
      await parameterPathStory.goto(page, 'Deep Nested Truncated');

      const path = page.locator('[data-slot="parameter-path"]');
      await path.hover();

      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText('multipart');
      await expect(tooltip).toContainText('get');
    });

    test('Should not show tooltip when path fits the container', async ({ page }) => {
      await parameterPathStory.goto(page, 'Full Path');

      const path = page.locator('[data-slot="parameter-path"]');
      await path.hover();

      // Wait briefly to let any tooltip render if it were going to.
      await page.waitForTimeout(500);
      await expect(page.getByRole('tooltip')).toHaveCount(0);
    });

    test('Should render the full path inline without truncation in a wide container', async ({
      page,
    }) => {
      // The 'Expandable Truncated' story uses a wide (720px) container in which
      // the full path fits, so it never truncates. With no truncation the
      // `expandable` affordance is inert: no ellipsis, not interactive, and a
      // click does not toggle an expanded state.
      await parameterPathStory.goto(page, 'Expandable Truncated');

      const path = page.locator('[data-slot="parameter-path"]');
      // Scope text queries to the visible row: the off-screen measurement row
      // always renders every segment to measure widths, so a global text query
      // would also match its hidden copy.
      const visibleRow = path.locator('[data-row="visible"]');
      const ellipsis = visibleRow.locator('[data-slot="parameter-path-ellipsis"]');

      // Full path shown inline: no ellipsis, every segment visible.
      await expect(ellipsis).toHaveCount(0);
      await expect(visibleRow.getByText('json_doc', { exact: true })).toBeVisible();
      await expect(visibleRow.getByText('qwerty_doc', { exact: true })).toBeVisible();

      // Not interactive — no expand/collapse affordance when nothing is truncated.
      await expect(path).not.toHaveAttribute('aria-expanded');
      await path.click();
      await expect(path).not.toHaveAttribute('aria-expanded');
      await expect(ellipsis).toHaveCount(0);
    });

    test('Should copy filter-format text on Cmd+C', async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'clipboard read API limited');

      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      await parameterPathStory.goto(page, 'Full Path');

      const path = page.locator('[data-slot="parameter-path"]');
      await path.click();

      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modifier}+A`);
      await page.keyboard.press(`${modifier}+C`);

      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toBe(
        'method = "POST" AND parameter = "JSON.nginx_config" AND encoding = "BASE64"',
      );
    });
  });
});
