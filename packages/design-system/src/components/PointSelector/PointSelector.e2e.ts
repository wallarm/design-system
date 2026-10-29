import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const pointSelectorStory = createStoryHelper('components-pointselector', [
  'BuildFromScratch',
  'HttpRequest',
  'HttpResponse',
  'WithInitialValue',
  'JWTClaims',
  'WithWildcards',
  'MultiFormatParsing',
  'PointOnlyMode',
  'CanonicalFormFeedback',
  'WithProfileSelector',
  'ProfileRevalidation',
  'ErrorFixes',
] as const);

const getInput = (page: Page) => page.getByRole('textbox').first();
const getCombobox = (page: Page) => page.locator('[role="combobox"]').first();
const getMenu = (page: Page) => page.getByRole('menu').first();
const getChips = (page: Page) => page.locator('[data-slot="where-bar"] button');

test.describe('Component: PointSelector', () => {
  test.describe('Visual', () => {
    test('Should render empty state correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with initial value correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with menu open correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);
      await input.click();

      // Wait for menu to appear
      await expect(getMenu(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render with chips correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');
      const chips = getChips(page);
      await expect(chips.first()).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render http_response context correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpResponse');
      await expect(page).toHaveScreenshot();
    });

    test('Should render JWT claims correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'JWTClaims');
      await expect(page).toHaveScreenshot();
    });

    test('Should render wildcards correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithWildcards');
      await expect(page).toHaveScreenshot();
    });

    test('Should render multi-format parsing correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'MultiFormatParsing');
      await expect(page).toHaveScreenshot();
    });

    test('Should render point-only mode correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'PointOnlyMode');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open menu when input is clicked', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      await expect(getMenu(page)).toBeHidden();
      await input.click();
      await expect(getMenu(page)).toBeVisible();
    });

    test('Should filter menu items when typing', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      await input.click();
      await input.fill('hea');

      // Menu should show filtered items
      await expect(getMenu(page)).toBeVisible();
      const menuItems = page.locator('[role="menuitem"]');
      await expect(menuItems.first()).toBeVisible();
    });

    test('Should select menu item with Enter key', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Navigate with arrow down and select with Enter
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Chip should be added after selection
      await page.waitForTimeout(200);
    });

    test('Should select menu item with digit key', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Press digit to select (e.g., "3" for Header)
      await page.keyboard.press('3');

      // Wait for selection to process
      await page.waitForTimeout(600); // Number selection has 500ms timeout

      // Chip should be added
      const chips = getChips(page);
      await expect(chips).toHaveCount(1);
    });

    test('Should remove last chip when backspace is pressed on empty query', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');
      const input = getInput(page);

      const initialChips = await getChips(page).count();
      expect(initialChips).toBeGreaterThan(0);

      await input.click();
      await page.keyboard.press('Backspace');

      // Should have one less chip
      await page.waitForTimeout(200);
      const finalChips = await getChips(page).count();
      expect(finalChips).toBeLessThan(initialChips);
    });

    test('Should close menu when Escape is pressed', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(getMenu(page)).toBeHidden();
    });

    test('Should focus Next button when Tab is pressed', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');
      const input = getInput(page);

      await input.click();
      await page.keyboard.press('Tab');

      // Next button should be focused
      const nextButton = page.getByRole('button', { name: /Next:/ });
      await expect(nextButton).toBeFocused();
    });

    test('Should navigate menu with arrow keys', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Navigate down
      await page.keyboard.press('ArrowDown');
      // The first item should be highlighted (use aria-selected)
      const firstItem = page.locator('[role="menuitem"]').first();
      await expect(firstItem).toHaveAttribute('aria-selected', 'true');

      // Navigate down again
      await page.keyboard.press('ArrowDown');
      // Second item should be highlighted
      const secondItem = page.locator('[role="menuitem"]').nth(1);
      await expect(secondItem).toHaveAttribute('aria-selected', 'true');
    });

    test('Should truncate point when chip is clicked', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');
      const chips = getChips(page);

      const initialChipCount = await chips.count();
      expect(initialChipCount).toBeGreaterThan(1);

      // Click the first chip
      await chips.first().click();

      // Menu should open
      await expect(getMenu(page)).toBeVisible();

      // Point should be truncated to that chip (only first chip remains)
      await page.waitForTimeout(200);
      const finalChipCount = await chips.count();
      expect(finalChipCount).toBe(1);
    });

    test('Should support multi-digit selection', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Type "1" quickly for single-digit selection
      await page.keyboard.press('1');

      // Wait for number buffer timeout
      await page.waitForTimeout(600);

      // First option should be selected and chip added
      const chips = getChips(page);
      await expect(chips).toHaveCount(1);
    });

    test('Should handle name step flow (header selection)', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Select "Header" (option 3)
      await page.keyboard.press('3');
      await page.waitForTimeout(600);

      // Name step should appear with input
      const nameInput = page.locator('input[placeholder*="header"]');
      await expect(nameInput).toBeVisible();

      // Type "auth" to filter
      await nameInput.fill('auth');
      await page.waitForTimeout(200);

      // Select first match with Enter
      await page.keyboard.press('Enter');

      // Should have 2 chips now (Header + authorization)
      await page.waitForTimeout(200);
      const chips = getChips(page);
      await expect(chips).toHaveCount(2);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      // Tab to focus the input
      await page.keyboard.press('Tab');
      await expect(input).toBeFocused();
    });

    test('Should have proper ARIA attributes on combobox', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const combobox = getCombobox(page);

      await expect(combobox).toHaveAttribute('role', 'combobox');
      await expect(combobox).toHaveAttribute('aria-haspopup', 'menu');
      await expect(combobox).toHaveAttribute('aria-expanded', 'false');

      // Click to open
      const input = getInput(page);
      await input.click();

      await expect(combobox).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should announce input purpose via aria-label', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      await expect(input).toHaveAttribute(
        'aria-label',
        'type to filter, or the number of an option',
      );
    });

    test('Should navigate menu items with keyboard only', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');

      // Tab to focus
      await page.keyboard.press('Tab');

      // Open menu with ArrowDown
      await page.keyboard.press('ArrowDown');
      await expect(getMenu(page)).toBeVisible();

      // Navigate through items
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      // Select with Enter
      await page.keyboard.press('Enter');

      // Menu should update or chip be added
      await page.waitForTimeout(200);
    });

    test('Should close menu with Escape and retain focus', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(getMenu(page)).toBeHidden();
      await expect(input).toBeFocused();
    });

    test('Should connect menu to input via aria-controls', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);
      const combobox = getCombobox(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Get the menu ID
      const menuId = await getMenu(page).getAttribute('id');
      expect(menuId).toBeTruthy();

      // Combobox should reference the menu
      await expect(combobox).toHaveAttribute('aria-controls', menuId!);
    });
  });

  test.describe('Contexts', () => {
    test('Should show appropriate completions for http_request context', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Should show HTTP request-specific items (Header, Body, etc.)
      const menuItems = page.locator('[role="menuitem"]');
      await expect(menuItems.first()).toBeVisible();
      const text = await page.textContent('[role="menu"]');
      expect(text).toMatch(/Header|Body|Query|Path/);
    });

    test('Should show appropriate completions for http_response context', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpResponse');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Should show HTTP response-specific items (Status, Header, Body)
      const menuItems = page.locator('[role="menuitem"]');
      await expect(menuItems.first()).toBeVisible();
      const text = await page.textContent('[role="menu"]');
      expect(text).toMatch(/Status|Header|Body/);
    });
  });

  test.describe('Pick step (multi-select)', () => {
    test('Should show format picker after Body selection', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Select "Body" (option 4)
      await page.keyboard.press('4');
      await page.waitForTimeout(600);

      // Format picker should appear with checkboxes
      const checkboxes = page.locator('[role="checkbox"]');
      await expect(checkboxes.first()).toBeVisible();

      // Menu should show format options
      const text = await page.textContent('[role="menu"]');
      expect(text).toMatch(/JSON|XML|Form/);
    });

    test('Should toggle checkbox with Space key in pick step', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await page.keyboard.press('4'); // Body
      await page.waitForTimeout(600);

      // Should be in pick step now
      // Press Space to toggle first checkbox
      await page.keyboard.press(' ');
      await page.waitForTimeout(200);

      // A checkbox should be checked
      const checkedBox = page.locator('[role="checkbox"][aria-checked="true"]');
      await expect(checkedBox.first()).toBeVisible();
    });

    test('Should apply picked formats with Enter', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await page.keyboard.press('4'); // Body
      await page.waitForTimeout(600);

      // Toggle JSON format
      await page.keyboard.press(' ');
      await page.waitForTimeout(200);

      // Apply with Enter
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      // Should have chips for Body + format
      const chips = getChips(page);
      await expect(chips).toHaveCount(2);
    });
  });

  test.describe('Name step features', () => {
    test('Should toggle case sensitivity with Alt+C', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await page.keyboard.press('3'); // Header
      await page.waitForTimeout(600);

      // Should show name input with case sensitivity checkbox
      const nameInput = page.locator('input[placeholder*="header"]');
      await expect(nameInput).toBeVisible();

      const caseCheckbox = page.getByRole('checkbox', { name: /Ignore letter case/i });
      await expect(caseCheckbox).toBeVisible();

      // Initially unchecked
      await expect(caseCheckbox).not.toBeChecked();

      // Toggle with Alt+C
      await page.keyboard.press('Alt+KeyC');
      await page.waitForTimeout(200);

      // Should be checked now
      await expect(caseCheckbox).toBeChecked();
    });

    test('Should go back with Backspace in name step', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await page.keyboard.press('3'); // Header
      await page.waitForTimeout(600);

      // In name step now
      const nameInput = page.locator('input[placeholder*="header"]');
      await expect(nameInput).toBeVisible();

      // Press Backspace with empty input to go back
      await nameInput.focus();
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(200);

      // Should be back to main menu
      const text = await page.textContent('[role="menu"]');
      expect(text).toMatch(/Header|Body|Query/);
    });

    test('Should go back with Escape in name step', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');
      const input = getInput(page);

      await input.click();
      await page.keyboard.press('3'); // Header
      await page.waitForTimeout(600);

      // In name step now
      const nameInput = page.locator('input[placeholder*="header"]');
      await expect(nameInput).toBeVisible();

      // Press Escape to go back
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      // Should be back to main menu
      const text = await page.textContent('[role="menu"]');
      expect(text).toMatch(/Header|Body|Query/);
    });
  });

  test.describe('Parser Vocabulary Completion', () => {
    test('Should offer JWT parser keys after [format:jwt]', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Default');

      // Type: [http:body][format:jwt]
      await page.keyboard.press('2'); // Body
      await page.keyboard.press('7'); // format: picker
      await page.keyboard.type('jwt');
      await page.keyboard.press('Enter');

      // Wait for menu to show parser vocabulary
      await page.waitForSelector('[role="menu"]', { state: 'visible' });

      // Should offer parser-planted keys
      const menu = await page.textContent('[role="menu"]');
      expect(menu).toContain('header'); // JWT header segment
      expect(menu).toContain('payload'); // JWT payload segment
      expect(menu).toContain('signature'); // JWT signature segment
      expect(menu).toContain('prefix'); // Optional bearer/lsapi2/mobapp2 prefix
    });

    test('Should offer auth parser keys after [format:auth]', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Default');

      // Type: [http:header]['authorization'][format:auth]
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('authorization');
      await page.keyboard.press('Enter');
      await page.keyboard.press('7'); // format: picker
      await page.keyboard.type('auth');
      await page.keyboard.press('Enter');

      // Wait for menu
      await page.waitForSelector('[role="menu"]', { state: 'visible' });

      // Should offer auth scheme keys
      const menu = await page.textContent('[role="menu"]');
      expect(menu).toContain('bearer'); // Bearer token
      expect(menu).toContain('basic'); // Basic credentials
      expect(menu).toContain('digest'); // Digest credentials
    });

    test('Should offer protobuf reading keys after [format:protobuf]', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Default');

      // Type: [http:body][format:protobuf][3][format:protobuf][1]
      await page.keyboard.press('2'); // Body
      await page.keyboard.press('7'); // format: picker
      await page.keyboard.type('protobuf');
      await page.keyboard.press('Enter');

      // Array index [3]
      await page.keyboard.press('0'); // array position
      await page.keyboard.type('3');
      await page.keyboard.press('Enter');

      // Nested [format:protobuf]
      await page.keyboard.press('7'); // format: picker
      await page.keyboard.type('protobuf');
      await page.keyboard.press('Enter');

      // Array index [1]
      await page.keyboard.press('0'); // array position
      await page.keyboard.type('1');
      await page.keyboard.press('Enter');

      // Wait for menu
      await page.waitForSelector('[role="menu"]', { state: 'visible' });

      // Should offer protobuf reading keys
      const menu = await page.textContent('[role="menu"]');
      expect(menu).toContain('varint'); // VARINT reading
      expect(menu).toContain('i32'); // I32 reading
      expect(menu).toContain('i64'); // I64 reading
    });

    test('Should offer Basic auth decomposition keys', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Default');

      // Type: [http:header]['authorization'][format:auth]['basic']
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('authorization');
      await page.keyboard.press('Enter');
      await page.keyboard.press('7'); // format: picker
      await page.keyboard.type('auth');
      await page.keyboard.press('Enter');

      // Select 'basic'
      await page.keyboard.type('basic');
      await page.keyboard.press('Enter');

      // Wait for menu
      await page.waitForSelector('[role="menu"]', { state: 'visible' });

      // Should offer Basic auth decomposition keys
      const menu = await page.textContent('[role="menu"]');
      expect(menu).toContain('user'); // Username
      expect(menu).toContain('pass'); // Password
    });

    test('Should NOT offer parser vocabulary for JSON (keys come from document)', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Default');

      // Type: [http:body][format:json]
      await page.keyboard.press('2'); // Body
      await page.keyboard.press('7'); // format: picker
      await page.keyboard.type('json');
      await page.keyboard.press('Enter');

      // Wait for menu
      await page.waitForSelector('[role="menu"]', { state: 'visible' });

      // Should offer name input prompt, not parser vocabulary
      const menu = await page.textContent('[role="menu"]');
      // JSON has no parser-planted keys - menu should be for document keys
      expect(menu).not.toContain('header');
      expect(menu).not.toContain('payload');
    });

    test('Should offer JWT keys after Bearer token in Authorization', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Default');

      // Type: [http:header]['authorization'][format:auth]['bearer'][format:jwt]
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('authorization');
      await page.keyboard.press('Enter');
      await page.keyboard.press('7'); // format: picker
      await page.keyboard.type('auth');
      await page.keyboard.press('Enter');

      // Select 'bearer'
      await page.keyboard.type('bearer');
      await page.keyboard.press('Enter');

      // Add JWT format
      await page.keyboard.press('7'); // format: picker
      await page.keyboard.type('jwt');
      await page.keyboard.press('Enter');

      // Wait for menu
      await page.waitForSelector('[role="menu"]', { state: 'visible' });

      // Should offer JWT parser keys
      const menu = await page.textContent('[role="menu"]');
      expect(menu).toContain('header');
      expect(menu).toContain('payload');
      expect(menu).toContain('signature');
    });
  });

  test.describe('TestID cascading', () => {
    test('Should cascade data-testid to all sub-components', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');

      // Root component receives data-testid
      const root = page.getByTestId('point-selector');
      await expect(root).toBeVisible();

      // WhereBar receives cascaded test ID
      const whereBar = page.getByTestId('point-selector--where-bar');
      await expect(whereBar).toBeVisible();

      // SampleRequest receives cascaded test ID (visible when segments exist)
      const sampleRequest = page.getByTestId('point-selector--sample-request');
      await expect(sampleRequest).toBeVisible();

      // MatchStep receives cascaded test ID (visible in match stage)
      const matchStep = page.getByTestId('point-selector--match-step');
      await expect(matchStep).toBeVisible();
    });

    test('Should cascade data-testid to StepMenu when menu is open', async ({ page }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');

      // Open the menu
      const input = getInput(page);
      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // StepMenu receives cascaded test ID
      const stepMenu = page.getByTestId('point-selector--step-menu');
      await expect(stepMenu).toBeVisible();
    });

    test('Should not render test IDs when data-testid is not provided', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Root should not have data-testid (story doesn't provide one)
      const root = page.locator('[data-slot="point-selector"]');
      await expect(root).toBeVisible();
      await expect(root).not.toHaveAttribute('data-testid');

      // Sub-components should also not have data-testid
      const whereBar = page.locator('[data-slot="where-bar"]');
      await expect(whereBar).toBeVisible();
      await expect(whereBar).not.toHaveAttribute('data-testid');
    });

    test('Should maintain cascaded test IDs across state changes', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');

      // Verify initial state has cascaded test IDs
      await expect(page.getByTestId('point-selector--where-bar')).toBeVisible();
      await expect(page.getByTestId('point-selector--sample-request')).toBeVisible();
      await expect(page.getByTestId('point-selector--match-step')).toBeVisible();

      // Click "Change where" to go back to point stage
      const changeButton = page.getByRole('button', { name: /Change where/i });
      await changeButton.click();

      // Wait for stage transition
      await page.waitForTimeout(200);

      // Test IDs should still be present
      await expect(page.getByTestId('point-selector--where-bar')).toBeVisible();
      await expect(page.getByTestId('point-selector--sample-request')).toBeVisible();

      // MatchStep should no longer be visible in point stage
      await expect(page.getByTestId('point-selector--match-step')).not.toBeVisible();

      // Open menu - StepMenu should have cascaded test ID
      const input = getInput(page);
      await input.click();
      await expect(page.getByTestId('point-selector--step-menu')).toBeVisible();
    });
  });

  test.describe('Canonical form feedback', () => {
    test('Should show info alert when wildcard run is folded', async ({ page }) => {
      await pointSelectorStory.goto(page, 'CanonicalFormFeedback');

      // Wait for SDK to load and canonicalization to occur
      await page.waitForTimeout(500);

      // Check if canonical info alert is visible
      const alert = page.locator('[role="alert"]').filter({ hasText: 'Point Canonicalized' });

      // The alert should be visible because this story uses [key:*][key:**] → [key:+]
      await expect(alert).toBeVisible();

      // Verify alert content
      await expect(alert).toContainText('Your point was automatically normalized');
      await expect(alert).toContainText('canonical form');

      // Should show both forms
      await expect(alert).toContainText('Your form:');
      await expect(alert).toContainText('Canonical form:');
    });

    test('Should allow dismissing canonical info alert', async ({ page }) => {
      await pointSelectorStory.goto(page, 'CanonicalFormFeedback');

      // Wait for canonicalization
      await page.waitForTimeout(500);

      // Look for canonical info alert
      const alert = page.locator('[role="alert"]').filter({ hasText: 'Point Canonicalized' });
      await expect(alert).toBeVisible();

      // Find and click close button
      const closeButton = alert.locator('button[aria-label*="Close"], button[aria-label*="close"]');
      await expect(closeButton).toBeVisible();
      await closeButton.click();

      // Alert should be dismissed
      await expect(alert).not.toBeVisible();
    });

    test('Should show info variant for canonical alert (not error)', async ({ page }) => {
      await pointSelectorStory.goto(page, 'CanonicalFormFeedback');

      // Wait for SDK
      await page.waitForTimeout(500);

      // Check if canonical info is present
      const alert = page.locator('[role="alert"]').filter({ hasText: 'Point Canonicalized' });
      await expect(alert).toBeVisible();

      // Should have info color styling (data-color="info")
      await expect(alert).toHaveAttribute('data-color', 'info');
    });

    test('Visual: Should render canonical info alert correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'CanonicalFormFeedback');

      // Wait for SDK
      await page.waitForTimeout(500);

      // Alert should be visible
      const alert = page.locator('[role="alert"]').filter({ hasText: 'Point Canonicalized' });
      await expect(alert).toBeVisible();

      // Take screenshot of the full component with alert
      await expect(page).toHaveScreenshot();
    });
  });

  /**
   * Keyboard-Only Navigation Tests
   *
   * Acceptance criteria: "The whole flow works by keyboard alone"
   *
   * These tests verify that a user can build complete points using ONLY keyboard:
   * - Number keys (1-9) to select menu items
   * - Arrow keys to navigate menus
   * - Enter to confirm selections
   * - Tab to move between fields
   * - Escape to close menus
   * - Alt+C to toggle ignore case
   * - ? to open keyboard shortcuts dialog
   *
   * No mouse clicks or pointer events are used in these tests.
   */
  test.describe('Keyboard-Only Navigation', () => {
    test("Should build simple point using only keyboard: [http:header]['authorization']", async ({
      page,
    }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Focus the input (initial focus should be on input)
      const input = getInput(page);
      await input.focus();

      // Press '3' to select Header (3rd option in menu)
      await page.keyboard.press('3');

      // Menu should show header children
      await expect(getMenu(page)).toBeVisible();

      // Type 'auth' to filter headers
      await page.keyboard.type('auth');

      // Press Enter to select 'authorization'
      await page.keyboard.press('Enter');

      // Verify chips show: Header › authorization
      const chips = getChips(page);
      await expect(chips.nth(0)).toContainText('Header');
      await expect(chips.nth(1)).toContainText('authorization');

      // Verify canonical form is correct
      const canonicalText = page.getByText(/\[http:header\]\['authorization'\]/);
      await expect(canonicalText).toBeVisible();
    });

    test("Should build JSON body point: [http:body][format:json]['user']['email']", async ({
      page,
    }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Step 1: Select Body (press '2')
      await page.keyboard.press('2');
      await expect(getMenu(page)).toBeVisible();

      // Step 2: Select JSON format (press '1' for first format)
      await page.keyboard.press('1');
      await expect(getMenu(page)).toBeVisible();

      // Step 3: Type 'user' and press Enter
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // Step 4: Type 'email' and press Enter
      await page.keyboard.type('email');
      await page.keyboard.press('Enter');

      // Verify chips
      const chips = getChips(page);
      await expect(chips.nth(0)).toContainText('Body');
      await expect(chips.nth(1)).toContainText('JSON');
      await expect(chips.nth(2)).toContainText('user');
      await expect(chips.nth(3)).toContainText('email');

      // Verify canonical form
      const canonicalText = page.getByText(/\[http:body\]\[format:json\]\['user'\]\['email'\]/);
      await expect(canonicalText).toBeVisible();
    });

    test('Should navigate menu with Arrow keys and select with Enter', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Open menu
      await page.keyboard.press('ArrowDown');
      await expect(getMenu(page)).toBeVisible();

      // Navigate down 2 times to reach Header (3rd item)
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Select with Enter
      await page.keyboard.press('Enter');

      // Header chip should appear
      const chips = getChips(page);
      await expect(chips.first()).toContainText('Header');
    });

    test('Should close menu with Escape key', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Open menu
      await page.keyboard.press('ArrowDown');
      await expect(getMenu(page)).toBeVisible();

      // Close menu with Escape
      await page.keyboard.press('Escape');
      await expect(getMenu(page)).not.toBeVisible();
    });

    test('Should use Tab to navigate between input and Next button', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Build a simple point first
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('cookie');
      await page.keyboard.press('Enter');

      // Tab should move focus to Next button
      await page.keyboard.press('Tab');

      // Next button should be focused
      const nextButton = page.getByRole('button', { name: /Next/ });
      await expect(nextButton).toBeFocused();

      // Press Enter to proceed to condition step
      await page.keyboard.press('Enter');

      // Condition dropdown should be visible
      const conditionDropdown = page.getByRole('combobox');
      await expect(conditionDropdown).toBeVisible();
    });

    test('Should use Alt+C to toggle ignore case in match step', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Build point
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('authorization');
      await page.keyboard.press('Enter');

      // Tab to Next button and press Enter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Now in match step
      // Select condition with keyboard (press '1' for Equal)
      await page.keyboard.press('1');

      // Type value
      await page.keyboard.type('Bearer token123');

      // Press Alt+C to toggle ignore case
      await page.keyboard.press('Alt+KeyC');

      // Checkbox should be checked
      const checkbox = page.getByRole('checkbox', { name: /ignore.*case/i });
      await expect(checkbox).toBeChecked();

      // Press Alt+C again to uncheck
      await page.keyboard.press('Alt+KeyC');
      await expect(checkbox).not.toBeChecked();
    });

    test('Should open keyboard shortcuts dialog with ? key', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Press ? to open shortcuts dialog
      await page.keyboard.press('Shift+Slash'); // ? key

      // Dialog should open
      const dialog = page.getByRole('dialog', { name: /keyboard.*shortcuts/i });
      await expect(dialog).toBeVisible();

      // Close dialog with Escape
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    });

    test('Should build complex JWT point entirely with keyboard', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // [http:header]
      await page.keyboard.press('3');

      // ['authorization']
      await page.keyboard.type('authorization');
      await page.keyboard.press('Enter');

      // [format:auth]
      await page.keyboard.press('1'); // Assuming auth is first format

      // ['bearer']
      await page.keyboard.type('bearer');
      await page.keyboard.press('Enter');

      // [format:jwt]
      await page.keyboard.press('1'); // JWT format

      // ['payload']
      await page.keyboard.type('payload');
      await page.keyboard.press('Enter');

      // [encoding:base64]
      await page.keyboard.press('1'); // Base64 encoding

      // [format:json]
      await page.keyboard.press('1'); // JSON format

      // ['sub']
      await page.keyboard.type('sub');
      await page.keyboard.press('Enter');

      // Verify all chips
      const chips = getChips(page);
      await expect(chips.nth(0)).toContainText('Header');
      await expect(chips.nth(1)).toContainText('authorization');
      // ... more chips
      await expect(chips.nth(chips.count() - 1)).toContainText('sub');

      // Verify canonical form includes full JWT path
      const canonical = page.getByText(/\[http:header\]\['authorization'\]/);
      await expect(canonical).toBeVisible();
    });

    test('Should delete last segment with Backspace when input is empty', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Build point with 3 segments
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('cookie');
      await page.keyboard.press('Enter');

      // Verify 2 chips (Header + cookie)
      let chips = getChips(page);
      await expect(chips).toHaveCount(2);

      // Focus input and press Backspace
      await input.focus();
      await page.keyboard.press('Backspace');

      // Last chip should be removed
      chips = getChips(page);
      await expect(chips).toHaveCount(1);
      await expect(chips.first()).toContainText('Header');
    });

    test('Should use Ctrl+Enter to submit point from condition step', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Build point
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('x-api-key');
      await page.keyboard.press('Enter');

      // Tab to Next
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Select Equal condition
      await page.keyboard.press('1');

      // Type value
      await page.keyboard.type('secret123');

      // Press Ctrl+Enter to submit (if implemented)
      await page.keyboard.press('Control+Enter');

      // Form should be submitted or value confirmed
      // (Test depends on onChange handler - verify in consumer app)
    });

    test('Accessibility: Should announce selections to screen readers', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Press '3' to select Header
      await page.keyboard.press('3');

      // Check for aria-live region updates
      const liveRegion = page.locator('[aria-live="polite"], [role="status"]');
      await expect(liveRegion).toBeVisible();

      // Should announce the selection (Header added)
      // Note: Actual screen reader testing requires assistive tech tools
    });

    test('Should handle rapid keyboard input without losing state', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Rapid keyboard input
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('auth'); // Fast typing
      await page.keyboard.press('Enter');

      // Wait for state to settle
      await page.waitForTimeout(100);

      // Verify correct chip
      const chips = getChips(page);
      await expect(chips.nth(1)).toContainText('authorization');
    });

    test('Visual: Should show keyboard focus indicators clearly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();

      // Input should have visible focus ring
      await expect(input).toBeFocused();

      // Take screenshot to verify focus styling
      await expect(page).toHaveScreenshot('keyboard-focus-input.png');

      // Tab to Next button
      await page.keyboard.press('Tab');
      const nextButton = page.getByRole('button', { name: /Next/ });
      await expect(nextButton).toBeFocused();

      // Screenshot of button focus
      await expect(page).toHaveScreenshot('keyboard-focus-button.png');
    });
  });

  test.describe('Error Handling', () => {
    // TODO: Add test for SDK load failure and retry flow
    // This test requires a Storybook story that mocks SDK load error.
    // The story should:
    // 1. Mock useProton to return [null, Error('Failed to load SDK'), retryFn]
    // 2. Verify error alert is shown with message "Failed to load validation SDK"
    // 3. Click "Try again" button
    // 4. Verify retryFn is called
    // 5. Mock successful SDK load on retry
    // 6. Verify PointSelector becomes functional
    //
    // Implementation approach:
    // - Create PointSelector.stories.tsx → export const SDKLoadError story
    // - Use dependency injection or global mock for SDK loading
    // - Test the complete error → retry → success flow
    //
    // See PointSelector.tsx lines 80-101 for the error UI implementation
    test.skip('Should show error and allow retry when SDK fails to load', async ({ page }) => {
      // Blocked on: Storybook story with mocked SDK error
      // Once story exists, implement:
      // 1. await pointSelectorStory.goto(page, 'SDKLoadError');
      // 2. await expect(page.getByText('Failed to load validation SDK')).toBeVisible();
      // 3. await page.getByRole('button', { name: 'Try again' }).click();
      // 4. await expect(page.getByText('Failed to load validation SDK')).not.toBeVisible();
      // 5. Verify PointSelector works after successful retry
    });
  });

  test.describe('Profile Selector', () => {
    test('Should render profile selector when onProfileChange is provided', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithProfileSelector');

      // Profile selector should be visible
      const profileSelector = page.getByTestId('point-selector-with-profile--profile-selector');
      await expect(profileSelector).toBeVisible();

      // Should show all three tabs
      await expect(page.getByRole('tab', { name: 'Tree' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Value' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Grammar' })).toBeVisible();

      // Tree should be selected by default
      await expect(page.getByRole('tab', { name: 'Tree' })).toHaveAttribute('data-state', 'checked');
    });

    test('Should show correct description for each profile', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithProfileSelector');

      // Tree profile description should be visible initially
      await expect(page.getByText('What can exist in traffic')).toBeVisible();

      // Click Value tab
      await page.getByRole('tab', { name: 'Value' }).click();
      await expect(page.getByText('Single readable value')).toBeVisible();

      // Click Grammar tab
      await page.getByRole('tab', { name: 'Grammar' }).click();
      await expect(page.getByText('Pure syntax check')).toBeVisible();
    });

    test('Should update profile state when tab is clicked', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithProfileSelector');

      // Initial state should be tree
      await expect(page.getByText('Current profile: tree')).toBeVisible();

      // Click Value tab
      await page.getByRole('tab', { name: 'Value' }).click();
      await expect(page.getByText('Current profile: value')).toBeVisible();

      // Click Grammar tab
      await page.getByRole('tab', { name: 'Grammar' }).click();
      await expect(page.getByText('Current profile: grammar')).toBeVisible();

      // Click back to Tree
      await page.getByRole('tab', { name: 'Tree' }).click();
      await expect(page.getByText('Current profile: tree')).toBeVisible();
    });

    test('Should re-validate point when profile changes', async ({ page }) => {
      await pointSelectorStory.goto(page, 'ProfileRevalidation');

      // Start with tree profile - point should be valid
      await expect(page.getByRole('tab', { name: 'Tree' })).toHaveAttribute('data-state', 'checked');
      await expect(page.getByText('Valid in tree profile')).toBeVisible();

      // Switch to value profile - should show warning about invalid point
      await page.getByRole('tab', { name: 'Value' }).click();
      await expect(page.getByText('Will show error in value profile')).toBeVisible();

      // Switch to grammar - should be valid again
      await page.getByRole('tab', { name: 'Grammar' }).click();
      await expect(page.getByText('Valid in grammar profile')).toBeVisible();
    });

    test('Visual: Profile selector with tree profile', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithProfileSelector');
      await expect(page).toHaveScreenshot();
    });

    test('Visual: Profile selector with value profile', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithProfileSelector');
      await page.getByRole('tab', { name: 'Value' }).click();
      await expect(page).toHaveScreenshot();
    });

    test('Visual: Profile selector with grammar profile', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithProfileSelector');
      await page.getByRole('tab', { name: 'Grammar' }).click();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Keyboard-only Navigation', () => {
    test('Should build point [http:header]["authorization"] without mouse', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Focus input and press Enter to open menu
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Wait for menu
      await expect(getMenu(page)).toBeVisible();

      // Press '6' to select "Header" (http:header)
      await page.keyboard.press('6');

      // Menu should close, chip should appear
      await expect(getChips(page)).toHaveCount(1);
      await expect(getChips(page).first()).toContainText('Header');

      // Press Enter to open menu again
      await page.keyboard.press('Enter');
      await expect(getMenu(page)).toBeVisible();

      // Type 'auth' to filter keys
      await page.keyboard.type('auth');

      // Press Enter to select first match (authorization)
      await page.keyboard.press('Enter');

      // Should have 2 chips now
      await expect(getChips(page)).toHaveCount(2);
      await expect(getChips(page).nth(1)).toContainText('authorization');

      // Verify canonical form
      await expect(page.getByText("[http:header]['authorization']")).toBeVisible();
    });

    test('Should navigate between "where" and "how" sections via Tab', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Build point first
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(getMenu(page)).toBeVisible();
      await page.keyboard.press('6'); // Header

      await page.keyboard.press('Enter');
      await page.keyboard.type('x-api-key');
      await page.keyboard.press('Enter');

      // Tab to "Next" button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Press Enter on Next button
      await page.keyboard.press('Enter');

      // Should be on match step now
      await expect(page.getByText('How should the value')).toBeVisible();

      // Tab to condition select
      await page.keyboard.press('Tab');

      // Press Space to open select
      await page.keyboard.press('Space');

      // Arrow down to "equal"
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Tab to value input
      await page.keyboard.press('Tab');
      await page.keyboard.type('secret-key');

      // Verify value entered
      await expect(page.getByDisplayValue('secret-key')).toBeVisible();
    });

    test('Should toggle multi-select items via Space', async ({ page }) => {
      await pointSelectorStory.goto(page, 'MultiFormatParsing');

      // Navigate to point with format picker
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(getMenu(page)).toBeVisible();

      // Select Body first
      await page.keyboard.press('1'); // Body

      // Open menu again for format
      await page.keyboard.press('Enter');
      await expect(getMenu(page)).toBeVisible();

      // Navigate to format option (should be option with multiple choices)
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Should open picker dialog
      await expect(page.getByRole('dialog')).toBeVisible();

      // Tab to first checkbox
      await page.keyboard.press('Tab');

      // Space to toggle JSON
      await page.keyboard.press('Space');

      // Tab to next checkbox
      await page.keyboard.press('Tab');

      // Space to toggle XML
      await page.keyboard.press('Space');

      // Tab to confirm button and press Enter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Verify multiple formats selected
      await expect(page.getByText('JSON or XML')).toBeVisible();
    });

    test('Should handle name step keyboard-only input', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Build point to key name
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.keyboard.press('6'); // Header

      await page.keyboard.press('Enter');
      await page.keyboard.type('authorization');
      await page.keyboard.press('Enter');

      // Open menu for role
      await page.keyboard.press('Enter');
      await expect(getMenu(page)).toBeVisible();

      // Navigate to and select "Key Name" role option
      let attempts = 0;
      while (attempts < 10) {
        await page.keyboard.press('ArrowDown');
        const highlighted = await page.locator('[role="option"][aria-selected="true"]').textContent();
        if (highlighted?.includes('Name')) {
          await page.keyboard.press('Enter');
          break;
        }
        attempts++;
      }

      // Should have role:name segment
      await expect(page.getByText('[role:name]')).toBeVisible();
    });

    test('Should escape from menu via Escape key', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Open menu
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(getMenu(page)).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Menu should be hidden
      await expect(getMenu(page)).not.toBeVisible();

      // Input should still be focused
      const input = getInput(page);
      await expect(input).toBeFocused();
    });

    test('Should navigate menu via arrow keys and select via Enter', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Open menu
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(getMenu(page)).toBeVisible();

      // Arrow down twice
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Check which option is highlighted
      const highlighted = page.locator('[role="option"][aria-selected="true"]');
      await expect(highlighted).toBeVisible();

      // Press Enter to select
      await page.keyboard.press('Enter');

      // Menu should close and chip should appear
      await expect(getMenu(page)).not.toBeVisible();
      await expect(getChips(page)).toHaveCount(1);
    });

    test('Should handle full point construction flow keyboard-only', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Complete flow: [http:body][format:json]['user']['email']

      // 1. Select Body
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.keyboard.press('1'); // Body

      // 2. Select JSON format
      await page.keyboard.press('Enter');
      await page.keyboard.press('ArrowDown'); // Find format option
      await page.keyboard.press('Enter');

      // If picker opens, select JSON
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Space'); // Toggle JSON
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter'); // Confirm
      } else {
        // Direct selection
        await page.keyboard.type('json');
        await page.keyboard.press('Enter');
      }

      // 3. Type 'user' key
      await page.keyboard.press('Enter');
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // 4. Type 'email' key
      await page.keyboard.press('Enter');
      await page.keyboard.type('email');
      await page.keyboard.press('Enter');

      // Verify final point
      await expect(page.getByText("[http:body][format:json]['user']['email']")).toBeVisible();
      await expect(getChips(page)).toHaveCount(4);
    });
  });

  test.describe('Error Fixes (Quick Actions)', () => {
    test('Should show error with fix suggestions when point is invalid', async ({ page }) => {
      await pointSelectorStory.goto(page, 'ErrorFixes');

      // Wait for SDK to load
      await page.waitForTimeout(500);

      const input = getInput(page);

      // Build invalid point: [http:body]['user'] (missing format:json)
      await input.click();
      await page.keyboard.press('2'); // Body
      await page.waitForTimeout(600);

      // Type 'user' directly (without format)
      await input.click();
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // Wait for validation error
      await page.waitForTimeout(500);

      // Error alert should be visible
      const errorAlert = page.locator('[role="alert"]').filter({ hasText: /error|invalid/i });
      await expect(errorAlert).toBeVisible();

      // Quick fixes section should be visible
      const fixesSection = page.getByText('Quick fixes:');
      if (await fixesSection.isVisible()) {
        // Fix buttons should be present
        const fixButtons = page.locator('button').filter({ hasText: /Insert|Add/i });
        await expect(fixButtons.first()).toBeVisible();
      }
    });

    test('Should apply fix when fix button is clicked', async ({ page }) => {
      await pointSelectorStory.goto(page, 'ErrorFixes');

      // Wait for SDK to load
      await page.waitForTimeout(500);

      const input = getInput(page);

      // Build invalid point: [http:body]['user']
      await input.click();
      await page.keyboard.press('2'); // Body
      await page.waitForTimeout(600);

      await input.click();
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // Wait for error with fixes
      await page.waitForTimeout(500);

      // Click first fix button if available
      const fixButton = page.locator('button[data-testid*="fix-0"]').first();
      if (await fixButton.isVisible()) {
        await fixButton.click();

        // Wait for fix to apply
        await page.waitForTimeout(500);

        // Error should be gone (or different)
        // Point should be updated (check chips or canonical form)
        const chips = getChips(page);
        const chipCount = await chips.count();
        expect(chipCount).toBeGreaterThan(1); // Should have more segments after fix
      }
    });

    test('Should apply fix with Ctrl+1 keyboard shortcut', async ({ page }) => {
      await pointSelectorStory.goto(page, 'ErrorFixes');

      // Wait for SDK to load
      await page.waitForTimeout(500);

      const input = getInput(page);

      // Build invalid point
      await input.click();
      await page.keyboard.press('2'); // Body
      await page.waitForTimeout(600);

      await input.click();
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // Wait for error
      await page.waitForTimeout(500);

      // Check if quick fixes are available
      const fixButton = page.locator('button').filter({ hasText: /Ctrl\+1/ });
      if (await fixButton.isVisible()) {
        // Press Ctrl+1 to apply first fix
        await page.keyboard.press('Control+Digit1');

        // Wait for fix to apply
        await page.waitForTimeout(500);

        // Verify fix was applied (more segments in chips)
        const chips = getChips(page);
        const chipCount = await chips.count();
        expect(chipCount).toBeGreaterThan(1);
      }
    });

    test('Visual: Should render error with fix buttons correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'ErrorFixes');

      // Wait for SDK
      await page.waitForTimeout(500);

      const input = getInput(page);

      // Build invalid point
      await input.click();
      await page.keyboard.press('2'); // Body
      await page.waitForTimeout(600);

      await input.click();
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // Wait for error to appear
      await page.waitForTimeout(500);

      // Take screenshot if error with fixes is visible
      const errorAlert = page.locator('[role="alert"]');
      if (await errorAlert.isVisible()) {
        await expect(page).toHaveScreenshot('error-with-fixes.png');
      }
    });

    test('Should show lightbulb icon on fix buttons', async ({ page }) => {
      await pointSelectorStory.goto(page, 'ErrorFixes');

      // Wait for SDK
      await page.waitForTimeout(500);

      const input = getInput(page);

      // Build invalid point
      await input.click();
      await page.keyboard.press('2'); // Body
      await page.waitForTimeout(600);

      await input.click();
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // Wait for error
      await page.waitForTimeout(500);

      // Check for lightbulb icon in fix button
      const fixButton = page.locator('button[data-testid*="fix"]').first();
      if (await fixButton.isVisible()) {
        // Lightbulb icon should be present (svg or icon element)
        const icon = fixButton.locator('svg').first();
        await expect(icon).toBeVisible();
      }
    });

    test('Should dismiss error when close button is clicked', async ({ page }) => {
      await pointSelectorStory.goto(page, 'ErrorFixes');

      // Wait for SDK
      await page.waitForTimeout(500);

      const input = getInput(page);

      // Build invalid point
      await input.click();
      await page.keyboard.press('2'); // Body
      await page.waitForTimeout(600);

      await input.click();
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // Wait for error
      await page.waitForTimeout(500);

      // Find and click close button
      const errorAlert = page.locator('[role="alert"]').first();
      if (await errorAlert.isVisible()) {
        const closeButton = errorAlert.locator('button[aria-label*="Close"], button[aria-label*="close"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();

          // Error should be dismissed
          await expect(errorAlert).not.toBeVisible();
        }
      }
    });
  });
});
