export interface Choice {
  value: string;
  label: string;
}

/** The engine's own findings (0.10.1 `signal_present`). */
export const SIGNAL_TYPES: Choice[] = [
  { value: 'key_duplicate', label: 'sends a key more than once' },
  { value: 'resource_overlimit', label: 'went over a processing limit' },
];

/** Containers whose keys can repeat — the point a duplicate check reads. */
export const DUPLICATE_CONTAINERS: Choice[] = [
  { value: '[http:header]', label: 'the headers' },
  { value: '[http:query][format:form]', label: 'the query string' },
  { value: '[http:body][format:form]', label: 'the form body' },
  { value: '[http:body][format:json]', label: 'the JSON body' },
  { value: "[http:header]['cookie'][format:cookie]", label: 'the cookies' },
];

export const LIMITS: Choice[] = [
  { value: 'processing_time_limit', label: 'processing time' },
  { value: 'processing_space_limit', label: 'processing memory' },
  { value: 'entry_size_soft_limit', label: 'value size (soft limit)' },
  { value: 'entry_size_hard_limit', label: 'value size (hard limit)' },
];

/** A choice's label, or the stored value as written when it is not listed. */
export const labelOf = (choices: readonly Choice[], value: string): string =>
  choices.find(c => c.value === value)?.label ?? value;
