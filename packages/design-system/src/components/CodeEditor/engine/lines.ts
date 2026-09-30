import type { CSSProperties } from 'react';
import {
  type EditorState,
  type Extension,
  Facet,
  Prec,
  type Range,
  StateField,
} from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';
import { cn } from '../../../utils/cn';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../../CodeSnippet/lib/lineStyles';
import { getLineTextStyles } from '../../CodeSnippet/lib/lineUtils';
import { lineNumberToDocLine } from './positions';

export interface LinesConfig {
  lines: Record<number, LineConfig>;
  startingLineNumber: number;
}

const DEFAULT_CONFIG: LinesConfig = { lines: {}, startingLineNumber: 1 };

/** CSS properties React renders without a `px` suffix (react-dom `isUnitlessNumber`). */
const UNITLESS_PROPERTIES: ReadonlySet<string> = new Set([
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
]);

const VENDOR_PREFIX = /^(Webkit|Moz|ms|O)(?=[A-Z])/;

/** `WebkitLineClamp` → `lineClamp`, so vendor-prefixed unitless properties stay unitless. */
const isUnitless = (property: string): boolean => {
  const unprefixed = property.replace(VENDOR_PREFIX, '');
  const normalized =
    unprefixed === property ? property : unprefixed.charAt(0).toLowerCase() + unprefixed.slice(1);
  return UNITLESS_PROPERTIES.has(normalized);
};

const toKebabCase = (property: string): string => {
  if (property.startsWith('--')) return property;
  const kebab = property.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
  // `msTransition` → `-ms-transition` (React convention for the lowercase ms prefix)
  return kebab.startsWith('ms-') ? `-${kebab}` : kebab;
};

/**
 * Serialize React `CSSProperties` into an inline style string, following
 * react-dom's rules: camelCase → kebab-case, custom properties kept as-is,
 * numbers get `px` unless the property is unitless (or the value is 0),
 * `null` / `undefined` / booleans / empty strings are skipped.
 */
export const cssPropertiesToString = (style: CSSProperties | undefined): string => {
  if (!style) return '';
  const declarations: string[] = [];
  for (const [property, rawValue] of Object.entries(style)) {
    const value: unknown = rawValue;
    if (value == null || typeof value === 'boolean' || value === '') continue;
    const isCustom = property.startsWith('--');
    let serialized: string;
    if (typeof value === 'number') {
      serialized = value === 0 || isCustom || isUnitless(property) ? String(value) : `${value}px`;
    } else {
      serialized = String(value).trim();
    }
    declarations.push(`${toKebabCase(property)}: ${serialized}`);
  }
  return declarations.join('; ');
};

const linesConfigFacet = Facet.define<LinesConfig, LinesConfig>({
  combine: values => values[values.length - 1] ?? DEFAULT_CONFIG,
});

const buildLineDecorations = (state: EditorState): DecorationSet => {
  const { lines, startingLineNumber } = state.facet(linesConfigFacet);
  const decorations: Range<Decoration>[] = [];

  for (const [key, config] of Object.entries(lines)) {
    const line = lineNumberToDocLine(state.doc, Number(key), startingLineNumber);
    if (!line) continue;

    const { colorClass, textStyleClass, className, style } = getLineTextStyles(config);
    const lineClass = cn(
      config.color ? LINE_COLOR_STYLES[config.color].bg : undefined,
      colorClass,
      textStyleClass,
      className,
    );
    const styleString = cssPropertiesToString(style);
    if (lineClass || styleString) {
      decorations.push(
        Decoration.line({
          ...(lineClass ? { class: lineClass } : {}),
          ...(styleString ? { attributes: { style: styleString } } : {}),
        }).range(line.from),
      );
    }

    // Whole-line text colour must beat syntax-token colours (CodeToken precedence:
    // range colour > line colour > token colour), so it is also applied as an
    // innermost mark over the full line text.
    if (colorClass && line.length > 0) {
      decorations.push(Decoration.mark({ class: colorClass }).range(line.from, line.to));
    }

    for (const range of config.ranges ?? []) {
      const resolvedColor = range.color ?? config.color;
      if (!resolvedColor) continue;
      const start = Math.max(range.start, 0);
      const end = Math.min(range.end, line.length);
      if (start >= end) continue;
      decorations.push(
        Decoration.mark({ class: LINE_COLOR_STYLES[resolvedColor].text }).range(
          line.from + start,
          line.from + end,
        ),
      );
    }
  }

  return Decoration.set(decorations, true);
};

const linesField = StateField.define<DecorationSet>({
  create: buildLineDecorations,
  update: (value, tr) => {
    if (
      tr.docChanged ||
      tr.startState.facet(linesConfigFacet) !== tr.state.facet(linesConfigFacet)
    ) {
      return buildLineDecorations(tr.state);
    }
    return value;
  },
  provide: field => EditorView.decorations.from(field),
});

/**
 * `lines` prop → line decorations (background, text colour, text style, className, style)
 * and range marks. Rebuilt on every document change, keyed by absolute line number.
 * `Prec.high` makes these marks the innermost spans so they win over painter token colours.
 */
export const linesExtension = (config: LinesConfig): Extension => [
  linesConfigFacet.of(config),
  Prec.high(linesField),
];

export const getLineDecorations = (state: EditorState): DecorationSet =>
  state.field(linesField, false) ?? Decoration.none;
