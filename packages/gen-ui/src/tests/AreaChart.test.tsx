import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { AreaChartComponent } from '../components/AreaChart';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { findPlaceholder } from './findPlaceholder';

const SERIES = [
  { key: 'blocked', label: 'Blocked', color: 'red' },
  { key: 'passed', label: 'Passed', color: 'green' },
];
const POINTS = [
  { x: '2026-11-05T10:00:00Z', blocked: 120, passed: 900 },
  { x: '2026-11-05T11:00:00Z', blocked: null, passed: 870 },
];

const catalog = [AreaChartComponent];

const renderA2ui = (points: unknown, data?: unknown) => {
  const messages: A2uiMessage[] = [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
  ];
  if (data !== undefined) {
    messages.push({
      version: '1.0',
      updateDataModel: { surfaceId: 's', path: '/traffic', value: data },
    });
  }
  messages.push({
    version: '1.0',
    updateComponents: {
      surfaceId: 's',
      components: [
        { id: 'root', component: 'AreaChart', title: 'Traffic', series: SERIES, points },
      ],
    },
  });
  return render(
    <A2uiSurfaces
      catalog={createA2uiCatalog(catalog)}
      messages={messages}
      actions={[]}
      onAction={rstest.fn()}
    />,
  );
};

const renderJsonRender = (points: unknown, state?: unknown, series: unknown = SERIES) =>
  render(
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(catalog, [])}
      spec={specFromLines([
        ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
        { op: 'add', path: '/root', value: 'root' },
        {
          op: 'add',
          path: '/elements/root',
          value: { type: 'AreaChart', props: { title: 'Traffic', series, points }, children: [] },
        },
      ])}
      onAction={rstest.fn()}
    />,
  );

const expectChart = async () => {
  expect(await screen.findByText('Traffic')).toBeTruthy();
  expect(screen.getByText('Blocked')).toBeTruthy();
  expect(screen.getByText('Passed')).toBeTruthy();
};

describe('AreaChart', () => {
  it('renders literal props in A2UI', async () => {
    renderA2ui(POINTS);
    await expectChart();
  });

  it('renders a data-model binding in A2UI', async () => {
    renderA2ui({ '@path': '/traffic' }, POINTS);
    await expectChart();
  });

  it('renders literal props in json-render', async () => {
    renderJsonRender(POINTS);
    await expectChart();
  });

  it('renders a state binding in json-render', async () => {
    renderJsonRender({ $state: '/traffic' }, { traffic: POINTS });
    await expectChart();
  });

  it('holds a placeholder while bound data is missing, and an empty frame for no points', async () => {
    // Until the data arrives the props don't match the schema: GuardedView shows a placeholder.
    const view = renderA2ui({ '@path': '/traffic' });
    // The skeleton already carries the title that has streamed in.
    const skeleton = await findPlaceholder('AreaChart');
    expect(skeleton.textContent).toContain('Traffic');
    view.unmount();
    renderJsonRender({ $state: '/traffic' }, {}).unmount();
    // Points arrived, but there are none: the chart itself says so.
    renderJsonRender([]);
    expect((await screen.findAllByText('No data')).length).toBeGreaterThan(0);
  });
});
