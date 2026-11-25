import type { SpecStreamLine } from '@json-render/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { BarChartComponent } from '../components/BarChart';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { findPlaceholder } from './findPlaceholder';

const catalog = [BarChartComponent];
const SERIES = [
  { key: 'blocked', label: 'Blocked', color: 'green' },
  { key: 'monitored', label: 'Monitored', color: 'amber' },
];
// Largest total first, not alphabetical — the chart keeps the order.
const POINTS = [
  { x: 'api.payments.example.com', blocked: 1200, monitored: 40 },
  { x: 'checkout.example.com', blocked: 800, monitored: null },
  { x: 'admin.example.com', blocked: null, monitored: 60 },
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
      components: [{ id: 'root', component: 'BarChart', title: 'Requests per host', ...chart }],
    },
  },
];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: { chart: state } }]),
  { op: 'add', path: '/root', value: 'root' },
  {
    op: 'add',
    path: '/elements/root',
    value: { type: 'BarChart', props: { title: 'Requests per host', ...props }, children: [] },
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
  expect(await screen.findByText('Requests per host')).toBeTruthy();
  expect(screen.getByText('Blocked')).toBeTruthy();
  expect(screen.getByText('2K')).toBeTruthy();
  expect(screen.getByText('100')).toBeTruthy();
};

const LITERAL = { series: SERIES, points: POINTS, format: 'compact' };

describe('BarChart', () => {
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
          format: 'compact',
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
          format: 'compact',
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
      () => renderA2ui(a2ui({ series: SERIES, points: [{ x: 'a' }] })),
      () =>
        renderJsonRender(
          jsonRender({ series: { $state: '/chart/series' }, points: { $state: '/chart/points' } }),
        ),
      () => renderJsonRender(jsonRender({ series: SERIES, points: [{ x: 'a' }] })),
    ];
    // Unbound data doesn't match the schema yet: a placeholder. Partial data renders.
    // Even cases are unbound (a skeleton), odd ones render the chart.
    for (const [i, draw] of cases.entries()) {
      const view = draw();
      if (i % 2 === 0) expect(await findPlaceholder('BarChart')).toBeTruthy();
      else expect(await screen.findByText('Requests per host')).toBeTruthy();
      view.unmount();
    }
  });

  it('shows the empty frame with a message when there are no points', async () => {
    renderA2ui(a2ui({ series: SERIES, points: [] }));
    expect(await screen.findByText('Requests per host')).toBeTruthy();
    expect(screen.getByText('No data')).toBeTruthy();
  });

  it('takes categories in any order without a sort warning', async () => {
    const warn = rstest.spyOn(console, 'warn').mockImplementation(() => undefined);
    renderA2ui(a2ui({ series: SERIES, points: POINTS }));
    expect(await screen.findByText('Requests per host')).toBeTruthy();
    expect(warn.mock.calls.flat().join(' ')).not.toContain('not sorted');
    warn.mockRestore();
  });
});
