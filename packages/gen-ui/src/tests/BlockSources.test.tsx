import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type A2uiMessage, A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { ExpressSurfaces, toExpressLines } from '../a2ui/express';
import { wallarmComponents } from '../components';
import { BLOCK_SOURCES_SCENARIO } from '../fixtures/blockSources';
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
Element.prototype.scrollTo ??= noop;
afterEach(cleanup);

const scenario = BLOCK_SOURCES_SCENARIO;
const streams = toStreams(scenario);
const catalog = createA2uiCatalog(wallarmComponents);
const messages: A2uiMessage[] = streams.a2ui.map(l => l.line);

const surfaces = {
  A2UI: (onAction: () => void) => (
    <A2uiSurfaces
      catalog={catalog}
      messages={messages}
      actions={scenario.actions}
      onAction={onAction}
    />
  ),
  // The agent's part in Express; the app's data stays A2UI messages, sent beside it.
  Express: (onAction: () => void) => (
    <ExpressSurfaces
      catalog={catalog}
      surfaceId={scenario.surfaceId}
      chunks={toExpressLines(catalog, scenario.surfaceId, messages)}
      actions={scenario.actions}
      onAction={onAction}
      onError={rstest.fn()}
    />
  ),
  'json-render': (onAction: () => void) => (
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(wallarmComponents, scenario.actions)}
      spec={specFromLines(streams.jsonRender.map(l => l.line))}
      onAction={onAction}
    />
  ),
  OpenUI: (onAction: () => void) => {
    const { program, data } = openUiAnswer(streams.openui);
    return (
      <OpenUiSurface
        library={createOpenUiLibrary(wallarmComponents, scenario.actions)}
        program={program}
        data={data}
        onAction={onAction}
        onError={rstest.fn()}
      />
    );
  },
};

describe('"Block the sources brute-forcing /oauth/token"', () => {
  for (const [format, surface] of Object.entries(surfaces)) {
    it(`sends the picked rows and the form in one action in ${format}`, async () => {
      const onAction = rstest.fn();
      render(surface(onAction));
      // The first checkbox is the header's select-all.
      const boxes = await screen.findAllByRole('checkbox');
      await userEvent.click(boxes[1] as HTMLElement);
      await userEvent.click(boxes[3] as HTMLElement);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(await screen.findByRole('option', { name: '7 days' }));
      await userEvent.click(screen.getByText('Also block their /24 subnets'));
      await userEvent.type(screen.getByLabelText(/Reason/), ', again');
      await userEvent.click(screen.getByRole('button', { name: 'Block selected' }));
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith('block_ips', {
          ips: ['203.0.113.77', '192.0.2.146'],
          duration: '7d',
          subnet: true,
          notify: true,
          reason: 'Brute force on /oauth/token, again',
        }),
      );
    });

    it(`allows one source from its row menu in ${format}`, async () => {
      const onAction = rstest.fn();
      render(surface(onAction));
      const menus = await screen.findAllByRole('button', { name: 'Row actions' });
      // By keyboard, as the DS menu tests do: the menu takes focus once it has opened.
      (menus[2] as HTMLElement).focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menu'));
      await userEvent.keyboard('{ArrowDown}{Enter}');
      await waitFor(() => expect(onAction).toHaveBeenCalledWith('allow_ip', { ip: '192.0.2.146' }));
    });
  }
});
