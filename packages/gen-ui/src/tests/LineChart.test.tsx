import type { SpecStreamLine } from '@json-render/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { LineChartComponent } from '../components/LineChart';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const CATALOG = [LineChartComponent];
const SERIES = [
  { key: 'attacks', label: 'Attacks', color: 'red' },
  { key: 'blocked', label: 'Blocked', color: 'green', variant: 'dashed' },
];
const POINTS = [
  { x: '2026-11-05T12:00:00Z', attacks: 120, blocked: 110 },
  { x: '2026-11-05T13:00:00Z', attacks: 340, blocked: null },
];

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/traffic', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [{ id: 'root', component: 'LineChart', ...props }],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'LineChart', props, children: [] } },
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

const expectChart = async () => {
  expect(await screen.findByText('Traffic')).toBeTruthy();
  expect(screen.getByText('Attacks')).toBeTruthy(); // legend, from series
  expect(screen.getByText('Blocked')).toBeTruthy();
};

describe('LineChart', () => {
  it('renders literal props in A2UI', async () => {
    renderA2ui(a2ui({ title: 'Traffic', series: SERIES, points: POINTS }));
    await expectChart();
  });

  it('renders literal props in json-render', async () => {
    renderJsonRender(jsonRender({ title: 'Traffic', series: SERIES, points: POINTS }));
    await expectChart();
  });

  it('renders points bound to the A2UI data model', async () => {
    renderA2ui(
      a2ui(
        {
          title: 'Traffic',
          series: { '@path': '/traffic/series' },
          points: { '@path': '/traffic/points' },
        },
        { series: SERIES, points: POINTS },
      ),
    );
    await expectChart();
  });

  it('renders points bound to json-render state', async () => {
    renderJsonRender(
      jsonRender(
        {
          title: 'Traffic',
          series: { $state: '/traffic/series' },
          points: { $state: '/traffic/points' },
        },
        { traffic: { series: SERIES, points: POINTS } },
      ),
    );
    await expectChart();
  });

  it('holds a placeholder while bound data has not arrived, and No data for no points', async () => {
    const bound = {
      title: 'Traffic',
      series: { '@path': '/traffic/series' },
      points: { '@path': '/traffic/points' },
    };
    const view = renderA2ui(a2ui(bound));
    expect(await screen.findByText('LineChart')).toBeTruthy();
    view.unmount();
    const json = renderJsonRender(
      jsonRender({ title: 'Traffic', series: { $state: '/none' }, points: { $state: '/none' } }),
    );
    expect(await screen.findByText('LineChart')).toBeTruthy();
    json.unmount();
    renderA2ui(a2ui({ title: 'Empty', series: SERIES, points: [] }));
    expect(await screen.findByText('Empty')).toBeTruthy();
  });
});
