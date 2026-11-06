import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const incidentStory = createStoryHelper('templates-incident-detail', [
  'Default',
  'Timeline Tab',
  'Loading',
] as const);

test.describe('Template: Incident detail', () => {
  test.describe('Visual', () => {
    test('Should render the overview correctly', async ({ page }) => {
      await incidentStory.goto(page, 'Default');
      await expect(page.getByTestId('incident-attributes')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the timeline tab correctly', async ({ page }) => {
      await incidentStory.goto(page, 'Timeline Tab');
      await expect(page.getByTestId('incident-timeline')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the false positive dialog correctly', async ({ page }) => {
      await incidentStory.goto(page, 'Default');
      await page.getByTestId('incident-resolve-menu').click();
      await page.getByTestId('incident-false-positive').click();
      await expect(page.getByTestId('false-positive-confirm')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await incidentStory.goto(page, 'Loading');
      await expect(page.getByTestId('incident-attributes')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should switch to the related events tab', async ({ page }) => {
      await incidentStory.goto(page, 'Default');
      await page.getByTestId('incident-tab-events').click();
      await expect(page.getByTestId('incident-events-table')).toBeVisible();
    });

    test('Should open the row menu from the master cell', async ({ page }) => {
      await incidentStory.goto(page, 'Default');
      await page.getByTestId('incident-tab-events').click();
      const row = page.getByTestId('incident-events-table--container--row').first();
      await row.hover();
      await row.getByRole('button', { name: 'Actions for request r-90412' }).click();
      const menu = page.getByTestId('incident-event-menu--content');
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('menuitem').first()).toHaveText('Open request');
    });

    test('Should resolve the incident and confirm with a toast', async ({ page }) => {
      await incidentStory.goto(page, 'Default');
      await page.getByTestId('incident-resolve-primary').click();
      await expect(page.getByTestId('incident-status')).toHaveText('Resolved');
      await expect(page.getByTestId('incident-resolution--title')).toHaveText('Incident resolved');
    });

    test('Should mark as false positive after confirming', async ({ page }) => {
      await incidentStory.goto(page, 'Default');
      await page.getByTestId('incident-resolve-menu').click();
      await page.getByTestId('incident-false-positive').click();
      await page.getByTestId('false-positive-confirm').click();
      await expect(page.getByTestId('false-positive-dialog')).toBeHidden();
      await expect(page.getByTestId('incident-status')).toHaveText('False positive');
    });
  });
});
