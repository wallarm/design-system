import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import { DASHBOARD_A2UI, DASHBOARD_ACTIONS, DASHBOARD_JSON_RENDER } from '../fixtures/dashboard';
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
});
