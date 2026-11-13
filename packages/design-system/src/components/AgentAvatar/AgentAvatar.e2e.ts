import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const agentAvatarStory = createStoryHelper('ai-agentavatar', [
  'Basic',
  'Cast',
  'States',
  'Partial Coverage',
  'Custom Agent',
  'Team',
  'Live States',
  'Beats',
  'Inviting',
  'Activation',
  'Coverage',
  'Many On Screen',
  'Reduced Motion',
] as const);

const LIVE_STORIES = [
  'Live States',
  'Beats',
  'Inviting',
  'Activation',
  'Coverage',
  'Many On Screen',
  'Reduced Motion',
] as const;

// Counts animation frames the page requests, from before the story loads.
const countFrames = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __raf: number };
    w.__raf = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => {
      w.__raf++;
      return raf(cb);
    };
  });
const framesIn = async (page: Page, ms: number) => {
  const read = () => page.evaluate(() => (window as unknown as { __raf: number }).__raf);
  const before = await read();
  await page.waitForTimeout(ms);
  return (await read()) - before;
};

// Every layer that shows has its baked image decoded (the veil only while the ghost or the crown shows).
const waitForBakes = (page: Page) =>
  page.waitForFunction(() =>
    [...document.querySelectorAll('[data-slot="agent-avatar"]')].every(svg => {
      const ghost = svg.hasAttribute('data-ghosting');
      return [...svg.querySelectorAll('[data-part~="ly"]')]
        .filter(g => ghost || !g.closest('[data-part~="veil"]'))
        .every(g => g.hasAttribute('data-ready'));
    }),
  );

test.describe('Component: AgentAvatar', () => {
  test.describe('Visual', () => {
    for (const story of ['Basic', 'Cast', 'States', 'Partial Coverage', 'Custom Agent'] as const) {
      test(`Should render the ${story} story correctly`, async ({ page }) => {
        await agentAvatarStory.goto(page, story);
        await waitForBakes(page);
        await expect(page).toHaveScreenshot();
      });
    }

    // Live stories draw their static frames under reduced motion, so the baselines are stable.
    for (const story of LIVE_STORIES) {
      test(`Should render the ${story} story with reduced motion correctly`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await agentAvatarStory.goto(page, story);
        await waitForBakes(page);
        await expect(page).toHaveScreenshot();
      });
    }
  });

  test.describe('Interactions', () => {
    // WDS-199 acceptance: a static view requests no animation frames once its bakes are in.
    test('Should request no animation frames when static via the Team story', async ({ page }) => {
      await countFrames(page);
      await agentAvatarStory.goto(page, 'Team');
      await waitForBakes(page);
      await page.waitForTimeout(500);
      expect(await framesIn(page, 1000)).toBe(0);
    });

    // WDS-201: live characters run one frame loop, and it stops when reduced motion is switched on.
    test('Should stop requesting frames when reduced motion is switched on', async ({ page }) => {
      await countFrames(page);
      await agentAvatarStory.goto(page, 'Live States');
      await expect(page.getByTestId('agent-avatar-live-radar-idle')).toHaveAttribute(
        'data-live',
        'true',
      );
      expect(await framesIn(page, 1000)).toBeGreaterThan(30);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.getByTestId('agent-avatar-live-radar-idle')).not.toHaveAttribute(
        'data-live',
      );
      await page.waitForTimeout(200);
      expect(await framesIn(page, 1000)).toBe(0);
    });

    test('Should return to the state when the Done beat is played', async ({ page }) => {
      await agentAvatarStory.goto(page, 'Beats');
      const avatar = page.getByTestId('agent-avatar-beats-wally');
      await page.getByTestId('agent-avatar-beats-done').click();
      await expect(avatar).toHaveAttribute('data-state', 'done');
      await expect(page.getByTestId('agent-avatar-beats-ended')).toHaveText('done ended', {
        timeout: 4000,
      });
      await expect(avatar).toHaveAttribute('data-state', 'idle');
    });

    test('Should land in On duty when Activate is clicked', async ({ page }) => {
      await agentAvatarStory.goto(page, 'Activation');
      const avatar = page.getByTestId('agent-avatar-activation-bard');
      await page.getByTestId('agent-avatar-activation-toggle').click();
      await expect(avatar).toHaveAttribute('data-state', 'power');
      await expect(avatar).toHaveAttribute('data-state', 'idle', { timeout: 3000 });
      await expect(avatar).not.toHaveAttribute('data-veiled');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be decorative via aria-hidden when unlabelled', async ({ page }) => {
      await agentAvatarStory.goto(page, 'Basic');
      await expect(page.getByTestId('agent-avatar')).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
