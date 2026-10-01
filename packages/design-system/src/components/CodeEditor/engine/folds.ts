import { createElement } from 'react';
import { foldService } from '@codemirror/language';
import type { EditorState, Extension, Range, SelectionRange, Transaction } from '@codemirror/state';
import { EditorSelection, Facet, Prec, StateEffect, StateField } from '@codemirror/state';
import type { BlockInfo, DecorationSet, ViewUpdate } from '@codemirror/view';
import {
  Decoration,
  EditorView,
  GutterMarker,
  gutter,
  keymap,
  ViewPlugin,
  WidgetType,
} from '@codemirror/view';
import { FoldSummary } from '../../CodeSnippet/internal/FoldSummary';
import { FoldToggle } from '../../CodeSnippet/internal/FoldToggle';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { getFoldSummaryLabel, validateFolds } from '../../CodeSnippet/lib/foldUtils';
import type { PortalRegistry } from '../lib/portalRegistry';
import type { CodeEditorFolds } from '../types';

/** Debounce for re-running function-form `folds` after edits (spec §4). */
export const FOLDS_DEBOUNCE_MS = 150;

interface FoldsConfig {
  folds: CodeEditorFolds | undefined;
  startingLineNumber: number;
  portals: PortalRegistry;
  testId: string | undefined;
}

interface FoldsState {
  /** Last regions received (static prop or function output), before validation. */
  raw: readonly FoldRegion[];
  /** Validated regions for the current document, sorted by startLine. */
  regions: readonly FoldRegion[];
  collapsed: ReadonlySet<string>;
  /** Every id ever seen — `defaultCollapsed` applies only on the first sighting. */
  seen: ReadonlySet<string>;
  decorations: DecorationSet;
}

const foldsConfig = Facet.define<FoldsConfig, FoldsConfig | null>({
  combine: values => values[0] ?? null,
});

/** Replaces the raw regions (function-form re-run). */
const setFoldsEffect = StateEffect.define<readonly FoldRegion[]>();
/** Collapses or expands one region by id. */
const setCollapsedEffect = StateEffect.define<{ id: string; collapsed: boolean }>();

const portalIds = new WeakMap<Node, number>();

const releasePortal = (portals: PortalRegistry, dom: Node): void => {
  const id = portalIds.get(dom);
  if (id === undefined) return;
  portalIds.delete(dom);
  portals.unregister(id);
};

const sameRegion = (a: FoldRegion, b: FoldRegion): boolean =>
  a.id === b.id &&
  a.startLine === b.startLine &&
  a.endLine === b.endLine &&
  a.label === b.label &&
  a.toggleProps === b.toggleProps &&
  a.summaryProps === b.summaryProps;

const regionLineCount = (region: FoldRegion): number => region.endLine - region.startLine + 1;

const regionRange = (
  state: EditorState,
  region: FoldRegion,
  startingLineNumber: number,
): { from: number; to: number } => ({
  from: state.doc.line(region.startLine - startingLineNumber + 1).from,
  to: state.doc.line(region.endLine - startingLineNumber + 1).to,
});

const startingLine = (state: EditorState): number =>
  state.facet(foldsConfig)?.startingLineNumber ?? 1;

const computeRaw = (config: FoldsConfig | null, state: EditorState): readonly FoldRegion[] => {
  const folds = config?.folds;
  if (folds === undefined) return [];
  if (typeof folds === 'function') {
    return folds(state.doc.toString(), { startingLineNumber: config?.startingLineNumber ?? 1 });
  }
  return folds;
};

const resolve = (
  raw: readonly FoldRegion[],
  state: EditorState,
  warn: boolean,
): readonly FoldRegion[] => validateFolds(raw, state.doc.lines, startingLine(state), { warn });

class FoldSummaryWidget extends WidgetType {
  constructor(
    readonly region: FoldRegion,
    readonly portals: PortalRegistry,
    readonly testId: string | undefined,
  ) {
    super();
  }

  eq(other: FoldSummaryWidget): boolean {
    return (
      sameRegion(this.region, other.region) &&
      this.portals === other.portals &&
      this.testId === other.testId
    );
  }

  toDOM(view: EditorView): HTMLElement {
    const host = document.createElement('span');
    host.className = 'cm-ds-fold-summary';
    const { id } = this.region;
    const portalId = this.portals.register(
      host,
      createElement(FoldSummary, {
        fold: this.region,
        lineCount: regionLineCount(this.region),
        onToggle: () => {
          toggleFoldRegion(view, id);
        },
        testId: this.testId === undefined ? undefined : `${this.testId}--fold-summary`,
      }),
    );
    portalIds.set(host, portalId);
    return host;
  }

  destroy(dom: HTMLElement): void {
    releasePortal(this.portals, dom);
  }

  ignoreEvent(): boolean {
    return true;
  }
}

const buildDecorations = (
  state: EditorState,
  regions: readonly FoldRegion[],
  collapsed: ReadonlySet<string>,
): DecorationSet => {
  const config = state.facet(foldsConfig);
  if (!config || collapsed.size === 0) return Decoration.none;
  const ranges: Range<Decoration>[] = [];
  for (const region of regions) {
    if (!collapsed.has(region.id)) continue;
    const { from, to } = regionRange(state, region, config.startingLineNumber);
    ranges.push(
      Decoration.replace({
        widget: new FoldSummaryWidget(region, config.portals, config.testId),
      }).range(from, to),
    );
  }
  return Decoration.set(ranges, true);
};

/**
 * Whether a selection range goes into a region: a cursor or a range head strictly inside it, or a
 * range lying entirely within it (a search match). Select All or a range merely overlapping the
 * region does not count, so it stays collapsed.
 */
const selectionEntersRange = (range: SelectionRange, from: number, to: number): boolean =>
  (range.head > from && range.head < to) || (!range.empty && range.from >= from && range.to <= to);

/**
 * Maps function-form regions through a document change until the debounced re-run delivers a
 * fresh set (no stale line ranges in the meantime). A region outside the old document is kept.
 */
const mapRegions = (
  raw: readonly FoldRegion[],
  tr: Transaction,
  startingLineNumber: number,
): readonly FoldRegion[] => {
  const oldDoc = tr.startState.doc;
  const newDoc = tr.state.doc;
  const offset = startingLineNumber - 1;
  return raw.map(region => {
    const startLine = region.startLine - offset;
    const endLine = region.endLine - offset;
    if (startLine < 1 || endLine > oldDoc.lines || startLine > endLine) return region;
    const from = tr.changes.mapPos(oldDoc.line(startLine).from, 1);
    const to = tr.changes.mapPos(oldDoc.line(endLine).to, -1);
    const nextStart = newDoc.lineAt(Math.min(from, to)).number + offset;
    const nextEnd = newDoc.lineAt(to).number + offset;
    if (nextStart === region.startLine && nextEnd === region.endLine) return region;
    return { ...region, startLine: nextStart, endLine: nextEnd };
  });
};

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
  a.size === b.size && [...a].every(id => b.has(id));

const initialState = (state: EditorState): FoldsState => {
  const raw = computeRaw(state.facet(foldsConfig), state);
  const regions = resolve(raw, state, true);
  const collapsed = new Set(regions.filter(r => r.defaultCollapsed).map(r => r.id));
  return {
    raw,
    regions,
    collapsed,
    seen: new Set(regions.map(r => r.id)),
    decorations: Decoration.none,
  };
};

const updateState = (value: FoldsState, tr: Transaction): FoldsState => {
  const { state } = tr;
  let { raw, regions } = value;
  let validated = false;

  if (tr.startState.facet(foldsConfig) !== state.facet(foldsConfig)) {
    raw = computeRaw(state.facet(foldsConfig), state);
    regions = resolve(raw, state, true);
    validated = true;
  }
  for (const effect of tr.effects) {
    if (effect.is(setFoldsEffect)) {
      raw = effect.value;
      regions = resolve(raw, state, true);
      validated = true;
    }
  }
  const isFunction = typeof state.facet(foldsConfig)?.folds === 'function';
  if (!validated && tr.docChanged) {
    // Function folds: follow the edit until the debounced re-run arrives. Static folds (D6):
    // regions are absolute line numbers — re-apply them to the new document.
    if (isFunction) raw = mapRegions(raw, tr, startingLine(state));
    regions = resolve(raw, state, false);
  }

  const collapsed = new Set(value.collapsed);
  let seen = value.seen;
  if (regions !== value.regions) {
    const nextSeen = new Set(seen);
    for (const region of regions) {
      if (nextSeen.has(region.id)) continue;
      nextSeen.add(region.id);
      if (region.defaultCollapsed) collapsed.add(region.id);
    }
    seen = nextSeen;
  }
  for (const effect of tr.effects) {
    if (!effect.is(setCollapsedEffect)) continue;
    if (effect.value.collapsed) collapsed.add(effect.value.id);
    else collapsed.delete(effect.value.id);
  }

  // Function folds forget a collapsed id only when a fresh fold set lacks it — never on a silent
  // re-resolve after an edit, which could drop a region the next run brings back.
  if (validated || !isFunction) {
    const ids = new Set(regions.map(r => r.id));
    for (const id of [...collapsed]) {
      if (!ids.has(id)) collapsed.delete(id);
    }
  }

  const userEdit = tr.docChanged && (tr.isUserEvent('input') || tr.isUserEvent('delete'));
  if (collapsed.size > 0 && (tr.selection || userEdit)) {
    const start = startingLine(state);
    for (const region of regions) {
      if (!collapsed.has(region.id)) continue;
      const { from, to } = regionRange(state, region, start);
      const selected =
        tr.selection !== undefined &&
        state.selection.ranges.some(range => selectionEntersRange(range, from, to));
      let edited = false;
      if (userEdit) {
        tr.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
          if (fromB <= to && toB >= from) edited = true;
        });
      }
      if (selected || edited) collapsed.delete(region.id);
    }
  }

  const collapsedChanged = !sameSet(collapsed, value.collapsed);
  if (regions === value.regions && !collapsedChanged && !tr.docChanged && seen === value.seen) {
    return value;
  }
  const nextCollapsed = collapsedChanged ? collapsed : value.collapsed;
  return {
    raw,
    regions,
    collapsed: nextCollapsed,
    seen,
    decorations: buildDecorations(state, regions, nextCollapsed),
  };
};

const foldsField = StateField.define<FoldsState>({
  create: state => {
    const value = initialState(state);
    return { ...value, decorations: buildDecorations(state, value.regions, value.collapsed) };
  },
  update: updateState,
  // Provided directly (not as a function) — required for replace decorations that cover line breaks.
  provide: field => EditorView.decorations.from(field, value => value.decorations),
});

const functionFoldsPlugin = ViewPlugin.fromClass(
  class {
    timer: ReturnType<typeof setTimeout> | null = null;

    constructor(readonly view: EditorView) {}

    update(update: ViewUpdate): void {
      if (!update.docChanged) return;
      if (typeof update.state.facet(foldsConfig)?.folds !== 'function') return;
      this.clear();
      this.timer = setTimeout(() => {
        this.timer = null;
        const config = this.view.state.facet(foldsConfig);
        const folds = config?.folds;
        if (typeof folds !== 'function') return;
        const raw = folds(this.view.state.doc.toString(), {
          startingLineNumber: config?.startingLineNumber ?? 1,
        });
        this.view.dispatch({ effects: setFoldsEffect.of(raw) });
      }, FOLDS_DEBOUNCE_MS);
    }

    clear(): void {
      if (this.timer !== null) clearTimeout(this.timer);
      this.timer = null;
    }

    destroy(): void {
      this.clear();
    }
  },
);

const readField = (state: EditorState): FoldsState | undefined => state.field(foldsField, false);

const setCollapsed = (
  view: EditorView,
  targets: readonly FoldRegion[],
  collapse: boolean,
): boolean => {
  const { state } = view;
  if (targets.length === 0) return false;
  const start = startingLine(state);
  const ranges = targets.map(region => regionRange(state, region, start));
  const effects: StateEffect<unknown>[] = targets.map(region =>
    setCollapsedEffect.of({ id: region.id, collapsed: collapse }),
  );
  if (targets.length === 1 && targets[0]) {
    const label = getFoldSummaryLabel(targets[0], regionLineCount(targets[0]));
    effects.push(EditorView.announce.of(`${collapse ? 'Folded' : 'Unfolded'} ${label}`));
  }
  let selection: EditorSelection | undefined;
  if (collapse) {
    // Never leave a cursor hidden inside a collapsed region: move it to the region start.
    let moved = false;
    const next = state.selection.ranges.map(range => {
      const hit = ranges.find(({ from, to }) => selectionEntersRange(range, from, to));
      if (!hit) return range;
      moved = true;
      return EditorSelection.cursor(hit.from);
    });
    if (moved) selection = EditorSelection.create(next, state.selection.mainIndex);
  }
  view.dispatch(selection ? { effects, selection } : { effects });
  return true;
};

export const getCollapsedFoldIds = (state: EditorState): ReadonlySet<string> =>
  readField(state)?.collapsed ?? new Set<string>();

export const getVisibleRowCount = (state: EditorState): number => {
  const value = readField(state);
  if (!value) return state.doc.lines;
  let hidden = 0;
  for (const region of value.regions) {
    if (value.collapsed.has(region.id)) hidden += regionLineCount(region) - 1;
  }
  return state.doc.lines - hidden;
};

/** Document ranges of the collapsed regions (what the fold replace decorations hide). */
export const getCollapsedRanges = (state: EditorState): { from: number; to: number }[] => {
  const value = readField(state);
  if (!value || value.collapsed.size === 0) return [];
  const start = startingLine(state);
  return value.regions
    .filter(region => value.collapsed.has(region.id))
    .map(region => regionRange(state, region, start));
};

export const toggleFoldRegion = (view: EditorView, id: string): boolean => {
  const value = readField(view.state);
  const region = value?.regions.find(r => r.id === id);
  if (!value || !region) return false;
  return setCollapsed(view, [region], !value.collapsed.has(id));
};

export const foldAllRegions = (view: EditorView): boolean => {
  const value = readField(view.state);
  if (!value) return false;
  return setCollapsed(
    view,
    value.regions.filter(r => !value.collapsed.has(r.id)),
    true,
  );
};

export const unfoldAllRegions = (view: EditorView): boolean => {
  const value = readField(view.state);
  if (!value) return false;
  return setCollapsed(
    view,
    value.regions.filter(r => value.collapsed.has(r.id)),
    false,
  );
};

const regionAtCursor = (state: EditorState): FoldRegion | undefined => {
  const value = readField(state);
  if (!value) return undefined;
  const line = state.doc.lineAt(state.selection.main.head).number + startingLine(state) - 1;
  return value.regions.find(r => r.startLine <= line && r.endLine >= line);
};

const foldRegionAtCursor = (view: EditorView): boolean => {
  const region = regionAtCursor(view.state);
  if (!region || getCollapsedFoldIds(view.state).has(region.id)) return false;
  return setCollapsed(view, [region], true);
};

const unfoldRegionAtCursor = (view: EditorView): boolean => {
  const region = regionAtCursor(view.state);
  if (!region || !getCollapsedFoldIds(view.state).has(region.id)) return false;
  return setCollapsed(view, [region], false);
};

// Same keys as CM's foldKeymap, bound to our field (CM's foldKeymap is NOT used — it would
// create a second, CM-owned fold state).
const foldsKeymap = Prec.high(
  keymap.of([
    { key: 'Ctrl-Shift-[', mac: 'Cmd-Alt-[', run: foldRegionAtCursor },
    { key: 'Ctrl-Shift-]', mac: 'Cmd-Alt-]', run: unfoldRegionAtCursor },
    { key: 'Ctrl-Alt-[', run: foldAllRegions },
    { key: 'Ctrl-Alt-]', run: unfoldAllRegions },
  ]),
);

const regionsFoldService = foldService.of((state, lineStart) => {
  const value = readField(state);
  if (!value) return null;
  const start = startingLine(state);
  const line = state.doc.lineAt(lineStart).number + start - 1;
  const region = value.regions.find(r => r.startLine === line);
  return region ? regionRange(state, region, start) : null;
});

interface ToggleHost {
  view: EditorView;
  regionId: string;
  portalId: number;
  portals: PortalRegistry;
  testId: string | undefined;
}

/** Live fold-toggle hosts per view, re-rendered in place when the fold field changes. */
const toggleHosts = new WeakMap<EditorView, Set<ToggleHost>>();
const toggleHostByDom = new WeakMap<Node, ToggleHost>();

/** The FoldToggle for `regionId` from the current field value (`null` if the region is gone). */
const renderToggle = (
  view: EditorView,
  regionId: string,
  testId: string | undefined,
): ReturnType<typeof createElement> | null => {
  const value = readField(view.state);
  const region = value?.regions.find(r => r.id === regionId);
  if (!value || !region) return null;
  return createElement(FoldToggle, {
    fold: region,
    isCollapsed: value.collapsed.has(regionId),
    onToggle: () => {
      toggleFoldRegion(view, regionId);
    },
    testId: testId === undefined ? undefined : `${testId}--fold-toggle`,
  });
};

/**
 * Identity is the region id + start line + stable config — NOT the collapsed state or
 * the region's props. Toggling therefore keeps the same host and <button> (keyboard
 * focus survives); `foldToggleUpdater` re-renders the portal node in place instead.
 */
class FoldToggleMarker extends GutterMarker {
  constructor(
    readonly region: FoldRegion,
    readonly portals: PortalRegistry,
    readonly testId: string | undefined,
  ) {
    super();
  }

  eq(other: GutterMarker): boolean {
    return (
      other instanceof FoldToggleMarker &&
      this.region.id === other.region.id &&
      this.region.startLine === other.region.startLine &&
      this.portals === other.portals &&
      this.testId === other.testId
    );
  }

  toDOM(view: EditorView): Node {
    const host = document.createElement('span');
    host.className = 'cm-ds-fold-toggle';
    const { id } = this.region;
    const portalId = this.portals.register(host, renderToggle(view, id, this.testId));
    portalIds.set(host, portalId);
    const entry: ToggleHost = {
      view,
      regionId: id,
      portalId,
      portals: this.portals,
      testId: this.testId,
    };
    toggleHostByDom.set(host, entry);
    let hosts = toggleHosts.get(view);
    if (!hosts) {
      hosts = new Set();
      toggleHosts.set(view, hosts);
    }
    hosts.add(entry);
    return host;
  }

  destroy(dom: Node): void {
    const entry = toggleHostByDom.get(dom);
    if (entry) {
      toggleHostByDom.delete(dom);
      toggleHosts.get(entry.view)?.delete(entry);
    }
    releasePortal(this.portals, dom);
  }
}

/** Re-renders live fold toggles in place (collapsed state, label, toggleProps) on field changes. */
const foldToggleUpdater = ViewPlugin.define(view => ({
  update(update: ViewUpdate) {
    if (readField(update.startState) === readField(update.state)) return;
    for (const entry of toggleHosts.get(view) ?? []) {
      const node = renderToggle(view, entry.regionId, entry.testId);
      if (node) entry.portals.update(entry.portalId, node);
    }
  },
}));

class FoldSpacerMarker extends GutterMarker {
  eq(other: GutterMarker): boolean {
    return other instanceof FoldSpacerMarker;
  }

  toDOM(): Node {
    const spacer = document.createElement('span');
    spacer.className = 'cm-ds-fold-spacer';
    return spacer;
  }
}

const foldSpacer = new FoldSpacerMarker();

const foldGutterTheme = EditorView.theme({
  '.cm-ds-fold-gutter .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  '.cm-ds-fold-spacer, .cm-ds-fold-toggle': {
    display: 'flex',
    width: '16px',
    height: '16px',
  },
});

const foldGutter: Extension = [
  gutter({
    class: 'cm-ds-fold-gutter',
    renderEmptyElements: true,
    lineMarker: (view: EditorView, line: BlockInfo): GutterMarker | null => {
      const { state } = view;
      const value = readField(state);
      const config = state.facet(foldsConfig);
      if (!value || !config) return null;
      const lineNumber = state.doc.lineAt(line.from).number + config.startingLineNumber - 1;
      const region = value.regions.find(r => r.startLine === lineNumber);
      if (!region) return null;
      return new FoldToggleMarker(region, config.portals, config.testId);
    },
    lineMarkerChange: update => readField(update.startState) !== readField(update.state),
    initialSpacer: () => foldSpacer,
  }),
  foldToggleUpdater,
  foldGutterTheme,
];

export const foldsExtension = (config: {
  folds: CodeEditorFolds | undefined;
  startingLineNumber: number;
  portals: PortalRegistry;
  testId: string | undefined;
}): { extension: Extension; gutter: Extension | null } => ({
  extension: [
    foldsConfig.of({ ...config }),
    foldsField,
    functionFoldsPlugin,
    foldsKeymap,
    regionsFoldService,
  ],
  gutter:
    config.folds === undefined || (Array.isArray(config.folds) && config.folds.length === 0)
      ? null
      : foldGutter,
});
