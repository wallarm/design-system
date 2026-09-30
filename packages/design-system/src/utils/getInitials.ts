const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : undefined;

// Grapheme-safe: an emoji or a letter with a combining mark stays whole.
const firstGrapheme = (word: string): string => {
  if (!segmenter) return Array.from(word)[0] ?? '';
  const first = segmenter.segment(word)[Symbol.iterator]().next();
  return first.done ? '' : first.value.segment;
};

/** Avatar initials: the first grapheme of the first and of the last word, upper-cased. */
export const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words.at(0);
  if (!first) return '';
  const last = words.length > 1 ? (words.at(-1) ?? '') : '';
  return (firstGrapheme(first) + firstGrapheme(last)).toLocaleUpperCase();
};
