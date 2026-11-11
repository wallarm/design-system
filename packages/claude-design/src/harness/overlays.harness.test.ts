import type { ElementType, ReactNode } from 'react';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, rs } from '@rstest/core';

import { createReact18Window } from './react18';

const cleanups: (() => void)[] = [];

function setup() {
  const env = createReact18Window();
  // jsdom has no layout engine. These observers are browser capabilities used by
  // Ark positioning and Table virtualization, not component implementations.
  env.window.ResizeObserver = class {
    observe() {
      /* No layout measurements in jsdom. */
    }
    unobserve() {
      /* No layout measurements in jsdom. */
    }
    disconnect() {
      /* No layout measurements in jsdom. */
    }
  };
  env.window.IntersectionObserver = class {
    root = null;
    rootMargin = '0px';
    thresholds = [0];
    observe() {
      /* No viewport measurements in jsdom. */
    }
    unobserve() {
      /* No viewport measurements in jsdom. */
    }
    disconnect() {
      /* No viewport measurements in jsdom. */
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
  const errors = rs.spyOn(env.window.console, 'error').mockImplementation(() => undefined);
  const runtimeErrors: unknown[] = [];
  env.window.addEventListener('error', event => runtimeErrors.push(event.error));
  env.window.eval(readFileSync(resolve('.claude-design/project/components/bundle.js'), 'utf8'));
  const DS = env.window.WallarmDS;
  const h = (name: string, props: Record<string, unknown> = {}, ...children: ReactNode[]) => {
    expect(DS, `Canvas export ${name}`).toHaveProperty(name);
    return env.React.createElement(DS[name] as ElementType, props, ...children);
  };
  const root = env.ReactDOM.createRoot(env.window.document.getElementById('app')!);
  const mount = (node: ReactNode) => env.ReactDOM.flushSync(() => root.render(node));
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
  return { ...env, DS, h, mount };
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

describe('canvas helpers on real React 18', () => {
  it('defaults Root to light and scopes theme changes without touching html or localStorage', () => {
    const { window, h, mount } = setup();
    const { document, localStorage } = window;
    document.documentElement.setAttribute('data-theme', 'existing-theme');
    document.documentElement.className = 'existing-class';
    localStorage.setItem('theme', 'existing-preference');
    const htmlAttributes = [...document.documentElement.attributes].map(a => [a.name, a.value]);
    mount(h('Root', {}, h('Text', {}, 'Canvas content')));
    const frame = document.getElementById('app')!.firstElementChild!;
    expect(frame.getAttribute('data-theme')).toBe('light');
    expect(frame.getAttribute('data-slot')).toBe('root');
    expect(frame.classList.contains('bg-bg-page-bg')).toBe(true);
    expect(frame.textContent).toContain('Canvas content');
    mount(h('Root', { theme: 'dark' }, h('Text', {}, 'Canvas content')));
    expect(frame.getAttribute('data-theme')).toBe('dark');
    expect([...document.documentElement.attributes].map(a => [a.name, a.value])).toEqual(
      htmlAttributes,
    );
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem('theme')).toBe('existing-preference');
  });

  it.each(['Dialog', 'Popover', 'Select', 'DropdownMenu'] as const)(
    'mounts open %s in the dark Root portal host without React errors',
    async name => {
      const { window, DS, h, mount } = setup();
      let overlay: ReactNode;
      if (name === 'Dialog') {
        overlay = h(
          'Dialog',
          { open: true, 'data-testid': 'overlay' },
          h('DialogTrigger', {}, 'Open dialog'),
          h(
            'DialogContent',
            {},
            h('DialogTitle', {}, 'Dialog title'),
            h('DialogDescription', {}, 'Dialog description'),
            h('Button', {}, 'Dialog action'),
          ),
        );
      } else if (name === 'Popover') {
        overlay = h(
          'Popover',
          { open: true, 'data-testid': 'overlay' },
          h('PopoverTrigger', {}, 'Open popover'),
          h('PopoverContent', {}, 'Popover content'),
        );
      } else if (name === 'Select') {
        const item = { label: 'Production', value: 'production' };
        const createListCollection = DS.createListCollection as (options: {
          items: (typeof item)[];
        }) => unknown;
        overlay = h(
          'Select',
          { open: true, collection: createListCollection({ items: [item] }) },
          h('SelectButton', { 'aria-label': 'Environment' }, 'Select environment'),
          h(
            'SelectPositioner',
            { contentProps: { 'data-testid': 'overlay--content' } },
            h(
              'SelectContent',
              {},
              h('SelectOption', { item }, h('SelectOptionText', {}, item.label)),
            ),
          ),
        );
      } else {
        overlay = h(
          'DropdownMenu',
          { open: true, 'data-testid': 'overlay' },
          h('DropdownMenuTrigger', {}, 'Open menu'),
          h(
            'DropdownMenuContent',
            {},
            h('DropdownMenuInput', { 'aria-label': 'Search actions' }),
            h('DropdownMenuItem', { value: 'inspect' }, 'Inspect request'),
          ),
        );
      }
      mount(h('Root', { theme: 'dark' }, overlay));
      const frame = window.document.getElementById('app')!.firstElementChild!;
      const host = frame.lastElementChild!;
      await expect
        .poll(() => host.querySelector('[data-testid="overlay--content"]'))
        .not.toBeNull();
      const content = window.document.querySelector('[data-testid="overlay--content"]')!;
      expect(content.getAttribute('data-state')).toBe('open');
      expect(content.closest('[data-theme]')).toBe(frame);
      expect(content.closest('[data-theme]')?.getAttribute('data-theme')).toBe('dark');
      if (name === 'DropdownMenu') {
        // DropdownMenuContent separates this child by component identity.
        const search = content.querySelector('[aria-label="Search actions"]')!;
        expect(search.closest('[data-part="viewport"]')).toBeNull();
      }
    },
  );

  it('mounts Table with createElement cells and a master-cell handler as the README translates it', async () => {
    const { React, window, DS, h, mount } = setup();
    const onMasterCellClick = rs.fn();
    const columns = [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (ctx: { row: { original: { name: string } } }) =>
          React.createElement(DS.Text as ElementType, { size: 'xs' }, ctx.row.original.name),
      },
    ];
    mount(
      h(
        'Root',
        {},
        h('Table', {
          'aria-label': 'Rules',
          data: [{ id: 'r1', name: 'Block bots' }],
          columns,
          getRowId: (row: { id: string }) => row.id,
          onMasterCellClick,
        }),
      ),
    );
    await expect
      .poll(() => window.document.querySelector('tbody')?.textContent)
      .toContain('Block bots');
    (window.document.querySelector('tbody td') as HTMLElement).click();
    expect(onMasterCellClick).toHaveBeenCalledWith('r1');
  });

  it('preserves canvas Text child identity for Button trailing-content spacing', () => {
    const { React, window, h, mount } = setup();
    mount(
      React.createElement(
        React.Fragment,
        {},
        h(
          'Button',
          { size: 'medium', 'data-testid': 'text-end' },
          'Save',
          h('Text', { inline: true }, 'request'),
        ),
        h(
          'Button',
          { size: 'medium', 'data-testid': 'icon-end' },
          'Save',
          React.createElement('span', {}, '+'),
        ),
      ),
    );
    expect(
      window.document.querySelector('[data-testid="text-end"]')?.classList.contains('pr-6'),
    ).toBe(false);
    expect(
      window.document.querySelector('[data-testid="icon-end"]')?.classList.contains('pr-6'),
    ).toBe(true);
  });
});
