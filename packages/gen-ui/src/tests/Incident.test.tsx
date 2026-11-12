import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import { INCIDENT_ACTIONS, INCIDENT_SCENARIO } from '../fixtures/incident';
import { toStreams } from '../fixtures/stream';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const streams = toStreams(INCIDENT_SCENARIO);
const a2ui = createA2uiCatalog(wallarmComponents);
const jsonRender = createJsonRenderCatalog(wallarmComponents, INCIDENT_ACTIONS);

const A2ui = ({ n = streams.a2ui.length }: { n?: number }) => (
  <A2uiSurfaces
    catalog={a2ui}
    messages={streams.a2ui.slice(0, n).map(l => l.line)}
    actions={INCIDENT_ACTIONS}
    onAction={rstest.fn()}
  />
);
const Json = ({ n = streams.jsonRender.length }: { n?: number }) => (
  <JsonRenderSurface
    catalog={jsonRender}
    spec={specFromLines(streams.jsonRender.slice(0, n).map(l => l.line))}
    onAction={rstest.fn()}
  />
);

/** Texts that only appear once the app's data arrived, and no skeleton left. */
const expectFilled = async (container: HTMLElement) => {
  expect(await screen.findByText('48.2K')).toBeTruthy(); // /kpi/attempts, compact
  expect(screen.getByText('1,284')).toBeTruthy(); // /kpi/uniqueIps
  expect(screen.getByText('97.4%')).toBeTruthy(); // /kpi/blockedPercent
  expect(screen.getByText(/6 logins succeeded/)).toBeTruthy(); // /incident/summary
  expect(screen.getByText('198.51.100.23')).toBeTruthy(); // a /requests row only
  expect(screen.getAllByText('203.0.113.77').length).toBeGreaterThan(1); // /sourceIps + /requests
  expect(container.querySelector('[data-gen-ui-placeholder]')).toBeNull();
};

describe('incident: the agent sends the layout, the app fills the data', () => {
  it('renders the whole A2UI stream', async () => {
    const { container } = render(<A2ui />);
    await expectFilled(container);
  });

  it('renders the whole json-render stream', async () => {
    const { container } = render(<Json />);
    await expectFilled(container);
  });

  it('renders every prefix of both streams', () => {
    const error = rstest.spyOn(console, 'error');
    for (let i = 1; i <= streams.a2ui.length; i++) render(<A2ui n={i} />).unmount();
    for (let i = 1; i <= streams.jsonRender.length; i++) render(<Json n={i} />).unmount();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
