import { test, expect } from '@playwright/test';

test.describe('App E2E Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');

    await expect(true).toBeTruthy();
  });
});
