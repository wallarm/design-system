/**
 * An answer with nothing to show: the search matched no attacks, so the agent says so with an
 * EmptyState whose button widens the search, instead of drawing an empty table.
 */
import type { GenUiAction } from '../core/define';
import { bind, type LayoutNode, node as n, type Scenario } from './stream';

export const NO_RESULTS_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'search_attacks',
    description: 'Search attacks again with the given filter and period.',
  },
];

const LAYOUT: LayoutNode[][] = [
  [
    n('root', 'Section', { title: 'Attacks from Antarctica', subtitle: 'Last 7 days' }, ['empty']),
    {
      ...n('empty', 'EmptyState', {
        type: 'no-results',
        title: 'No attacks found',
        description: bind('/reason'),
        actionLabel: 'Search the last 30 days',
      }),
      press: { action: 'search_attacks', params: { filter: 'country:AQ', period: '30d' } },
    },
  ],
];

/** Nothing found: an EmptyState with the reason and a button that widens the search. */
export const NO_RESULTS_SCENARIO: Scenario = {
  id: 'no-results',
  prompt: 'Any attacks from Antarctica this week?',
  summary: 'Nothing matched: an empty state with the reason and a wider search',
  surfaceId: 'no_results',
  actions: NO_RESULTS_ACTIONS,
  layout: LAYOUT,
  data: [
    {
      after: 0,
      values: [{ path: '/reason', value: 'No requests came from AQ in the last 7 days.' }],
    },
  ],
};
