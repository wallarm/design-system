import type { ReactNode } from 'react';
import {
  type EditorState,
  type Extension,
  type Range,
  RangeSet,
  StateField,
} from '@codemirror/state';
import {
  type BlockInfo,
  EditorView,
  GutterMarker,
  gutter,
  gutterLineClass,
  lineNumberMarkers,
  lineNumbers,
} from '@codemirror/view';
import { cn } from '../../../utils/cn';
import type { LineColor, LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../../CodeSnippet/lib/lineStyles';
import type { PortalRegistry } from '../lib/portalRegistry';
import { deletedRowCount, diffChunksChanged, isDiffInsertedLine } from './diff';
import { lineNumberToDocLine } from './positions';

export interface GuttersConfig {
  lines: Record<number, LineConfig>;
  startingLineNumber: number;
  lineNumbers: boolean;
  foldGutter: Extension | null;
  portals: PortalRegistry;
  testId: string | undefined;
  /** Diff mode (`original` set): `+` / `-` prefixes and colour sticks from the merge chunks. */
  diff?: boolean;
}

/** Gutter wrapper classes (`.cm-gutter`), used by tests and the theme below. */
export const STICK_GUTTER_CLASS = 'cm-ds-stick';
export const PREFIX_GUTTER_CLASS = 'cm-ds-prefix';

/** Class-only marker: adds `elementClass` to the gutter cell, renders nothing. */
class ClassMarker extends GutterMarker {
  constructor(readonly elementClass: string) {
    super();
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof ClassMarker && other.elementClass === this.elementClass;
  }
}

// ColorStickColumn: `border-l-2 pl-12` + border colour (transparent for uncoloured lines)
const STICK_BASE_CLASS = 'border-l-2 pl-12';
const transparentStick = new ClassMarker(cn(STICK_BASE_CLASS, 'border-transparent'));
const colorStickMarkers = new Map<LineColor, ClassMarker>();
const getStickMarker = (color: LineColor | undefined): ClassMarker => {
  if (!color) return transparentStick;
  let marker = colorStickMarkers.get(color);
  if (!marker) {
    marker = new ClassMarker(cn(STICK_BASE_CLASS, LINE_COLOR_STYLES[color].border));
    colorStickMarkers.set(color, marker);
  }
  return marker;
};

/**
 * Portal ids by marker host. Module-level (not per marker) because CM keeps the DOM of an
 * `eq` marker but swaps in the new instance, so `destroy` may run on a different instance.
 */
const prefixPortalIds = new WeakMap<Node, number>();

/** PrefixColumn cell: `px-8 text-center` + line text colour; ReactNode content via portals. */
class PrefixMarker extends GutterMarker {
  readonly elementClass: string;

  constructor(
    readonly lineNumber: number,
    readonly prefix: ReactNode,
    readonly color: LineColor | undefined,
    readonly portals: PortalRegistry,
  ) {
    super();
    this.elementClass = cn('px-8 text-center', color ? LINE_COLOR_STYLES[color].text : undefined);
  }

  override eq(other: GutterMarker): boolean {
    return (
      other instanceof PrefixMarker &&
      other.lineNumber === this.lineNumber &&
      other.prefix === this.prefix &&
      other.color === this.color &&
      other.portals === this.portals
    );
  }

  override toDOM(view: EditorView): Node {
    const host = view.dom.ownerDocument.createElement('span');
    const { prefix } = this;
    if (typeof prefix === 'string' || typeof prefix === 'number' || typeof prefix === 'bigint') {
      host.textContent = String(prefix);
    } else if (prefix != null && typeof prefix !== 'boolean') {
      prefixPortalIds.set(host, this.portals.register(host, prefix));
    }
    return host;
  }

  override destroy(dom: Node): void {
    const id = prefixPortalIds.get(dom);
    if (id !== undefined) {
      prefixPortalIds.delete(dom);
      this.portals.unregister(id);
    }
  }
}

/** Prefix cell of a deleted chunk: one `-` per deleted row (the widget is a single gutter block). */
class DeletedRowsMarker extends GutterMarker {
  readonly elementClass = cn('px-8 text-center', LINE_COLOR_STYLES.danger.text);

  constructor(readonly rows: number) {
    super();
  }

  override eq(other: GutterMarker): boolean {
    return other instanceof DeletedRowsMarker && other.rows === this.rows;
  }

  override toDOM(view: EditorView): Node {
    const doc = view.dom.ownerDocument;
    const host = doc.createElement('span');
    for (let row = 0; row < this.rows; row++) {
      const cell = doc.createElement('div');
      cell.textContent = '-';
      host.append(cell);
    }
    return host;
  }
}

const absoluteLineAt = (state: EditorState, block: BlockInfo, startingLineNumber: number): number =>
  state.doc.lineAt(block.from).number + startingLineNumber - 1;

const gutterTheme = EditorView.theme({
  // CodeSnippetLineNumbers: `px-8 text-right text-text-secondary select-none`
  '.cm-lineNumbers': {
    color: 'var(--color-text-secondary)',
    userSelect: 'none',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px',
    minWidth: '0',
    textAlign: 'right',
  },
  // PrefixColumn inherits the root text colour; CM's base gutter colour is grey.
  [`.${PREFIX_GUTTER_CLASS}`]: {
    color: 'var(--color-syntax-no-syntax)',
    userSelect: 'none',
  },
});

interface GutterClassSets {
  /** Line colour background on every gutter cell of a coloured line (`gutterLineClass`). */
  background: RangeSet<GutterMarker>;
  /** Line colour text on line-number cells (`lineNumberMarkers`), as CodeSnippetLineNumbers does. */
  numberText: RangeSet<GutterMarker>;
}

const buildGutterClassSets = (
  state: EditorState,
  lines: Record<number, LineConfig>,
  startingLineNumber: number,
): GutterClassSets => {
  const background: Range<GutterMarker>[] = [];
  const numberText: Range<GutterMarker>[] = [];
  for (const [key, config] of Object.entries(lines)) {
    if (!config.color) continue;
    const line = lineNumberToDocLine(state.doc, Number(key), startingLineNumber);
    if (!line) continue;
    const styles = LINE_COLOR_STYLES[config.color];
    background.push(new ClassMarker(styles.bg).range(line.from));
    numberText.push(new ClassMarker(styles.text).range(line.from));
  }
  return {
    background: RangeSet.of(background, true),
    numberText: RangeSet.of(numberText, true),
  };
};

/**
 * Gutters in CodeSnippet order: colour stick (only if any line has `color`, or diff mode) →
 * line numbers (if `lineNumbers`) → fold gutter (if given) → prefix (only if any line has
 * `prefix`, or diff mode). In diff mode the diff marker wins over the line's own stick/prefix.
 */
export const guttersExtension = (config: GuttersConfig): Extension => {
  const { lines, startingLineNumber, portals } = config;
  const diff = config.diff === true;
  const configs = Object.values(lines);
  const hasColors = configs.some(line => line.color != null);
  const hasPrefixes = configs.some(line => line.prefix != null);

  if (!hasColors && !hasPrefixes && !diff && !config.lineNumbers && !config.foldGutter) {
    return [];
  }

  const extensions: Extension[] = [gutterTheme];

  if (hasColors || diff) {
    const classSets = StateField.define<GutterClassSets>({
      create: state => buildGutterClassSets(state, lines, startingLineNumber),
      update: (value, tr) =>
        tr.docChanged ? buildGutterClassSets(tr.state, lines, startingLineNumber) : value,
      provide: field => [
        gutterLineClass.from(field, sets => sets.background),
        lineNumberMarkers.from(field, sets => sets.numberText),
      ],
    });
    extensions.push(
      classSets,
      gutter({
        class: STICK_GUTTER_CLASS,
        lineMarker: (view, block) =>
          getStickMarker(
            diff && isDiffInsertedLine(view.state, block.from)
              ? 'success'
              : lines[absoluteLineAt(view.state, block, startingLineNumber)]?.color,
          ),
        widgetMarker: (view, _widget, block) =>
          diff && deletedRowCount(view.state, block) > 0 ? getStickMarker('danger') : null,
        lineMarkerChange: diff ? diffChunksChanged : null,
        initialSpacer: () => transparentStick,
      }),
    );
  }

  if (config.lineNumbers) {
    extensions.push(
      lineNumbers({ formatNumber: lineNo => String(lineNo + startingLineNumber - 1) }),
    );
  }

  if (config.foldGutter) {
    extensions.push(config.foldGutter);
  }

  if (hasPrefixes || diff) {
    extensions.push(
      gutter({
        class: PREFIX_GUTTER_CLASS,
        lineMarker: (view, block) => {
          const absolute = absoluteLineAt(view.state, block, startingLineNumber);
          if (diff && isDiffInsertedLine(view.state, block.from)) {
            return new PrefixMarker(absolute, '+', 'success', portals);
          }
          const line = lines[absolute];
          if (line?.prefix == null) return null;
          return new PrefixMarker(absolute, line.prefix, line.color, portals);
        },
        widgetMarker: (view, _widget, block) => {
          if (!diff) return null;
          const rows = deletedRowCount(view.state, block);
          return rows > 0 ? new DeletedRowsMarker(rows) : null;
        },
        lineMarkerChange: diff ? diffChunksChanged : null,
      }),
    );
  }

  return extensions;
};
