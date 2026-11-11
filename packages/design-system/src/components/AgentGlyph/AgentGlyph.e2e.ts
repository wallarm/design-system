import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const agentGlyphStory = createStoryHelper('ai-agentglyph', [
  'Basic',
  'Cast',
  'Sizes',
  'Inline With Text',
  'Partial Coverage',
  'Custom Agent',
] as const);

test.describe('Component: AgentGlyph', () => {
  test.describe('Visual', () => {
    test('Should render the basic glyph correctly', async ({ page }) => {
      await agentGlyphStory.goto(page, 'Basic');
      await expect(page.getByTestId('agent-glyph')).toHaveScreenshot();
    });

    test('Should render every agent in every state frame correctly', async ({ page }) => {
      await agentGlyphStory.goto(page, 'Cast');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all sizes correctly', async ({ page }) => {
      await agentGlyphStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render glyphs inline with text correctly', async ({ page }) => {
      await agentGlyphStory.goto(page, 'Inline With Text');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the partial coverage crown correctly', async ({ page }) => {
      await agentGlyphStory.goto(page, 'Partial Coverage');
      await expect(page).toHaveScreenshot();
    });

    test('Should render default looks for custom agents correctly', async ({ page }) => {
      await agentGlyphStory.goto(page, 'Custom Agent');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    // WDS-198 acceptance (C55): the body's optical centre sits within 0.13 px of the row's centre line.
    test('Should center each body on its row within 0.13 px via optical alignment', async ({
      page,
    }) => {
      await agentGlyphStory.goto(page, 'Inline With Text');
      const offsets = await page
        .locator('[data-testid^="agent-glyph-inline-optical-"]')
        .evaluateAll(svgs =>
          svgs.map(svg => {
            const r = svg.getBoundingClientRect();
            const row = (svg.parentElement as HTMLElement).getBoundingClientRect();
            const s = Math.min(r.width / 136, r.height / 128); // viewBox -8 -14 136 128, xMidYMid meet
            const top = r.top + (r.height - 128 * s) / 2;
            // optical centre in viewBox units: y 50 plus the shape's optY, which is exactly what --oy lifts by
            const optY =
              (-Number.parseFloat(getComputedStyle(svg).getPropertyValue('--oy')) * 136) / r.width;
            const centre = top + (50 + optY + 14) * s;
            return Math.abs(centre - (row.top + row.height / 2));
          }),
        );
      expect(offsets).toHaveLength(7);
      for (const d of offsets) expect(d).toBeLessThanOrEqual(0.13);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be hidden from assistive technology via aria-hidden', async ({ page }) => {
      await agentGlyphStory.goto(page, 'Basic');
      await expect(page.getByTestId('agent-glyph')).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
