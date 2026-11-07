/**
 * Name step utilities
 *
 * UI helpers for name input steps (header, cookie, key, etc.)
 */

import { NAME_DESCRIPTIONS } from './constants';
import { fuzzyScore } from './search';
import type { NameRow, NameStep } from './types';

/**
 * Check if name step has case-insensitive option
 */
export function isCaseFixed(step: NameStep): boolean {
  // Headers are always case-insensitive in HTTP
  if (step.placeholder.toLowerCase().includes('header')) return true;
  // Other steps allow case choice
  return false;
}

/**
 * Check if name step is for entering a key name
 */
export function isKeyStep(step: NameStep): boolean {
  const p = step.placeholder.toLowerCase();
  return (
    p.includes('key') ||
    p.includes('field') ||
    p.includes('cookie') ||
    p.includes('claim') ||
    p.includes('parameter') ||
    p.includes('header')
  );
}

/**
 * Check if name step is for entering a numeric position
 */
export function isPositionStep(step: NameStep): boolean {
  return !!step.positionOf;
}

/**
 * Get noun for name step (singular form)
 */
export function nounOf(step: NameStep): string {
  if (step.positionOf) return step.positionOf;

  const p = step.placeholder.toLowerCase();
  if (p.includes('header')) return 'header';
  if (p.includes('cookie')) return 'cookie';
  if (p.includes('claim')) return 'claim';
  if (p.includes('parameter')) return 'parameter';
  if (p.includes('field')) return 'field';
  if (p.includes('key')) return 'key';
  if (p.includes('attribute')) return 'attribute';

  return 'name';
}

/**
 * Generate name rows for autocomplete
 *
 * Filters and scores suggestions based on query.
 *
 * @param query - User's typed text
 * @param step - Name step configuration
 * @param numbered - Whether to add numbers for keyboard shortcuts
 * @returns Array of name rows with scores
 */
export function nameRows(query: string, step: NameStep, numbered: boolean = true): NameRow[] {
  const rows: NameRow[] = [];

  // Add suggestions that match query
  if (step.suggest) {
    step.suggest.forEach((name, i) => {
      const score = fuzzyScore(query, name);
      if (score > 0 || !query) {
        const desc = NAME_DESCRIPTIONS[name] || '';
        rows.push({
          id: `suggest-${i}`,
          label: name,
          desc,
        });
      }
    });
  }

  // Add custom typed value if not exact match
  if (query && !step.suggest?.includes(query)) {
    rows.unshift({
      id: 'custom',
      label: step.customLabel ? step.customLabel(query) : query,
      desc: `Use '${query}'`,
    });
  }

  // Add fixed words if any
  if (step.words) {
    step.words.forEach((word, i) => {
      if (!query || fuzzyScore(query, word.word) > 0) {
        rows.push({
          id: `word-${i}`,
          label: word.label,
          desc: word.desc,
        });
      }
    });
  }

  // Limit to reasonable number
  const limited = rows.slice(0, 50);

  // Add numbers for keyboard shortcuts
  if (numbered) {
    limited.forEach((row, i) => {
      if (i < 9) {
        // Only 1-9 get numbers
        row.desc = `${i + 1}. ${row.desc}`;
      }
    });
  }

  return limited;
}

/**
 * Type for segsFor - creates segments from name input
 */
export function segsFor(name: string, step: NameStep) {
  return step.make(name);
}
