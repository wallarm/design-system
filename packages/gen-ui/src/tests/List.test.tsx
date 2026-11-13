import type { SpecStreamLine } from '@json-render/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { ListComponent } from '../components/List';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [ListComponent];
const ITEMS = ['Rotate the API key', 'Block 203.0.113.7'];

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/steps', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [{ id: 'root', component: 'List', ...props }],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'List', props, children: [] } },
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

const expectList = async (tag: 'OL' | 'UL') => {
  const first = await screen.findByText('Rotate the API key');
  expect(screen.getByText('Block 203.0.113.7')).toBeTruthy();
  expect(screen.getByRole('list').tagName).toBe(tag);
  expect(first.tagName).toBe('LI');
};

describe('List', () => {
  it('renders literal items in A2UI, bulleted by default', async () => {
    renderA2ui(a2ui({ items: ITEMS }));
    await expectList('UL');
  });

  it('renders literal items in json-render, numbered when ordered', async () => {
    renderJsonRender(jsonRender({ items: ITEMS, ordered: true }));
    await expectList('OL');
  });

  it('renders literal items in OpenUI', async () => {
    renderOpenUi(`root = List(${JSON.stringify(ITEMS)}, true)`);
    await expectList('OL');
  });

  it('renders items bound to the A2UI data model', async () => {
    renderA2ui(a2ui({ items: { '@path': '/steps' }, ordered: true }, ITEMS));
    await expectList('OL');
  });

  it('renders items bound to json-render state', async () => {
    renderJsonRender(jsonRender({ items: { $state: '/steps' } }, { steps: ITEMS }));
    await expectList('UL');
  });

  it('renders items bound to OpenUI data', async () => {
    renderOpenUi('root = List($steps)', { steps: ITEMS });
    await expectList('UL');
  });

  it('holds a placeholder for missing data or no items, without console errors', async () => {
    const error = rstest.spyOn(console, 'error');
    const cases = [
      () => renderA2ui(a2ui({ items: { '@path': '/steps' } })),
      () => renderA2ui(a2ui({ items: [] })),
      () => renderA2ui(a2ui({ items: { '@path': '/steps' } }, 'Rotate the API key')),
      () => renderJsonRender(jsonRender({ items: [1, 2] })),
      () => renderJsonRender(jsonRender({ items: { $state: '/none' } })),
      () => renderOpenUi('root = List($steps)'),
    ];
    for (const run of cases) {
      const view = run();
      expect(await findPlaceholder('List')).toBeTruthy();
      view.unmount();
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('renders agent markup as plain text', async () => {
    renderJsonRender(jsonRender({ items: ['<img src=x onerror=alert(1)>'] }));
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(document.querySelector('img')).toBeNull();
  });
});
