import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const assistantMessageStory = createStoryHelper('ai-assistantmessage', [
  'Answer Prose',
  'With Reasoning',
  'With Actions Visible',
  'With Approval',
  'With Actions On Hover',
  'Streaming',
  'Loading',
  'Error State',
  'Analytics',
  'Markdown',
  'Markdown Streaming',
  'Markdown In Chain Of Thought',
  'Markdown Unsafe Content',
  'Markdown Custom Elements',
] as const);

test.describe('Component: AssistantMessage', () => {
  test.describe('Visual', () => {
    test('Should render the answer prose correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Answer Prose');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the reasoning collapsed and expanded correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'With Reasoning');
      await expect(page.getByTestId('collapsed--chain-of-thought--step').first()).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      await expect(page.getByTestId('expanded--chain-of-thought--step').first()).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      await expect(page).toHaveScreenshot();
    });

    test('Should render the actions visible correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'With Actions Visible');
      await expect(page.getByTestId('with-actions--actions')).toHaveCSS('opacity', '1');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the approval card at full width correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'With Approval');
      await expect(page.getByTestId('with-approval--approval-card')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the streaming state correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Streaming');
      await expect(page.getByTestId('streaming')).toHaveAttribute('aria-busy', 'true');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loader correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Loading');
      await expect(page.getByTestId('loading--loader')).toHaveText('Working...');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the error with Retry correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Error State');
      await expect(page.getByTestId('error--error--retry')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the markdown elements correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Markdown');
      await expect(
        page.getByTestId('markdown--code-block').locator('.text-syntax-string').first(),
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render streamed markdown once the stream ends correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Markdown Streaming');
      await expect(page.getByTestId('markdown-streaming')).toHaveAttribute('aria-busy', 'false', {
        timeout: 15_000,
      });
      await expect(
        page.getByTestId('markdown-streaming--code-block').locator('.text-syntax-string').first(),
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render markdown in the chain of thought correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Markdown In Chain Of Thought');
      await expect(
        page.getByTestId('cot-markdown--chain-of-thought--step--inline-code').first(),
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render unsafe markdown as inert text correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Markdown Unsafe Content');
      const message = page.getByTestId('unsafe-markdown');
      await expect(message).toContainText('<script>alert(1)</script>');
      await expect(message.locator('img, script, iframe')).toHaveCount(0);
      await expect(page).toHaveScreenshot();
    });

    test('Should render custom markdown elements correctly', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Markdown Custom Elements');
      const message = page.getByTestId('custom-markdown');
      await expect(page.getByTestId('custom-markdown--link')).toHaveAttribute(
        'data-analytics-id',
        'wally.answer.link',
      );
      await expect(message.locator('img')).toHaveCount(1);
      await expect(message).toContainText('tracker');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should reveal the actions when the message is hovered', async ({ page }) => {
      await assistantMessageStory.goto(page, 'With Actions On Hover');
      const actions = page.getByTestId('hover-actions--actions');
      await expect(actions).toHaveCSS('opacity', '0');
      await page.getByTestId('hover-actions--content').hover();
      await expect(actions).toHaveCSS('opacity', '1');
      await expect(page).toHaveScreenshot();
    });

    test('Should expand the reasoning when its step is clicked', async ({ page }) => {
      await assistantMessageStory.goto(page, 'With Reasoning');
      const step = page.getByTestId('collapsed--chain-of-thought--step').first();
      await step.click();
      await expect(step).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should copy the code block when the copy button is clicked', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: { writeText: () => Promise.resolve() },
          writable: true,
          configurable: true,
        });
      });
      await assistantMessageStory.goto(page, 'Markdown');
      await page.getByTestId('markdown--code-block--copy-button').click();
      await expect(page.getByText('Copied')).toBeVisible();
    });

    test('Should replay the stream when Replay is clicked', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Markdown Streaming');
      const message = page.getByTestId('markdown-streaming');
      await expect(message).toHaveAttribute('aria-busy', 'false', { timeout: 15_000 });
      await page.getByTestId('markdown-streaming--replay').click();
      await expect(message).toHaveAttribute('aria-busy', 'true');
      await expect(message).toHaveAttribute('aria-busy', 'false', { timeout: 15_000 });
    });
  });

  test.describe('Accessibility', () => {
    test('Should be named Wally via its article role', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Answer Prose');
      await expect(page.getByRole('article', { name: 'Wally' })).toBeVisible();
    });

    test('Should reveal the actions via keyboard focus', async ({ page }) => {
      await assistantMessageStory.goto(page, 'With Actions On Hover');
      const actions = page.getByTestId('hover-actions--actions');
      await expect(actions).toHaveCSS('opacity', '0');
      await page.keyboard.press('Tab');
      await expect(actions.getByRole('button', { name: 'Copy' })).toBeFocused();
      await expect(actions).toHaveCSS('opacity', '1');
    });

    test('Should announce the loader as a status', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Loading');
      await expect(page.getByRole('status')).toHaveText('Working...');
    });

    test('Should announce the error as an alert with a named Retry button', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Error State');
      const alert = page.getByRole('alert');
      await expect(alert).toContainText('The connection was lost');
      await expect(alert.getByRole('button', { name: 'Retry' })).toBeVisible();
    });

    test('Should be reachable via Tab key for links and the copy button', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Markdown');
      const docs = page.getByTestId('markdown--link').first();
      const copy = page.getByTestId('markdown--code-block--copy-button');
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        if (await copy.evaluate(el => el === document.activeElement)) break;
      }
      await expect(copy).toBeFocused();
      await docs.focus();
      await expect(docs).toBeFocused();
      await expect(docs).not.toHaveCSS('box-shadow', 'none');
    });

    test('Should be exposed as column headers via the columnheader role', async ({ page }) => {
      await assistantMessageStory.goto(page, 'Markdown');
      const table = page.getByTestId('markdown--table').getByRole('table');
      await expect(table.getByRole('columnheader')).toHaveText(['IP', 'Type', 'Hits']);
    });
  });
});
