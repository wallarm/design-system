import { expect, type Locator, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tocStory = createStoryHelper('navigation-tableofcontents', [
  'Basic',
  'Numbered',
  'Levels',
  'Minimized',
  'Long Labels',
  'Long List',
  'With Scroll Spy',
  'With Segmented Tabs',
] as const);

const getItem = (page: Page, name: string, scope = page.getByTestId('toc')) =>
  scope.getByTestId('toc--item').filter({ hasText: name });
const expectActive = (page: Page, name: string, scope?: Locator) =>
  expect(getItem(page, name, scope)).toHaveAttribute('aria-current', 'location');

test.describe('Component: TableOfContents', () => {
  test.describe('Visual', () => {
    for (const story of ['Basic', 'Numbered', 'Levels', 'Minimized', 'Long Labels'] as const) {
      test(`Should render ${story.toLowerCase()} correctly`, async ({ page }) => {
        await tocStory.goto(page, story);
        await expect(page.getByTestId('toc')).toBeVisible();
        await expect(page).toHaveScreenshot();
      });
    }

    test('Should render long list scrolled to the end correctly', async ({ page }) => {
      await tocStory.goto(page, 'Long List');
      const list = page.getByTestId('toc--list');
      await list.evaluate(el => el.scrollTo({ top: el.scrollHeight }));
      await expect(getItem(page, 'Section 30')).toBeInViewport();
      await expect(page.getByTestId('toc--toggle')).toBeInViewport();
      await expect(page).toHaveScreenshot();
    });

    test('Should render open popover correctly', async ({ page }) => {
      await tocStory.goto(page, 'Minimized');
      await page.getByTestId('toc--dashes').hover();
      await expect(page.getByTestId('toc--popover')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render hover state correctly', async ({ page }) => {
      await tocStory.goto(page, 'Basic');
      await getItem(page, 'Impact').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render pressed state correctly', async ({ page }) => {
      await tocStory.goto(page, 'Basic');
      await getItem(page, 'Impact').hover();
      await page.mouse.down();
      await expect(page).toHaveScreenshot();
      await page.mouse.up();
    });

    test('Should render keyboard focus ring correctly', async ({ page }) => {
      await tocStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const first = getItem(page, 'TL;DR');
      await expect(first).toBeFocused();
      // The focus ring is a Tailwind ring, drawn as a box-shadow.
      await expect(first).not.toHaveCSS('box-shadow', 'none');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should move the active item when an item is clicked', async ({ page }) => {
      await tocStory.goto(page, 'Basic');
      await expectActive(page, 'Findings');
      await getItem(page, 'Remediation').click();
      await expectActive(page, 'Remediation');
      await expect(getItem(page, 'Findings')).not.toHaveAttribute('aria-current');
    });

    test('Should keep the active item when the view is toggled', async ({ page }) => {
      await tocStory.goto(page, 'Basic');
      await getItem(page, 'Impact').click();
      await page.getByTestId('toc--toggle').click();
      await expect(page.getByTestId('toc')).toHaveAttribute('data-view', 'minimized');
      await expect(page.getByTestId('toc--list')).toBeHidden();
      await page.getByTestId('toc--toggle').click();
      await expectActive(page, 'Impact');
    });

    test('Should open the popover when the dashes are hovered', async ({ page }) => {
      await tocStory.goto(page, 'Minimized');
      await page.getByTestId('toc--dashes').hover();
      const popover = page.getByTestId('toc--popover');
      await expect(popover).toBeVisible();
      await expectActive(page, 'Findings', popover);
      await page.mouse.move(600, 400);
      await expect(popover).toBeHidden();
    });

    test('Should open the popover when the dashes are tapped', async ({ page }) => {
      await tocStory.goto(page, 'Minimized');
      const dashes = page.getByTestId('toc--dashes');
      const popover = page.getByTestId('toc--popover');
      // A touch tap: the pointerType of the pointerdown tells it apart from a mouse click.
      const tap = async () => {
        await dashes.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true });
        await dashes.dispatchEvent('click');
      };
      await tap();
      await expect(popover).toBeVisible();
      await expectActive(page, 'Findings', popover);
      await tap();
      await expect(popover).toBeHidden();
    });

    test('Should close the popover when an item in it is clicked', async ({ page }) => {
      await tocStory.goto(page, 'Minimized');
      await page.getByTestId('toc--dashes').hover();
      const popover = page.getByTestId('toc--popover');
      await getItem(page, 'Impact', popover).click();
      await expect(popover).toBeHidden();
      await page.getByTestId('toc--toggle').click();
      await expectActive(page, 'Impact');
    });

    test('Should scroll to the section and activate it when an item is clicked', async ({
      page,
    }) => {
      await tocStory.goto(page, 'With Scroll Spy');
      const content = page.getByTestId('toc-content');
      await getItem(page, 'Remediation').click();
      await expectActive(page, 'Remediation');
      await expect(page.getByTestId('toc-section-remediation')).toBeInViewport();
      await expect.poll(() => content.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    });

    test('Should activate the section when the content is scrolled', async ({ page }) => {
      await tocStory.goto(page, 'With Scroll Spy');
      const content = page.getByTestId('toc-content');
      await expectActive(page, 'TL;DR');
      await content.evaluate(el => el.scrollTo({ top: el.scrollHeight }));
      await expectActive(page, 'Appendix');
    });

    test('Should drive segmented tabs when the content is scrolled', async ({ page }) => {
      await tocStory.goto(page, 'With Segmented Tabs');
      await page.getByTestId('toc-content').evaluate(el => el.scrollTo({ top: el.scrollHeight }));
      await expect(
        page.getByTestId('toc-tabs--trigger').filter({ hasText: 'Appendix' }),
      ).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('Accessibility', () => {
    // No axe tooling in this repo's e2e: landmark, list and current-item semantics stand in for it.
    test('Should be announced as a named nav landmark via its roles in full view', async ({
      page,
    }) => {
      await tocStory.goto(page, 'Basic');
      const nav = page.getByRole('navigation', { name: 'On this page' });
      await expect(nav).toBeVisible();
      await expect(nav.getByRole('listitem')).toHaveCount(5);
      await expect(nav.getByRole('link', { name: 'Findings' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      const toggle = nav.getByRole('button', { name: 'On this page' });
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(toggle).toHaveAttribute(
        'aria-controls',
        (await page.getByTestId('toc--list').getAttribute('id')) ?? '',
      );
    });

    test('Should hide the dashes from assistive tech via aria-hidden in minimized view', async ({
      page,
    }) => {
      await tocStory.goto(page, 'Minimized');
      const nav = page.getByRole('navigation', { name: 'On this page' });
      await expect(page.getByTestId('toc--dashes')).toHaveAttribute('aria-hidden', 'true');
      await expect(nav.getByRole('link')).toHaveCount(0);
      await expect(nav.getByRole('button', { name: 'On this page' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    test('Should be focusable via Tab key', async ({ page }) => {
      await tocStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('toc--toggle')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(getItem(page, 'TL;DR')).toBeFocused();
    });
  });
});
