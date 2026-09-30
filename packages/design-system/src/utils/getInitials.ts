const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : undefined;

const LETTER = /^\p{L}/u;

const graphemes = (word: string): string[] =>
  segmenter ? Array.from(segmenter.segment(word), s => s.segment) : Array.from(word);

// Grapheme-safe: a letter with a combining mark stays whole. Leading punctuation is skipped.
const firstLetter = (word: string): string => graphemes(word).find(g => LETTER.test(g)) ?? '';

/**
 * Avatar initials: the first letter of the first and of the last word that has a letter,
 * upper-cased. '' when the name has no letter, so the fallback shows its icon.
 */
export const getInitials = (name: string): string => {
  const letters = name
    .trim()
    .split(/\s+/)
    .map(firstLetter)
    .filter(letter => letter !== '');
  const first = letters.at(0) ?? '';
  const last = letters.length > 1 ? (letters.at(-1) ?? '') : '';
  return (first + last).toLocaleUpperCase();
};
