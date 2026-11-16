import type { SpecStreamLine } from '@json-render/core';
import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { TimelineComponent } from '../components/Timeline';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [TimelineComponent];
const TIME = '2026-03-14T09:26:00Z';
const ITEMS = [
  { title: 'Recon started', time: TIME, badge: { text: 'Low', color: 'blue' } },
  { title: 'SQL injection blocked', description: 'Payload in post.login', badge: { text: 'High' } },
];

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/events', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [{ id: 'root', component: 'Timeline', ...props }],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'Timeline', props, children: [] } },
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

const expectTimeline = async () => {
  expect(await screen.findByText('Recon started')).toBeTruthy();
  expect(screen.getByText('SQL injection blocked')).toBeTruthy();
  expect(screen.getByText('Payload in post.login')).toBeTruthy();
  expect(screen.getByText('Low')).toBeTruthy();
  expect(screen.getByText('High')).toBeTruthy();
  // The time is formatted, not printed raw.
  expect(screen.queryByText(TIME)).toBeNull();
  expect(screen.getAllByRole('listitem')[0]?.textContent).toMatch(/14 Mar/);
};

describe('Timeline', () => {
  const error = rstest.spyOn(console, 'error');
  afterEach(() => {
    expect(error).not.toHaveBeenCalled();
    error.mockClear();
  });

  it('renders literal and bound items in A2UI', async () => {
    const view = renderA2ui(a2ui({ items: ITEMS }));
    await expectTimeline();
    view.unmount();
    renderA2ui(a2ui({ items: { '@path': '/events' } }, ITEMS));
    await expectTimeline();
  });

  it('renders literal and bound items in json-render', async () => {
    const view = renderJsonRender(jsonRender({ items: ITEMS }));
    await expectTimeline();
    view.unmount();
    renderJsonRender(jsonRender({ items: { $state: '/events' } }, { events: ITEMS }));
    await expectTimeline();
  });

  it('renders literal and bound items in OpenUI Lang', async () => {
    const view = renderOpenUi(`root = Timeline(${JSON.stringify(ITEMS)})`);
    await expectTimeline();
    view.unmount();
    renderOpenUi('root = Timeline($events)', { events: ITEMS });
    await expectTimeline();
  });

  it('holds a placeholder for missing data or invalid items, without console errors', async () => {
    const cases = [
      () => renderA2ui(a2ui({ items: { '@path': '/events' } })),
      () => renderA2ui(a2ui({ items: [] })),
      () => renderJsonRender(jsonRender({ items: { $state: '/none' } })),
      () => renderJsonRender(jsonRender({ items: [{ description: 'no title' }] })),
      () => renderJsonRender(jsonRender({ items: 'Recon started' })),
      () =>
        renderJsonRender(
          jsonRender({ items: [{ title: 'x', badge: { text: 'y', color: 'pink' } }] }),
        ),
      () => renderOpenUi('root = Timeline([{"title": 7}])'),
      () => renderOpenUi('root = Timeline($events)'),
    ];
    for (const run of cases) {
      const view = run();
      expect(await findPlaceholder('Timeline')).toBeTruthy();
      view.unmount();
    }
  });
});
