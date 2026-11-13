import type { SpecStreamLine } from '@json-render/core';
import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { TabsComponent } from '../components/Tabs';
import { TextComponent } from '../components/Text';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

// jsdom lacks these; the DS TabsList measures its scroll area.
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
Element.prototype.scrollBy ??= noop;
afterEach(cleanup);

const CATALOG = [TabsComponent, TextComponent];
const LABELS = ['Overview', 'Requests'];
const TEXTS = ['Overview pane', 'Requests pane', 'Extra pane'];

const a2ui = (labels: unknown, childCount = 2, data?: unknown): A2uiMessage[] => {
  const kids = TEXTS.slice(0, childCount).map((text, i) => ({
    id: `t${i}`,
    component: 'Text',
    text,
  }));
  return [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/labels', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [
          { id: 'root', component: 'Tabs', labels, children: kids.map(k => k.id) },
          ...kids,
        ],
      },
    },
  ] as unknown as A2uiMessage[];
};

const jsonRender = (labels: unknown, childCount = 2, state?: unknown): SpecStreamLine[] => {
  const ids = TEXTS.slice(0, childCount).map((_, i) => `t${i}`);
  return [
    ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
    { op: 'add', path: '/root', value: 'root' },
    {
      op: 'add',
      path: '/elements/root',
      value: { type: 'Tabs', props: { labels }, children: ids },
    },
    ...ids.map((id, i) => ({
      op: 'add' as const,
      path: `/elements/${id}`,
      value: { type: 'Text', props: { text: TEXTS[i] }, children: [] },
    })),
  ];
};

const openUi = (labels: string, childCount = 2) => {
  const ids = TEXTS.slice(0, childCount).map((_, i) => `t${i}`);
  return [
    `root = Tabs(${labels}, [${ids.join(', ')}])`,
    ...ids.map((id, i) => `${id} = Text("${TEXTS[i]}")`),
  ].join('\n');
};

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

const visible = (text: string) => screen.getByText(text).closest('[hidden]') === null;

const expectTabs = async () => {
  expect(await screen.findByRole('tab', { name: 'Overview' })).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Requests' })).toBeTruthy();
  expect(await screen.findByText('Overview pane')).toBeTruthy();
  expect(visible('Overview pane')).toBe(true);
  expect(visible('Requests pane')).toBe(false);
  await userEvent.click(screen.getByRole('tab', { name: 'Requests' }));
  await waitFor(() => expect(visible('Requests pane')).toBe(true));
  await waitFor(() => expect(visible('Overview pane')).toBe(false));
};

describe('Tabs', () => {
  it('renders literal labels in A2UI and switches panes', async () => {
    renderA2ui(a2ui(LABELS));
    await expectTabs();
  });

  it('renders labels bound to the A2UI data model', async () => {
    renderA2ui(a2ui({ '@path': '/labels' }, 2, LABELS));
    await expectTabs();
  });

  it('renders literal labels in json-render', async () => {
    renderJsonRender(jsonRender(LABELS));
    await expectTabs();
  });

  it('renders labels bound to json-render state', async () => {
    renderJsonRender(jsonRender({ $state: '/labels' }, 2, { labels: LABELS }));
    await expectTabs();
  });

  it('renders literal labels in OpenUI', async () => {
    renderOpenUi(openUi('["Overview", "Requests"]'));
    await expectTabs();
  });

  it('renders labels bound to OpenUI data', async () => {
    renderOpenUi(openUi('$labels'), { labels: LABELS });
    await expectTabs();
  });

  it('holds a placeholder while labels have not arrived or are invalid', async () => {
    const error = rstest.spyOn(console, 'error');
    for (const labels of [{ '@path': '/labels' }, [], ['Overview', '']]) {
      renderA2ui(a2ui(labels));
      expect(await findPlaceholder('Tabs')).toBeTruthy();
      expect(screen.queryByRole('tab')).toBeNull();
      cleanup();
    }
    // A2UI's own validator drops a literal of the wrong type: nothing renders, nothing throws.
    renderA2ui(a2ui('Overview'));
    await waitFor(() => expect(screen.queryByRole('tab')).toBeNull());
    cleanup();
    for (const labels of [{ $state: '/labels' }, [], [42]]) {
      renderJsonRender(jsonRender(labels));
      expect(await findPlaceholder('Tabs')).toBeTruthy();
      expect(screen.queryByRole('tab')).toBeNull();
      cleanup();
    }
    for (const labels of ['$labels', '[]', '[42]', '[""]']) {
      renderOpenUi(openUi(labels));
      expect(await findPlaceholder('Tabs')).toBeTruthy();
      expect(screen.queryByRole('tab')).toBeNull();
      cleanup();
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('tolerates more labels than children, and drops extra children', async () => {
    const error = rstest.spyOn(console, 'error');
    const warn = rstest.spyOn(console, 'warn');
    renderA2ui(a2ui(['Overview', 'Requests', 'Rules'], 1));
    expect(await screen.findByRole('tab', { name: 'Rules' })).toBeTruthy();
    expect(await screen.findByText('Overview pane')).toBeTruthy();
    cleanup();
    renderJsonRender(jsonRender(['Only'], 3));
    expect(await screen.findByText('Overview pane')).toBeTruthy();
    expect(screen.queryByText('Extra pane')).toBeNull();
    cleanup();
    renderOpenUi(openUi('["Same", "Same"]', 3));
    expect(await screen.findAllByRole('tab', { name: 'Same' })).toHaveLength(2);
    expect(screen.queryByText('Extra pane')).toBeNull();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });
});
