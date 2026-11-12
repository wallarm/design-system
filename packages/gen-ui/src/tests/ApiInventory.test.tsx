import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import { API_INVENTORY_ACTIONS, API_INVENTORY_SCENARIO } from '../fixtures/apiInventory';
import { toStreams } from '../fixtures/stream';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const streams = toStreams(API_INVENTORY_SCENARIO);
const a2ui = createA2uiCatalog(wallarmComponents);
const jsonRender = createJsonRenderCatalog(wallarmComponents, API_INVENTORY_ACTIONS);
const a2uiLines = (n = streams.a2ui.length) => streams.a2ui.slice(0, n).map(l => l.line);
const jsonLines = (n = streams.jsonRender.length) =>
  streams.jsonRender.slice(0, n).map(l => l.line);

const A2ui = ({ n }: { n?: number }) => (
  <A2uiSurfaces
    catalog={a2ui}
    messages={a2uiLines(n)}
    actions={API_INVENTORY_ACTIONS}
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

/** Texts that only appear once the app sent its data. */
const expectFilled = async () => {
  expect(await screen.findByText('Sensitive data exposure')).toBeTruthy();
  expect(await screen.findByText('1,842')).toBeTruthy(); // /kpi/endpoints
  expect(screen.getAllByText('327')).toHaveLength(2); // /kpi/sensitive and the pie total
  expect(screen.getByText('/api/v1/payments/charge')).toBeTruthy(); // /endpoints path
  expect(screen.getByText('184,220')).toBeTruthy(); // /endpoints hits
  expect(screen.getAllByText('Health records').length).toBeGreaterThan(0); // pie legend + badge
};
const expectNoSkeleton = (container: HTMLElement) =>
  expect(container.querySelector('[data-gen-ui-placeholder]')).toBeNull();

describe('api inventory: the agent sends the layout, the app fills the data', () => {
  it('renders the whole A2UI stream', async () => {
    const { container } = render(<A2ui />);
    await expectFilled();
    expectNoSkeleton(container);
  });

  it('renders the whole json-render stream', async () => {
    const { container } = render(<Json />);
    await expectFilled();
    expectNoSkeleton(container);
  });

  it('renders every prefix of both streams', () => {
    const error = rstest.spyOn(console, 'error');
    for (let i = 1; i <= streams.a2ui.length; i++) render(<A2ui n={i} />).unmount();
    for (let i = 1; i <= streams.jsonRender.length; i++) render(<Json n={i} />).unmount();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
