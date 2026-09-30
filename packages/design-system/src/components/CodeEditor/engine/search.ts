import { createElement, type ReactNode } from 'react';
import { getSearchQuery, gotoLine, search, searchKeymap } from '@codemirror/search';
import { EditorState, type Extension, Facet } from '@codemirror/state';
import { EditorView, keymap, type Panel, type ViewUpdate } from '@codemirror/view';
import type { PortalRegistry } from '../lib/portalRegistry';
import { SearchPanel } from './SearchPanel';
import { countMatches } from './searchMatches';

/**
 * `true` once a search extension is configured. `api.openSearch` checks it so
 * `openSearchPanel` never falls back to CodeMirror's own un-themed panel.
 */
export const searchConfigured = Facet.define<boolean, boolean>({
  combine: values => values.some(Boolean),
});

interface SearchPanelConfig {
  portals: PortalRegistry;
  readOnly: boolean;
  testId: string | undefined;
}

/**
 * CodeMirror keeps an open panel across compartment reconfigures (its
 * constructor stays the same), so the panel reads its config from state
 * instead of closing over the config it was created with.
 */
const searchPanelConfig = Facet.define<SearchPanelConfig, SearchPanelConfig | null>({
  combine: values => values[0] ?? null,
});

const renderPanel = (
  view: EditorView,
  state: EditorState,
  config: SearchPanelConfig,
): ReactNode => {
  const query = getSearchQuery(state);
  return createElement(SearchPanel, {
    view,
    query,
    matchCount: query.valid ? countMatches(state, query) : null,
    readOnly: config.readOnly || state.readOnly,
    testId: config.testId,
  });
};

const needsRender = (update: ViewUpdate): boolean =>
  update.docChanged ||
  update.state.readOnly !== update.startState.readOnly ||
  update.state.facet(searchPanelConfig) !== update.startState.facet(searchPanelConfig) ||
  !getSearchQuery(update.state).eq(getSearchQuery(update.startState));

const createSearchPanel = (view: EditorView): Panel => {
  const dom = document.createElement('div');
  let registered: { id: number; portals: PortalRegistry } | null = null;

  return {
    dom,
    top: true,
    mount() {
      const config = view.state.facet(searchPanelConfig);
      if (!config) return;
      registered = {
        id: config.portals.register(dom, renderPanel(view, view.state, config)),
        portals: config.portals,
      };
    },
    update(update) {
      const config = update.state.facet(searchPanelConfig);
      if (!registered || !config || !needsRender(update)) return;
      registered.portals.update(registered.id, renderPanel(view, update.state, config));
    },
    destroy() {
      registered?.portals.unregister(registered.id);
      registered = null;
    },
  };
};

/**
 * Screen-reader wording (spec §7.16). `replaceAll` from `@codemirror/search` already
 * announces `state.phrase('replaced $ matches', n) + '.'`, so the wording is changed
 * here. A second announce from the panel would stack a second line in `.cm-announced`.
 */
const SEARCH_PHRASES: Record<string, string> = {
  // Count-independent wording: the phrase has no plural form ("Replaced 1 occurrences").
  'replaced $ matches': 'Occurrences replaced: $',
};

/** `Mod-Alt-g` (gotoLine) opens CodeMirror's own unthemed dialog; the DS editor has no go-to-line. */
const dsSearchKeymap = searchKeymap.filter(binding => binding.run !== gotoLine);

/** Neutralises CodeMirror's default panel chrome; the React panel draws its own. */
const searchTheme = EditorView.theme({
  '.cm-panels': {
    backgroundColor: 'transparent',
    color: 'inherit',
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: 'none',
  },
  '.cm-searchMatch': {
    backgroundColor: 'var(--color-syntax-highlight-warning-highlight)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'var(--color-syntax-highlight-selected-highlight)',
  },
});

/** Find / replace panel (spec §7.11): DS components rendered into CodeMirror's top panel via portals. */
export const searchExtension = (config: {
  portals: PortalRegistry;
  readOnly: boolean;
  testId: string | undefined;
}): Extension => [
  search({ top: true, createPanel: createSearchPanel }),
  searchPanelConfig.of({
    portals: config.portals,
    readOnly: config.readOnly,
    testId: config.testId,
  }),
  searchConfigured.of(true),
  keymap.of(dsSearchKeymap),
  EditorState.phrases.of(SEARCH_PHRASES),
  searchTheme,
];
