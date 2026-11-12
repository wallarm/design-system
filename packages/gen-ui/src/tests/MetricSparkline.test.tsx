import type { SpecStreamLine } from '@json-render/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { MetricComponent } from '../components/Metric';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const POINTS = [
  { x: '2026-11-01T00:00:00Z', y: 14 },
  { x: '2026-11-02T00:00:00Z', y: 11 },
  { x: '2026-11-03T00:00:00Z', y: 18 },
];

const A2UI = createA2uiCatalog([MetricComponent]);
const JSON_RENDER = createJsonRenderCatalog([MetricComponent], []);

const a2ui = (metric: Record<string, unknown>, data?: unknown): readonly A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/stats', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [{ id: 'root', component: 'Metric', ...metric }],
      },
    },
  ] as unknown as readonly A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: { stats: state } }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'Metric', props, children: [] } },
];

const renderBoth = (
  props: Record<string, unknown>,
  a2uiProps: Record<string, unknown>,
  data?: unknown,
) => [
  () =>
    render(
      <A2uiSurfaces
        catalog={A2UI}
        messages={a2ui(a2uiProps, data)}
        actions={[]}
        onAction={rstest.fn()}
      />,
    ),
  () =>
    render(
      <JsonRenderSurface
        catalog={JSON_RENDER}
        spec={specFromLines(jsonRender(props, data))}
        onAction={rstest.fn()}
      />,
    ),
];

const sparklinePath = (container: HTMLElement) => container.querySelector('svg path[stroke]');

describe('MetricSparkline', () => {
  it('draws the sparkline from literal props in both formats', async () => {
    const props = { title: 'Attacks', value: 91, sparkline: POINTS, sparklineColor: 'negative' };
    for (const draw of renderBoth(props, props)) {
      const view = draw();
      expect(await screen.findByText('Attacks')).toBeTruthy();
      expect(screen.getByText('91')).toBeTruthy();
      expect(sparklinePath(view.container)).toBeTruthy();
      view.unmount();
    }
  });

  it('draws bound points in both formats', async () => {
    const data = { attacks: 1240, trend: POINTS };
    const jr = {
      title: 'Attacks',
      value: { $state: '/stats/attacks' },
      sparkline: { $state: '/stats/trend' },
    };
    const a = {
      title: 'Attacks',
      value: { '@path': '/stats/attacks' },
      sparkline: { '@path': '/stats/trend' },
    };
    for (const draw of renderBoth(jr, a, data)) {
      const view = draw();
      expect(await screen.findByText('1,240')).toBeTruthy();
      expect(sparklinePath(view.container)).toBeTruthy();
      view.unmount();
    }
  });

  it('survives points that have not arrived, and no sparkline at all', async () => {
    const jr = { title: 'Pending', value: 3, sparkline: { $state: '/stats/missing' } };
    const a = { title: 'Pending', value: 3, sparkline: { '@path': '/stats/missing' } };
    for (const draw of [
      ...renderBoth(jr, a, {}),
      ...renderBoth({ title: 'Plain', value: 1 }, { title: 'Plain', value: 1 }),
    ]) {
      const view = draw();
      expect(await screen.findByText(/Pending|Plain/)).toBeTruthy();
      expect(sparklinePath(view.container)).toBeNull();
      view.unmount();
    }
  });
});
