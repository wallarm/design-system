import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('overlay-feedbackpulse', ['Playground', 'Rating'] as const);

const pickAndSend = async (page: Page) => {
  await page.getByRole('radio', { name: '4' }).click();
  await page.getByPlaceholder('Tell us why? (optional)').fill('Great');
  await page.getByRole('button', { name: 'Send' }).click();
};

test.describe('Component: FeedbackPulse', () => {
  test.describe('Visual', () => {
    test('Should render the Rating phase correctly', async ({ page }) => {
      await story.goto(page, 'Rating');
      await expect(page.getByRole('dialog')).toHaveScreenshot('feedback-pulse-rating.png', {
        animations: 'disabled',
      });
    });

    test('Should render the Feedback phase correctly', async ({ page }) => {
      await story.goto(page, 'Rating');
      await page.getByRole('radio', { name: '4' }).click();
      await expect(page.getByRole('dialog')).toHaveScreenshot('feedback-pulse-feedback.png', {
        animations: 'disabled',
      });
    });
  });

  test.describe('Interactions', () => {
    test('Should reveal comment + Send when a score is selected', async ({ page }) => {
      await story.goto(page, 'Rating');
      await page.getByRole('radio', { name: '3' }).click();
      await expect(page.getByPlaceholder('Tell us why? (optional)')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
    });

    test('Should show the confirmation when feedback is sent', async ({ page }) => {
      await story.goto(page, 'Playground');
      await pickAndSend(page);
      await expect(page.getByText('Thanks a lot! — Wallarm Team')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should move scale selection via arrow keys', async ({ page }) => {
      await story.goto(page, 'Rating');
      await page.getByRole('radio', { name: '3' }).click();
      await page.getByRole('radiogroup').press('ArrowRight');
      await expect(page.getByRole('radio', { name: '4' })).toHaveAttribute('aria-checked', 'true');
    });
  });
});
