import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const stepperStory = createStoryHelper('navigation-stepper', [
  'Basic',
  'Step Types',
  'With Description',
  'Navigation',
  'In Drawer',
  'Long Label',
  'Six Steps',
  'With Footer',
  'Custom Indicator',
  'Analytics And Test Ids',
] as const);

const getStep = (page: Page, index: number, base = 'stepper') =>
  page.getByTestId(`${base}--item-${index}--trigger`);

test.describe('Component: Stepper', () => {
  test.describe('Visual', () => {
    test('Should render step types correctly', async ({ page }) => {
      await stepperStory.goto(page, 'Step Types');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with description correctly', async ({ page }) => {
      await stepperStory.goto(page, 'With Description');
      await expect(page).toHaveScreenshot();
    });

    test('Should render long label with ellipsis correctly', async ({ page }) => {
      await stepperStory.goto(page, 'Long Label');
      await expect(page).toHaveScreenshot();
    });

    test('Should render six steps correctly', async ({ page }) => {
      await stepperStory.goto(page, 'Six Steps');
      await expect(page).toHaveScreenshot();
    });

    test('Should render custom indicator correctly', async ({ page }) => {
      await stepperStory.goto(page, 'Custom Indicator');
      await expect(page).toHaveScreenshot();
    });

    test('Should render footer recipe correctly', async ({ page }) => {
      await stepperStory.goto(page, 'With Footer');
      await page.getByTestId('stepper-next').click();
      await expect(getStep(page, 1)).toHaveAttribute('aria-current', 'step');
      await expect(page).toHaveScreenshot();
    });

    test('Should render keyboard focus ring correctly', async ({ page }) => {
      await stepperStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(getStep(page, 1)).toBeFocused();
      // The focus ring is a Tailwind ring, drawn as a box-shadow.
      await expect(getStep(page, 1)).not.toHaveCSS('box-shadow', 'none');
      await expect(page).toHaveScreenshot();
    });

    test('Should render overflow tooltip correctly', async ({ page }) => {
      await stepperStory.goto(page, 'Long Label');
      const title = page.getByTestId('stepper-long--title');
      await title.hover();
      // OverflowTooltipTrigger only starts measuring on the first pointer-enter, and the
      // tooltip stays disabled until that measurement re-renders — so nudge the pointer
      // inside the title until a pointer-move lands on the enabled trigger.
      const box = await title.boundingBox();
      if (!box) throw new Error('stepper title has no bounding box');
      await expect(async () => {
        await page.mouse.move(box.x + 5, box.y + 5);
        await page.mouse.move(box.x + 6, box.y + 5);
        await expect(page.getByRole('tooltip')).toBeVisible({ timeout: 1_000 });
      }).toPass({ timeout: 10_000 });
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should change the current step when a later step is clicked', async ({ page }) => {
      await stepperStory.goto(page, 'Navigation');
      await getStep(page, 2).click();
      await expect(getStep(page, 2)).toHaveAttribute('aria-current', 'step');
      await expect(getStep(page, 2)).toHaveAttribute('data-status', 'active');
      await expect(page.getByTestId('stepper-readout')).toHaveText('Current step: Scope');
    });

    test('Should change the current step when an earlier step is clicked', async ({ page }) => {
      await stepperStory.goto(page, 'Navigation');
      await getStep(page, 3).click();
      await expect(getStep(page, 3)).toHaveAttribute('aria-current', 'step');
      await getStep(page, 0).click();
      await expect(getStep(page, 0)).toHaveAttribute('aria-current', 'step');
      await expect(getStep(page, 3)).not.toHaveAttribute('aria-current');
    });

    test('Should advance the stepper when Next is clicked', async ({ page }) => {
      await stepperStory.goto(page, 'With Footer');
      await expect(page.getByTestId('stepper-back')).toBeHidden();
      await page.getByTestId('stepper-next').click();
      await expect(getStep(page, 1)).toHaveAttribute('aria-current', 'step');
      await expect(getStep(page, 0)).toHaveAttribute('data-status', 'completed');
      await expect(page.getByTestId('stepper-back')).toBeVisible();
    });

    test('Should show the submit button instead of Next when the last step is reached', async ({
      page,
    }) => {
      await stepperStory.goto(page, 'With Footer');
      await expect(page.getByTestId('stepper-next')).toHaveText('Next: Rules');
      await expect(page.getByTestId('stepper-submit')).toBeHidden();
      for (const index of [1, 2, 3]) {
        await page.getByTestId('stepper-next').click();
        await expect(getStep(page, index)).toHaveAttribute('aria-current', 'step');
      }
      await expect(page.getByTestId('stepper-next')).toBeHidden();
      await expect(page.getByTestId('stepper-submit')).toBeVisible();
      await expect(page.getByTestId('stepper-submit')).toHaveAttribute('type', 'submit');
      // The footer recipe keeps focus on the button that replaced Next.
      await expect(page.getByTestId('stepper-submit')).toBeFocused();
      await expect(page.getByTestId('stepper-back')).toBeVisible();
    });

    test('Should show only the current step body when a step is clicked', async ({ page }) => {
      await stepperStory.goto(page, 'With Footer');
      await expect(page.getByTestId('stepper--content-0')).toBeVisible();
      await expect(page.getByTestId('stepper--content-1')).toBeHidden();
      await getStep(page, 1).click();
      await expect(page.getByTestId('stepper--content-1')).toBeVisible();
      await expect(page.getByTestId('stepper--content-0')).toBeHidden();
    });

    test('Should go back when Back is clicked', async ({ page }) => {
      await stepperStory.goto(page, 'With Footer');
      await page.getByTestId('stepper-next').click();
      await page.getByTestId('stepper-next').click();
      await page.getByTestId('stepper-back').click();
      await expect(getStep(page, 1)).toHaveAttribute('aria-current', 'step');
    });

    test('Should not submit the form when a step or Next is clicked', async ({ page }) => {
      await stepperStory.goto(page, 'In Drawer');
      await page.getByTestId('drawer-open').click();
      await page.getByTestId('stepper--next-trigger').click();
      await expect(getStep(page, 1)).toHaveAttribute('aria-current', 'step');
      await getStep(page, 2).click();
      await expect(getStep(page, 2)).toHaveAttribute('aria-current', 'step');
      await expect(page.getByTestId('stepper-submitted')).toHaveText('Submitted: 0');
      // The click on Next into the last step swaps Next for the submit button: still no submit.
      await page.getByTestId('stepper--next-trigger').click();
      await expect(getStep(page, 3)).toHaveAttribute('aria-current', 'step');
      // Inside the Stepper root, the Drawer footer takes the Stepper's test id.
      await expect(
        page.getByTestId('stepper--footer').getByRole('button', { name: 'Create policy' }),
      ).toBeVisible();
      await expect(page.getByTestId('stepper-submitted')).toHaveText('Submitted: 0');
    });

    test('Should land analytics attributes on the step and footer buttons when the story renders', async ({
      page,
    }) => {
      await stepperStory.goto(page, 'Analytics And Test Ids');
      await expect(getStep(page, 0)).toHaveAttribute('data-analytics-id', 'POLICY_STEP_GENERAL');
      await expect(page.getByTestId('step-review')).toHaveAttribute(
        'data-analytics-id',
        'POLICY_STEP_REVIEW',
      );
      await expect(getStep(page, 0)).toHaveAttribute(
        'data-analytics-props',
        JSON.stringify({ flow: 'create-policy', step: 0 }),
      );
      await expect(page.getByTestId('stepper--prev-trigger')).toHaveAttribute(
        'data-analytics-id',
        'POLICY_STEP_BACK',
      );
      await expect(page.getByTestId('stepper--next-trigger')).toHaveAttribute(
        'data-analytics-id',
        'POLICY_STEP_NEXT',
      );
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await stepperStory.goto(page, 'Basic');
      for (const index of [0, 1, 2, 3]) {
        await page.keyboard.press('Tab');
        await expect(getStep(page, index)).toBeFocused();
      }
    });

    test('Should be activatable via keyboard Enter key', async ({ page }) => {
      await stepperStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(getStep(page, 1)).toHaveAttribute('aria-current', 'step');
    });

    test('Should be activatable via keyboard Space key', async ({ page }) => {
      await stepperStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
      await expect(getStep(page, 2)).toHaveAttribute('aria-current', 'step');
    });

    test('Should not show focus ring via mouse click', async ({ page }) => {
      await stepperStory.goto(page, 'Basic');
      await getStep(page, 1).click();
      await expect(getStep(page, 1)).toHaveAttribute('aria-current', 'step');
      await expect(getStep(page, 1)).toBeFocused();
      // Assert the rendered result, not the :focus-visible heuristic: a `focus:ring` regression
      // would draw the ring on click and fail here.
      await expect(getStep(page, 1)).toHaveCSS('box-shadow', 'none');
    });
  });
});
