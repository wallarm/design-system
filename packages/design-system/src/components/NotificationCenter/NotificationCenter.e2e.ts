import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const notificationCenterStory = createStoryHelper('overlay-notificationcenter', [
  'Basic',
  'Read Tab',
  'Empty',
  'Loading',
  'Error State',
  'Many Items',
  'In Top Header',
] as const);

const getTrigger = (page: Page) => page.getByTestId('notification-center--trigger');
const getContent = (page: Page) => page.getByTestId('notification-center--content');

const openInbox = async (page: Page) => {
  await getTrigger(page).click();
  await expect(getContent(page)).toBeVisible();
};

test.describe('Component: NotificationCenter', () => {
  test.describe('Visual', () => {
    test('Should render the new tab correctly', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Basic');
      await openInbox(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the read tab correctly', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Read Tab');
      await openInbox(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the empty new tab correctly', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Empty');
      await openInbox(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the empty read tab correctly', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Empty');
      await openInbox(page);
      await page.getByRole('tab', { name: 'Read' }).click();
      await expect(page.getByTestId('notification-center--empty')).toContainText(
        'Nothing read yet',
      );
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Loading');
      await openInbox(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the error state correctly', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Error State');
      await openInbox(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render inside the top header correctly', async ({ page }) => {
      await notificationCenterStory.goto(page, 'In Top Header');
      await openInbox(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should show read items when the Read tab is clicked', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Basic');
      await openInbox(page);
      await page.getByRole('tab', { name: 'Read' }).click();
      await expect(page.getByTestId('notification-center--tabs--content')).toContainText(
        'Node wallarm-node-2 is back online',
      );
    });

    test('Should close when an item is clicked', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Basic');
      await openInbox(page);
      await page.getByTestId('notification-center--item-patch--title').click();
      await expect(getContent(page)).toBeHidden();
    });

    test('Should keep the header in place when the list scrolls', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Many Items');
      await openInbox(page);
      const header = page.getByTestId('notification-center--header');
      const before = await header.boundingBox();
      await page.getByTestId('notification-center--body').hover();
      await page.mouse.wheel(0, 600);
      await expect(page.getByTestId('notification-center--item').last()).toBeInViewport();
      expect(await header.boundingBox()).toEqual(before);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be named with the unread count via aria-label', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Basic');
      await expect(getTrigger(page)).toHaveAccessibleName('Notifications, 5 unread');
    });

    test('Should be closable via Escape with focus back on the bell', async ({ page }) => {
      await notificationCenterStory.goto(page, 'Basic');
      await openInbox(page);
      await page.keyboard.press('Escape');
      await expect(getContent(page)).toBeHidden();
      await expect(getTrigger(page)).toBeFocused();
    });
  });
});
