import type { CSSProperties } from 'react';
import type { Token } from '../adapters/types';
import type { LineColor, LineConfig, LineRange } from '../CodeSnippetContext';
import { LINE_COLOR_STYLES, LINE_TEXT_STYLE_CLASSES } from './lineStyles';

export type LineTextStyles = {
  colorClass?: string;
  textStyleClass?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Build text styles for a line based on its configuration.
 * When ranges are present, the whole-line colorClass is suppressed
 * so that only individual ranges get colored text.
 */
export const getLineTextStyles = (lineConfig: LineConfig | undefined): LineTextStyles => {
  if (!lineConfig) {
    return {};
  }

  const hasRanges = lineConfig.ranges && lineConfig.ranges.length > 0;
  const colorStyles = lineConfig.color ? LINE_COLOR_STYLES[lineConfig.color] : undefined;
  const textStyleClass = lineConfig?.textStyle
    ? LINE_TEXT_STYLE_CLASSES[lineConfig.textStyle]
    : undefined;

  return {
    // When ranges exist, don't apply color to entire line text
    colorClass: hasRanges ? undefined : colorStyles?.text,
    textStyleClass,
    className: lineConfig.className,
    style: lineConfig.style,
  };
};

// --- Range splitting utilities ---

export type TextSegment = {
  content: string;
  rangeColor?: string;
};

/**
 * Split a plain text string at range boundaries, tagging overlapping portions
 * with their range color class.
 *
 * Example:
 *   splitTextByRanges("Accept: application/json", [{ start: 8, end: 24, color: 'danger' }])
 *   → [{ content: "Accept: " }, { content: "application/json", rangeColor: "text-..." }]
 */
export const splitTextByRanges = (
  text: string,
  ranges: LineRange[],
  lineColor?: LineColor,
): TextSegment[] => {
  if (ranges.length === 0) {
    return [{ content: text }];
  }

  // Sort ranges by start position
  const sorted = [...ranges].sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let pos = 0;

  for (const range of sorted) {
    const start = Math.max(range.start, 0);
    const end = Math.min(range.end, text.length);
    if (start >= end || start >= text.length) continue;

    // Text before this range
    if (pos < start) {
      segments.push({ content: text.slice(pos, start) });
    }

    // The range itself — range.color falls back to line color
    const resolvedColor = range.color ?? lineColor;
    const colorStyles = resolvedColor ? LINE_COLOR_STYLES[resolvedColor] : undefined;
    segments.push({
      content: text.slice(start, end),
      rangeColor: colorStyles?.text,
    });

    pos = end;
  }

  // Remaining text after last range
  if (pos < text.length) {
    segments.push({ content: text.slice(pos) });
  }

  return segments;
};

export type EnrichedToken = Token & {
  rangeColor?: string;
};

/**
 * Split syntax tokens at range boundaries, tagging overlapping portions
 * with their range color class.
 *
 * Iterates tokens tracking character position; splits any token that
 * overlaps a range boundary.
 */
export const splitTokensByRanges = (
  tokens: Token[],
  ranges: LineRange[],
  lineColor?: LineColor,
): EnrichedToken[] => {
  if (ranges.length === 0) {
    return tokens;
  }

  // Build a flat list of range entries sorted by start
  const sorted = [...ranges].sort((a, b) => a.start - b.start);

  const result: EnrichedToken[] = [];
  let charPos = 0;

  for (const token of tokens) {
    const tokenStart = charPos;
    const tokenEnd = charPos + token.content.length;

    // Collect all ranges that overlap this token
    const overlapping = sorted.filter(r => r.start < tokenEnd && r.end > tokenStart);

    if (overlapping.length === 0) {
      // No ranges overlap this token — keep as-is
      result.push(token);
    } else {
      // Split the token at range boundaries
      let pos = tokenStart;

      for (const range of overlapping) {
        const rangeStart = Math.max(range.start, tokenStart);
        const rangeEnd = Math.min(range.end, tokenEnd);

        // Part before the range (within this token)
        if (pos < rangeStart) {
          result.push({
            ...token,
            content: token.content.slice(pos - tokenStart, rangeStart - tokenStart),
          });
        }

        // The range portion — range.color falls back to line color
        const resolvedColor = range.color ?? lineColor;
        const colorStyles = resolvedColor ? LINE_COLOR_STYLES[resolvedColor] : undefined;
        result.push({
          ...token,
          content: token.content.slice(rangeStart - tokenStart, rangeEnd - tokenStart),
          rangeColor: colorStyles?.text,
        });

        pos = rangeEnd;
      }

      // Remaining part after last range
      if (pos < tokenEnd) {
        result.push({
          ...token,
          content: token.content.slice(pos - tokenStart),
        });
      }
    }

    charPos = tokenEnd;
  }

  return result;
};
