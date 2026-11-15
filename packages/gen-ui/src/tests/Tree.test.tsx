import type { SpecStreamLine } from '@json-render/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { TreeComponent } from '../components/Tree';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [TreeComponent];
const NODES = [
  { label: 'api.example.com', depth: 0, badge: { text: '3', color: 'blue' } },
  { label: '/v1/users', depth: 1 },
  { label: 'GET /v1/users/{id}', depth: 2, badge: { text: 'Attacked', color: 'red' } },
  { label: '/v1/orders', depth: 1 },
  { label: 'shop.example.com', depth: 0 },
];

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/hosts', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [{ id: 'root', component: 'Tree', ...props }],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'Tree', props, children: [] } },
];

const renderA2ui = (messages: A2uiMessage[]) =>
  render(
    <A2uiSurfaces
      catalog={createA2uiCatalog(CATALOG)}
      messages={messages}
      actions={[]}
      onAction={rstest.fn()}
    />,
  );

const renderJsonRender = (lines: SpecStreamLine[]) =>
  render(
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(CATALOG, [])}
      spec={specFromLines(lines)}
      onAction={rstest.fn()}
    />,
  );

const renderOpenUi = (program: string, data?: Record<string, unknown>) =>
  render(
    <OpenUiSurface
      library={createOpenUiLibrary(CATALOG, [])}
      program={program}
      data={data}
      onAction={rstest.fn()}
      onError={rstest.fn()}
    />,
  );

const expectTree = async () => {
  const host = await screen.findByText('api.example.com');
  const endpoint = screen.getByText('GET /v1/users/{id}');
  expect(screen.getByText('Attacked')).toBeTruthy();
  expect(screen.getByText('shop.example.com')).toBeTruthy();
  // Nested: the endpoint sits inside its host's item, the second host doesn't.
  const hostItem = host.closest('[data-state]')?.parentElement;
  expect(hostItem?.contains(endpoint)).toBe(true);
  expect(hostItem?.contains(screen.getByText('shop.example.com'))).toBe(false);
};

describe('Tree', () => {
  it('renders literal nodes nested in A2UI', async () => {
    renderA2ui(a2ui({ nodes: NODES }));
    await expectTree();
  });

  it('renders literal nodes nested in json-render', async () => {
    renderJsonRender(jsonRender({ nodes: NODES }));
    await expectTree();
  });

  it('renders literal nodes nested in OpenUI', async () => {
    renderOpenUi(`root = Tree(${JSON.stringify(NODES)})`);
    await expectTree();
  });

  it('renders nodes bound to app data in every format', async () => {
    const views = [
      () => renderA2ui(a2ui({ nodes: { '@path': '/hosts' } }, NODES)),
      () => renderJsonRender(jsonRender({ nodes: { $state: '/hosts' } }, { hosts: NODES })),
      () => renderOpenUi('root = Tree($hosts)', { hosts: NODES }),
    ];
    for (const run of views) {
      const view = run();
      await expectTree();
      view.unmount();
    }
  });

  it('collapses a node, hiding its children, and expands it again', async () => {
    renderA2ui(a2ui({ nodes: NODES }));
    const users = await screen.findByText('/v1/users');
    const endpoint = screen.getByText('GET /v1/users/{id}');
    expect(endpoint.closest('[inert]')).toBeNull();
    fireEvent.click(users);
    expect(endpoint.closest('[inert]')).not.toBeNull();
    expect(screen.getByText('/v1/orders').closest('[inert]')).toBeNull();
    fireEvent.click(users);
    expect(endpoint.closest('[inert]')).toBeNull();
  });

  it('holds a placeholder for missing data or a bad depth sequence, without console errors', async () => {
    const error = rstest.spyOn(console, 'error');
    const skip = [
      { label: 'a', depth: 0 },
      { label: 'b', depth: 2 },
    ];
    const cases = [
      () => renderA2ui(a2ui({ nodes: { '@path': '/hosts' } })),
      () => renderA2ui(a2ui({ nodes: [{ label: 'a', depth: 1 }] })),
      () => renderJsonRender(jsonRender({ nodes: { $state: '/none' } })),
      () => renderJsonRender(jsonRender({ nodes: skip })),
      () => renderOpenUi('root = Tree($hosts)'),
      () => renderOpenUi('root = Tree($hosts)', { hosts: skip }),
    ];
    for (const run of cases) {
      const view = run();
      expect(await findPlaceholder('Tree')).toBeTruthy();
      view.unmount();
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
  it('rejects wrong types, out-of-range values and oversized lists with a placeholder', async () => {
    const error = rstest.spyOn(console, 'error');
    const bad = [
      [{ label: 'a', depth: '0' }],
      [{ label: 'a', depth: 0.5 }],
      [
        { label: 'a', depth: 0 },
        { label: 'b', depth: 1 },
        ...Array.from({ length: 8 }, (_, i) => ({ label: `c${i}`, depth: i + 2 })),
      ],
      [{ depth: 0 }],
      [{ label: 'a', depth: 0, badge: { text: 'x', color: 'purple' } }],
      [{ label: 'a', depth: 0, badge: 'x' }],
      [],
      Array.from({ length: 501 }, () => ({ label: 'a', depth: 0 })),
      'api.example.com',
    ];
    for (const nodes of bad) {
      const view = renderJsonRender(jsonRender({ nodes }));
      expect(await findPlaceholder('Tree')).toBeTruthy();
      view.unmount();
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('renders hostile labels as text and swaps the placeholder once data arrives', async () => {
    const error = rstest.spyOn(console, 'error');
    const hostile = '<img src=x onerror=alert(1)>';
    const view = renderOpenUi('root = Tree($hosts)');
    expect(await findPlaceholder('Tree')).toBeTruthy();
    act(() => {
      view.rerender(
        <OpenUiSurface
          library={createOpenUiLibrary(CATALOG, [])}
          program='root = Tree($hosts)'
          data={{ hosts: [...NODES, { label: hostile, depth: 1 }] }}
          onAction={rstest.fn()}
          onError={rstest.fn()}
        />,
      );
    });
    await expectTree();
    expect(screen.getByText(hostile)).toBeTruthy();
    expect(document.querySelector('img')).toBeNull();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
