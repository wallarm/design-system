export interface FilterParseError {
  readonly _tag: 'FilterParseError';
  readonly message: string;
}

export const FilterParseError = (message: string): FilterParseError => ({
  _tag: 'FilterParseError',
  message,
});

export const isFilterParseError = (value: unknown): value is FilterParseError =>
  typeof value === 'object' &&
  value !== null &&
  '_tag' in value &&
  value._tag === 'FilterParseError';
