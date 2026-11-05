import { expect, type Locator, type Page } from '@playwright/test';

/** Live agent characters draw their static frame under reduced motion, so screenshots are stable. */
export const holdAgentsStill = (page: Page) => page.emulateMedia({ reducedMotion: 'reduce' });

/** Waits until every 3D character inside `root` shows its baked layers (the veil only counts while it shows). */
export const waitForAgentBakes = (root: Locator) =>
  expect
    .poll(() =>
      root.evaluate(el =>
        [...el.querySelectorAll('[data-part~="ly"]')]
          .filter(g => !g.closest('[data-part~="veil"]'))
          .every(g => g.hasAttribute('data-ready')),
      ),
    )
    .toBe(true);
