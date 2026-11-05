import { expect, type Locator, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';
import { holdAgentsStill, waitForAgentBakes } from '../AgentAvatar/agentAvatar.e2e.helpers';

const conversationStory = createStoryHelper('ai-conversation', [
  'Default',
  'Empty',
  'Streaming',
] as const);

const getLog = (page: Page) => page.getByTestId('chat--body');
const getScrollButton = (page: Page) => page.getByTestId('chat--scroll-button');

/** Distance in px between the log's viewport bottom and its content bottom. */
const distanceFromBottom = (log: Locator) =>
  log.evaluate(el => el.scrollHeight - el.scrollTop - el.clientHeight);

const scrollUp = async (page: Page) => {
  await getLog(page).hover();
  await page.mouse.wheel(0, -600);
  await expect(getScrollButton(page)).toBeVisible();
};

/** Per-frame scrollTop jump cap: the animator moves at most 3px/ms × 16.7ms ≈ 50px a frame. */
const MAX_FRAME_JUMP = 60;

/** Records the log's scroll position every animation frame from page start (before the story). */
const recordFrames = (page: Page) =>
  page.addInitScript(() => {
    const frames: number[][] = [];
    Object.assign(window, { __frames: frames });
    const tick = () => {
      const el = document.querySelector('[data-testid="chat--body"]');
      const button = document.querySelector('[data-testid="chat--scroll-button"]') ? 1 : 0;
      if (el) frames.push([el.scrollTop, el.scrollHeight - el.clientHeight, button]);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

/**
 * Frame stats; `fromPinned` skips to the first pinned frame (the mount pin is a deliberate
 * instant jump).
 */
const frameStats = (page: Page, fromPinned = false) =>
  page.evaluate(pinned => {
    const all = (window as unknown as { __frames: number[][] }).__frames;
    const start = pinned ? all.findIndex(([top = 0, end = 0]) => end - top <= 1) : 0;
    const frames = all.slice(Math.max(0, start));
    const deltas = frames.slice(1).map(([top = 0], i) => top - (frames[i]?.[0] ?? 0));
    return {
      count: frames.length,
      backwards: deltas.filter(delta => delta < -0.5).length,
      maxJump: Math.max(0, ...deltas),
      buttonFrames: frames.filter(([, , button]) => button).length,
    };
  }, fromPinned);

const resetFrames = (page: Page) =>
  page.evaluate(() => {
    (window as unknown as { __frames: number[][] }).__frames.length = 0;
  });

test.describe('Component: Conversation', () => {
  test.describe('Visual', () => {
    test('Should render a long history pinned to the bottom correctly', async ({ page }) => {
      await conversationStory.goto(page, 'Default');
      await expect.poll(() => distanceFromBottom(getLog(page))).toBeLessThanOrEqual(1);
      await expect(getScrollButton(page)).toBeHidden();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the empty state correctly', async ({ page }) => {
      await holdAgentsStill(page);
      await conversationStory.goto(page, 'Empty');
      await expect(page.getByTestId('chat--empty-state')).toBeVisible();
      await waitForAgentBakes(page.getByTestId('chat'));
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should return to the bottom when the scroll button is clicked', async ({ page }) => {
      await conversationStory.goto(page, 'Default');
      await scrollUp(page);
      await getScrollButton(page).click();
      await expect.poll(() => distanceFromBottom(getLog(page))).toBeLessThanOrEqual(1);
      await expect(getScrollButton(page)).toBeHidden();
    });

    test('Should stay pinned when the answer streams', async ({ page }) => {
      await conversationStory.goto(page, 'Streaming');
      const log = getLog(page);
      const pinnedWhileBusy = () =>
        log.evaluate(
          el =>
            el.getAttribute('aria-busy') === 'true' &&
            el.scrollHeight - el.scrollTop - el.clientHeight <= 1,
        );
      await expect.poll(pinnedWhileBusy).toBe(true);
      await expect(log).toHaveAttribute('aria-busy', 'false', { timeout: 10_000 });
      await expect.poll(() => distanceFromBottom(log)).toBeLessThanOrEqual(1);
      await expect(getScrollButton(page)).toBeHidden();
    });
    test('Should follow the stream without jerks or a scroll button flash', async ({ page }) => {
      await recordFrames(page);
      await conversationStory.goto(page, 'Streaming');
      const log = getLog(page);
      await expect(log).toHaveAttribute('aria-busy', 'false', { timeout: 10_000 });
      await expect.poll(() => distanceFromBottom(log)).toBeLessThanOrEqual(1);

      const streaming = await frameStats(page, true);
      expect(streaming.count).toBeGreaterThan(10);
      expect(streaming.backwards).toBe(0);
      expect(streaming.maxJump).toBeLessThanOrEqual(MAX_FRAME_JUMP);
      expect(streaming.buttonFrames).toBe(0);
    });

    test('Should follow a chunk taller than the threshold without a scroll button flash', async ({
      page,
    }) => {
      await recordFrames(page);
      await conversationStory.goto(page, 'Default');
      const log = getLog(page);
      await expect.poll(() => distanceFromBottom(log)).toBeLessThanOrEqual(1);
      await resetFrames(page);
      // The thread wrapper sits just before the end marker.
      await page.getByTestId('chat--end').evaluate(el => {
        const block = document.createElement('div');
        block.style.height = '400px';
        el.previousElementSibling?.append(block);
      });
      await expect.poll(() => distanceFromBottom(log)).toBeLessThanOrEqual(1);

      const follow = await frameStats(page);
      expect(follow.backwards).toBe(0);
      expect(follow.maxJump).toBeGreaterThan(0);
      expect(follow.maxJump).toBeLessThanOrEqual(MAX_FRAME_JUMP);
      expect(follow.buttonFrames).toBe(0);
    });

    test('Should glide back via the scroll button while the answer still streams', async ({
      page,
    }) => {
      await recordFrames(page);
      await conversationStory.goto(page, 'Streaming');
      const log = getLog(page);
      const pinnedWhileBusy = () =>
        log.evaluate(
          el =>
            el.getAttribute('aria-busy') === 'true' &&
            el.scrollHeight - el.scrollTop - el.clientHeight <= 1,
        );
      await expect.poll(pinnedWhileBusy).toBe(true);

      await scrollUp(page);
      await resetFrames(page);
      await getScrollButton(page).click();
      await expect(log).toHaveAttribute('aria-busy', 'false', { timeout: 10_000 });
      await expect.poll(() => distanceFromBottom(log)).toBeLessThanOrEqual(1);

      const glide = await frameStats(page);
      expect(glide.backwards).toBe(0);
      expect(glide.maxJump).toBeGreaterThan(0);
      expect(glide.maxJump).toBeLessThanOrEqual(MAX_FRAME_JUMP);
      await expect(getScrollButton(page)).toBeHidden();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be named via aria-label', async ({ page }) => {
      await conversationStory.goto(page, 'Default');
      await scrollUp(page);
      await expect(page.getByRole('button', { name: 'Scroll to latest message' })).toBeVisible();
    });

    test('Should hand focus to the end of the log via scroll button click', async ({ page }) => {
      await conversationStory.goto(page, 'Default');
      await scrollUp(page);
      await getScrollButton(page).click();
      await expect(page.getByTestId('chat--end')).toBeFocused();
    });

    test('Should stay at the bottom on Tab after the scroll button', async ({ page }) => {
      await conversationStory.goto(page, 'Default');
      await scrollUp(page);
      await getScrollButton(page).focus();
      await page.keyboard.press('Enter');
      await expect.poll(() => distanceFromBottom(getLog(page))).toBeLessThanOrEqual(1);
      await page.keyboard.press('Tab');
      await expect.poll(() => distanceFromBottom(getLog(page))).toBeLessThanOrEqual(1);
    });

    test('Should reach the bottom via scroll button with reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await conversationStory.goto(page, 'Default');
      await scrollUp(page);
      await getScrollButton(page).click();
      await expect.poll(() => distanceFromBottom(getLog(page))).toBeLessThanOrEqual(1);
    });
  });
});
