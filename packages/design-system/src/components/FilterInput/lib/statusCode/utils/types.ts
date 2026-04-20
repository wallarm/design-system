export interface StatusCodeSuggestionsOptions {
  /**
   * Raw backend status-code list. The helper keeps only 1-char entries in
   * `[1..5]` as mask roots; everything else is ignored. When omitted or
   * empty, the helper returns `[]` for every input.
   */
  codes?: string[];
}
