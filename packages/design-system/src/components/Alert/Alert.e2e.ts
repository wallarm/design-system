import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';
import type { AlertColor } from './Alert';

const alertStory = createStoryHelper('messaging-alert', [
  'All Colors',
  'Title Only',
  'With Close Button',
  'With Controls',
  'With Bottom Actions',
  'Min Max Width',
  'Max Lines',
  'With Code',
] as const);

const getAlerts = (page: Page) => page.getByRole('alert');
const getAlertByColor = (page: Page, color: AlertColor) =>
  page.getByRole('alert').and(page.locator(`[data-color="${color}"]`));

test.describe('Alert Component', () => {
  test.describe('View', () => {
    test('All color variants', async ({ page }) => {
      await alertStory.goto(page, 'All Colors');
      await expect(page).toHaveScreenshot();
    });

    test('With title only', async ({ page }) => {
      await alertStory.goto(page, 'Title Only');
      await expect(page).toHaveScreenshot();
    });

    test('Min Max width', async ({ page }) => {
      await alertStory.goto(page, 'Min Max Width');
      await expect(page).toHaveScreenshot();
    });

    test('Max lines', async ({ page }) => {
      await alertStory.goto(page, 'Max Lines');
      await expect(page).toHaveScreenshot();
    });

    test('With code', async ({ page }) => {
      await alertStory.goto(page, 'With Code');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Close Button', () => {
    test.beforeEach(async ({ page }) => {
      await alertStory.goto(page, 'With Close Button');
    });

    test('Close button - view', async ({ page }) => {
      await expect(page).toHaveScreenshot();
    });

    test('Close button - clicked', async ({ page }) => {
      const alerts = getAlerts(page);
      await expect(alerts).toHaveCount(2);

      const infoAlert = getAlertByColor(page, 'info');
      await infoAlert.getByRole('button', { name: 'close' }).click();

      await expect(alerts).toHaveCount(1);
      await expect(infoAlert).toBeHidden();
      await expect(getAlertByColor(page, 'warning')).toBeVisible();
    });

    test('Close button - keyboard accessible', async ({ page }) => {
      const alerts = getAlerts(page);
      await expect(alerts).toHaveCount(2);

      const infoAlert = getAlertByColor(page, 'info');
      const closeButton = infoAlert.getByRole('button', { name: 'close' });
      await closeButton.focus();
      await expect(closeButton).toBeFocused();

      await page.keyboard.press('Enter');

      await expect(alerts).toHaveCount(1);
      await expect(infoAlert).toBeHidden();
    });
  });

  test.describe('With Controls', () => {
    test.beforeEach(async ({ page }) => {
      await alertStory.goto(page, 'With Controls');
    });

    test('With controls - view', async ({ page }) => {
      await expect(page).toHaveScreenshot();
    });

    test('With controls - clickable buttons', async ({ page }) => {
      const firstInfoAlert = getAlertByColor(page, 'info').filter({
        hasNot: page.getByRole('button', { name: 'close' }),
      });
      const learnMoreButton = firstInfoAlert.getByRole('button', {
        name: 'Learn more',
      });
      await expect(learnMoreButton).toBeEnabled();
      await learnMoreButton.click();
    });

    test('With controls - both controls and close button', async ({ page }) => {
      const infoAlerts = getAlertByColor(page, 'info');
      const alertWithClose = infoAlerts.filter({
        has: page.getByRole('button', { name: 'close' }),
      });

      await expect(alertWithClose.getByRole('button', { name: 'Learn more' })).toBeVisible();
      await expect(alertWithClose.getByRole('button', { name: 'close' })).toBeVisible();
    });
  });

  test.describe('With Bottom Actions', () => {
    test.beforeEach(async ({ page }) => {
      await alertStory.goto(page, 'With Bottom Actions');
    });

    test('With bottom actions - view', async ({ page }) => {
      await expect(page).toHaveScreenshot();
    });

    test('With bottom actions - clickable buttons', async ({ page }) => {
      const infoAlert = getAlertByColor(page, 'info');
      const actionButton = infoAlert.getByRole('button', {
        name: 'Primary Action',
      });
      await expect(actionButton).toBeEnabled();
      await actionButton.click();
    });
  });
});
