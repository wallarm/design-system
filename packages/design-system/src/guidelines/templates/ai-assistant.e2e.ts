import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const assistantStory = createStoryHelper('templates-ai-assistant', [
  'Default',
  'Docked Panel',
  'Streaming',
  'Empty',
] as const);

test.describe('Template: AI assistant', () => {
  test.describe('Visual', () => {
    test('Should render the full-page conversation correctly', async ({ page }) => {
      await assistantStory.goto(page, 'Default');
      await expect(page.getByTestId('wally-approval')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the docked panel correctly', async ({ page }) => {
      await assistantStory.goto(page, 'Docked Panel');
      await expect(page.getByTestId('attacks-table')).toBeVisible();
      await expect(page.getByTestId('wally-context')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the streaming state correctly', async ({ page }) => {
      await assistantStory.goto(page, 'Streaming');
      await expect(page.getByTestId('wally-answer')).toHaveAttribute('aria-busy', 'true');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the empty landing correctly', async ({ page }) => {
      await assistantStory.goto(page, 'Empty');
      await expect(page.getByTestId('wally-prompt-0')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should resolve the approval and confirm when Allow is clicked', async ({ page }) => {
      await assistantStory.goto(page, 'Default');
      await page.getByTestId('wally-approve').click();
      await expect(page.getByTestId('wally-approval')).toHaveAttribute('data-status', 'approved');
      await expect(page.getByTestId('wally-outcome')).toContainText('Done.');
    });

    test('Should hide the docked chat when its close button is clicked', async ({ page }) => {
      await assistantStory.goto(page, 'Docked Panel');
      await page.getByTestId('wally-close').click();
      await expect(page.getByTestId('wally-chat')).toBeHidden();
      await page.getByTestId('wally-toggle').click();
      await expect(page.getByTestId('wally-chat')).toBeVisible();
    });

    test('Should attach a row to the chat from its master-cell menu', async ({ page }) => {
      await assistantStory.goto(page, 'Docked Panel');
      const row = page.getByTestId('attacks-table--container--row').nth(2);
      await row.hover();
      await row
        .getByRole('button', { name: 'Actions for SQL injection from 198.51.100.77' })
        .click();
      await page.getByTestId('attacks-row-menu--content').getByRole('menuitem').click();
      await expect(page.getByTestId('wally-context')).toContainText('SQL injection');
    });

    test('Should fill the composer when a suggested prompt is clicked', async ({ page }) => {
      await assistantStory.goto(page, 'Empty');
      await page.getByTestId('wally-prompt-0').click();
      await expect(page.getByTestId('wally-textarea')).toHaveValue(
        'Investigate the attack spike in the last hour',
      );
    });
  });
});
