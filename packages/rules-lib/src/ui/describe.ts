/**
 * Human-readable descriptions for points
 *
 * Converts segments to plain English for UI display.
 * NOT grammar parsing - uses existing segment metadata.
 */

import type { RuleContext, Segment } from './types';

/**
 * Convert segments to human-readable sentence
 *
 * Uses segment.label metadata already attached by UI builders.
 * Does NOT parse point string - works with UI segments.
 *
 * @example
 * ```typescript
 * const segments = [
 *   { text: '[http:header]', kind: 'native', label: 'Header' },
 *   { text: "['authorization']", kind: 'key', label: 'authorization' }
 * ];
 * describe(segments); // "Header authorization"
 * ```
 */
export function describe(segments: readonly Segment[]): string {
  if (segments.length === 0) return '';

  // Simple concatenation of labels with smart spacing
  return segments
    .map(s => s.label)
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate menu title for current point
 *
 * Returns "What next?" question based on current point state.
 * Uses last segment to determine context.
 *
 * @example
 * ```typescript
 * listTitle([], 'http_request'); // "Where is the value?"
 * listTitle([headerSeg], 'http_request'); // "Which header?"
 * listTitle([headerSeg, keySeg('auth')], 'http_request'); // "What next?"
 * ```
 */
export function listTitle(segments: readonly Segment[], context: RuleContext): string {
  if (segments.length === 0) {
    return context === 'http_response'
      ? 'Where in the response?'
      : context.startsWith('grpc')
        ? 'Where in the message?'
        : 'Where in the request?';
  }

  const last = segments[segments.length - 1];

  // After native that expects keys (header, query, body)
  if (last?.kind === 'native') {
    if (last.name === 'header') return 'Which header?';
    if (last.name === 'query') return 'Which parameter?';
    if (last.name === 'body') return 'What format?';
  }

  // After format marker
  if (last?.kind === 'format') {
    if (last.name === 'json' || last.name === 'xml') return 'Which field?';
    if (last.name === 'form') return 'Which field?';
    if (last.name === 'multipart') return 'Which part?';
    if (last.name === 'jwt') return 'Which claim?';
    if (last.name === 'cookie') return 'Which cookie?';
  }

  // Default
  return 'What next?';
}
