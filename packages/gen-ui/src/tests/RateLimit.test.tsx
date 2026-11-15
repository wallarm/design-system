import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type A2uiMessage, A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { ExpressSurfaces, toExpressLines } from '../a2ui/express';
import { wallarmComponents } from '../components';
import { openUiAnswer } from '../fixtures/openui';
import { RATE_LIMIT_DRAFT, RATE_LIMIT_SCENARIO } from '../fixtures/rateLimit';
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

const scenario = RATE_LIMIT_SCENARIO;
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

describe('"Rate-limit POST /oauth/token"', () => {
  for (const [format, surface] of Object.entries(surfaces)) {
    it(`sends the tuned rule in one action in ${format}`, async () => {
      const onAction = rstest.fn();
      render(surface(onAction));
      const limit = await screen.findByLabelText(/Requests per source/);
      await userEvent.clear(limit);
      await userEvent.type(limit, '60');
      await userEvent.click(screen.getByRole('radio', { name: '5 min' }));
      await userEvent.click(screen.getByText('Challenge'));
      screen.getByRole('slider').focus();
      await userEvent.keyboard('{ArrowRight}');
      await userEvent.type(screen.getByLabelText('Note'), ' Tuned.');
      await userEvent.click(screen.getByRole('button', { name: 'Create rule' }));
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith('create_rate_limit', {
          ...RATE_LIMIT_DRAFT,
          endpoint: 'POST /oauth/token',
          limit: 60,
          window: '5m',
          reaction: 'challenge',
          burst: 25,
          note: `${RATE_LIMIT_DRAFT.note} Tuned.`,
        }),
      );
    });
  }
});
