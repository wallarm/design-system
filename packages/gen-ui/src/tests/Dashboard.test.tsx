import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import { formatNumber } from '../core/format';
import {
  DASHBOARD_A2UI,
  DASHBOARD_ACTIONS,
  DASHBOARD_JSON_RENDER,
  DASHBOARD_SCENARIO,
} from '../fixtures/dashboard';
import { toStreams } from '../fixtures/stream';

const DASHBOARD_STREAMS = toStreams(DASHBOARD_SCENARIO);

import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const a2uiCatalog = createA2uiCatalog(wallarmComponents);
const jsonRender = createJsonRenderCatalog(wallarmComponents, DASHBOARD_ACTIONS);
const a2uiLines = (n = DASHBOARD_A2UI.length) => DASHBOARD_A2UI.slice(0, n).map(l => l.line);
const jsonLines = (n = DASHBOARD_JSON_RENDER.length) =>
  DASHBOARD_JSON_RENDER.slice(0, n).map(l => l.line);

const A2ui = ({ n }: { n?: number }) => (
  <A2uiSurfaces
    catalog={a2uiCatalog}
    messages={a2uiLines(n)}
    actions={DASHBOARD_ACTIONS}
    onAction={rstest.fn()}
  />
);
const Json = ({ n }: { n?: number }) => (
  <JsonRenderSurface
    catalog={jsonRender}
    spec={specFromLines(jsonLines(n))}
    onAction={rstest.fn()}
  />
);

/** The app's numbers, as the catalog formats them: they only appear once the app sent its data. */
const expectFilled = async () => {
  expect(await screen.findByText('Security dashboard')).toBeTruthy();
  expect(await screen.findByText('13.2M')).toBeTruthy(); // /kpi/requests, compact
  expect(screen.getByText('95.7%')).toBeTruthy(); // /kpi/blockedPercent, percent
  expect(screen.getByText('Top threats')).toBeTruthy();
  expect(screen.getByText('POST /api/v2/auth/login')).toBeTruthy(); // /endpoints
};

describe('dashboard: the agent sends the layout, the app fills the data', () => {
  it('renders the whole A2UI stream', async () => {
    render(<A2ui />);
    await expectFilled();
  });

  it('renders the whole json-render stream', async () => {
    render(<Json />);
    await expectFilled();
  });

  it('renders every prefix of both streams', () => {
    // Boundaries catch a View that throws and render nothing; React still reports it here.
    const error = rstest.spyOn(console, 'error');
    for (let i = 1; i <= DASHBOARD_A2UI.length; i++) render(<A2ui n={i} />).unmount();
    for (let i = 1; i <= DASHBOARD_JSON_RENDER.length; i++) render(<Json n={i} />).unmount();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('shows data the app sends after the surface mounted (json-render state is not read once)', async () => {
    const firstApp = DASHBOARD_JSON_RENDER.findIndex((l, i) => i > 0 && l.origin === 'app');
    const view = render(<Json n={firstApp} />);
    expect(await screen.findByText('Security dashboard')).toBeTruthy();
    expect(screen.queryByText('13.2M')).toBeNull();
    view.rerender(<Json />);
    expect(await screen.findByText('13.2M')).toBeTruthy();
  });

  it('keeps the page current with live app data, in both formats', async () => {
    const live = DASHBOARD_STREAMS.liveStreams;
    if (!live) throw new Error('the dashboard scenario has live data');
    // The first update whose formatted request total differs from the answer's 13.2M.
    const tick = Array.from({ length: 48 }, (_, i) => i + 1).find(
      t => text(live.lines(t).a2ui) !== '13.2M',
    );
    if (!tick) throw new Error('no live update changes the request total');
    const ticks = Array.from({ length: tick }, (_, i) => i + 1);
    const expected = text(live.lines(tick).a2ui);

    const a2ui = render(
      <A2uiSurfaces
        catalog={a2uiCatalog}
        messages={[...a2uiLines(), ...ticks.flatMap(t => live.lines(t).a2ui).map(l => l.line)]}
        actions={DASHBOARD_ACTIONS}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText(expected)).toBeTruthy();
    a2ui.unmount();

    const json = render(<Json n={DASHBOARD_JSON_RENDER.length} />);
    expect(await screen.findByText('13.2M')).toBeTruthy();
    json.rerender(
      <JsonRenderSurface
        catalog={jsonRender}
        spec={specFromLines([
          ...jsonLines(),
          ...ticks.flatMap(t => live.lines(t).jsonRender).map(l => l.line),
        ])}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText(expected)).toBeTruthy();
  });
});

/** The request total of a live update, as the Requests tile prints it. */
const text = (lines: readonly { line: unknown }[]) => {
  const kpi = lines.find(l => JSON.stringify(l.line).includes('"/kpi"'));
  const requests = (kpi?.line as { updateDataModel: { value: { requests: number } } } | undefined)
    ?.updateDataModel.value.requests;
  return requests === undefined ? '' : formatNumber(requests, 'compact');
};
