import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import {
  ATTACK_INVESTIGATION_ACTIONS,
  ATTACK_INVESTIGATION_SCENARIO,
} from '../fixtures/attackInvestigation';
import { openUiAnswer } from '../fixtures/openui';
import { toStreams } from '../fixtures/stream';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';

// jsdom has none of these; the DS Table measures its container and scroll edges.
const noop = () => undefined;
class NoopObserver {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
  takeRecords() {
    return [];
  }
}
globalThis.ResizeObserver ??= NoopObserver;
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;
Element.prototype.scrollBy ??= noop;
afterEach(cleanup);

const streams = toStreams(ATTACK_INVESTIGATION_SCENARIO);
const actions = ATTACK_INVESTIGATION_ACTIONS;
const a2uiLines = (n = streams.a2ui.length) => streams.a2ui.slice(0, n).map(l => l.line);
const jsonLines = (n = streams.jsonRender.length) =>
  streams.jsonRender.slice(0, n).map(l => l.line);

const SURFACES = {
  A2UI: (n?: number) => (
    <A2uiSurfaces
      catalog={createA2uiCatalog(wallarmComponents)}
      messages={a2uiLines(n)}
      actions={actions}
      onAction={rstest.fn()}
    />
  ),
  'json-render': (n?: number) => (
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(wallarmComponents, actions)}
      spec={specFromLines(jsonLines(n))}
      onAction={rstest.fn()}
    />
  ),
  OpenUI: () => {
    const { program, data } = openUiAnswer(streams.openui);
    return (
      <OpenUiSurface
        library={createOpenUiLibrary(wallarmComponents, actions)}
        program={program}
        data={data}
        onAction={rstest.fn()}
        onError={rstest.fn()}
      />
    );
  },
};

describe('attack investigation: a table whose rows open a detail drawer', () => {
  for (const [format, Surface] of Object.entries(SURFACES)) {
    it(`renders the whole ${format} answer and opens a row's details`, async () => {
      const { container } = render(Surface());
      expect(await screen.findByText('Attacks from 203.0.113.77')).toBeTruthy();
      expect(await screen.findByText('8,940')).toBeTruthy(); // /source/requests
      expect(screen.getByText('Netherlands')).toBeTruthy(); // country value
      expect(container.querySelector('[data-gen-ui-placeholder]')).toBeNull();

      // The first cell of the first request opens its drawer, titled by its path.
      const [firstTime] = await screen.findAllByText(/2026|Nov/, { selector: 'td *' });
      if (!firstTime) throw new Error('no request rows');
      await userEvent.click(firstTime);
      const drawer = await screen.findByRole('dialog', { name: '/oauth/token' });
      expect(within(drawer).getByText('python-requests/2.32')).toBeTruthy(); // no column shows it
      expect(within(drawer).getByText('auth.example.com')).toBeTruthy();

      // The raw request sits behind its own drawer button.
      await userEvent.click(screen.getByRole('button', { name: 'Show the last request' }));
      expect(await screen.findByText(/grant_type=password/)).toBeTruthy();
    });
  }

  it('renders every prefix of the A2UI and json-render streams', () => {
    const error = rstest.spyOn(console, 'error');
    for (let i = 1; i <= streams.a2ui.length; i++) render(SURFACES.A2UI(i)).unmount();
    for (let i = 1; i <= streams.jsonRender.length; i++)
      render(SURFACES['json-render'](i)).unmount();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
