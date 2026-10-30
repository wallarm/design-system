/**
 * Duplicate Ordinals E2E Tests
 *
 * Tests keyboard-only flow for building points with dup ordinals.
 *
 * @see packages/docs/point-format.md#duplicate-ordinals
 */

import { expect, test } from '@playwright/test';

test.describe('PointSelector: Duplicate Ordinals E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-pointselector--default');
  });

  test('keyboard-only: select first duplicate [dup:0]', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build [http:header]['x-forwarded-for'][dup:0]
    // Step 1: Type 'header' and select
    await input.fill('header');
    await expect(page.getByText('http:header')).toBeVisible();
    await input.press('Enter');

    // Step 2: Type 'x-forwarded-for' and select
    await input.fill('x-forwarded-for');
    await expect(page.getByText(/'x-forwarded-for'/i)).toBeVisible();
    await input.press('Enter');

    // Step 3: Dup options should be visible
    await expect(page.getByText(/first duplicate.*\[dup:0\]/i)).toBeVisible();

    // Step 4: Press '1' to select First duplicate [dup:0]
    await input.press('1');

    // Verify chip shows [dup:0]
    await expect(page.getByText('[dup:0]')).toBeVisible();

    // Verify canonical form
    const canonicalDisplay = page.getByTestId('point-selector--canonical-display');
    if (await canonicalDisplay.isVisible()) {
      await expect(canonicalDisplay).toContainText("[http:header]['x-forwarded-for'][dup:0]");
    }
  });

  test('keyboard-only: select last duplicate [dup:-1]', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build [http:header]['cookie'][dup:-1]
    await input.fill('header');
    await input.press('Enter');

    await input.fill('cookie');
    await input.press('Enter');

    // Wait for dup menu
    await expect(page.getByText(/last duplicate.*\[dup:-1\]/i)).toBeVisible();

    // Press '3' for Last duplicate (it's the 3rd option)
    await input.press('3');

    // Verify chip
    await expect(page.getByText('[dup:-1]')).toBeVisible();
  });

  test('keyboard-only: select all duplicates [dup:all]', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build [http:query][format:form]['tag'][dup:all]
    await input.fill('query');
    await input.press('Enter');

    await input.fill('form');
    await input.press('Enter');

    await input.fill('tag');
    await input.press('Enter');

    // Wait for dup menu
    await expect(page.getByText(/all duplicates.*\[dup:all\]/i)).toBeVisible();

    // Press '4' for All duplicates
    await input.press('4');

    // Verify chip
    await expect(page.getByText('[dup:all]')).toBeVisible();
  });

  test('keyboard-only: select any duplicate [dup:any]', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build [http:header]['cache-control'][dup:any]
    await input.fill('header');
    await input.press('Enter');

    await input.fill('cache-control');
    await input.press('Enter');

    // Wait for dup menu
    await expect(page.getByText(/any duplicate.*\[dup:any\]/i)).toBeVisible();

    // Press '5' for Any duplicate
    await input.press('5');

    // Verify chip
    await expect(page.getByText('[dup:any]')).toBeVisible();
  });

  test('mouse click: select dup option', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build point with mouse
    await input.fill('header');
    await page.getByText('http:header').click();

    await input.fill('authorization');
    await page.getByText(/'authorization'/i).click();

    // Click "First duplicate [dup:0]"
    await page.getByText(/first duplicate.*\[dup:0\]/i).click();

    // Verify chip
    await expect(page.getByText('[dup:0]')).toBeVisible();
  });

  test('arrow keys: navigate dup menu', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build point
    await input.fill('header');
    await input.press('Enter');

    await input.fill('cookie');
    await input.press('Enter');

    // Wait for menu
    await expect(page.getByText(/first duplicate.*\[dup:0\]/i)).toBeVisible();

    // Navigate with arrow down
    await input.press('ArrowDown');
    await input.press('ArrowDown'); // Move to Second duplicate

    // Press Enter to select
    await input.press('Enter');

    // Should select Second duplicate [dup:1]
    await expect(page.getByText('[dup:1]')).toBeVisible();
  });

  test('continue building after dup segment', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build [http:header]['cookie'][format:cookie]['session'][dup:0]
    await input.fill('header');
    await input.press('Enter');

    await input.fill('cookie');
    await input.press('Enter');

    // Add format:cookie
    await input.fill('cookie');
    await expect(page.getByText(/cookie/i)).toBeVisible();
    // Find the format option (might be in menu)
    const formatOption = page.getByText(/format.*cookie/i).first();
    await formatOption.click();

    // Add 'session' key
    await input.fill('session');
    await input.press('Enter');

    // Add [dup:0]
    await expect(page.getByText(/first duplicate.*\[dup:0\]/i)).toBeVisible();
    await input.press('1');

    // Verify final canonical form
    const chips = page.getByTestId('point-selector--where-bar');
    await expect(chips).toContainText('[dup:0]');
  });

  test('backspace removes dup segment', async ({ page }) => {
    // Load story with pre-filled dup segment
    await page.goto(
      '/storybook/iframe.html?id=components-pointselector--presets&args=presetId:dup:-1',
    );

    const input = page.getByTestId('point-selector--bar-input');

    // Should show [dup:-1] chip
    await expect(page.getByText('[dup:-1]')).toBeVisible();

    // Click the chip to truncate (or press Escape then Backspace)
    await input.focus();
    await input.press('Escape'); // Close menu if open
    await input.press('Backspace');

    // [dup:-1] should be removed
    await expect(page.getByText('[dup:-1]')).not.toBeVisible();

    // Previous segment should still be there
    await expect(page.getByText(/'x-forwarded-for'/i)).toBeVisible();
  });

  test('dup options appear only after concrete key', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build [http:header]
    await input.fill('header');
    await input.press('Enter');

    // Menu should NOT show dup options yet (no concrete key selected)
    await expect(page.getByText(/first duplicate/i)).not.toBeVisible();

    // Now add a concrete key
    await input.fill('authorization');
    await input.press('Enter');

    // NOW dup options should appear
    await expect(page.getByText(/first duplicate.*\[dup:0\]/i)).toBeVisible();
  });

  test('dup options work after array index', async ({ page }) => {
    const input = page.getByTestId('point-selector--bar-input');

    // Build [http:body][format:json]['users'][0]
    await input.fill('body');
    await input.press('Enter');

    await input.fill('json');
    await input.press('Enter');

    await input.fill('users');
    await input.press('Enter');

    await input.fill('0');
    await input.press('Enter');

    // Dup options should be available after index
    await expect(page.getByText(/first duplicate.*\[dup:0\]/i)).toBeVisible();

    // Select [dup:-1]
    await input.press('3');

    // Verify
    await expect(page.getByText('[dup:-1]')).toBeVisible();
  });
});
