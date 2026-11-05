import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const feedbackToastsStory = createStoryHelper('patterns-feedback-toasts', [
  'Default',
  'Test Failed',
] as const);

test.describe('Pattern: Feedback toasts', () => {
  test.describe('Visual', () => {
    test('Should render the channels page correctly', async ({ page }) => {
      await feedbackToastsStory.goto(page, 'Default');
      await expect(page.getByTestId('channels-table--container--row')).toHaveCount(4);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the channel page correctly', async ({ page }) => {
      await feedbackToastsStory.goto(page, 'Test Failed');
      await expect(page.getByTestId('channel-send-test')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show a create toast with one next-step action', async ({ page }) => {
      await feedbackToastsStory.goto(page, 'Default');
      await page.getByTestId('channels-create').click();
      const toast = page.getByTestId('channel-created');
      await expect(toast.getByTestId('channel-created--title')).toHaveText('Channel created');
      await expect(toast.getByRole('button', { name: 'Go to destination' })).toBeVisible();
    });

    test('Should turn the loading toast into the result in place', async ({ page }) => {
      await feedbackToastsStory.goto(page, 'Default');
      await page
        .getByTestId('channels-table')
        .getByRole('button', { name: 'Actions for #soc-alerts' })
        .click();
      await page
        .getByTestId('channel-actions--content')
        .getByRole('menuitem', { name: 'Send test' })
        .click();
      const title = page.getByTestId('test-ch-soc-alerts--title');
      await expect(title).toHaveText('Testing channel…');
      await expect(title).toHaveText('Test delivered via Slack');
    });

    test('Should close the dialog, then toast and remove the deleted row', async ({ page }) => {
      await feedbackToastsStory.goto(page, 'Default');
      await page
        .getByTestId('channels-table')
        .getByRole('button', { name: 'Actions for SIEM ingest' })
        .click();
      await page
        .getByTestId('channel-actions--content')
        .getByRole('menuitem', { name: 'Delete channel' })
        .click();
      await page
        .getByTestId('channels-delete-dialog--content')
        .getByRole('button', { name: 'Delete channel' })
        .click();
      await expect(page.getByTestId('channels-delete-dialog--content')).toBeHidden();
      await expect(page.getByTestId('delete-ch-siem--title')).toHaveText('Channel deleted');
      await expect(page.getByTestId('channels-table--container--row')).toHaveCount(3);
    });

    test('Should turn the loading toast into an error with the cause', async ({ page }) => {
      await feedbackToastsStory.goto(page, 'Test Failed');
      await page.getByTestId('channel-send-test').click();
      await expect(page.getByTestId('test-ch-siem--title')).toHaveText('Test failed');
      await expect(page.getByTestId('test-ch-siem--description')).toHaveText(
        'Splunk rejected the request: HEC token is invalid or disabled.',
      );
    });
  });
});
