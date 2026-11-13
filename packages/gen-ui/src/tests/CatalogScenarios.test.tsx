import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { A2uiSurfaces, createA2uiCatalog } from '../a2ui';
import { wallarmComponents } from '../components';
import { API_STRUCTURE_SCENARIO } from '../fixtures/apiStructure';
import { CONFIG_REVIEW_SCENARIO } from '../fixtures/configReview';
import { NO_RESULTS_SCENARIO } from '../fixtures/noResults';
import { type Scenario, toStreams } from '../fixtures/stream';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

afterEach(cleanup);

const surfaces = (scenario: Scenario, onAction = rstest.fn()) => {
  const streams = toStreams(scenario);
  return {
    A2UI: (n = streams.a2ui.length) => (
      <A2uiSurfaces
        catalog={createA2uiCatalog(wallarmComponents)}
        messages={streams.a2ui.slice(0, n).map(l => l.line)}
        actions={scenario.actions}
        onAction={onAction}
      />
    ),
    'json-render': (n = streams.jsonRender.length) => (
      <JsonRenderSurface
        catalog={createJsonRenderCatalog(wallarmComponents, scenario.actions)}
        spec={specFromLines(streams.jsonRender.slice(0, n).map(l => l.line))}
        onAction={onAction}
      />
    ),
    lengths: { A2UI: streams.a2ui.length, 'json-render': streams.jsonRender.length },
  };
};

const FORMATS = ['A2UI', 'json-render'] as const;
const noSkeleton = (container: HTMLElement) =>
  expect(container.querySelector('[data-gen-ui-placeholder]')).toBeNull();

describe('recorded answers for the newer entries', () => {
  for (const format of FORMATS) {
    it(`config review renders whole in ${format}: progress, steps, rules, dialog, link`, async () => {
      const { container } = render(surfaces(CONFIG_REVIEW_SCENARIO)[format]());
      expect(await screen.findByText('Filtering configuration review')).toBeTruthy();
      const bars = await screen.findAllByRole('progressbar');
      expect(bars.map(b => b.getAttribute('aria-valuenow'))).toEqual(['71', '8420000']);
      expect(screen.getByText(/Switch api\.example\.com/)).toBeTruthy(); // bound list
      // The open section's rule; highlighting splits it into tokens.
      await waitFor(() => expect(container.textContent).toContain('source: 0.0.0.0/0'));
      expect(screen.getByRole('link', { name: 'Filtration modes' })).toBeTruthy();
      await userEvent.click(screen.getByRole('button', { name: 'Why blocking mode' }));
      expect(await screen.findByRole('dialog', { name: 'Monitoring vs blocking' })).toBeTruthy();
      noSkeleton(container);
    });

    it(`api structure renders whole in ${format}: profile and tree`, async () => {
      const { container } = render(surfaces(API_STRUCTURE_SCENARIO)[format]());
      expect(await screen.findByText('POST /internal/auth/token')).toBeTruthy();
      expect(screen.getByText('credentials')).toBeTruthy(); // badge
      expect(screen.getByText('42')).toBeTruthy(); // /host/endpoints
      noSkeleton(container);
    });

    it(`no results renders an empty state whose button widens the search in ${format}`, async () => {
      const onAction = rstest.fn();
      const { container } = render(surfaces(NO_RESULTS_SCENARIO, onAction)[format]());
      expect(await screen.findByText('No attacks found')).toBeTruthy();
      expect(screen.getByText(/No requests came from AQ/)).toBeTruthy();
      await userEvent.click(screen.getByRole('button', { name: 'Search the last 30 days' }));
      expect(onAction).toHaveBeenCalledWith('search_attacks', {
        filter: 'country:AQ',
        period: '30d',
      });
      noSkeleton(container);
    });
  }

  it('renders every prefix of every stream', () => {
    const error = rstest.spyOn(console, 'error');
    for (const scenario of [CONFIG_REVIEW_SCENARIO, API_STRUCTURE_SCENARIO, NO_RESULTS_SCENARIO]) {
      const s = surfaces(scenario);
      for (const format of FORMATS)
        for (let i = 1; i <= s.lengths[format]; i++) render(s[format](i)).unmount();
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
