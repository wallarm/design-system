import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { TableComponent } from '../components/Table';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const COLUMNS = [
  { key: 'ip', header: 'Source', type: 'ip' },
  { key: 'method', header: 'Method', type: 'method' },
  { key: 'path', header: 'Path', type: 'code' },
  { key: 'status', header: 'Status', type: 'status' },
  { key: 'hits', header: 'Hits', type: 'number', format: 'number' },
  { key: 'attack', header: 'Attack', type: 'badge' },
];
const ROWS = [
  {
    ip: '203.0.113.7',
    method: 'POST',
    path: '/api/v1/auth/login',
    status: 403,
    hits: 4120,
    attack: 'sqli',
  },
  {
    ip: '198.51.100.40',
    method: 'GET',
    path: '/api/v1/users',
    status: 200,
    hits: 18,
    attack: 'xss',
  },
];

// jsdom has none of these; the DS Table measures its container and scroll edges.
const noop = () => undefined;
class NoopObserver {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
  takeRecords() {
    return [];
  }
}
globalThis.ResizeObserver ??= NoopObserver;
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;
Element.prototype.scrollBy ??= noop;
afterEach(cleanup);

const catalog = [TableComponent];
const SURFACE = 'table';

const a2ui = (table: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: SURFACE, catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: SURFACE, path: '/rows', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: SURFACE,
        components: [
          { id: 'root', component: 'Table', title: 'Top sources', rowKey: 'ip', ...table },
        ],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown) =>
  specFromLines([
    ...(state === undefined
      ? []
      : [{ op: 'add' as const, path: '/state', value: { rows: state } }]),
    { op: 'add', path: '/root', value: 'root' },
    {
      op: 'add',
      path: '/elements/root',
      value: {
        type: 'Table',
        props: { title: 'Top sources', rowKey: 'ip', ...props },
        children: [],
      },
    },
  ]);

const renderA2ui = (messages: A2uiMessage[]) =>
  render(
    <A2uiSurfaces
      catalog={createA2uiCatalog(catalog)}
      messages={messages}
      actions={[]}
      onAction={rstest.fn()}
    />,
  );

const renderJsonRender = (spec: ReturnType<typeof jsonRender>) =>
  render(
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(catalog, [])}
      spec={spec}
      onAction={rstest.fn()}
    />,
  );

const expectRows = async () => {
  expect(await screen.findByText('203.0.113.7')).toBeTruthy();
  expect(screen.getByText('Top sources')).toBeTruthy();
  expect(screen.getByText('POST')).toBeTruthy();
  expect(screen.getByText('/api/v1/auth/login')).toBeTruthy();
  expect(screen.getByText('403')).toBeTruthy();
  expect(screen.getByText('4,120')).toBeTruthy();
  expect(screen.getByText('sqli')).toBeTruthy();
};

describe('Table', () => {
  it('renders literal rows from A2UI', async () => {
    renderA2ui(a2ui({ columns: COLUMNS, rows: ROWS }));
    await expectRows();
  });

  it('renders rows bound to the A2UI data model', async () => {
    renderA2ui(a2ui({ columns: COLUMNS, rows: { '@path': '/rows' } }, ROWS));
    await expectRows();
  });

  it('renders literal rows from json-render', async () => {
    renderJsonRender(jsonRender({ columns: COLUMNS, rows: ROWS }));
    await expectRows();
  });

  it('renders rows bound to json-render state', async () => {
    renderJsonRender(jsonRender({ columns: COLUMNS, rows: { $state: '/rows' } }, ROWS));
    await expectRows();
  });

  it('survives rows and columns that have not arrived', async () => {
    renderA2ui(a2ui({ columns: COLUMNS, rows: { '@path': '/rows' } })).unmount();
    renderJsonRender(jsonRender({ columns: COLUMNS, rows: { $state: '/rows' } })).unmount();
    renderJsonRender(jsonRender({ columns: [{ header: 'No key yet' }] })).unmount();
    renderA2ui(a2ui({ columns: COLUMNS, rows: [{ ip: null, hits: { nested: 1 } }] }));
    expect(await screen.findByText('Top sources')).toBeTruthy();
  });

  it('keeps rows whose rowKey repeats or is missing', async () => {
    const error = rstest.spyOn(console, 'error');
    renderA2ui(
      a2ui({ columns: COLUMNS, rows: [ROWS[0], ROWS[0], { method: 'GET' }, { method: 'PUT' }] }),
    );
    expect(await screen.findAllByText('203.0.113.7')).toHaveLength(2);
    expect(screen.getByText('PUT')).toBeTruthy();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
