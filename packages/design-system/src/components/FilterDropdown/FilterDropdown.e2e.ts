import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterDropdownStory = createStoryHelper('patterns-filterdropdown', [
  'Default',
  'Multi',
  'Label Forms',
  'States',
  'With Search',
  'Groups',
  'Hint',
  'Long Labels',
  'Filter Row',
  'Controlled',
] as const);

test.describe('Component: FilterDropdown', () => {
  test.describe('Visual', () => {
    test('Should render the trigger label forms correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Label Forms');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled states correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'States');
      await expect(page).toHaveScreenshot();
    });

    test('Should render long labels truncated correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Long Labels');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the filter row correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Filter Row');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the open single menu correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Default');
      await page.getByTestId('filter-dropdown--trigger').click();
      await expect(page.getByTestId('filter-dropdown--content')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the open multi menu with footer correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Multi');
      await page.getByTestId('filter-dropdown--trigger').click();
      await expect(page.getByTestId('filter-dropdown--footer')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the menu with search and selected section correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'With Search');
      await page.getByTestId('filter-dropdown-multi--trigger').click();
      await expect(page.getByTestId('filter-dropdown-multi--selected')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the no-results state within the menu width correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'With Search');
      await page.getByTestId('filter-dropdown-single--trigger').click();
      await page
        .getByTestId('filter-dropdown-single--search')
        .getByRole('combobox')
        .fill('nothing like this');
      await expect(page.getByTestId('filter-dropdown-single--empty')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render grouped options correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Groups');
      await page.getByTestId('filter-dropdown--trigger').click();
      await expect(page.getByTestId('filter-dropdown--content')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the long labels menu wrapped within its max width correctly', async ({
      page,
    }) => {
      await filterDropdownStory.goto(page, 'Long Labels');
      await page.getByTestId('filter-dropdown-single--trigger').click();
      await expect(page.getByTestId('filter-dropdown-single--content')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render option hints correctly', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Hint');
      await page.getByTestId('filter-dropdown--trigger').click();
      await expect(page.getByTestId('filter-dropdown--content')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should apply a value and close when an option is picked in single mode', async ({
      page,
    }) => {
      await filterDropdownStory.goto(page, 'Controlled');
      const trigger = page.getByTestId('filter-dropdown--trigger');
      await trigger.click();
      await page
        .getByTestId('filter-dropdown--content')
        .getByRole('option', { name: 'Staging' })
        .click();
      await expect(trigger).toHaveText(/Staging/);
      await expect(page.getByTestId('filter-dropdown-value')).toHaveText('value: ["staging"]');
      await expect(page.getByTestId('filter-dropdown--content')).toBeHidden();
    });

    test('Should reset to unset when the All option is picked', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Controlled');
      await page.getByTestId('filter-dropdown--trigger').click();
      await page.getByTestId('filter-dropdown--all-option').click();
      await expect(page.getByTestId('filter-dropdown-value')).toHaveText('value: []');
    });

    test('Should clear a multi filter when the clear button is clicked', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Multi');
      await page.getByTestId('filter-dropdown--clear').click();
      await expect(page.getByTestId('filter-dropdown--clear')).toBeHidden();
      await expect(page.getByTestId('filter-dropdown--trigger')).toBeFocused();
    });

    test('Should narrow the list when a query is typed', async ({ page }) => {
      await filterDropdownStory.goto(page, 'With Search');
      await page.getByTestId('filter-dropdown-single--trigger').click();
      const search = page.getByTestId('filter-dropdown-single--search').getByRole('combobox');
      await search.fill('Scope B');
      const content = page.getByTestId('filter-dropdown-single--content');
      await expect(content.getByRole('option')).toHaveCount(1);
      await search.fill('nothing like this');
      await expect(page.getByTestId('filter-dropdown-single--empty')).toBeVisible();
    });
    test('Should stay open and count the values when several options are ticked', async ({
      page,
    }) => {
      await filterDropdownStory.goto(page, 'Hint');
      const trigger = page.getByTestId('filter-dropdown--trigger');
      await trigger.click();
      const content = page.getByTestId('filter-dropdown--content');
      await content.getByRole('option', { name: /Lua/ }).click();
      await content.getByRole('option', { name: /WASM/ }).click();
      await expect(content).toBeVisible();
      await expect(trigger).toHaveAccessibleName('Type, 2 selected: Lua, WASM');
    });

    test('Should keep the selected section rows when another option is ticked', async ({
      page,
    }) => {
      await filterDropdownStory.goto(page, 'With Search');
      await page.getByTestId('filter-dropdown-multi--trigger').click();
      const selected = page.getByTestId('filter-dropdown-multi--selected');
      await expect(selected.getByRole('option')).toHaveCount(2);
      await page
        .getByTestId('filter-dropdown-multi--content')
        .getByRole('option', { name: /Scope A/ })
        .first()
        .click();
      await expect(selected.getByRole('option')).toHaveCount(2);
      await expect(page.getByTestId('filter-dropdown-multi--trigger')).toHaveAccessibleName(
        /3 selected/,
      );
    });

    test('Should clear all values when the footer clear button is clicked', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Multi');
      await page.getByTestId('filter-dropdown--trigger').click();
      await page.getByTestId('filter-dropdown--footer-clear').click();
      await expect(page.getByTestId('filter-dropdown--footer')).toBeHidden();
      await expect(page.getByTestId('filter-dropdown--content')).toBeVisible();
      await expect(page.getByTestId('filter-dropdown--trigger')).toHaveAccessibleName('Type');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key with the clear button after the trigger', async ({
      page,
    }) => {
      await filterDropdownStory.goto(page, 'Multi');
      const trigger = page.getByTestId('filter-dropdown--trigger');
      await trigger.focus();
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('filter-dropdown--clear')).toBeFocused();
    });

    test('Should be navigable via arrow keys and Enter from the search', async ({ page }) => {
      await filterDropdownStory.goto(page, 'With Search');
      const trigger = page.getByTestId('filter-dropdown-single--trigger');
      await trigger.click();
      await expect(
        page.getByTestId('filter-dropdown-single--search').getByRole('combobox'),
      ).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('filter-dropdown-single--content')).toBeHidden();
      await expect(trigger).toHaveAccessibleName('Scope, Scope A');
    });

    test('Should focus the listbox on open when there is no search', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Default');
      await page.getByTestId('filter-dropdown--trigger').click();
      await expect(page.getByTestId('filter-dropdown--content')).toBeFocused();
    });

    test('Should focus the listbox, not the footer, on open with a multi value', async ({
      page,
    }) => {
      await filterDropdownStory.goto(page, 'Multi');
      await page.getByTestId('filter-dropdown--trigger').click();
      await expect(page.getByTestId('filter-dropdown--footer-clear')).toBeVisible();
      await expect(page.getByTestId('filter-dropdown--content')).toBeFocused();
    });

    test('Should be clearable via Enter key on the focused footer clear button', async ({
      page,
    }) => {
      await filterDropdownStory.goto(page, 'Multi');
      await page.getByTestId('filter-dropdown--trigger').click();
      await page.getByTestId('filter-dropdown--footer-clear').focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('filter-dropdown--footer')).toBeHidden();
      await expect(page.getByTestId('filter-dropdown--content')).toBeVisible();
      await expect(page.getByTestId('filter-dropdown--trigger')).toHaveAccessibleName('Type');
    });

    test('Should be clearable via Backspace key on the focused trigger', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Multi');
      const trigger = page.getByTestId('filter-dropdown--trigger');
      await trigger.focus();
      await page.keyboard.press('Backspace');
      await expect(page.getByTestId('filter-dropdown--clear')).toBeHidden();
      await expect(trigger).toHaveAccessibleName('Type');
    });

    test('Should be searchable via keyboard with a space in the query', async ({ page }) => {
      await filterDropdownStory.goto(page, 'With Search');
      await page.getByTestId('filter-dropdown-single--trigger').focus();
      await page.keyboard.press('Enter');
      const search = page.getByTestId('filter-dropdown-single--search').getByRole('combobox');
      await expect(search).toBeFocused();
      await page.keyboard.type('Scope C');
      await expect(search).toHaveValue('Scope C');
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('filter-dropdown-single--trigger')).toHaveText(/Scope C/);
    });

    test('Should be closable via Escape key with focus back on the trigger', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Default');
      const trigger = page.getByTestId('filter-dropdown--trigger');
      await trigger.click();
      await expect(page.getByTestId('filter-dropdown--content')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('filter-dropdown--content')).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test('Should be announced via a composed accessible name', async ({ page }) => {
      await filterDropdownStory.goto(page, 'Label Forms');
      await expect(page.getByTestId('multi-many--trigger')).toHaveAccessibleName(
        'Type, 3 selected: Lua, WASM, Plugin',
      );
      await expect(page.getByTestId('single-set--trigger')).toHaveAccessibleName('Type, WASM');
      await expect(page.getByTestId('multi-one--clear')).toHaveAccessibleName('Clear Type');
    });
  });
});
