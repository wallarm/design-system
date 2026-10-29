import type { ElementType } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createReact18Window } from '../harness/react18';
import { toCanvasAdapter } from './canvas-adapter';
import { canvasRecipes } from './canvas-recipes';

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

describe('complete canvas documentation recipes on React 18', () => {
  for (const [component, recipes] of Object.entries(canvasRecipes)) {
    for (const recipe of recipes) {
      it(`mounts ${component}: ${recipe.name}`, async () => {
        const env = createReact18Window();
        env.window.ResizeObserver = class {
          observe() {
            /* jsdom has no layout engine. */
          }
          unobserve() {
            /* jsdom has no layout engine. */
          }
          disconnect() {
            /* jsdom has no layout engine. */
          }
        };
        env.window.IntersectionObserver = class {
          root = null;
          rootMargin = '0px';
          thresholds = [0];
          observe() {
            /* jsdom has no viewport measurements. */
          }
          unobserve() {
            /* jsdom has no viewport measurements. */
          }
          disconnect() {
            /* jsdom has no viewport measurements. */
          }
          takeRecords(): IntersectionObserverEntry[] {
            return [];
          }
        };
        const errors = rs.spyOn(env.window.console, 'error').mockImplementation(() => undefined);
        const runtimeErrors: unknown[] = [];
        env.window.addEventListener('error', event => runtimeErrors.push(event.error));
        env.window.eval(
          readFileSync(resolve('.claude-design/project/components/bundle.js'), 'utf8'),
        );
        const snippet = toCanvasAdapter(recipe.code, `${component}${recipe.name}`);
        expect(snippet).toBeDefined();
        const script = snippet?.match(/```js\n([\s\S]*?)\n```/)?.[1];
        const globalName = snippet?.match(/component-from-global-scope="([^"]+)"/)?.[1];
        expect(script).toBeDefined();
        expect(globalName).toBeDefined();
        env.window.eval(script ?? '');
        const adapter = Reflect.get(env.window, globalName ?? '') as ElementType;
        const root = env.ReactDOM.createRoot(env.window.document.getElementById('app')!);
        cleanups.push(() => {
          try {
            env.ReactDOM.flushSync(() => root.unmount());
            expect(errors.mock.calls).toEqual([]);
            expect(runtimeErrors).toEqual([]);
          } finally {
            env.dom.window.close();
            errors.mockRestore();
          }
        });
        env.ReactDOM.flushSync(() =>
          root.render(
            env.React.createElement(
              env.window.WallarmDS.Root as ElementType,
              { theme: 'light' },
              env.React.createElement(adapter),
            ),
          ),
        );
        await new Promise(done => setTimeout(done, 25));
        expect(env.window.document.getElementById('app')?.textContent?.trim()).toBeTruthy();
        if (component === 'NavRail') {
          const settings = [...env.window.document.querySelectorAll('a')].find(
            link => link.textContent?.trim() === 'Settings',
          );
          expect(settings).toBeDefined();
          env.ReactDOM.flushSync(() =>
            settings?.dispatchEvent(
              new env.window.MouseEvent('click', { bubbles: true, cancelable: true }),
            ),
          );
          expect(env.window.document.querySelector('[aria-current="page"]')?.textContent).toContain(
            'Settings',
          );
        }
        if (component === 'WallyAssistant') {
          const suggestion = [...env.window.document.querySelectorAll('button')].find(
            button => button.textContent?.trim() === 'Review security rules',
          );
          expect(suggestion).toBeDefined();
          env.ReactDOM.flushSync(() => suggestion?.click());
          expect(env.window.document.getElementById('app')?.textContent).toContain(
            'Prototype response. No request was sent to a service.',
          );
        }
      });
    }
  }
});
