import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const panelStory = createStoryHelper('ai-wallyassistant', [
  'Empty',
  'Conversation',
  'Streaming Simulation',
  'Approval',
  'Error State',
  'In Drawer',
] as const);

const byId = (page: Page, id: string) => page.getByTestId(id);
const getTextarea = (page: Page) => byId(page, 'wally--input--textarea');
const getSubmit = (page: Page) => byId(page, 'wally--input--submit');
const getLog = (page: Page) => byId(page, 'wally--body');

/** Streaming Simulation with every script delay at 0, so a run ends within a few frames. */
const gotoInstantStreaming = async (page: Page) => {
  await page.goto(`${panelStory.url('Streaming Simulation')}&args=speed:0`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await expect(byId(page, 'wally')).toBeVisible({ timeout: 30000 });
  // Same readiness steps as createStoryHelper.goto (it takes no args): force-load every font
  // face so the screenshot doesn't race font-display:swap, then let layout settle.
  await page.evaluate(async () => {
    const loads: Promise<unknown>[] = [];
    document.fonts.forEach(font => {
      loads.push(font.load().catch(() => undefined));
    });
    await Promise.all(loads);
    await document.fonts.ready;
  });
  await page.waitForTimeout(300);
};

const openDrawer = async (page: Page) => {
  await byId(page, 'chat-trigger').click();
  await expect(byId(page, 'wally')).toBeVisible();
};

// The empty chat's Wally is a live character: shoot its static frame (reduced motion), once its bakes are in.
const stillWally = (page: Page) => page.emulateMedia({ reducedMotion: 'reduce' });
const waitForWally = (page: Page) =>
  page.waitForFunction(() =>
    [...document.querySelectorAll('[data-slot="agent-avatar"] [data-part~="ly"]')]
      .filter(g => !g.closest('[data-part~="veil"]'))
      .every(g => g.hasAttribute('data-ready')),
  );

test.describe('Component: WallyAssistant', () => {
  test.describe('Visual', () => {
    test('Should render empty panel correctly', async ({ page }) => {
      await stillWally(page);
      await panelStory.goto(page, 'Empty');
      await waitForWally(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render conversation correctly', async ({ page }) => {
      await panelStory.goto(page, 'Conversation');
      await expect(page).toHaveScreenshot();
    });

    test('Should render docked approval correctly', async ({ page }) => {
      await panelStory.goto(page, 'Approval');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render error with retry correctly', async ({ page }) => {
      await panelStory.goto(page, 'Error State');
      await expect(page).toHaveScreenshot();
    });

    test('Should render streaming simulation end state correctly', async ({ page }) => {
      await gotoInstantStreaming(page);
      await byId(page, 'wally--suggestion-0').click();
      await expect(byId(page, 'wally--assistant-message-5--actions')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should show loader, streamed answer and folded summary after a pill click', async ({
      page,
    }) => {
      await panelStory.goto(page, 'Streaming Simulation');
      await byId(page, 'wally--suggestion-0').click();
      await expect(byId(page, 'wally--assistant-message-5--loader')).toBeVisible();
      await expect(byId(page, 'wally--assistant-message-5--content')).toBeVisible({
        timeout: 15000,
      });
      await expect(
        byId(page, 'wally--assistant-message-5--chain-of-thought--step-summary'),
      ).toContainText('Worked for 12s', { timeout: 15000 });
    });

    test('Should end the run when stop is clicked', async ({ page }) => {
      await panelStory.goto(page, 'Streaming Simulation');
      await byId(page, 'wally--suggestion-0').click();
      await expect(getSubmit(page)).toHaveAccessibleName('Stop response');
      await getSubmit(page).click();
      await expect(getLog(page)).toHaveAttribute('aria-busy', 'false');
      await expect(getSubmit(page)).toHaveAccessibleName('Send');
    });

    test('Should resolve the docked card when allow is clicked', async ({ page }) => {
      await panelStory.goto(page, 'Approval');
      await expect(getSubmit(page)).toBeDisabled();
      await byId(page, 'wally--approval-card--option-allow-always').click();
      await expect(byId(page, 'wally--approval-card--status')).toHaveText('Approved');
    });

    test('Should keep send blocked while typing during a pending approval', async ({ page }) => {
      await panelStory.goto(page, 'Approval');
      await getTextarea(page).fill('Also block 198.51.100.4');
      await expect(getTextarea(page)).toHaveValue('Also block 198.51.100.4');
      await expect(getSubmit(page)).toBeDisabled();
    });

    test('Should toggle aria-pressed when a thumb is clicked', async ({ page }) => {
      await panelStory.goto(page, 'Conversation');
      const dislike = byId(page, 'wally--assistant-message-3--actions--dislike');
      await expect(dislike).toHaveAttribute('aria-pressed', 'false');
      await dislike.click();
      await expect(dislike).toHaveAttribute('aria-pressed', 'true');
      await dislike.click();
      await expect(dislike).toHaveAttribute('aria-pressed', 'false');
    });

    test('Should toggle the summary row when clicked', async ({ page }) => {
      await panelStory.goto(page, 'Conversation');
      // The summary test id sits on the row's toggle button.
      const toggle = byId(page, 'wally--assistant-message-1--chain-of-thought--step-summary');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be reachable header → pills → textarea via Tab key without stopping on the log', async ({
      page,
    }) => {
      await panelStory.goto(page, 'In Drawer');
      await openDrawer(page);
      // Last header action; Tab walks the log's own controls, then the pills, then the textarea.
      await page.getByRole('button', { name: 'Close chat' }).focus();
      const visited: (string | null)[] = [];
      for (let i = 0; i < 60 && visited.at(-1) !== 'wally--input--textarea'; i++) {
        await page.keyboard.press('Tab');
        visited.push(
          await page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? null),
        );
      }
      expect(visited).not.toContain('wally--body');
      expect(visited.at(-1)).toBe('wally--input--textarea');
      const firstPill = visited.indexOf('wally--suggestion-0');
      expect(firstPill).toBeGreaterThanOrEqual(0);
      // After the first pill: only pills, then the textarea.
      expect(visited.slice(firstPill, -1).every(id => id?.startsWith('wally--suggestion-'))).toBe(
        true,
      );
    });

    test('Should be reachable pills → textarea via Tab key', async ({ page }) => {
      await panelStory.goto(page, 'Empty');
      await byId(page, 'wally--suggestion-0').focus();
      for (const index of [1, 2]) {
        await page.keyboard.press('Tab');
        await expect(byId(page, `wally--suggestion-${index}`)).toBeFocused();
      }
      await page.keyboard.press('Tab');
      await expect(getTextarea(page)).toBeFocused();
      await expect(getLog(page)).toHaveAttribute('tabindex', '-1');
    });

    test('Should be marked aria-busy on the log via a streaming reply', async ({ page }) => {
      await panelStory.goto(page, 'Streaming Simulation');
      await expect(getLog(page)).toHaveAttribute('aria-busy', 'false');
      await byId(page, 'wally--suggestion-0').click();
      await expect(getLog(page)).toHaveAttribute('aria-busy', 'true');
      await expect(getLog(page)).toHaveAttribute('aria-busy', 'false', { timeout: 15000 });
    });

    test('Should be stoppable via Escape key without closing the drawer', async ({ page }) => {
      await panelStory.goto(page, 'In Drawer');
      await openDrawer(page);
      await expect(page.getByRole('dialog', { name: 'Wally' })).toBeVisible();
      await getTextarea(page).fill('Show top attacks');
      await page.keyboard.press('Enter');
      await expect(getSubmit(page)).toHaveAccessibleName('Stop response');
      await page.keyboard.press('Escape');
      await expect(getSubmit(page)).toHaveAccessibleName('Send');
      await expect(byId(page, 'wally')).toBeVisible();
    });
  });
});
