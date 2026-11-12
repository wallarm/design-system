import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import {
  ATTACK_SUMMARY_A2UI,
  ATTACK_SUMMARY_ACTIONS,
  ATTACK_SUMMARY_JSON_RENDER,
} from '../fixtures/attackSummary';
import {
  createJsonRenderCatalog,
  JsonRenderSurface,
  type SpecStreamLine,
  specFromLines,
} from '../json-render';
import { findPlaceholder } from './findPlaceholder';

const pendingIds = (root: HTMLElement) =>
  [...root.querySelectorAll('[data-gen-ui-placeholder]')].map(el =>
    el.getAttribute('data-gen-ui-placeholder'),
  );

const IPS = ['203.0.113.7', '203.0.113.12', '198.51.100.40'];

/** Both formats must draw the same answer from the same definitions and fire the same action. */
const expectAttackSummary = async (onAction: ReturnType<typeof rstest.fn>) => {
  expect(await screen.findByText('Attacks in the last 24 hours')).toBeTruthy();
  expect(screen.getByText('1,240')).toBeTruthy(); // bound to /stats/attacks
  expect(screen.getByText('/api/v1/auth/login')).toBeTruthy(); // bound array
  await userEvent.click(screen.getByRole('button', { name: 'Block 3 source IPs' }));
  expect(onAction).toHaveBeenCalledWith('block_ips', { ips: IPS });
};

describe('gen-ui', () => {
  it('renders the A2UI stream through the DS catalog', async () => {
    const onAction = rstest.fn();
    render(
      <A2uiSurfaces
        catalog={createA2uiCatalog(wallarmComponents)}
        messages={ATTACK_SUMMARY_A2UI}
        actions={ATTACK_SUMMARY_ACTIONS}
        onAction={onAction}
      />,
    );
    await expectAttackSummary(onAction);
  });

  it('renders the json-render stream through the DS catalog', async () => {
    const onAction = rstest.fn();
    render(
      <JsonRenderSurface
        catalog={createJsonRenderCatalog(wallarmComponents, ATTACK_SUMMARY_ACTIONS)}
        spec={specFromLines(ATTACK_SUMMARY_JSON_RENDER)}
        onAction={onAction}
      />,
    );
    await expectAttackSummary(onAction);
  });

  it('renders every prefix of both streams without throwing', () => {
    // Boundaries catch a View that throws and render nothing; React still reports it here.
    const error = rstest.spyOn(console, 'error');
    const a2ui = createA2uiCatalog(wallarmComponents);
    const jsonRender = createJsonRenderCatalog(wallarmComponents, ATTACK_SUMMARY_ACTIONS);
    for (let i = 1; i <= ATTACK_SUMMARY_A2UI.length; i++) {
      const view = render(
        <A2uiSurfaces
          catalog={a2ui}
          messages={ATTACK_SUMMARY_A2UI.slice(0, i)}
          actions={ATTACK_SUMMARY_ACTIONS}
          onAction={rstest.fn()}
        />,
      );
      view.unmount();
    }
    for (let i = 1; i <= ATTACK_SUMMARY_JSON_RENDER.length; i++) {
      const view = render(
        <JsonRenderSurface
          catalog={jsonRender}
          spec={specFromLines(ATTACK_SUMMARY_JSON_RENDER.slice(0, i))}
          streaming
          onAction={rstest.fn()}
        />,
      );
      view.unmount();
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('survives a malformed A2UI stream and drops actions outside the allowlist', async () => {
    const onAction = rstest.fn();
    const onError = rstest.fn();
    const [create, data, ...rest] = ATTACK_SUMMARY_A2UI;
    const bogus = { version: '1.0', updateComponents: { surfaceId: 'nope', components: [] } };
    render(
      <A2uiSurfaces
        catalog={createA2uiCatalog(wallarmComponents)}
        messages={[bogus, create, data, ...rest] as unknown as typeof ATTACK_SUMMARY_A2UI}
        actions={[{ name: 'open_attacks', description: 'only this one' }]}
        onAction={onAction}
        onError={onError}
      />,
    );
    expect(await screen.findByText('Attacks in the last 24 hours')).toBeTruthy();
    expect(onError).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Block 3 source IPs' }));
    expect(onAction).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Open in Attacks' }));
    expect(onAction).toHaveBeenCalledWith('open_attacks', { filter: 'type:sqli' });
  });

  it('json-render actions reach the latest onAction, not the one from mount', async () => {
    const catalog = createJsonRenderCatalog(wallarmComponents, ATTACK_SUMMARY_ACTIONS);
    const spec = specFromLines(ATTACK_SUMMARY_JSON_RENDER);
    const first = rstest.fn();
    const second = rstest.fn();
    const view = render(<JsonRenderSurface catalog={catalog} spec={spec} onAction={first} />);
    view.rerender(<JsonRenderSurface catalog={catalog} spec={spec} onAction={second} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open in Attacks' }));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('open_attacks', { filter: 'type:sqli' });
  });

  it('holds a placeholder, labelled with the agent id, for children that have not arrived', async () => {
    // Up to the first updateComponents: root and the metrics row exist, endpoints/alert/actions don't.
    const a2ui = render(
      <A2uiSurfaces
        catalog={createA2uiCatalog(wallarmComponents)}
        messages={ATTACK_SUMMARY_A2UI.slice(0, 3)}
        actions={ATTACK_SUMMARY_ACTIONS}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText('Attacks in the last 24 hours')).toBeTruthy();
    expect(pendingIds(a2ui.container)).toEqual(['endpoints', 'alert', 'actions']);
    a2ui.unmount();

    // Up to the metrics: the root lists five children, two have arrived.
    const jsonRender = render(
      <JsonRenderSurface
        catalog={createJsonRenderCatalog(wallarmComponents, ATTACK_SUMMARY_ACTIONS)}
        spec={specFromLines(ATTACK_SUMMARY_JSON_RENDER.slice(0, 4))}
        streaming
        onAction={rstest.fn()}
      />,
    );
    expect(pendingIds(jsonRender.container)).toEqual(['metrics', 'endpoints', 'alert', 'actions']);
  });

  it('keeps the catalog honest: unique names, and no casts in the definitions', () => {
    const names = wallarmComponents.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
    const dir = join(__dirname, '..', 'components');
    for (const file of readdirSync(dir)) {
      // An `as` would hide a value the DS no longer has; use subsetOf/allOf or a typed map.
      // Strings and comments may say "as" in prose; only code counts.
      const code = readFileSync(join(dir, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
        .replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '');
      const casts = code.match(/\bas (?!const\b)\w/g);
      expect({ file, casts }).toEqual({ file, casts: null });
    }
  });

  it('emits a catalog document and a prompt for the agent', () => {
    const document = JSON.stringify(createA2uiCatalog(wallarmComponents).toJson());
    const prompt = createJsonRenderCatalog(
      wallarmComponents,
      ATTACK_SUMMARY_ACTIONS,
    ).catalog.prompt();
    expect(document).toContain('Default column'); // a field description survives the zod 3 rewrite
    for (const { name } of wallarmComponents) {
      expect(document).toContain(`"${name}"`);
      expect(prompt).toMatch(new RegExp(`\\b${name}\\b`));
    }
  });

  it('specFromLines never throws on a malformed stream', () => {
    const spec = specFromLines([
      { op: 'add', path: '/root', value: 'a' },
      { op: 'add', path: '/elements/a', value: { type: 'Stack', props: {}, children: ['b', 3] } },
      { op: 'add', path: '/elements/b', value: null },
      { op: 'add', path: '/elements/c', value: { type: 'Text', props: 'x', children: 3 } },
      { op: 'test', path: '/root', value: 'not-a' },
    ] as SpecStreamLine[]);
    expect(spec.root).toBe('a');
    expect(spec.elements.a?.children).toEqual(['b']);
    expect(spec.elements.b?.type).toBe('gen-ui:pending');
    expect(spec.elements.c).toEqual({ type: 'Text', props: {}, children: [] });
  });

  it('json-render runs only allowlisted actions: no built-ins, no watch, no confirm dialog', async () => {
    const onAction = rstest.fn();
    // The surface sanitizes on its own: the raw agent spec goes straight in.
    const spec = specFromLines([
      { op: 'add', path: '/state', value: { n: 'app value' } },
      { op: 'add', path: '/root', value: 'root' },
      {
        op: 'add',
        path: '/elements/root',
        value: { type: 'Stack', props: {}, children: ['t', 'set', 'ok'] },
      },
      {
        op: 'add',
        path: '/elements/t',
        value: { type: 'Text', props: { text: { $state: '/n' } }, children: [] },
      },
      {
        op: 'add',
        path: '/elements/set',
        value: {
          type: 'Button',
          props: { label: 'Overwrite' },
          on: {
            press: { action: 'setState', params: { statePath: '/n', value: 'agent value' } },
          },
          watch: { '/n': { action: 'open_attacks' } },
          children: [],
        },
      },
      {
        op: 'add',
        path: '/elements/ok',
        value: {
          type: 'Button',
          props: { label: 'Open' },
          on: {
            press: {
              action: 'open_attacks',
              params: { filter: 'x' },
              confirm: { title: 'Sure?' },
            },
          },
          children: [],
        },
      },
    ] as SpecStreamLine[]);
    render(
      <JsonRenderSurface
        catalog={createJsonRenderCatalog(wallarmComponents, ATTACK_SUMMARY_ACTIONS)}
        spec={spec}
        onAction={onAction}
      />,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Overwrite' }));
    expect(screen.getByText('app value')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.queryByText('Sure?')).toBeNull();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('open_attacks', { filter: 'x' });
  });

  it('json-render state follows the spec: changed leaves update, dropped ones clear', async () => {
    const catalog = createJsonRenderCatalog(wallarmComponents, ATTACK_SUMMARY_ACTIONS);
    const lines = (state: Record<string, unknown>): SpecStreamLine[] => [
      { op: 'add', path: '/state', value: state },
      { op: 'add', path: '/root', value: 't' },
      {
        op: 'add',
        path: '/elements/t',
        value: { type: 'Text', props: { text: { $state: '/a/b' } }, children: [] },
      },
    ];
    const view = render(
      <JsonRenderSurface
        catalog={catalog}
        spec={specFromLines(lines({ a: { b: 'one' } }))}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText('one')).toBeTruthy();
    view.rerender(
      <JsonRenderSurface
        catalog={catalog}
        spec={specFromLines(lines({ a: { b: 'two' } }))}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText('two')).toBeTruthy();
    view.rerender(
      <JsonRenderSurface
        catalog={catalog}
        spec={specFromLines(lines({}))}
        onAction={rstest.fn()}
      />,
    );
    // The binding resolves to nothing again, so Text's props fail and it holds a placeholder.
    expect(await findPlaceholder('Text')).toBeTruthy();
  });
});
