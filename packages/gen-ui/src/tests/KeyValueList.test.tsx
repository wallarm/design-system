import type { SpecStreamLine } from '@json-render/core';
import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { KeyValueListComponent } from '../components/KeyValueList';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [KeyValueListComponent];
const FIELDS = [
  { key: 'ip', label: 'Source', type: 'ip' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'country', label: 'Country', type: 'country' },
  { key: 'point', label: 'Point', type: 'parameter' },
  { key: 'rule', label: 'Rule', type: 'code' },
];
const RECORD = {
  ip: '203.0.113.7',
  status: 403,
  country: 'DE',
  point: 'post.json_doc.password',
};

const a2ui = (record: unknown, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/attack', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [
          { id: 'root', component: 'KeyValueList', title: 'Attack', fields: FIELDS, record },
        ],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (record: unknown, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  {
    op: 'add',
    path: '/elements/root',
    value: {
      type: 'KeyValueList',
      props: { title: 'Attack', fields: FIELDS, record },
      children: [],
    },
  },
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

const OPEN_UI_FIELDS = `[${FIELDS.map(f => `{key: "${f.key}", label: "${f.label}", type: "${f.type}"}`).join(', ')}]`;
const OPEN_UI_RECORD =
  '{ip: "203.0.113.7", status: 403, country: "DE", point: "post.json_doc.password"}';
const openUi = (record: string) => `root = KeyValueList("Attack", ${OPEN_UI_FIELDS}, ${record})`;

// Country and ParameterPath repeat their text in a tooltip.
const expectShown = (text: string) => expect(screen.getAllByText(text).length).toBeGreaterThan(0);

const expectRecord = async () => {
  expect(await screen.findByText('Attack')).toBeTruthy();
  expect(screen.getByText('Source')).toBeTruthy();
  expect(screen.getByText('203.0.113.7')).toBeTruthy();
  expect(screen.getByText('403')).toBeTruthy();
  expectShown('Germany');
  expectShown('json_doc');
  expectShown('password');
  // The record has no rule: its line is a dash.
  expect(screen.getByText('—')).toBeTruthy();
};

describe('KeyValueList', () => {
  let error: ReturnType<typeof rstest.spyOn>;
  beforeEach(() => {
    error = rstest.spyOn(console, 'error');
  });
  afterEach(() => {
    cleanup();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('renders a literal record from A2UI', async () => {
    renderA2ui(a2ui(RECORD));
    await expectRecord();
  });

  it('renders a record bound to the A2UI data model', async () => {
    renderA2ui(a2ui({ '@path': '/attack' }, RECORD));
    await expectRecord();
  });

  it('renders a literal record from json-render', async () => {
    renderJsonRender(jsonRender(RECORD));
    await expectRecord();
  });

  it('renders a record bound to json-render state', async () => {
    renderJsonRender(jsonRender({ $state: '/attack' }, { attack: RECORD }));
    await expectRecord();
  });

  it('renders a literal record from OpenUI', async () => {
    renderOpenUi(openUi(OPEN_UI_RECORD));
    await expectRecord();
  });

  it('renders a record bound to OpenUI data', async () => {
    renderOpenUi(openUi('$attack'), { attack: RECORD });
    await expectRecord();
  });

  it('holds a placeholder until the record arrives, in every format', async () => {
    const a = renderA2ui(a2ui({ '@path': '/attack' }));
    expect(await findPlaceholder('KeyValueList')).toBeTruthy();
    a.unmount();
    const j = renderJsonRender(jsonRender({ $state: '/attack' }));
    expect(await findPlaceholder('KeyValueList')).toBeTruthy();
    j.unmount();
    renderOpenUi(openUi('$attack'));
    expect(await findPlaceholder('KeyValueList')).toBeTruthy();
    expect(screen.queryByText('Source')).toBeNull();
  });

  // A2UI and OpenUI reject a literal of the wrong type before render; bound data reaches the View.
  it('shows a placeholder for invalid props', async () => {
    const a = renderA2ui(a2ui({ '@path': '/attack' }, 'not an object'));
    expect(await findPlaceholder('KeyValueList')).toBeTruthy();
    a.unmount();
    const j = renderJsonRender(jsonRender(42));
    expect(await findPlaceholder('KeyValueList')).toBeTruthy();
    j.unmount();
    const k = renderJsonRender(jsonRender({ $state: '/attack' }, { attack: [RECORD] }));
    expect(await findPlaceholder('KeyValueList')).toBeTruthy();
    k.unmount();
    renderOpenUi(openUi('$attack'), { attack: 'not an object' });
    expect(await findPlaceholder('KeyValueList')).toBeTruthy();
    expect(screen.queryByText('Source')).toBeNull();
  });

  it('draws hostile values as plain text or a dash, with repeated keys', async () => {
    const fields = [
      { key: 'ip', label: 'First', type: 'ip' },
      { key: 'ip', label: 'Again', type: 'ip' },
      { key: 'nested', label: 'Nested' },
      { key: 'html', label: 'Html' },
    ];
    const record = { ip: '203.0.113.7', nested: { a: 1 }, html: '<img src=x onerror=alert(1)>' };
    renderJsonRender([
      { op: 'add', path: '/root', value: 'root' },
      {
        op: 'add',
        path: '/elements/root',
        value: { type: 'KeyValueList', props: { fields, record }, children: [] },
      },
    ]);
    expect(await screen.findByText('Again')).toBeTruthy();
    expect(screen.getAllByText('203.0.113.7')).toHaveLength(2);
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(document.querySelector('img')).toBeNull();
  });
});
