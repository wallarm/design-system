import { afterAll, beforeAll, describe, expect, it } from '@rstest/core';
import type { Root } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createReact18Window } from './react18';

const names = ['Button', 'Copyable', 'FilterInput', 'Select', 'CodeSnippet', 'AssistantMessage'];
// The Shiki and highlight.js stories load adapters that Claude Design swaps for a throwing stub;
// CodeSnippet falls back to plain text, but the loader's rejection surfaces as unhandled.
const adapterStub = (reason: unknown) => {
  if (!String(reason).includes('syntax adapter is not included')) throw reason;
};
describe('compiled Storybook previews', () => {
  // The runner's own listener would fail the file, so it is set aside for the stub's rejection only.
  const runnerListeners = process.listeners('unhandledRejection');
  beforeAll(() => {
    process.removeAllListeners('unhandledRejection');
    process.on('unhandledRejection', adapterStub);
  });
  afterAll(() => {
    process.off('unhandledRejection', adapterStub);
    for (const listener of runnerListeners) process.on('unhandledRejection', listener);
  });
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
        // A story may render nothing but its heading (a closed overlay), so only the first must show content.
        expect(stories[0]?.children.length, stories[0]?.textContent ?? '').toBeGreaterThan(1);
        // The first Button story has a fixed label, not the generic meta.component fallback.
        if (name === 'Button')
          expect(stories[0]?.querySelector('button')?.textContent).toBe('Button');
      } finally {
        if (root) env.ReactDOM.flushSync(() => root?.unmount());
        env.dom.window.close();
      }
    });
});
