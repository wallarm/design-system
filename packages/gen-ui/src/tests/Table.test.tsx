import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { TableComponent } from '../components/Table';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

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
    country: 'DE',
    point: 'post.json_doc.password',
    rule: 'rule-4417',
  },
  {
    ip: '198.51.100.40',
    method: 'GET',
    path: '/api/v1/users',
    status: 200,
    hits: 18,
    attack: 'xss',
    country: 'FR',
    point: 'get.query.q',
    rule: 'rule-0042',
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

// rule is a row field no column shows; country and point have no column either.
const DETAIL = {
  fields: [
    { key: 'rule', label: 'Rule', type: 'code' },
    { key: 'country', label: 'Country', type: 'country' },
    { key: 'point', label: 'Point', type: 'parameter' },
    { key: 'hits', label: 'Total hits', type: 'number', format: 'number' },
  ],
};

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

const renderOpenUi = (program: string, data?: Record<string, unknown>) =>
  render(
    <OpenUiSurface
      library={createOpenUiLibrary(catalog, [])}
      program={program}
      data={data}
      onAction={rstest.fn()}
      onError={rstest.fn()}
    />,
  );

// OpenUI Lang is positional in prop order: title, rowKey, columns, rows, detail. JSON is valid Lang.
const openUi = (rows: string, detail?: string) =>
  `root = Table("Top sources", "ip", ${JSON.stringify(COLUMNS)}, ${rows}${detail ? `, ${detail}` : ''})`;

const drawer = () => screen.queryByRole('dialog');
const openDrawer = () => {
  const dialog = drawer();
  if (!dialog) throw new Error('no drawer');
  return within(dialog);
};
// Country and ParameterPath repeat their text in a tooltip.
const expectShown = (text: string) =>
  expect(openDrawer().getAllByText(text).length).toBeGreaterThan(0);

/** Opens the first row, switches to the second, closes it from its master cell. */
const expectDetail = async () => {
  fireEvent.click(await screen.findByText('203.0.113.7'));
  await waitFor(() => expect(drawer()).not.toBeNull());
  const first = openDrawer();
  expect(first.getByText('203.0.113.7')).toBeTruthy(); // title: the first column
  expect(first.getByText('rule-4417')).toBeTruthy();
  expect(first.getByText('Total hits')).toBeTruthy();
  expect(first.getByText('4,120')).toBeTruthy();
  expectShown('Germany');
  expectShown('json_doc');
  expectShown('password');

  fireEvent.click(screen.getByText('198.51.100.40'));
  await waitFor(() => expect(openDrawer().queryByText('rule-0042')).not.toBeNull());
  expect(openDrawer().queryByText('rule-4417')).toBeNull();
  expectShown('France');

  fireEvent.click(screen.getAllByText('198.51.100.40')[0] ?? document.body);
  await waitFor(() => expect(drawer()).toBeNull());
};

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
  let error: ReturnType<typeof rstest.spyOn>;
  beforeEach(() => {
    error = rstest.spyOn(console, 'error');
  });
  afterEach(() => {
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

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
    renderA2ui(
      a2ui({ columns: COLUMNS, rows: [ROWS[0], ROWS[0], { method: 'GET' }, { method: 'PUT' }] }),
    );
    expect(await screen.findAllByText('203.0.113.7')).toHaveLength(2);
    expect(screen.getByText('PUT')).toBeTruthy();
  });

  it('renders literal rows from OpenUI', async () => {
    renderOpenUi(openUi(JSON.stringify(ROWS)));
    await expectRows();
  });

  it('renders rows bound to OpenUI data', async () => {
    renderOpenUi(openUi('$rows'), { rows: ROWS });
    await expectRows();
  });

  it('opens a row in a drawer from A2UI', async () => {
    renderA2ui(a2ui({ columns: COLUMNS, rows: ROWS, detail: DETAIL }));
    await expectDetail();
  });

  it('opens a bound row in a drawer from A2UI', async () => {
    renderA2ui(a2ui({ columns: COLUMNS, rows: { '@path': '/rows' }, detail: DETAIL }, ROWS));
    await expectDetail();
  });

  it('opens a row in a drawer from json-render', async () => {
    renderJsonRender(jsonRender({ columns: COLUMNS, rows: ROWS, detail: DETAIL }));
    await expectDetail();
  });

  it('opens a bound row in a drawer from json-render', async () => {
    renderJsonRender(
      jsonRender({ columns: COLUMNS, rows: { $state: '/rows' }, detail: DETAIL }, ROWS),
    );
    await expectDetail();
  });

  it('opens a row in a drawer from OpenUI', async () => {
    renderOpenUi(openUi(JSON.stringify(ROWS), JSON.stringify(DETAIL)));
    await expectDetail();
  });

  it('opens a bound row in a drawer from OpenUI', async () => {
    renderOpenUi(openUi('$rows', JSON.stringify(DETAIL)), { rows: ROWS });
    await expectDetail();
  });

  it('titles the drawer with titleKey', async () => {
    renderA2ui(a2ui({ columns: COLUMNS, rows: ROWS, detail: { ...DETAIL, titleKey: 'path' } }));
    fireEvent.click(await screen.findByText('203.0.113.7'));
    await waitFor(() => expect(drawer()).not.toBeNull());
    expect(openDrawer().getByText('/api/v1/auth/login')).toBeTruthy();
  });

  it('closes from its close button, then reopens with one click', async () => {
    renderA2ui(a2ui({ columns: COLUMNS, rows: ROWS, detail: DETAIL }));
    fireEvent.click(await screen.findByText('203.0.113.7'));
    // The drawer is named by its title.
    expect(await screen.findByRole('dialog', { name: '203.0.113.7' })).toBeTruthy();
    fireEvent.click(openDrawer().getByRole('button', { name: 'Close drawer' }));
    await waitFor(() => expect(drawer()).toBeNull());

    // Closing from the drawer clears the open row: the same cell opens it again, not a no-op toggle.
    fireEvent.click(screen.getByText('203.0.113.7'));
    await waitFor(() => expect(drawer()).not.toBeNull());
  });

  it('survives hostile detail fields in every format', async () => {
    // Repeated keys, a missing field, a non-scalar value, an unknown and a lowercase country,
    // a parameter with empty parts, and a titleKey whose value is not a scalar.
    const rows = [{ ...ROWS[0], nested: { a: 1 }, country: 'zz', point: 'a..a' }];
    const detail = {
      titleKey: 'nested',
      fields: [
        { key: 'rule', label: 'Rule' },
        { key: 'rule', label: 'Rule again' },
        { key: 'missing', label: 'Missing' },
        { key: 'nested', label: 'Nested' },
        { key: 'country', label: 'Country', type: 'country' },
        { key: 'point', label: 'Point', type: 'parameter' },
        { key: '__proto__', label: 'Proto' },
      ],
    };
    const check = async () => {
      fireEvent.click(await screen.findByText('203.0.113.7'));
      await waitFor(() => expect(drawer()).not.toBeNull());
      const d = openDrawer();
      expect(d.getByText('Top sources')).toBeTruthy(); // title falls back to the table title
      expect(d.getAllByText('rule-4417')).toHaveLength(2);
      expect(d.getAllByText('—')).toHaveLength(3); // missing, nested, __proto__
      expect(d.getByText('ZZ')).toBeTruthy(); // unknown code prints itself, no flag
    };
    const a = renderA2ui(a2ui({ columns: COLUMNS, rows, detail }));
    await check();
    a.unmount();
    const j = renderJsonRender(jsonRender({ columns: COLUMNS, rows, detail }));
    await check();
    j.unmount();
    renderOpenUi(openUi(JSON.stringify(rows), JSON.stringify(detail)));
    await check();
  });

  it('opens no drawer without detail', async () => {
    renderA2ui(a2ui({ columns: COLUMNS, rows: ROWS }));
    fireEvent.click(await screen.findByText('203.0.113.7'));
    expect(screen.queryByText('Open details')).toBeNull();
    expect(drawer()).toBeNull();
  });

  it('does not render a detail with no fields', async () => {
    const broken = { titleKey: 'ip' };
    // A2UI's own validator rejects a malformed object prop: the update never renders a table.
    const a = renderA2ui(a2ui({ columns: COLUMNS, rows: ROWS, detail: broken }));
    await waitFor(() => expect(screen.queryByText('203.0.113.7')).toBeNull());
    a.unmount();
    const j = renderJsonRender(jsonRender({ columns: COLUMNS, rows: ROWS, detail: broken }));
    expect(await findPlaceholder('Table')).toBeTruthy();
    j.unmount();
    // OpenUI drops an optional prop that fails its schema: the table renders, with no drawer.
    renderOpenUi(openUi(JSON.stringify(ROWS), JSON.stringify(broken)));
    fireEvent.click(await screen.findByText('203.0.113.7'));
    expect(drawer()).toBeNull();
  });

  it('holds a placeholder until OpenUI rows arrive', async () => {
    renderOpenUi(openUi('$rows', JSON.stringify(DETAIL)));
    expect(await findPlaceholder('Table')).toBeTruthy();
  });
});
