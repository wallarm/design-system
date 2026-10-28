import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from '@rstest/core';
import type { Root } from 'react-dom/client';

import { createReact18Window } from './react18';

const names = ['Button', 'Copyable', 'FilterInput', 'Select', 'CodeSnippet', 'AssistantMessage'];
// Stories that legitimately render only their heading, each with the reason.
const headingOnly = new Set([
  'FilterInput/Closed', // the menu is closed, so there is nothing but the heading until it opens
]);
describe('compiled Storybook previews', () => {
  for (const name of names)
    it(`mounts real ${name} stories using the shared canvas components`, async () => {
      const env = createReact18Window();
      const errors: unknown[] = [];
      env.window.addEventListener('error', event => {
        errors.push(event.error);
        event.preventDefault();
      });
      env.window.ResizeObserver = class {
        observe() {
          /* no layout engine */
        }
        unobserve() {
          /* no layout engine */
        }
        disconnect() {
          /* no layout engine */
        }
      };
      env.window.IntersectionObserver = class {
        root = null;
        rootMargin = '0px';
        thresholds = [0];
        observe() {
          /* no layout engine */
        }
        unobserve() {
          /* no layout engine */
        }
        disconnect() {
          /* no layout engine */
        }
        takeRecords(): IntersectionObserverEntry[] {
          return [];
        }
      };
      env.window.eval(readFileSync(resolve('.claude-design/project/components/bundle.js'), 'utf8'));
      env.window.eval(
        readFileSync(resolve(`.claude-design/project/components/${name}/stories.js`), 'utf8'),
      );
      const preview = (
        env.window as typeof env.window & { WallarmPreview: { mount(node: HTMLElement): Root } }
      ).WallarmPreview;
      let root: Root | undefined;
      try {
        env.ReactDOM.flushSync(() => {
          root = preview.mount(env.window.document.getElementById('app')!);
        });
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(errors).toEqual([]);
        const stories = env.window.document.querySelectorAll('[data-preview-story]');
        expect(stories.length).toBeGreaterThan(0);
        for (const story of stories) {
          const storyName = story.getAttribute('data-preview-story');
          if (!headingOnly.has(`${name}/${storyName}`))
            expect(story.children.length, `${name}/${storyName}`).toBeGreaterThan(1);
        }
        // The first Button story has a fixed label, not the generic meta.component fallback.
        if (name === 'Button')
          expect(stories[0]?.querySelector('button')?.textContent).toBe('Button');
      } finally {
        if (root) env.ReactDOM.flushSync(() => root?.unmount());
        env.dom.window.close();
      }
    });
});
