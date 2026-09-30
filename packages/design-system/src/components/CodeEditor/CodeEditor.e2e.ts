import { expect, type Locator, type Page, test } from '@playwright/test';
import { storyNameFromExport } from 'storybook/internal/csf';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';
import { CODE_EDITOR_KEYBOARD_HINT } from './lib/keyboardHint';

const COMPONENT_ID = 'data-display-codeeditor-codeeditor';

const storiesSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'CodeEditor.stories.tsx'),
  'utf8',
);

/**
 * Every story exported from `CodeEditor.stories.tsx`, named the way Storybook names it
 * (`ParityLineColors` → `Parity Line Colors`). Each one gets a screenshot, so a story
 * added later is covered without touching this file. The `StoryFn` anchor skips sample
 * documents whose lines start with `export const` (the TypeScript sample does).
 */
const STORY_NAMES: string[] = [
  ...storiesSource.matchAll(/^export const (\w+): StoryFn</gm),
].flatMap(match => (match[1] ? [storyNameFromExport(match[1])] : []));

/** Stories under a Prism / Shiki provider: their colours arrive after the adapter loads. */
const COLOURED_STORIES = new Set([
  'Http Request With Prism',
  'Http Response With Shiki',
  'Parity Http Prism',
  'Languages',
  'Syntax Errors',
]);

/** Stories whose editors all show at least one diagnostic underline once linting settles. */
const DIAGNOSTIC_STORIES = new Set(['Syntax Errors', 'Editing Workflow']);

const everyStory = createStoryHelper(COMPONENT_ID, STORY_NAMES);

const interactionStory = createStoryHelper(COMPONENT_ID, [
  'Editing Workflow',
  'Tabs Keep History',
  'Long Document',
] as const);

const MOD = 'ControlOrMeta';

type CopyCaptureWindow = Window & { __copiedText?: string };
type DomProbeWindow = Window & { __codeEditorDomProbe?: { html: string; since: number } };

const editorOf = (page: Page, testId: string): Locator => page.getByTestId(`${testId}--editor`);

const ENGINE_SELECTOR = '[data-testid$="--editor"]';

/** The engine chunk has loaded: every editor surface exists and no static fallback is left. */
const waitForEngine = async (page: Page) => {
  await expect(page.locator(ENGINE_SELECTOR).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('textbox').first()).toBeVisible();
  await expect(page.locator('[data-testid$="--fallback"]')).toHaveCount(0);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
};

/**
 * Waits for the lazy work a stable DOM alone cannot prove has happened: an adapter that is
 * still downloading (Shiki's WASM) or a lazy parser (Babel, Lezer Python) that has not run
 * yet leaves the DOM quiet for longer than the stability window. Colours must be painted in
 * every editor, and diagnostic stories must show an underline (or, for a zero-length
 * diagnostic such as an unexpected end of input, a point marker) in every editor.
 */
const waitForLazyWork = async (page: Page, storyName: string) => {
  const editors = page.locator(ENGINE_SELECTOR);
  const count = await editors.count();
  if (COLOURED_STORIES.has(storyName)) {
    for (let index = 0; index < count; index++) {
      await expect(editors.nth(index).locator('span[class*="text-syntax-"]').first()).toBeAttached({
        timeout: 15_000,
      });
    }
  }
  if (DIAGNOSTIC_STORIES.has(storyName)) {
    for (let index = 0; index < count; index++) {
      await expect(editors.nth(index).locator('.cm-lintRange, .cm-lintPoint').first()).toBeAttached(
        {
          timeout: 15_000,
        },
      );
    }
  }
};

/**
 * Waits until nothing — adapter painter, linter, portals, tooltip positioning — has changed
 * the DOM for 750ms (longer than the 300ms lint delay plus the lazy schema load), so a
 * screenshot never catches a half-painted frame.
 */
const waitForStableDom = async (page: Page) => {
  await page.evaluate(() => {
    delete (window as DomProbeWindow).__codeEditorDomProbe;
  });
  await page.waitForFunction(
    () => {
      const probeWindow = window as DomProbeWindow;
      const html = document.body.innerHTML;
      const now = performance.now();
      const probe = probeWindow.__codeEditorDomProbe;
      if (!probe || probe.html !== html) {
        probeWindow.__codeEditorDomProbe = { html, since: now };
        return false;
      }
      return now - probe.since >= 750;
    },
    undefined,
    { polling: 100, timeout: 15_000 },
  );
};

/**
 * Drops focus so CodeMirror stops drawing its caret — except while a completion list is
 * open, because the list closes on blur and the screenshot is meant to show it.
 */
const blurUnlessCompleting = async (page: Page) => {
  if ((await page.getByRole('listbox').count()) > 0) return;
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });
};

const settleForScreenshot = async (page: Page) => {
  await blurUnlessCompleting(page);
  await waitForStableDom(page);
};

/** Puts the caret at the end of a (1-based) document line using the keyboard only. */
const caretToLineEnd = async (page: Page, editor: Locator, line: number) => {
  await editor.click();
  await page.keyboard.press(`${MOD}+Home`);
  for (let current = 1; current < line; current++) {
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('End');
};

/** Viewport box of `target`, found as the first occurrence inside the first occurrence of `context`. */
const textBox = async (editor: Locator, context: string, target: string) => {
  const box = await editor.evaluate(
    (root, { context, target }) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let text = '';
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node instanceof Text) {
          nodes.push(node);
          text += node.data;
        }
      }
      const contextStart = text.indexOf(context);
      const targetOffset = context.indexOf(target);
      if (contextStart < 0 || targetOffset < 0) return null;
      const start = contextStart + targetOffset;
      const end = start + target.length;
      const range = document.createRange();
      let offset = 0;
      for (const node of nodes) {
        const length = node.data.length;
        if (start >= offset && start <= offset + length) range.setStart(node, start - offset);
        if (end >= offset && end <= offset + length) {
          range.setEnd(node, end - offset);
          break;
        }
        offset += length;
      }
      const rect = range.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    },
    { context, target },
  );
  if (!box) throw new Error(`"${target}" inside "${context}" is not rendered in the editor`);
  return box;
};

const editorText = (editor: Locator): Promise<string> =>
  editor.evaluate(element => element.textContent ?? '');

test.describe('Component: CodeEditor', () => {
  test.describe('Visual', () => {
    for (const storyName of STORY_NAMES) {
      test(`Should render ${storyName.toLowerCase()} correctly`, async ({ page }) => {
        await everyStory.goto(page, storyName);
        await waitForEngine(page);
        await waitForLazyWork(page, storyName);
        await settleForScreenshot(page);
        await expect(page).toHaveScreenshot();
      });
    }

    test('Should render dark theme correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await waitForEngine(page);
      await waitForLazyWork(page, 'Editing Workflow');
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the find and replace panel correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await waitForLazyWork(page, 'Editing Workflow');
      await caretToLineEnd(page, editorOf(page, 'editing'), 1);
      await page.keyboard.press(`${MOD}+f`);
      await page.getByTestId('editing--search-input').fill('staging');
      await expect(page.getByTestId('editing--search')).toBeVisible();
      await waitForStableDom(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the open completion list correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await waitForLazyWork(page, 'Editing Workflow');
      await caretToLineEnd(page, editorOf(page, 'editing'), 4);
      await page.keyboard.press('Enter');
      await page.keyboard.type('Acc');
      await expect(page.getByRole('listbox')).toBeVisible();
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render a schema diagnostic tooltip correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await waitForLazyWork(page, 'Editing Workflow');
      const box = await textBox(editorOf(page, 'editing'), '"retries": 9', '9');
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      // The linter runs 300ms after load and the schema library loads lazily; a hover that
      // lands before the diagnostic exists shows nothing, so re-hover until the message shows.
      await expect(async () => {
        await page.mouse.move(x, y + box.height);
        await page.mouse.move(x, y);
        await expect(page.getByText(/at maximum/).first()).toBeVisible({ timeout: 1_000 });
      }).toPass({ timeout: 10_000 });
      await waitForStableDom(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render a collapsed fold summary correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await waitForLazyWork(page, 'Editing Workflow');
      await page.getByTestId('editing--fold-toggle').first().click();
      await expect(page.getByTestId('editing--fold-summary')).toBeVisible();
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render full screen correctly', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      await waitForLazyWork(page, 'Editing Workflow');
      await page.getByTestId('editing--fullscreen-button').click();
      await expect(page.getByTestId('editing--fullscreen-button')).toHaveAccessibleName(
        'Exit full screen',
      );
      await settleForScreenshot(page);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should update the document when text is typed', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 2);
      await page.keyboard.type('.test');
      await expect(editor).toContainText('Host: api.wallarm.example.test');
    });

    test('Should undo and redo typing when the history shortcuts are pressed', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 2);
      await page.keyboard.type('.test');
      await expect(editor).toContainText('api.wallarm.example.test');

      await page.keyboard.press(`${MOD}+z`);
      await expect(editor).not.toContainText('api.wallarm.example.test');
      await expect(editor).toContainText('Host: api.wallarm.example');

      await page.keyboard.press(`${MOD}+Shift+z`);
      await expect(editor).toContainText('api.wallarm.example.test');
    });

    test('Should edit every occurrence when the next occurrence is added to the selection', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      // Line 4 is `X-Env: staging`; the caret ends up touching the word.
      await caretToLineEnd(page, editor, 4);
      await page.keyboard.press(`${MOD}+d`);
      await page.keyboard.press(`${MOD}+d`);
      await page.keyboard.type('production');
      await expect(editor).toContainText('X-Env: production');
      await expect(editor).toContainText('"env": "production"');
      await expect(editor).not.toContainText('staging');
    });

    test('Should replace every match when replace all is clicked', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 1);
      await page.keyboard.press(`${MOD}+f`);
      await expect(page.getByTestId('editing--search')).toBeVisible();
      await page.getByTestId('editing--search-input').fill('staging');
      await page.getByTestId('editing--replace-input').fill('production');
      await page.getByTestId('editing--replace-all').click();
      await expect(editor).toContainText('X-Env: production');
      await expect(editor).toContainText('"env": "production"');
      await expect(editor).not.toContainText('staging');
    });

    test('Should collapse and expand the headers when the fold toggle and summary are clicked', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      const headersToggle = page.getByTestId('editing--fold-toggle').first();
      await expect(headersToggle).toHaveAccessibleName('Collapse Headers');

      await headersToggle.click();
      const summary = page.getByTestId('editing--fold-summary');
      await expect(summary).toBeVisible();
      await expect(editor).not.toContainText('Content-Type');
      await expect(page.getByTestId('editing--fold-toggle').first()).toHaveAccessibleName(
        'Expand Headers',
      );

      await summary.click();
      await expect(summary).toHaveCount(0);
      await expect(editor).toContainText('Content-Type: application/json');
    });

    test('Should reveal the whole document when show more is clicked', async ({ page }) => {
      await interactionStory.goto(page, 'Long Document');
      await waitForEngine(page);
      const showMore = page.getByTestId('long-document--show-more-button');
      const content = page.getByTestId('long-document--content');
      await expect(showMore).toContainText('Show more (1988 lines)');
      const clamped = await content.boundingBox();

      await showMore.click();
      await expect(showMore).toContainText('Show less');
      expect(clamped).not.toBeNull();
      await expect
        .poll(async () => (await content.boundingBox())?.height ?? 0)
        .toBeGreaterThan((clamped?.height ?? 0) * 10);

      await showMore.click();
      await expect(showMore).toContainText('Show more (1988 lines)');
      await expect.poll(async () => (await content.boundingBox())?.height).toBe(clamped?.height);
    });

    test('Should wrap long lines when the wrap button is clicked', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await expect(editor).toHaveCSS('white-space', 'pre');

      await page.getByTestId('editing--wrap-button').click();
      await expect(editor).toHaveCSS('white-space', 'break-spaces');
      await expect(editor).toHaveCSS('word-break', 'break-all');

      await page.getByTestId('editing--wrap-button').click();
      await expect(editor).toHaveCSS('white-space', 'pre');
    });

    test('Should keep the undo history when full screen is entered', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 2);
      await page.keyboard.type('.test');
      await expect(editor).toContainText('api.wallarm.example.test');

      const fullscreenButton = page.getByTestId('editing--fullscreen-button');
      await fullscreenButton.click();
      await expect(fullscreenButton).toHaveAccessibleName('Exit full screen');

      await editor.click();
      await page.keyboard.press(`${MOD}+z`);
      await expect(editor).not.toContainText('api.wallarm.example.test');
      await expect(fullscreenButton).toHaveAccessibleName('Exit full screen');
    });

    test('Should close the completion list without leaving full screen when Escape is pressed', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const fullscreenButton = page.getByTestId('editing--fullscreen-button');
      await fullscreenButton.click();
      await expect(fullscreenButton).toHaveAccessibleName('Exit full screen');

      await caretToLineEnd(page, editorOf(page, 'editing'), 4);
      await page.keyboard.press('Enter');
      await page.keyboard.type('Acc');
      const completions = page.getByRole('listbox');
      await expect(completions).toBeVisible();
      await expect(completions.getByRole('option', { name: /^Accept/ }).first()).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(completions).toHaveCount(0);
      await expect(fullscreenButton).toHaveAccessibleName('Exit full screen');
    });

    test('Should copy the edited value when the copy button is clicked', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: {
            writeText: (text: string) => {
              (window as CopyCaptureWindow).__copiedText = text;
              return Promise.resolve();
            },
          },
          writable: true,
          configurable: true,
        });
      });
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 2);
      await page.keyboard.type('.test');
      await expect(editor).toContainText('api.wallarm.example.test');

      await page.getByTestId('editing--copy-button').click();
      await expect(page.getByText('Copied')).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => (window as CopyCaptureWindow).__copiedText ?? ''))
        .toContain('POST /api/v1/rules HTTP/1.1\nHost: api.wallarm.example.test\n');
    });

    test('Should keep a separate undo history per tab when tabs are switched', async ({ page }) => {
      await interactionStory.goto(page, 'Tabs Keep History');
      await waitForEngine(page);
      const editor = editorOf(page, 'tabs-editor');

      // Line 3 ends with a closing quote; step inside it before typing.
      await caretToLineEnd(page, editor, 3);
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.type('-e2e');
      await expect(editor).toContainText('"/login-e2e"');

      await page.getByTestId('tabs-editor--tab-response').click();
      await expect(editor).toContainText('"reason": "blocked"');
      await caretToLineEnd(page, editor, 3);
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.type('-e2e');
      await expect(editor).toContainText('"blocked-e2e"');

      await page.getByTestId('tabs-editor--tab-request').click();
      await expect(editor).toContainText('"/login-e2e"');
      await editor.click();
      await page.keyboard.press(`${MOD}+z`);
      await expect(editor).toContainText('"path": "/login"');

      await page.getByTestId('tabs-editor--tab-response').click();
      await expect(editor).toContainText('"blocked-e2e"');
      await editor.click();
      await page.keyboard.press(`${MOD}+z`);
      await expect(editor).toContainText('"reason": "blocked"');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be exposed as a labelled multiline textbox via ARIA attributes', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await expect(editor).toHaveRole('textbox');
      await expect(editor).toHaveAccessibleName('HTTP request');
      await expect(editor).toHaveAccessibleDescription(CODE_EDITOR_KEYBOARD_HINT);
      await expect(editor).toHaveAttribute('aria-multiline', 'true');
    });

    test('Should be announced as read-only via aria-readonly', async ({ page }) => {
      await interactionStory.goto(page, 'Long Document');
      await waitForEngine(page);
      const editor = editorOf(page, 'long-document');
      await expect(editor).toHaveAttribute('aria-readonly', 'true');

      await editor.click();
      await expect(editor).toBeFocused();
      const before = await editorText(editor);
      await page.keyboard.type('x');
      expect(await editorText(editor)).toBe(before);
    });

    test('Should keep focus in the editor via Tab key', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 7);
      const before = await editorText(editor);

      await page.keyboard.press('Tab');
      await expect(editor).toBeFocused();
      await expect
        .poll(async () => (await editorText(editor)).length)
        .toBeGreaterThan(before.length);
    });

    test('Should move focus out of the editor via Escape then Tab', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 7);
      await expect(editor).toBeFocused();
      const before = await editorText(editor);

      await page.keyboard.press('Escape');
      await page.keyboard.press('Tab');
      await expect(editor).not.toBeFocused();
      expect(await editorText(editor)).toBe(before);
    });

    test('Should be collapsible via keyboard Enter on the fold toggle', async ({ page }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const headersToggle = page.getByTestId('editing--fold-toggle').first();
      await headersToggle.focus();
      await expect(headersToggle).toHaveAttribute('aria-expanded', 'true');

      await page.keyboard.press('Enter');
      await expect(page.getByTestId('editing--fold-summary')).toBeVisible();
      await expect(page.getByTestId('editing--fold-toggle').first()).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    test('Should close the search panel and return focus to the editor via Escape key', async ({
      page,
    }) => {
      await interactionStory.goto(page, 'Editing Workflow');
      await waitForEngine(page);
      const editor = editorOf(page, 'editing');
      await caretToLineEnd(page, editor, 1);
      await page.keyboard.press(`${MOD}+f`);
      const searchInput = page.getByTestId('editing--search-input');
      await expect(searchInput).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(page.getByTestId('editing--search')).toHaveCount(0);
      await expect(editor).toBeFocused();
    });
  });
});
