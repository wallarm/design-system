import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const timelineStory = createStoryHelper('data-display-timeline', [
  'Basic',
  'With Content',
  'Without Connector',
] as const);

test.describe('Component: Timeline', () => {
  test.describe('Visual', () => {
    test('Should render a plain numbered stepper correctly', async ({ page }) => {
      await timelineStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render steps with title and description correctly', async ({ page }) => {
      await timelineStory.goto(page, 'With Content');
      await expect(page).toHaveScreenshot();
    });

    test('Should not render a connecting line after the last step', async ({ page }) => {
      await timelineStory.goto(page, 'Basic');
      const lastSeparator = page
        .getByRole('listitem')
        .last()
        .locator('[data-slot="timeline-separator"]');
      await expect(lastSeparator).toBeHidden();
    });

    test('Should render content-only steps without a connector column correctly', async ({
      page,
    }) => {
      await timelineStory.goto(page, 'Without Connector');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose the step count via list semantics', async ({ page }) => {
      await timelineStory.goto(page, 'With Content');
      await expect(page.getByRole('list')).toBeVisible();
      await expect(page.getByRole('listitem')).toHaveCount(3);
    });
  });
});
