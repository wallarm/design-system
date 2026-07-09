import type { Page } from '@playwright/test';

function storyNameToId(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase();
}

/**
 * @example
 * ```ts
 * const alertStory = createStoryHelper('messaging-alert', [
 *   'All Colors',
 *   'Title Only',
 *   'With Close Button',
 * ] as const);
 *
 * await alertStory.goto(page, 'All Colors'); // → iframe.html?id=messaging-alert--all-colors
 * ```
 */
export function createStoryHelper<const T extends readonly string[]>(
  componentId: string,
  storyNames: T,
) {
  type StoryName = T[number];

  if (storyNames.length === 0) {
    throw new Error(`createStoryHelper: storyNames cannot be empty`);
  }

  return {
    url(storyName: StoryName): string {
      const storyId = storyNameToId(storyName);
      return `iframe.html?viewMode=story&id=${componentId}--${storyId}`;
    },

    async goto(page: Page, storyName: StoryName): Promise<void> {
      const url = this.url(storyName);

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      await page.waitForFunction(
        () => {
          const root = document.getElementById('storybook-root');
          return root && root.children.length > 0;
        },
        { timeout: 30000 },
      );

      // fonts.ready resolves immediately when no font request has started yet,
      // so force-load every registered face before awaiting it — otherwise
      // screenshots race the font-display:swap of lazily-loaded webfonts
      await page.evaluate(async () => {
        const loads: Promise<unknown>[] = [];
        document.fonts.forEach(font => {
          loads.push(font.load().catch(() => undefined));
        });
        await Promise.all(loads);
        await document.fonts.ready;
      });
      await page.waitForTimeout(300);
    },

    get componentId(): string {
      return componentId;
    },

    get stories(): readonly StoryName[] {
      return storyNames;
    },
  };
}
