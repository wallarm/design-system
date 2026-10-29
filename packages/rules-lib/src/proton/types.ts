/**
 * TypeScript definitions for proton-new-js SDK
 *
 * See packages/docs/point-sdk.md for full API documentation
 * @packageDocumentation
 */

export type Profile = 'tree' | 'grammar' | 'value';
export type RuleContext = 'http_request' | 'http_response' | 'grpc_request' | 'grpc_response';

export interface CheckOptions {
  profile?: Profile; // Default: 'tree'
  context?: RuleContext;
}

export interface CheckResultSuccess {
  ok: true;
  canonical: string; // Canonical form (store this!)
  exact: boolean; // true = one node shape (no wildcards/alternations/ordinals)
}

export interface CheckError {
  message: string; // Human-readable error
  layer: 'grammar' | 'tree' | 'value'; // Where it failed
  span: [number, number]; // UTF-16 indices for JS
  code: string; // Stable error code for branching
  params: Record<string, unknown>; // Template params
  fixes?: Fix[]; // Checked fixes (each passes profile)
  incomplete: boolean; // true = valid prefix, keep typing
}

export interface CheckResultError {
  ok: false;
  error: CheckError;
}

export type CheckResult = CheckResultSuccess | CheckResultError;

export interface Fix {
  label: string;
  replace: [number, number];
  insert: string;
}

export interface CompleteOptions extends CheckOptions {
  /**
   * Keys provider: list or function
   *
   * Function receives parent point and returns keys for that position.
   * Must be synchronous - use cached results + async fetch pattern.
   *
   * @example
   * ```typescript
   * keys: (parent) => {
   *   if (parent === '[http:header]') return ['authorization', 'cookie'];
   *   if (parent.includes('[format:json]')) return ['user', 'id', 'token'];
   *   return [];
   * }
   * ```
   */
  keys?: string[] | ((parent: string) => string[]);
}

export interface CompletionItem {
  kind: 'class' | 'member' | 'key' | 'close';
  insert: string; // Text to insert
  label: string; // Display label
  detail: string; // Secondary info
  caret: number; // Cursor position in insert (offset)
  open: boolean; // true = complete again immediately (template)
  category: string; // 'http' | 'format' | 'encoding' | 'key' | 'attr' | 'arr' | 'role' | 'dup' | 'joined' | 'wildcard'
  source: 'grammar' | 'tree' | 'dictionary'; // Where it came from
  key: string | null; // For tree/dictionary: raw key text
}

export interface Completion {
  replace: [number, number]; // Range to replace with item.insert
  items: CompletionItem[]; // What can go here
  parent: string; // Canonical point before step
  keySlot: boolean; // true = key position (query available)
  query: string | null; // Key text typed so far (null if !keySlot)
  truncated: boolean; // true = >200 matches (show "keep typing")
  error?: CheckError; // When text before cursor already fails
}

export interface Segment {
  kind: string; // Segment type
  [key: string]: unknown; // Segment-specific fields
}

export interface Step {
  span: [number, number];
  text: string;
  closed: boolean;
}

export interface Vocabulary {
  natives: string[];
  formats: string[];
  encodings: string[];
  kinds: string[];
  quantifiers: string[];
  roles: string[];
  dupWords: string[];
}

export interface VersionInfo {
  crate: string;
  ruleset_format: string;
  canonical: string; // Canonical version (store with points)
  commit: string;
}

export interface ProtonPoint {
  /** Validate and canonicalize point */
  check(point: string, options?: CheckOptions): CheckResult;

  /** Autocomplete at cursor position */
  complete(point: string, cursor: number, options?: CompleteOptions): Completion;

  /** Parse point into typed segments */
  parse(point: string): Segment[];

  /** Render segments back to canonical point */
  render(segments: Segment[]): string;

  /** Validate segments */
  checkSegments(segments: Segment[], options?: CheckOptions): CheckResult;

  /**
   * What can be inserted at position (segment-based API)
   */
  next(
    segments: Segment[],
    at: number,
    options?: CompleteOptions,
  ): Omit<Completion, 'replace' | 'query'>;

  /** Split text into steps */
  steps(point: string): { steps: Step[]; error?: CheckError };

  /** Grammar vocabulary */
  vocabulary(context?: RuleContext): Vocabulary;
}

export interface Proton {
  point: ProtonPoint;
  version(): VersionInfo;
}

/** Segment constructors from SDK (import {seg} from 'proton-new-js') */
export interface SegmentConstructors {
  native(word: string): Segment;
  key(text: string): Segment;
  name(key: string): Segment;
  attr(text: string): Segment;
  attrName(text: string): Segment;
  index(n: number): Segment;
  format(name: string): Segment;
  encoding(name: string): Segment;
  joined(key: string, sep: string): Segment;
  dup(n: number): Segment;
  dupAll(): Segment;
  dupAny(): Segment;
  wild(kinds: string[], quant: string, role?: string): Segment;
}
