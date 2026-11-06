import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const integrationsStory = createStoryHelper('templates-integrations-settings', [
  'Default',
  'Loading',
] as const);

const openRowMenu = async (page: Page, id: string) => {
  await page
    .getByTestId('integrations-table--container--row')
    .filter({ has: page.getByTestId(`integrations-actions-${id}`) })
    .hover();
  await page.getByTestId(`integrations-actions-${id}`).click();
};

test.describe('Template: Integrations settings', () => {
  test.describe('Visual', () => {
    test('Should render the full page correctly', async ({ page }) => {
      await integrationsStory.goto(page, 'Default');
      await expect(page.getByTestId('integrations-table')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the edit drawer correctly', async ({ page }) => {
      await integrationsStory.goto(page, 'Default');
      await openRowMenu(page, 'int-slack');
      await page.getByTestId('integrations-edit').click();
      await expect(page.getByTestId('integration-name')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the disconnect confirmation correctly', async ({ page }) => {
      await integrationsStory.goto(page, 'Default');
      await openRowMenu(page, 'int-teams');
      await page.getByTestId('integrations-disconnect').click();
      await expect(page.getByTestId('disconnect-confirm')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the failed save correctly', async ({ page }) => {
      await integrationsStory.goto(page, 'Default');
      await openRowMenu(page, 'int-jira');
      await page.getByTestId('integrations-edit').click();
      await page.getByTestId('integration-name').fill('Security backlog EU');
      await page.getByTestId('integration-submit').click();
      await expect(page.getByTestId('integration-save-error')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await integrationsStory.goto(page, 'Loading');
      await expect(page.getByTestId('integrations-table')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should confirm a notifications toggle with a toast', async ({ page }) => {
      await integrationsStory.goto(page, 'Default');
      await page.getByTestId('integrations-notify-int-webhook').click();
      await expect(page.getByTestId('notify-int-webhook')).toContainText(
        'Webhook notifications enabled',
      );
    });

    test('Should save an edited integration and close the drawer', async ({ page }) => {
      await integrationsStory.goto(page, 'Default');
      await openRowMenu(page, 'int-slack');
      await page.getByTestId('integrations-edit').click();
      const submit = page.getByTestId('integration-submit');
      await expect(submit).toBeDisabled();
      await page.getByTestId('integration-name').fill('SOC alerts EU');
      await submit.click();
      await expect(page.getByTestId('save-int-slack')).toContainText('Slack integration updated');
      await expect(page.getByTestId('integration-name')).toBeHidden();
    });

    test('Should disconnect an integration after confirmation', async ({ page }) => {
      await integrationsStory.goto(page, 'Default');
      await openRowMenu(page, 'int-teams');
      await page.getByTestId('integrations-disconnect').click();
      await page.getByTestId('disconnect-confirm').click();
      await expect(page.getByTestId('disconnect-int-teams')).toContainText(
        'Microsoft Teams disconnected',
      );
      await expect(page.getByTestId('disconnect-confirm')).toBeHidden();
    });
  });
});
