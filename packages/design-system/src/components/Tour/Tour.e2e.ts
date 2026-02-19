import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tourStory = createStoryHelper('overlay-tour', [
  'Overview',
  'Placement',
  'Beacon Triggered',
  'Wait For Interaction',
  'Wait For Input',
] as const);

const getTourContent = (page: Page) => page.locator('[data-part="content"]');
const getTourBackdrop = (page: Page) => page.locator('[data-part="backdrop"]');
const getBeaconOverlay = (page: Page) => page.locator('[style*="pulse"]');
const getCloseButton = (page: Page) => page.locator('[data-part="close-trigger"]');
const getActionButton = (page: Page, name: string) =>
  page.locator('[data-part="action-trigger"]').filter({ hasText: name });

const startTour = async (page: Page) => {
  await page.getByTestId('tour-start').click();
  await expect(getTourContent(page)).toBeVisible();
};
const goFirstStep = async (page: Page) => {
  await getActionButton(page, 'Start').click();
  await expect(getTourContent(page)).toBeVisible();
};
const goNextStep = async (page: Page) => {
  await getActionButton(page, 'Next').click();
  await expect(getTourContent(page)).toBeVisible();
};
const checkProgress = async (page: Page, text: string) => {
  const progress = page.locator('[data-part="progress-text"]');
  await expect(progress).toBeVisible();
  await expect(progress).toHaveText(text);
};

test.describe('Component: Tour', () => {
  test.describe('Visual', () => {
    test('Should render dialog step correctly', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);

      await expect(getTourBackdrop(page)).toBeVisible();
      await checkProgress(page, '1 of 6');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tooltip step correctly', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await goFirstStep(page);

      await expect(getTourBackdrop(page)).toBeVisible();
      await checkProgress(page, '2 of 6');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tooltip step with media correctly', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await goFirstStep(page);
      await goNextStep(page);

      await expect(getTourBackdrop(page)).toBeVisible();
      await checkProgress(page, '3 of 6');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tooltip step without backdrop correctly', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await goFirstStep(page);
      await goNextStep(page);
      await goNextStep(page);

      await expect(getTourBackdrop(page)).toBeHidden();
      await checkProgress(page, '4 of 6');
      await expect(page).toHaveScreenshot();
    });

    test('Should render circle spotlight correctly', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await goFirstStep(page);
      await goNextStep(page);
      await goNextStep(page);
      await goNextStep(page);

      await expect(getTourBackdrop(page)).toBeHidden();
      await checkProgress(page, '5 of 6');
      await expect(page).toHaveScreenshot();
    });

    test('Should render finish dialog with media correctly', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await goFirstStep(page);
      await goNextStep(page);
      await goNextStep(page);
      await goNextStep(page);
      await goNextStep(page);

      await expect(getTourBackdrop(page)).toBeVisible();
      await checkProgress(page, '6 of 6');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should navigate to previous step when Back button is clicked', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await goFirstStep(page);
      await goNextStep(page);
      await getActionButton(page, 'Back').click();

      await expect(getTourContent(page)).toContainText('Common use case');
    });

    test('Should dismiss tour when Skip button is clicked', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await getActionButton(page, 'Skip').click();

      await expect(getTourContent(page)).toBeHidden();
    });

    test('Should dismiss tour when Finish button is clicked', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await goFirstStep(page);
      await goNextStep(page);
      await goNextStep(page);
      await goNextStep(page);
      await goNextStep(page);
      await getActionButton(page, 'Finish').click();

      await expect(getTourContent(page)).toBeHidden();
    });

    test('Should close tour when close button is clicked', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await getCloseButton(page).click();

      await expect(getTourContent(page)).toBeHidden();
    });

    test('Should show tooltip when beacon target is clicked', async ({ page }) => {
      await tourStory.goto(page, 'Beacon Triggered');
      // Beacon auto-starts, tooltip is not visible yet
      await getBeaconOverlay(page).waitFor({ state: 'visible' });
      await expect(getTourContent(page)).toBeHidden();

      // Click the beacon target to reveal the tooltip
      await page.getByRole('button', { name: 'Quick tip' }).click();
      await expect(getTourContent(page)).toBeVisible();
      await expect(getTourContent(page)).toContainText('Quick tip');

      // Dismiss tooltip via close button (actions hidden during effect steps)
      await getCloseButton(page).click();
      await expect(getTourContent(page)).toBeHidden();
    });

    test('Should complete interactive tour when all targets are clicked', async ({ page }) => {
      await tourStory.goto(page, 'Wait For Interaction');
      await startTour(page);
      await goFirstStep(page);
      await expect(getTourContent(page)).toContainText('Click the Add button');

      // Click the target element to advance to the next step
      await page.getByRole('button', { name: 'Add Item' }).click();
      await expect(getTourContent(page)).toContainText('Click the Change button');

      await page.getByRole('button', { name: 'Change Item' }).click();
      await expect(getTourContent(page)).toContainText('Great!');

      await getActionButton(page, 'Finish').click();
      await expect(getTourContent(page)).toBeHidden();
    });

    test('Should advance step only when valid input is entered', async ({ page }) => {
      await tourStory.goto(page, 'Wait For Input');
      await startTour(page);
      await expect(getTourContent(page)).toContainText('Enter Your Name');

      // Type only 1 character (fails predicate: length >= 2)
      await page.getByPlaceholder('Enter your name').fill('J');
      await page.waitForTimeout(2000);

      // Should still be on the same step
      await expect(getTourContent(page)).toContainText('Enter Your Name');

      // Type a valid name (>= 2 chars) and wait for delay to elapse
      await page.getByPlaceholder('Enter your name').fill('John');
      await expect(getTourContent(page)).toContainText('Enter Your Email', { timeout: 5000 });
    });
  });

  test.describe('Accessibility', () => {
    test('Should navigate to next step via ArrowRight key', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await getActionButton(page, 'Start').click();
      await expect(getTourContent(page)).toContainText('Common use case');

      await page.keyboard.press('ArrowRight');
      await expect(getTourContent(page)).toContainText('Add an image, GIF, or video');
    });

    test('Should navigate to previous step via ArrowLeft key', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);
      await getActionButton(page, 'Start').click();
      await getActionButton(page, 'Next').click();
      await expect(getTourContent(page)).toContainText('Add an image, GIF, or video');

      await page.keyboard.press('ArrowLeft');
      await expect(getTourContent(page)).toContainText('Common use case');
    });

    test('Should dismiss tour via Escape key', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);

      await page.keyboard.press('Escape');
      await expect(getTourContent(page)).toBeHidden();
    });

    test('Should trap focus within content via Tab key', async ({ page }) => {
      await tourStory.goto(page, 'Overview');
      await startTour(page);

      // Press Tab multiple times to cycle through interactive elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      // Focus should remain trapped inside the tour content
      const content = getTourContent(page);
      await expect(content.locator(':focus')).toHaveCount(1);
    });

    test('Should block ArrowRight key when step has active effect', async ({ page }) => {
      await tourStory.goto(page, 'Wait For Interaction');
      await startTour(page);
      await getActionButton(page, 'Start').click();
      await expect(getTourContent(page)).toContainText('Click the Add button');

      // ArrowRight should be blocked during active effect
      await page.keyboard.press('ArrowRight');
      await expect(getTourContent(page)).toContainText('Click the Add button');
    });
  });
});
