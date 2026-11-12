import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import { toStreams } from '../fixtures/stream';
import { WEEKLY_REPORT_ACTIONS, WEEKLY_REPORT_SCENARIO } from '../fixtures/weeklyReport';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const STREAMS = toStreams(WEEKLY_REPORT_SCENARIO);
const a2ui = createA2uiCatalog(wallarmComponents);
const jsonRender = createJsonRenderCatalog(wallarmComponents, WEEKLY_REPORT_ACTIONS);

const A2ui = ({ n = STREAMS.a2ui.length }: { n?: number }) => (
  <A2uiSurfaces
    catalog={a2ui}
    messages={STREAMS.a2ui.slice(0, n).map(l => l.line)}
    actions={WEEKLY_REPORT_ACTIONS}
    onAction={rstest.fn()}
  />
);
const Json = ({ n = STREAMS.jsonRender.length }: { n?: number }) => (
  <JsonRenderSurface
    catalog={jsonRender}
    spec={specFromLines(STREAMS.jsonRender.slice(0, n).map(l => l.line))}
    onAction={rstest.fn()}
  />
);

/** The app's figures, as the catalog formats them: they only appear once its data arrived. */
const expectFilled = async (container: HTMLElement) => {
  expect(await screen.findByText('Weekly security report')).toBeTruthy();
  expect(await screen.findByText('92.4M')).toBeTruthy(); // /kpi/requests, compact
  expect(screen.getByText('457K')).toBeTruthy(); // /kpi/attacks, the sum of /daily
  expect(screen.getByText('96.4%')).toBeTruthy(); // /kpi/blockedPercent
  expect(screen.getByText('SQL injection')).toBeTruthy(); // /attackTypes
  expect(screen.getByText('164,520')).toBeTruthy();
  expect(screen.getByText('Recommendations')).toBeTruthy();
  expect(container.querySelector('[data-gen-ui-placeholder]')).toBeNull();
};

describe('weekly report: the agent writes the report, the app fills the figures', () => {
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
    for (let i = 1; i <= STREAMS.a2ui.length; i++) render(<A2ui n={i} />).unmount();
    for (let i = 1; i <= STREAMS.jsonRender.length; i++) render(<Json n={i} />).unmount();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
