import { expect, type Locator, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const hoverCardStory = createStoryHelper('overlay-hovercard', [
  'Agent',
  'User',
  'Without Action',
  'Loading',
  'Unavailable',
  'Long Values',
  'In Table',
  'With Tooltip',
  'Analytics',
] as const);

// Every story starts closed; screenshot stories open their card by hover.
const SCREENSHOT_STORIES = ['Agent', 'User', 'Loading', 'Unavailable', 'Long Values'] as const;
const INTERACTIVE_STORY = 'Without Action';

const OPEN_DELAY = 600;
const TOOLTIP_OPEN_DELAY = 400; // zag tooltip default
const CLOSE_DELAY = 300;

type Story = Parameters<typeof hoverCardStory.goto>[1];

// Each story's root data-testid; In Table renders one card per row and uses row 4, whose name
// truncates in the column.
const ROOT_TEST_ID = {
  Agent: 'agent-card',
  User: 'user-card',
  'Without Action': 'lens-card',
  Loading: 'loading-card',
  Unavailable: 'unavailable-card',
  'Long Values': 'long-card',
  'In Table': 'user-card-4',
  'With Tooltip': 'tooltip-card',
  Analytics: 'analytics-card',
} as const satisfies Record<Story, string>;

const getPart = (page: Page, story: Story, part: string) =>
  page.getByTestId(`${ROOT_TEST_ID[story]}--${part}`);
const getTrigger = (page: Page, story: Story) => getPart(page, story, 'trigger');
const getContent = (page: Page, story: Story) => getPart(page, story, 'content');

// Every baked character layer inside the card is decoded (the veil only while the ghost shows).
const waitForBakes = (page: Page) =>
  page.waitForFunction(() =>
    [...document.querySelectorAll('[data-testid$="--content"] svg')].every(svg => {
      const ghost = svg.hasAttribute('data-ghosting');
      return [...svg.querySelectorAll('[data-part~="ly"]')]
        .filter(g => ghost || !g.closest('[data-part~="veil"]'))
        .every(g => g.hasAttribute('data-ready'));
    }),
  );

// The open and close delays run on zag timers; a fake clock steps over them without real waits.
const gotoWithClock = async (
  page: Page,
  story: typeof INTERACTIVE_STORY | 'In Table' | 'With Tooltip',
) => {
  await hoverCardStory.goto(page, story);
  await page.clock.install();
};

const hoverOpen = async (page: Page, story: Story) => {
  await getTrigger(page, story).hover();
  await page.clock.runFor(OPEN_DELAY);
  await expect(getContent(page, story)).toBeVisible();
};

const isTopmost = (locator: Locator) =>
  locator.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return !!top && el.contains(top);
  });

test.describe('Component: HoverCard', () => {
  test.describe('Visual', () => {
    for (const story of SCREENSHOT_STORIES) {
      test(`Should render ${story.toLowerCase()} card correctly`, async ({ page }) => {
        // Reduced motion: the live 3D character and skeletons draw a static frame.
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await hoverCardStory.goto(page, story);
        await getTrigger(page, story).hover();
        await expect(getContent(page, story)).toBeVisible();
        await waitForBakes(page);
        await expect(page).toHaveScreenshot({ animations: 'disabled' });
      });
    }
  });

  test.describe('Interactions', () => {
    test('Should open card when trigger is hovered', async ({ page }) => {
      await gotoWithClock(page, INTERACTIVE_STORY);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeHidden();

      await getTrigger(page, INTERACTIVE_STORY).hover();
      await page.clock.runFor(OPEN_DELAY - 100);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeHidden();

      await page.clock.runFor(100);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeVisible();
    });

    test('Should stay open when pointer moves onto the card', async ({ page }) => {
      await gotoWithClock(page, INTERACTIVE_STORY);
      await hoverOpen(page, INTERACTIVE_STORY);

      await getPart(page, INTERACTIVE_STORY, 'header').hover();
      await page.clock.runFor(CLOSE_DELAY * 3);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeVisible();
    });

    test('Should stack title tooltip above the card when long title is hovered', async ({
      page,
    }) => {
      await hoverCardStory.goto(page, 'Long Values');
      await getTrigger(page, 'Long Values').hover();
      await expect(getContent(page, 'Long Values')).toBeVisible();

      await getPart(page, 'Long Values', 'title').hover();
      const tooltip = getPart(page, 'Long Values', 'title--content');
      await expect(tooltip).toBeVisible();
      expect(await isTopmost(tooltip)).toBe(true);
    });

    test('Should stay open when pointer moves onto a tooltip inside the card', async ({ page }) => {
      await gotoWithClock(page, 'In Table');
      await hoverOpen(page, 'In Table');

      // Step onto the card first, then rest on the title.
      await getPart(page, 'In Table', 'header').hover();
      await page.clock.runFor(CLOSE_DELAY);
      await getPart(page, 'In Table', 'title').hover();
      await page.clock.runFor(OPEN_DELAY);
      const tooltip = getPart(page, 'In Table', 'title--content');
      await expect(tooltip).toBeVisible();

      // The portaled tooltip is a React descendant of the content, so entering it is no leave.
      await tooltip.hover();
      await page.clock.runFor(CLOSE_DELAY * 3);
      await expect(getContent(page, 'In Table')).toBeVisible();
    });

    test('Should close card when pointer leaves', async ({ page }) => {
      await gotoWithClock(page, INTERACTIVE_STORY);
      await hoverOpen(page, INTERACTIVE_STORY);

      await page.mouse.move(0, 0);
      await page.clock.runFor(CLOSE_DELAY);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeHidden();
    });

    test('Should show no name tooltip when truncated table name is hovered', async ({ page }) => {
      await gotoWithClock(page, 'In Table');
      await getTrigger(page, 'In Table').hover();
      await page.clock.runFor(TOOLTIP_OPEN_DELAY);
      // On a HoverCard trigger AvatarName drops its overflow tooltip: the card shows the full name.
      await expect(page.getByTestId('user-row-4--content')).toHaveCount(0);
      await page.clock.runFor(OPEN_DELAY - TOOLTIP_OPEN_DELAY);
      await expect(getContent(page, 'In Table')).toBeVisible();
      await expect(page.getByTestId('user-row-4--content')).toHaveCount(0);
      await expect(getTrigger(page, 'In Table')).toHaveCount(1);
    });

    test('Should replace trigger tooltip with card when trigger with tooltip is hovered', async ({
      page,
    }) => {
      await gotoWithClock(page, 'With Tooltip');
      const trigger = getTrigger(page, 'With Tooltip');
      const tooltip = page.getByTestId('tooltip-card-tooltip--content');

      await trigger.hover();
      await page.clock.runFor(TOOLTIP_OPEN_DELAY);
      await expect(tooltip).toBeVisible();
      await expect(getContent(page, 'With Tooltip')).toBeHidden();

      await page.clock.runFor(OPEN_DELAY - TOOLTIP_OPEN_DELAY);
      await expect(getContent(page, 'With Tooltip')).toBeVisible();
      await expect(tooltip).toBeHidden();

      // Both machines found the shared trigger: the card sits under it, not at the viewport origin.
      const triggerBox = await trigger.boundingBox();
      const contentBox = await getContent(page, 'With Tooltip').boundingBox();
      expect(contentBox?.y).toBeGreaterThan((triggerBox?.y ?? 0) + (triggerBox?.height ?? 0));
      expect(Math.abs((contentBox?.x ?? 0) - (triggerBox?.x ?? 0))).toBeLessThan(2);

      // The tooltip stays off while the card is up.
      await getPart(page, 'With Tooltip', 'header').hover();
      await trigger.hover();
      await page.clock.runFor(TOOLTIP_OPEN_DELAY * 2);
      await expect(tooltip).toBeHidden();
      await expect(getContent(page, 'With Tooltip')).toBeVisible();
    });

    test.describe('Touch', () => {
      test.use({ hasTouch: true });

      test('Should open no card from touch pointer and follow link when trigger is tapped', async ({
        page,
      }) => {
        await gotoWithClock(page, INTERACTIVE_STORY);
        const trigger = getTrigger(page, INTERACTIVE_STORY);

        // zag ignores touch pointers (React's onPointerEnter is driven by pointerover).
        await trigger.dispatchEvent('pointerover', { pointerType: 'touch' });
        await page.clock.runFor(OPEN_DELAY * 2);
        await expect(getContent(page, INTERACTIVE_STORY)).toBeHidden();

        // The tap runs the link natively. A `#` link keeps focus on the trigger, and focus alone
        // may still open the card (spec: Behavior → Touch), so that is not asserted here.
        await trigger.tap();
        await expect(page).toHaveURL(/#$/);
      });
    });
  });

  test.describe('Accessibility', () => {
    test('Should be opened via Tab focus and closed via Tab away', async ({ page }) => {
      await gotoWithClock(page, INTERACTIVE_STORY);
      const trigger = getTrigger(page, INTERACTIVE_STORY);

      await trigger.focus();
      await expect(trigger).toBeFocused();
      await page.clock.runFor(OPEN_DELAY);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeVisible();

      // Focus never moves into the card; Tab goes to the next page element and blur closes it.
      await page.keyboard.press('Tab');
      await expect(trigger).not.toBeFocused();
      await page.clock.runFor(CLOSE_DELAY);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeHidden();
    });

    test('Should be dismissible via Escape key', async ({ page }) => {
      await gotoWithClock(page, INTERACTIVE_STORY);
      const trigger = getTrigger(page, INTERACTIVE_STORY);

      await trigger.focus();
      await page.clock.runFor(OPEN_DELAY);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeVisible();

      await page.keyboard.press('Escape');
      await page.clock.runFor(CLOSE_DELAY);
      await expect(getContent(page, INTERACTIVE_STORY)).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    for (const story of ['Agent', 'User'] as const) {
      test(`Should be announced via the trigger name with no popup role in ${story.toLowerCase()} card`, async ({
        page,
      }) => {
        await hoverCardStory.goto(page, story);
        await getTrigger(page, story).hover();
        await expect(getContent(page, story)).toBeVisible();

        // Stands in for the spec's axe run (no axe tooling in this repo's e2e): no ARIA is added,
        // the trigger keeps its native role and name, the content has no role.
        const trigger = getTrigger(page, story);
        await expect(trigger).toHaveAccessibleName(/\S/);
        await expect(trigger).not.toHaveAttribute('aria-haspopup');
        await expect(trigger).not.toHaveAttribute('aria-expanded');
        await expect(getContent(page, story)).not.toHaveAttribute('role');
        await expect(getContent(page, story)).toHaveAttribute('tabindex', '-1');
      });
    }
  });
});
