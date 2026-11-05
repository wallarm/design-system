import type { ElementType, ReactNode } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createReact18Window } from './react18';

const noLayout = class {
  root = null;
  rootMargin = '0px';
  thresholds = [0];
  observe() {
    /* jsdom has no layout engine */
  }
  unobserve() {
    /* jsdom has no layout engine */
  }
  disconnect() {
    /* jsdom has no layout engine */
  }
  takeRecords() {
    return [];
  }
};

describe('sampler.dc.html', () => {
  it('mounts on real React 18 with every x-import, hole and render prop resolved', async () => {
    const env = createReact18Window();
    const { window, React, ReactDOM } = env;
    const win = window as unknown as Record<string, unknown>;
    win.ResizeObserver = noLayout;
    win.IntersectionObserver = noLayout;
    const consoleErrors = rs.spyOn(window.console, 'error').mockImplementation(() => undefined);
    const runtimeErrors: unknown[] = [];
    window.addEventListener('error', event => runtimeErrors.push(event.error));
    window.eval(readFileSync(resolve('.claude-design/project/components/bundle.js'), 'utf8'));
    const html = readFileSync(resolve('.claude-design/project/sampler.dc.html'), 'utf8');
    const doc = new window.DOMParser().parseFromString(html, 'text/html');

    // A minimal stand-in for the canvas runtime: DCLogic state, {{holes}} and x-import.
    let rerender = () => undefined as void;
    win.DCLogic = class {
      state: Record<string, unknown> = {};
      constructor(public props: Record<string, unknown>) {}
      setState(next: Record<string, unknown>) {
        Object.assign(this.state, next);
        rerender();
      }
    };
    const Component = window.eval(
      `${doc.querySelector('script[data-dc-script]')?.textContent}\n;Component`,
    ) as new (
      props: object,
    ) => { renderVals(): Record<string, unknown> };
    const logic = new Component({});
    const camel = (name: string) =>
      /^(aria|data)-/.test(name)
        ? name
        : name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const toReact = (node: Node, vals: Record<string, unknown>): ReactNode => {
      if (node.nodeType === 3) return node.textContent?.trim() ? node.textContent : null;
      if (!(node instanceof window.Element)) return null;
      const props: Record<string, unknown> = {};
      for (const { name, value } of node.attributes) {
        if (name === 'component-from-global-scope') continue;
        const hole = /^\{\{(\w+)\}\}$/.exec(value)?.[1];
        if (hole) expect(vals, `renderVals().${hole}`).toHaveProperty(hole);
        props[name === 'class' ? 'className' : camel(name)] = hole ? vals[hole] : value;
      }
      const global = node.getAttribute('component-from-global-scope');
      const type = global
        ? (global
            .split('.')
            .reduce<unknown>(
              (at, key) => (at as Record<string, unknown>)?.[key],
              window,
            ) as ElementType)
        : node.localName;
      expect(type, global ?? node.localName).toBeTruthy();
      return React.createElement(
        type,
        props,
        ...[...node.childNodes].map(child => toReact(child, vals)),
      );
    };
    const markup = doc.querySelector('x-dc')!.firstElementChild!;
    const root = ReactDOM.createRoot(window.document.getElementById('app')!);
    rerender = () => ReactDOM.flushSync(() => root.render(toReact(markup, logic.renderVals())));
    try {
      rerender();
      const text = () => window.document.body.textContent ?? '';
      await expect
        .poll(() => window.document.querySelector('tbody')?.textContent)
        .toContain('Ana Ruiz');
      for (const part of ['Create user', 'Invite expired', 'API tokens', 'No API tokens yet'])
        await expect.poll(text).toContain(part);
      expect(window.document.querySelectorAll('[aria-label^="Actions for "]').length).toBe(5);
      (logic as unknown as { setState(next: object): void }).setState({ query: 'nobody' });
      await expect.poll(text).toContain('No results found');
      expect(runtimeErrors).toEqual([]);
      expect(consoleErrors.mock.calls).toEqual([]);
    } finally {
      ReactDOM.flushSync(() => root.unmount());
      env.dom.window.close();
      consoleErrors.mockRestore();
    }
  });
});
