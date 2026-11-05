/**
 * TypeScript definitions for proton-new-js SDK
 *
 * These types mirror the real SDK at node_modules/proton-new-js/index.d.ts.
 * Keep them in sync — the SDK is the source of truth.
 *
 * @packageDocumentation
 */

// ─── Literal types ──────────────────────────────────────────────────────────

export type Native =
  | 'method'
  | 'proto'
  | 'url'
  | 'path'
  | 'query'
  | 'header'
  | 'body'
  | 'status'
  | 'host'
  | 'scheme';

export type FormatName =
  | 'json'
  | 'xml'
  | 'form'
  | 'multipart'
  | 'cookie'
  | 'auth'
  | 'jwt'
  | 'protobuf';

export type EncodingName = 'base64' | 'percent' | 'gzip' | 'deflate' | 'brotli';

export type ContentName = FormatName | EncodingName;

export type Kind = 'arr' | 'attr' | 'encoding' | 'format' | 'http' | 'key';

export type Quant = 'one' | 'zero_or_one' | 'zero_or_more' | 'one_or_more';

export type Role = 'name' | 'value';

export type Layer = 'grammar' | 'tree' | 'value';

export type Category =
  | 'http'
  | 'format'
  | 'encoding'
  | 'key'
  | 'attr'
  | 'arr'
  | 'role'
  | 'dup'
  | 'joined'
  | 'wildcard';

/**
 * Rule context — which side of a request/response the point is read in.
 *
 * gRPC contexts have no natives of their own; streamable contexts (`sse:*`)
 * exist in the grammar but are not yet exposed in the JS SDK.
 */
export type RuleContext = 'http_request' | 'http_response' | 'grpc_request' | 'grpc_response';

/** Alias kept for backward compatibility with existing imports. */
export type Profile = Layer;

// ─── Segment types (discriminated union) ─────────────────────────────────────

export type NativeSegment = { kind: 'native'; value: Native };
/** A named key: `['user']`. */
export type KeySegment = { kind: 'key'; value: string };
/** A key's own text: `['user'][role:name]`. */
export type NameSegment = { kind: 'name'; value: string };
/** An XML attribute or marker: `[attr:'@id']`. */
export type AttrSegment = { kind: 'typed'; value: string };
/** An attribute's own text: `[attr:'@id'][role:name]`. */
export type AttrNameSegment = { kind: 'typed_name'; value: string };
/** An array position: `[3]`. */
export type IndexSegment = { kind: 'index'; index: number };
/** A format or an encoding: `[format:json]`, `[encoding:base64]`. */
export type ContentSegment<N extends ContentName = ContentName> = { kind: 'content'; name: N };
/** A duplicate group joined into one value: `['k'][dup,joined:', ']`. */
export type JoinedSegment = { kind: 'combined_key'; value: string; separator: string };
export type RootSegment = { kind: 'root' };
export type WildSegment = { kind: 'wildcard'; kinds: Kind[]; quant: Quant; role?: Role };
/** An alternation: `['a'|'b']`, `[json|xml]`. */
export type AltsSegment = {
  kind: 'alts';
  alts: { segment: KeySegment | AttrSegment | ContentSegment; caseless: boolean }[];
};
/** A duplicate by position: `[dup:-1]`. */
export type DupSegment = { kind: 'dup_index'; index: number };
export type DupAnySegment = { kind: 'dup_any' };
export type DupAllSegment = { kind: 'dup_all' };

/** One point segment — what `parse` returns and `render` spells. */
export type Segment =
  | NativeSegment
  | KeySegment
  | NameSegment
  | AttrSegment
  | AttrNameSegment
  | IndexSegment
  | ContentSegment
  | JoinedSegment
  | RootSegment
  | WildSegment
  | AltsSegment
  | DupSegment
  | DupAnySegment
  | DupAllSegment;

/** A segment `parse` returned: with the span of the text it came from. */
export type Parsed = Segment & { span: [number, number] };

// ─── Errors and verdicts ─────────────────────────────────────────────────────

/** Minimal error on a step — what `steps()` and `complete()` report. */
export interface StepError {
  message: string;
  layer: Layer;
  /** The first step at which the prefix stopped passing the profile. */
  span: [number, number];
  /** The verdict's stable identity, to translate or branch on. */
  code: string;
  /** What a message template for `code` needs. */
  params: Record<string, string | string[]>;
}

/** Full verdict from `check()` — adds fixes and incomplete. */
export interface Verdict extends StepError {
  /** Edits after which the whole point passes. */
  fixes: Fix[];
  /** The point is a prefix of one that passes: still being typed, not wrong. */
  incomplete: boolean;
}

export interface Fix {
  label: string;
  replace: [number, number];
  insert: string;
}

/** A verdict on segments: the failing segment in place of a span. */
export interface SegmentVerdict extends Omit<Verdict, 'span'> {
  /** The failing segment; null for `empty_point` and `too_many_expansion_nodes`. */
  segment: number | null;
}

// ─── Check results ───────────────────────────────────────────────────────────

/** Result of `check()` — text-based. */
export type CheckResult =
  | { ok: true; canonical: string; exact: boolean }
  | { ok: false; error: Verdict };

/** Result of `checkSegments()` — segment-based, no span, no fixes. */
export type SegmentCheck =
  | { ok: true; canonical: string; exact: boolean }
  | { ok: false; error: SegmentVerdict };

// ─── Options ─────────────────────────────────────────────────────────────────

export interface CheckOptions {
  profile?: Layer;
  context?: RuleContext;
}

export interface CompleteOptions extends CheckOptions {
  /** Keys to offer at a key position: a list, or a provider given the canonical parent point. */
  keys?: readonly string[] | ((parent: string) => readonly string[]);
}

// ─── Completion (text-based) ─────────────────────────────────────────────────

/** One item `complete()` returns — for text-based editing. */
export interface CompletionItem {
  kind: 'class' | 'member' | 'key' | 'close';
  insert: string;
  label: string;
  detail: string;
  /** Where the cursor goes after inserting: an index into `insert`. */
  caret: number;
  /** The insert leaves a step open: complete again right away. */
  open: boolean;
  category: Category;
  source: 'grammar' | 'tree' | 'dictionary';
  /** The raw key text of a `tree` or `dictionary` item. */
  key: string | null;
}

export interface Completion {
  replace: [number, number];
  parent: string | null;
  keySlot: boolean;
  query: string | null;
  truncated: boolean;
  error: StepError | null;
  items: CompletionItem[];
}

// ─── Choices (segment-based — return of next()) ──────────────────────────────

/** One segment that may be inserted — returned by `next()`. */
export interface Choice {
  /** The segment itself; when `open`, a template whose text the user types. */
  segment: Segment;
  label: string;
  detail: string;
  category: Category;
  source: 'grammar' | 'tree' | 'dictionary';
  open: boolean;
}

export interface Choices {
  parent: string | null;
  keySlot: boolean;
  truncated: boolean;
  error: SegmentVerdict | null;
  items: Choice[];
}

// ─── Steps ───────────────────────────────────────────────────────────────────

export interface Step {
  span: [number, number];
  text: string;
  /** Its `]` is there: the last step of an unfinished point has none yet. */
  closed: boolean;
}

// ─── Vocabulary ──────────────────────────────────────────────────────────────

export interface Words {
  natives: Native[];
  formats: FormatName[];
  encodings: EncodingName[];
  /** Wildcard kind words, in canonical order. */
  kinds: Kind[];
  quantifiers: ('*' | '**' | '?' | '+')[];
  roles: Role[];
  /** The `[dup:…]` words besides ordinals. */
  dups: ('all' | 'any')[];
}

// ─── Version ─────────────────────────────────────────────────────────────────

export interface VersionInfo {
  crate: string;
  ruleset_format: string;
  /** The version of the canonical point form (store beside canonical points). */
  canonical: number;
  commit: string;
}

// ─── Proton API ──────────────────────────────────────────────────────────────

export interface ProtonPoint {
  /** Validate and canonicalize point. */
  check(point: string, options?: CheckOptions): CheckResult;

  /** Parse point into typed segments with spans. */
  parse(point: string): Parsed[];

  /** Validate segments (segment-based API). */
  checkSegments(segments: readonly Segment[], options?: CheckOptions): SegmentCheck;

  /**
   * What can be inserted at index `at` (default: the end),
   * keeping the segments after it valid.
   */
  next(segments: readonly Segment[], at?: number, options?: CompleteOptions): Choices;

  /** Render segments back to canonical point string. */
  render(segments: readonly Segment[]): string;

  /** Autocomplete at cursor position (text-based API). */
  complete(point: string, cursor: number, options?: CompleteOptions): Completion;

  /** Split text into steps as the parser does. */
  steps(point: string): { steps: Step[]; error: StepError | null };

  /** The grammar's words; natives for the context given, or for any. */
  vocabulary(context?: RuleContext): Words;
}

export interface Proton {
  point: ProtonPoint;
  version(): VersionInfo;
}

// ─── Segment constructors (import { seg } from 'proton-new-js') ─────────────

export interface SegmentConstructors {
  native(word: Native): NativeSegment;
  key(text: string): KeySegment;
  name(key: string): NameSegment;
  attr(text: string): AttrSegment;
  attrName(text: string): AttrNameSegment;
  index(n: number): IndexSegment;
  format<N extends FormatName>(name: N): ContentSegment<N>;
  encoding<N extends EncodingName>(name: N): ContentSegment<N>;
  joined(key: string, separator: string): JoinedSegment;
  dup(n: number): DupSegment;
  dupAll(): DupAllSegment;
  dupAny(): DupAnySegment;
  wild(kinds: readonly Kind[], quant: Quant, role?: Role): WildSegment;
}

// ─── Backward-compatible aliases ─────────────────────────────────────────────
// Code that imported the old names keeps compiling while we migrate.

/** @deprecated Use {@link Verdict} */
export type CheckError = Verdict;

/** @deprecated Use {@link Words} */
export type Vocabulary = Words;
