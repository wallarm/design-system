import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const cardStory = createStoryHelper('data-display-card', [
  'Basic',
  'Variants',
  'Various Content',
] as const);

const getCards = (page: Page) => page.locator('[data-slot="card"]');

test.describe('Card Component', () => {
  test.describe('View', () => {
    test('Basic card', async ({ page }) => {
      await cardStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('All variants', async ({ page }) => {
      await cardStory.goto(page, 'Variants');
      await expect(page).toHaveScreenshot();
    });

    test('Various content', async ({ page }) => {
      await cardStory.goto(page, 'Various Content');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactive States', () => {
    test.beforeEach(async ({ page }) => {
      await cardStory.goto(page, 'Basic');
    });

    test('Hover state', async ({ page }) => {
      const card = getCards(page).first();
      await card.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Focus state', async ({ page }) => {
      await page.keyboard.press('Tab');
      await expect(page).toHaveScreenshot();
    });

    test('Focus via Tab - card is focused', async ({ page }) => {
      await page.keyboard.press('Tab');
      const card = getCards(page).first();
      await expect(card).toBeFocused();
    });

    test('No tabindex on non-interactive card', async ({ page }) => {
      await cardStory.goto(page, 'Various Content');
      const firstCard = getCards(page).first();
      await expect(firstCard).not.toHaveAttribute('tabindex');
    });
  });

  test.describe('Click Isolation', () => {
    test.beforeEach(async ({ page }) => {
      await cardStory.goto(page, 'Basic');
    });

    test('Button click - does not trigger card click', async ({ page }) => {
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'log') {
          consoleLogs.push(msg.text());
        }
      });

      const button = getCards(page).first().getByRole('button', { name: 'Button' });
      await button.click();

      expect(consoleLogs).toContain('Card`s button clicked');
      expect(consoleLogs).not.toContain('Card clicked');
    });

    test('Card area click - triggers card click', async ({ page }) => {
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'log') {
          consoleLogs.push(msg.text());
        }
      });

      const card = getCards(page).first();
      const cardContent = card.locator('[data-slot="card-content"]');
      await cardContent.click();

      expect(consoleLogs).toContain('Card clicked');
    });
  });

  test.describe('Disabled State', () => {
    test.beforeEach(async ({ page }) => {
      await cardStory.goto(page, 'Variants');
    });

    test('Disabled cards - aria-disabled present', async ({ page }) => {
      const disabledCards = page.locator('[data-slot="card"][aria-disabled="true"]');
      await expect(disabledCards).toHaveCount(2);
    });

    test('Disabled card - pointer events none', async ({ page }) => {
      const disabledCard = page.locator('[data-slot="card"][aria-disabled="true"]').first();
      await expect(disabledCard).toHaveCSS('pointer-events', 'none');
    });
  });
});
