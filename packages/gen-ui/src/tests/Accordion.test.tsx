import type { SpecStreamLine } from '@json-render/core';
import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { AccordionComponent } from '../components/Accordion';
import { TextComponent } from '../components/Text';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

afterEach(cleanup);

const CATALOG = [AccordionComponent, TextComponent];
const LABELS = ['SQL injection', 'XSS'];

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/labels', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [
          { id: 'root', component: 'Accordion', children: ['a', 'b'], ...props },
          { id: 'a', component: 'Text', text: 'Blocked 120 requests' },
          { id: 'b', component: 'Text', text: 'Blocked 40 requests' },
        ],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  {
    op: 'add',
    path: '/elements/root',
    value: { type: 'Accordion', props, children: ['a', 'b'] },
  },
  {
    op: 'add',
    path: '/elements/a',
    value: { type: 'Text', props: { text: 'Blocked 120 requests' }, children: [] },
  },
  {
    op: 'add',
    path: '/elements/b',
    value: { type: 'Text', props: { text: 'Blocked 40 requests' }, children: [] },
  },
];

const program = (labels: string, openFirst = 'null') =>
  [
    `root = Accordion(${labels}, null, ${openFirst}, null, [a, b])`,
    'a = Text("Blocked 120 requests")',
    'b = Text("Blocked 40 requests")',
  ].join('\n');

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

const renderOpenUi = (source: string, data?: Record<string, unknown>) =>
  render(
    <OpenUiSurface
      library={createOpenUiLibrary(CATALOG, [])}
      program={source}
      data={data}
      onAction={rstest.fn()}
      onError={rstest.fn()}
    />,
  );

const isOpen = (text: string) => screen.getByText(text).closest('[hidden]') === null;

const expectSections = async ({ firstOpen = false } = {}) => {
  expect(await screen.findByRole('button', { name: 'SQL injection' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'XSS' })).toBeTruthy();
  await waitFor(() => expect(isOpen('Blocked 120 requests')).toBe(firstOpen));
  expect(isOpen('Blocked 40 requests')).toBe(false);
};

describe('Accordion', () => {
  it('renders literal labels from A2UI', async () => {
    renderA2ui(a2ui({ labels: LABELS }));
    await expectSections();
  });

  it('renders labels bound to the A2UI data model', async () => {
    renderA2ui(a2ui({ labels: { '@path': '/labels' } }, LABELS));
    await expectSections();
  });

  it('renders literal labels from json-render, first open', async () => {
    renderJsonRender(jsonRender({ labels: LABELS, openFirst: true }));
    await expectSections({ firstOpen: true });
  });

  it('renders labels bound to json-render state', async () => {
    renderJsonRender(jsonRender({ labels: { $state: '/labels' } }, { labels: LABELS }));
    await expectSections();
  });

  it('renders literal labels from OpenUI, first open', async () => {
    renderOpenUi(program('["SQL injection", "XSS"]', 'true'));
    await expectSections({ firstOpen: true });
  });

  it('renders labels bound to OpenUI data', async () => {
    renderOpenUi(program('$labels'), { labels: LABELS });
    await expectSections();
  });

  it('opens a section when its label is clicked', async () => {
    renderA2ui(a2ui({ labels: LABELS }));
    await userEvent.click(await screen.findByRole('button', { name: 'XSS' }));
    await waitFor(() => expect(isOpen('Blocked 40 requests')).toBe(true));
    expect(isOpen('Blocked 120 requests')).toBe(false);
  });

  it('keeps several sections open with multiple', async () => {
    renderJsonRender(jsonRender({ labels: LABELS, multiple: true, openFirst: true }));
    await userEvent.click(await screen.findByRole('button', { name: 'XSS' }));
    await waitFor(() => expect(isOpen('Blocked 40 requests')).toBe(true));
    expect(isOpen('Blocked 120 requests')).toBe(true);
  });

  it('heads only the children it has labels for', async () => {
    renderA2ui(a2ui({ labels: ['SQL injection', 'XSS', 'RCE'] }));
    expect(await screen.findByRole('button', { name: 'RCE' })).toBeTruthy();
    cleanup();
    renderA2ui(a2ui({ labels: ['SQL injection'] }));
    expect(await screen.findByRole('button', { name: 'SQL injection' })).toBeTruthy();
    expect(screen.queryByText('Blocked 40 requests')).toBeNull();
  });

  it('keeps repeated labels as distinct sections without key warnings', async () => {
    const error = rstest.spyOn(console, 'error');
    renderJsonRender(jsonRender({ labels: ['XSS', 'XSS'], variant: 'section' }));
    const [, second, ...rest] = await screen.findAllByRole('button', { name: 'XSS' });
    expect(rest).toHaveLength(0);
    if (!second) throw new Error('second section missing');
    await userEvent.click(second);
    await waitFor(() => expect(isOpen('Blocked 40 requests')).toBe(true));
    expect(isOpen('Blocked 120 requests')).toBe(false);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('shows the placeholder until labels arrive or when they are invalid', async () => {
    const error = rstest.spyOn(console, 'error');
    renderA2ui(a2ui({ labels: { '@path': '/labels' } }));
    await findPlaceholder('Accordion');
    cleanup();
    renderJsonRender(jsonRender({ labels: { $state: '/labels' } }));
    await findPlaceholder('Accordion');
    cleanup();
    renderOpenUi(program('$labels'));
    await findPlaceholder('Accordion');
    cleanup();
    renderA2ui(a2ui({ labels: [] }));
    await findPlaceholder('Accordion');
    cleanup();
    renderJsonRender(jsonRender({ labels: 'XSS' }));
    await findPlaceholder('Accordion');
    cleanup();
    renderJsonRender(jsonRender({ labels: [1, 2] }));
    await findPlaceholder('Accordion');
    cleanup();
    renderJsonRender(jsonRender({ labels: LABELS, variant: 'huge' }));
    await findPlaceholder('Accordion');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
