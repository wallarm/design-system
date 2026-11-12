import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import { formatNumber } from '../core/format';
import { LIVE_MONITOR_ACTIONS, LIVE_MONITOR_SCENARIO } from '../fixtures/liveMonitor';
import { type StreamLine, toStreams } from '../fixtures/stream';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const streams = toStreams(LIVE_MONITOR_SCENARIO);
const a2uiCatalog = createA2uiCatalog(wallarmComponents);
const jsonRenderCatalog = createJsonRenderCatalog(wallarmComponents, LIVE_MONITOR_ACTIONS);

/** Requests / min in an update's /now write, as the tile prints it. */
const requestsIn = (lines: readonly StreamLine<unknown>[]) => {
  for (const { line } of lines) {
    const json = JSON.stringify(line);
    const match = json.match(/"\/(?:state\/)?now"[^}]*"value":\{"requests":(\d+)/);
    if (match?.[1]) return formatNumber(Number(match[1]), 'compact');
  }
  return '';
};

describe('live monitor: the app keeps the page current after the answer', () => {
  const live = streams.liveStreams;
  if (!live) throw new Error('the scenario has live data');
  const first = requestsIn(streams.a2ui);
  // The first update whose formatted value differs from the answer's, so the check can fail.
  const tick =
    Array.from({ length: 60 }, (_, i) => i + 1).find(
      t => requestsIn(live.lines(t).a2ui) !== first,
    ) ?? 0;
  const ticks = Array.from({ length: tick }, (_, i) => i + 1);
  const expected = requestsIn(live.lines(tick).a2ui);

  it('finds an update that changes what the page shows', () => {
    expect(tick).toBeGreaterThan(0);
    expect(expected).not.toBe(first);
  });

  it('applies live A2UI data model updates', async () => {
    render(
      <A2uiSurfaces
        catalog={a2uiCatalog}
        messages={[...streams.a2ui, ...ticks.flatMap(t => live.lines(t).a2ui)].map(l => l.line)}
        actions={LIVE_MONITOR_ACTIONS}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText(expected)).toBeTruthy();
  });

  it('applies live json-render state after the surface mounted', async () => {
    const lines = streams.jsonRender.map(l => l.line);
    const view = render(
      <JsonRenderSurface
        catalog={jsonRenderCatalog}
        spec={specFromLines(lines)}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText(first)).toBeTruthy();
    view.rerender(
      <JsonRenderSurface
        catalog={jsonRenderCatalog}
        spec={specFromLines([
          ...lines,
          ...ticks.flatMap(t => live.lines(t).jsonRender).map(l => l.line),
        ])}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText(expected)).toBeTruthy();
  });

  it('leaves no skeleton once the answer and its data are in', async () => {
    const view = render(
      <A2uiSurfaces
        catalog={a2uiCatalog}
        messages={streams.a2ui.map(l => l.line)}
        actions={LIVE_MONITOR_ACTIONS}
        onAction={rstest.fn()}
      />,
    );
    expect(await screen.findByText('Live traffic')).toBeTruthy();
    await screen.findByText(first);
    expect(view.container.querySelector('[data-gen-ui-placeholder]')).toBeNull();
  });
});
