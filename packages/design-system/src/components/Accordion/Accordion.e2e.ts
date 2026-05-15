import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const accordionStory = createStoryHelper('data-display-accordion', [
  'Primary',
  'Secondary',
  'Section',
  'Section With Actions',
  'Long Title',
  'Multiple',
  'Disabled',
] as const);

const getTrigger = (page: Page, name: RegExp | string) => page.getByRole('button', { name });

test.describe('Component: Accordion', () => {
  test.describe('Visual', () => {
    test('Should render primary variant correctly', async ({ page }) => {
      await accordionStory.goto(page, 'Primary');
      await expect(page).toHaveScreenshot();
    });

    test('Should render secondary variant correctly', async ({ page }) => {
      await accordionStory.goto(page, 'Secondary');
      await expect(page).toHaveScreenshot();
    });

    test('Should render section variant correctly', async ({ page }) => {
      await accordionStory.goto(page, 'Section');
      await expect(page).toHaveScreenshot();
    });

    test('Should render section with actions correctly', async ({ page }) => {
      await accordionStory.goto(page, 'Section With Actions');
      await expect(page).toHaveScreenshot();
    });

    test('Should render long title truncated correctly', async ({ page }) => {
      await accordionStory.goto(page, 'Long Title');
      await expect(page).toHaveScreenshot();
    });

    test('Should render multiple expanded items correctly', async ({ page }) => {
      await accordionStory.goto(page, 'Multiple');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled item correctly', async ({ page }) => {
      await accordionStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should expand item when trigger is clicked', async ({ page }) => {
      await accordionStory.goto(page, 'Primary');
      const trigger = getTrigger(page, /Title/).first();

      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should collapse expanded item on second click', async ({ page }) => {
      await accordionStory.goto(page, 'Section');
      const trigger = getTrigger(page, /Title/).first();

      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('Should not toggle accordion when action button is clicked', async ({ page }) => {
      await accordionStory.goto(page, 'Section With Actions');
      const trigger = getTrigger(page, /Title/).first();
      const deleteButton = page.getByRole('button', { name: 'Delete' }).first();

      const expandedBefore = await trigger.getAttribute('aria-expanded');
      await deleteButton.click();
      await expect(trigger).toHaveAttribute('aria-expanded', expandedBefore ?? 'true');
    });

    test('Should not nest interactive elements inside the trigger button', async ({ page }) => {
      await accordionStory.goto(page, 'Section With Actions');
      const nestedButtons = page.locator('[data-slot="accordion-trigger"] button');
      await expect(nestedButtons).toHaveCount(0);
    });

    test('Should keep disabled item collapsed when clicked', async ({ page }) => {
      await accordionStory.goto(page, 'Disabled');
      const disabledTrigger = getTrigger(page, 'Disabled item');

      await expect(disabledTrigger).toBeDisabled();
      await expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('Should allow multiple items open when multiple is true', async ({ page }) => {
      await accordionStory.goto(page, 'Multiple');
      const triggerA = getTrigger(page, 'Section A');
      const triggerB = getTrigger(page, 'Section B');

      await expect(triggerA).toHaveAttribute('aria-expanded', 'true');
      await expect(triggerB).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('Accessibility', () => {
    test('Should toggle via keyboard Enter key', async ({ page }) => {
      await accordionStory.goto(page, 'Primary');
      const trigger = getTrigger(page, /Title/).first();

      await trigger.focus();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should toggle via keyboard Space key', async ({ page }) => {
      await accordionStory.goto(page, 'Primary');
      const trigger = getTrigger(page, /Title/).first();

      await trigger.focus();
      await page.keyboard.press('Space');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should expose aria-controls referencing content region', async ({ page }) => {
      await accordionStory.goto(page, 'Primary');
      const trigger = getTrigger(page, /Title/).first();

      const controlsId = await trigger.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      await expect(page.locator(`[id="${controlsId}"]`)).toHaveAttribute('role', 'region');
    });
  });
});
