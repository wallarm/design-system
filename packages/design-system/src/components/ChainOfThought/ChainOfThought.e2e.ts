import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const cotStory = createStoryHelper('ai-chainofthought', [
  'Basic',
  'Nested',
  'With Agent',
  'Simple Rows',
  'Simple Result',
  'Working',
  'Streaming',
  'Error Step',
  'Worked Summary',
  'Rich Text Content',
  'Controlled',
] as const);

test.describe('Component: ChainOfThought', () => {
  test.describe('Visual', () => {
    test('Should render icon steps with connectors correctly', async ({ page }) => {
      await cotStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render nested collapsible steps correctly', async ({ page }) => {
      await cotStory.goto(page, 'Nested');
      await expect(page).toHaveScreenshot();
    });

    test('Should render sub-agent steps with agent glyphs correctly', async ({ page }) => {
      await cotStory.goto(page, 'With Agent');
      await expect(page).toHaveScreenshot();
    });

    test('Should render simple rows correctly', async ({ page }) => {
      await cotStory.goto(page, 'Simple Rows');
      await expect(page).toHaveScreenshot();
    });

    test('Should render simple rows with a metric correctly', async ({ page }) => {
      await cotStory.goto(page, 'Simple Result');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a running step correctly', async ({ page }) => {
      await cotStory.goto(page, 'Working');
      await expect(page).toHaveScreenshot();
    });

    test('Should render an error step correctly', async ({ page }) => {
      await cotStory.goto(page, 'Error Step');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the worked summary correctly', async ({ page }) => {
      await cotStory.goto(page, 'Worked Summary');
      await expect(page).toHaveScreenshot();
    });

    test('Should render rich text content correctly', async ({ page }) => {
      await cotStory.goto(page, 'Rich Text Content');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show the chevron when a collapsed step is hovered', async ({ page }) => {
      await cotStory.goto(page, 'Nested');
      const row = page.getByTestId('cot-collapsed');
      await row.hover();
      await expect(row).toHaveScreenshot();
    });

    test('Should expand nested content when the row is clicked', async ({ page }) => {
      await cotStory.goto(page, 'Nested');
      const row = page.getByTestId('cot-collapsed');
      await expect(row).toHaveAttribute('aria-expanded', 'false');
      await row.click();
      await expect(row).toHaveAttribute('aria-expanded', 'true');
      const contentId = await row.getAttribute('aria-controls');
      await expect(page.locator(`[id="${contentId}"]`)).toBeVisible();
    });

    test('Should animate only steps that mount as running', async ({ page }) => {
      await cotStory.goto(page, 'Streaming');
      // Two history steps (mounted done) precede the streamed ones.
      const steps = page.getByTestId('cot--step');
      const li = (i: number) => steps.nth(i).locator('xpath=..');
      await expect(steps).toHaveCount(3);
      await expect(li(0)).toHaveAttribute('data-status', 'done');
      await expect(li(0)).not.toHaveAttribute('data-entered');
      await expect(li(2)).toHaveAttribute('data-status', 'running');
      await page.getByTestId('next-step').click();
      await expect(steps).toHaveCount(4);
      await expect(li(1)).not.toHaveAttribute('data-entered');
      await expect(li(2)).toHaveAttribute('data-status', 'done');
      await expect(li(3)).toHaveAttribute('data-status', 'running');
      await expect(li(3)).toHaveAttribute('data-entered', 'true');
      // The enter transition settles at the static end state.
      await expect(li(3)).toHaveCSS('opacity', '1');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be toggled via keyboard Enter key', async ({ page }) => {
      await cotStory.goto(page, 'Controlled');
      const row = page.getByTestId('cot--step');
      await row.focus();
      await page.keyboard.press('Enter');
      await expect(row).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Enter');
      await expect(row).toHaveAttribute('aria-expanded', 'false');
    });

    test('Should be toggled via keyboard Space key', async ({ page }) => {
      await cotStory.goto(page, 'Controlled');
      const row = page.getByTestId('cot--step');
      await row.focus();
      await page.keyboard.press('Space');
      await expect(row).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
