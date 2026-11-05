import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const panelStory = createStoryHelper('ai-chat', [
  'Empty Panel',
  'Conversation',
  'Streaming',
  'Approval Docked',
  'Approval Resolved',
  'Permissions',
  'In Drawer',
] as const);

const getTextarea = (page: Page) => page.getByTestId('chat--input--textarea');
const getSubmit = (page: Page) => page.getByTestId('chat--input--submit');

const openDrawer = async (page: Page) => {
  await page.getByTestId('chat-trigger').click();
  await expect(page.getByTestId('chat')).toBeVisible();
};

// The empty chat's Wally is a live character: shoot its static frame (reduced motion), once its bakes are in.
const stillWally = (page: Page) => page.emulateMedia({ reducedMotion: 'reduce' });
const waitForWally = (page: Page) =>
  page.waitForFunction(() =>
    [...document.querySelectorAll('[data-slot="agent-avatar"] [data-part~="ly"]')]
      .filter(g => !g.closest('[data-part~="veil"]'))
      .every(g => g.hasAttribute('data-ready')),
  );

test.describe('Component: ChatComposed', () => {
  test.describe('Visual', () => {
    test('Should render empty panel correctly', async ({ page }) => {
      await stillWally(page);
      await panelStory.goto(page, 'Empty Panel');
      await waitForWally(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render conversation correctly', async ({ page }) => {
      await panelStory.goto(page, 'Conversation');
      await expect(page).toHaveScreenshot();
    });

    test('Should render streaming state correctly', async ({ page }) => {
      await panelStory.goto(page, 'Streaming');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render docked approval correctly', async ({ page }) => {
      await panelStory.goto(page, 'Approval Docked');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render resolved approval correctly', async ({ page }) => {
      await panelStory.goto(page, 'Approval Resolved');
      await expect(page).toHaveScreenshot();
    });

    test('Should render permissions popover inside the input correctly', async ({ page }) => {
      await stillWally(page);
      await panelStory.goto(page, 'Permissions');
      await page.getByTestId('chat--input--permissions--trigger').click();
      await expect(page.getByTestId('chat--input--permissions--content')).toBeVisible();
      await waitForWally(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render panel in drawer correctly', async ({ page }) => {
      await panelStory.goto(page, 'In Drawer');
      await openDrawer(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should resolve the docked approval when allow is clicked', async ({ page }) => {
      await panelStory.goto(page, 'Approval Docked');
      await expect(getSubmit(page)).toHaveAccessibleName('Stop response');
      await page.getByTestId('chat--approve').click();
      await expect(page.getByTestId('chat--approval-card--status')).toHaveText('Approved');
      await expect(getSubmit(page)).toHaveAccessibleName('Send');
    });

    test('Should stop the reply when stop is clicked', async ({ page }) => {
      await panelStory.goto(page, 'Streaming');
      await expect(page.getByTestId('chat--body')).toHaveAttribute('aria-busy', 'true');
      await getSubmit(page).click();
      await expect(page.getByTestId('chat--body')).toHaveAttribute('aria-busy', 'false');
      await expect(getSubmit(page)).toHaveAccessibleName('Send');
    });

    test('Should keep the popover open when a permission is toggled', async ({ page }) => {
      await panelStory.goto(page, 'Permissions');
      await page.getByTestId('chat--input--permissions--trigger').click();
      const row = page.getByTestId('chat--permission-propose_add_to_denylist');
      await expect(row.locator('input')).not.toBeChecked();
      await row.click();
      await expect(row.locator('input')).toBeChecked();
      await expect(page.getByTestId('chat--input--permissions--content')).toBeVisible();
    });

    test('Should close the drawer when close is clicked', async ({ page }) => {
      await panelStory.goto(page, 'In Drawer');
      await openDrawer(page);
      await page.getByTestId('chat--header').getByRole('button', { name: 'Close chat' }).click();
      await expect(page.getByTestId('chat')).toBeHidden();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be navigable from header to body to input via Tab key', async ({ page }) => {
      await panelStory.goto(page, 'Empty Panel');
      const header = page.getByTestId('chat--header');

      await page.keyboard.press('Tab');
      await expect(header.getByRole('button', { name: 'Chat history' })).toBeFocused();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(header.getByRole('button', { name: 'Close chat' })).toBeFocused();
      for (let index = 0; index < 3; index++) {
        await page.keyboard.press('Tab');
        await expect(page.getByTestId(`chat--suggestion-${index}`)).toBeFocused();
      }
      await page.keyboard.press('Tab');
      await expect(getTextarea(page)).toBeFocused();
    });

    test('Should be stoppable via keyboard Escape key without closing the drawer', async ({
      page,
    }) => {
      await panelStory.goto(page, 'In Drawer');
      await openDrawer(page);
      await getTextarea(page).focus();
      await page.keyboard.press('Escape');
      await expect(getSubmit(page)).toHaveAccessibleName('Send');
      await expect(page.getByTestId('chat')).toBeVisible();
    });
  });
});
