import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const cardStory = createStoryHelper('data-display-card', [
  'Basic',
  'Variants',
  'Various Content',
] as const);

const getCards = (page: Page) => page.getByTestId('card');
const getDisabledCards = (page: Page) => page.getByTestId('disabled-card');

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

    // The story records the handling target in `data-last-click` rather than
    // logging it, so these assert the DOM instead of console output.
    test('Button click - does not trigger card click', async ({ page }) => {
      const card = getCards(page).first();
      await expect(card).toHaveAttribute('data-last-click', 'none');

      await card.getByRole('button', { name: 'Button' }).click();

      await expect(card).toHaveAttribute('data-last-click', 'button');
    });

    test('Card area click - triggers card click', async ({ page }) => {
      const card = getCards(page).first();
      await expect(card).toHaveAttribute('data-last-click', 'none');

      await card.getByTestId('card--content').click();

      await expect(card).toHaveAttribute('data-last-click', 'card');
    });
  });

  test.describe('Disabled State', () => {
    test.beforeEach(async ({ page }) => {
      await cardStory.goto(page, 'Variants');
    });

    test('Disabled cards - aria-disabled present', async ({ page }) => {
      const disabledCards = getDisabledCards(page);
      await expect(disabledCards).toHaveCount(2);
      await expect(disabledCards.nth(0)).toHaveAttribute('aria-disabled', 'true');
      await expect(disabledCards.nth(1)).toHaveAttribute('aria-disabled', 'true');
    });

    test('Disabled card - pointer events none', async ({ page }) => {
      const disabledCard = getDisabledCards(page).first();
      await expect(disabledCard).toHaveCSS('pointer-events', 'none');
    });
  });
});
