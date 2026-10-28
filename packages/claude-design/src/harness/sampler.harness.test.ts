import type { ElementType, ReactNode } from 'react';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, rs } from '@rstest/core';

import { SAMPLER_FILE, SKELETON_FILE } from '../sampler/sampler';
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

/** Mounts a shipped artboard on real React 18 with a minimal stand-in for the canvas runtime. */
async function withArtboard(
  file: string,
  check: (env: {
    document: Document;
    logic: { setState(next: object): void };
    text: () => string;
    warnings: unknown[][];
  }) => Promise<void>,
) {
  const env = createReact18Window();
  const { window, React, ReactDOM } = env;
  const win = window as unknown as Record<string, unknown>;
  win.ResizeObserver = noLayout;
  win.IntersectionObserver = noLayout;
  const consoleErrors = rs.spyOn(window.console, 'error').mockImplementation(() => undefined);
  const consoleWarnings = rs.spyOn(window.console, 'warn').mockImplementation(() => undefined);
  const runtimeErrors: unknown[] = [];
  window.addEventListener('error', event => runtimeErrors.push(event.error));
  window.eval(readFileSync(resolve('.claude-design/project/components/bundle.js'), 'utf8'));
  const html = readFileSync(resolve('.claude-design/project', file), 'utf8');
  const doc = new window.DOMParser().parseFromString(html, 'text/html');

  // DCLogic state, {{holes}} and x-import.
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
  ) as new (props: object) => {
    renderVals(): Record<string, unknown>;
    setState(next: object): void;
  };
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
    await check({
      document: window.document,
      logic,
      text: () => window.document.body.textContent ?? '',
      warnings: consoleWarnings.mock.calls,
    });
    expect(runtimeErrors).toEqual([]);
    expect(consoleErrors.mock.calls).toEqual([]);
  } finally {
    ReactDOM.flushSync(() => root.unmount());
    env.dom.window.close();
    consoleErrors.mockRestore();
    consoleWarnings.mockRestore();
  }
}

describe(SAMPLER_FILE, () => {
  it('mounts on real React 18 with every x-import, hole and render prop resolved', async () => {
    await withArtboard(SAMPLER_FILE, async ({ document, logic, text }) => {
      await expect.poll(() => document.querySelector('tbody')?.textContent).toContain('Ana Ruiz');
      for (const part of ['Create user', 'Invite expired', 'API tokens', 'No API tokens yet'])
        await expect.poll(text).toContain(part);
      expect(document.querySelectorAll('[aria-label^="Actions for "]').length).toBe(5);
      logic.setState({ query: 'nobody' });
      await expect.poll(text).toContain('No results found');
    });
  });
});

describe(SKELETON_FILE, () => {
  it('renders the shell from its APP object and follows panel navigation', async () => {
    await withArtboard(SKELETON_FILE, async ({ document, text, warnings }) => {
      const byTestId = (id: string) => document.querySelector(`[data-testid="${id}"]`);
      const title = () => byTestId('page--title')?.textContent;
      const crumbs = () => byTestId('product-shell--breadcrumb')?.textContent;
      const panel = () => byTestId('product-shell--panel') as HTMLElement;

      for (const part of ['Acme Bank', 'Ask Claude to design this screen'])
        await expect.poll(text).toContain(part);
      expect(document.querySelector('[aria-label="Search"]')).not.toBeNull();
      expect(document.querySelector('[aria-label="Help"]')).not.toBeNull();
      expect(byTestId('notifications--trigger')?.textContent).toContain('2');
      const rail = byTestId('nav-rail')?.textContent ?? '';
      for (const label of ['Home', 'API Security', 'Edge', 'Security Testing', 'AI Hypervisor'])
        expect(rail).toContain(label);
      const footer = byTestId('nav-rail--footer')?.textContent ?? '';
      expect(footer).toContain('Settings');
      expect(footer).toContain('Maria Lopez');

      for (const label of ['Overview', 'API Discovery', 'API Specifications', 'Attacks'])
        expect(panel().textContent).toContain(label);
      expect(panel().textContent).toContain('Detect & Respond');
      expect(title()).toBe('Overview');
      expect(crumbs()).toContain('Overview');

      const item = (label: string) =>
        [...panel().querySelectorAll<HTMLElement>('a, button')].find(
          el => el.textContent?.trim() === label,
        );
      item('API Specifications')?.click();
      await expect.poll(title).toBe('API Specifications');
      expect(crumbs()).toContain('API Specifications');
      expect(byTestId('page--header')?.textContent).toContain('Upload specification');
      item('Attacks')?.click();
      await expect.poll(title).toBe('Attacks');
      expect(crumbs()).toContain('Events');
      expect(byTestId('page--header')?.textContent).not.toContain('Upload specification');
      expect(warnings.filter(args => String(args[0]).startsWith('[WallarmDS]'))).toEqual([]);
    });
  });
});
