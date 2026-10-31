import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const badgeStory = createStoryHelper('status-indication-badge', ['Muted Outline'] as const);

test.describe('Component: Badge', () => {
  test.describe('Visual', () => {
    for (const theme of ['light', 'dark'] as const) {
      test(`Should keep the muted outline neutral on a coloured surface in ${theme} theme`, async ({
        page,
      }) => {
        await badgeStory.goto(page, 'Muted Outline');
        await page.evaluate(theme => {
          document.documentElement.setAttribute('data-theme', theme);
        }, theme);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

        const badge = page.getByTestId('muted-outline');
        await expect(badge).toBeVisible();

        // Figma's muted Slate outline uses the usual label with a quieter primary
        // border. A coloured host exposes missing utilities that otherwise inherit
        // an almost-correct neutral page colour, including the currentColor border.
        const colors = await badge.evaluate(element => {
          const probe = document.createElement('span');
          probe.style.color = 'var(--color-badge-slate-dark)';
          probe.style.borderColor = 'var(--color-border-primary)';
          probe.style.backgroundColor = 'var(--color-badge-badge-bg)';
          element.appendChild(probe);
          const expected = getComputedStyle(probe);
          const actual = getComputedStyle(element);
          const result = {
            actual: {
              color: actual.color,
              border: actual.borderTopColor,
              background: actual.backgroundColor,
            },
            expected: {
              color: expected.color,
              border: expected.borderTopColor,
              background: expected.backgroundColor,
            },
          };
          probe.remove();
          return result;
        });

        expect(colors.actual).toEqual(colors.expected);
        await expect(badge).toHaveCSS('border-top-width', '1px');
        await expect(badge).toHaveCSS('border-top-style', 'solid');
      });
    }
  });
});
