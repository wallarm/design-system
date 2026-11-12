import type { SpecStreamLine } from '@json-render/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { ColumnChartComponent } from '../components/ColumnChart';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { findPlaceholder } from './findPlaceholder';

const catalog = [ColumnChartComponent];
const SERIES = [
  { key: 'blocked', label: 'Blocked', color: 'green' },
  { key: 'monitored', label: 'Monitored', color: 'amber' },
];
const POINTS = [
  { x: '2026-11-01T00:00:00Z', blocked: 1200, monitored: 40 },
  { x: '2026-11-02T00:00:00Z', blocked: 800, monitored: null },
  { x: '2026-11-03T00:00:00Z', blocked: null, monitored: 60 },
];

const a2ui = (chart: Record<string, unknown>, data?: unknown): A2uiMessage[] => [
  { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
  ...(data === undefined
    ? []
    : [
        {
          version: '1.0' as const,
          updateDataModel: { surfaceId: 's', path: '/chart', value: data },
        },
      ]),
  {
    version: '1.0',
    updateComponents: {
      surfaceId: 's',
      components: [{ id: 'root', component: 'ColumnChart', title: 'Requests per day', ...chart }],
    },
  },
];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: { chart: state } }]),
  { op: 'add', path: '/root', value: 'root' },
  {
    op: 'add',
    path: '/elements/root',
    value: { type: 'ColumnChart', props: { title: 'Requests per day', ...props }, children: [] },
  },
];

const renderA2ui = (messages: A2uiMessage[]) =>
  render(
    <A2uiSurfaces
      catalog={createA2uiCatalog(catalog)}
      messages={messages}
      actions={[]}
      onAction={rstest.fn()}
    />,
  );

const renderJsonRender = (lines: SpecStreamLine[]) =>
  render(
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(catalog, [])}
      spec={specFromLines(lines)}
      onAction={rstest.fn()}
    />,
  );

// The legend carries each series and its total; the plot itself is aria-hidden SVG.
const expectChart = async () => {
  expect(await screen.findByText('Requests per day')).toBeTruthy();
  expect(screen.getByText('Blocked')).toBeTruthy();
  expect(screen.getByText('2K')).toBeTruthy();
  expect(screen.getByText('100')).toBeTruthy();
};

const LITERAL = { series: SERIES, points: POINTS, yFormat: 'compact', xFormat: 'date' };

describe('ColumnChart', () => {
  it('renders literal props in A2UI', async () => {
    renderA2ui(a2ui(LITERAL));
    await expectChart();
  });

  it('renders literal props in json-render', async () => {
    renderJsonRender(jsonRender(LITERAL));
    await expectChart();
  });

  it('renders bound data in A2UI', async () => {
    renderA2ui(
      a2ui(
        {
          yFormat: 'compact',
          series: { '@path': '/chart/series' },
          points: { '@path': '/chart/points' },
        },
        { series: SERIES, points: POINTS },
      ),
    );
    await expectChart();
  });

  it('renders bound data in json-render', async () => {
    renderJsonRender(
      jsonRender(
        {
          yFormat: 'compact',
          series: { $state: '/chart/series' },
          points: { $state: '/chart/points' },
        },
        { series: SERIES, points: POINTS },
      ),
    );
    await expectChart();
  });

  it('survives data that has not arrived', async () => {
    const unbound = { series: { '@path': '/chart/series' }, points: { '@path': '/chart/points' } };
    const cases = [
      () => renderA2ui(a2ui(unbound)),
      () => renderA2ui(a2ui({ series: [], points: [] })),
      () =>
        renderJsonRender(
          jsonRender({ series: { $state: '/chart/series' }, points: { $state: '/chart/points' } }),
        ),
      () => renderJsonRender(jsonRender({ series: SERIES, points: [{ x: 'a' }] })),
    ];
    // Unbound data doesn't match the schema yet: a placeholder. Empty or partial data renders.
    // Even cases are unbound (a skeleton), odd ones render the chart.
    for (const [i, draw] of cases.entries()) {
      const view = draw();
      if (i % 2 === 0) expect(await findPlaceholder('ColumnChart')).toBeTruthy();
      else expect(await screen.findByText('Requests per day')).toBeTruthy();
      view.unmount();
    }
  });

  it('takes category labels in any order without a sort warning', async () => {
    const warn = rstest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const points = ['Mon', 'Tue', 'Wed', 'Thu'].map(x => ({ x, blocked: 1, monitored: 2 }));
    renderA2ui(a2ui({ series: SERIES, points }));
    expect(await screen.findByText('Requests per day')).toBeTruthy();
    expect(warn.mock.calls.flat().join(' ')).not.toContain('not sorted');
    warn.mockRestore();
  });
});
