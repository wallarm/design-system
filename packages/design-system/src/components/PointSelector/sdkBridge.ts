/**
 * SDK Bridge - Integrate Proton SDK with Point Selector
 *
 * **IMPORTANT: Proton SDK is the ONLY source of truth for point validation.**
 *
 * This file provides typed wrappers around SDK operations with proper error handling.
 * All point grammar rules, tree-shape validation, and canonical rendering are handled
 * by the SDK WASM module, which is identical to what proton backend uses.
 *
 * Architecture:
 * - SDK validates ALL grammar rules (native-first, role termination, ordinal binding, etc.)
 * - SDK provides canonical form, error messages, fixes, and incomplete state detection
 * - NO custom UI-level validation should duplicate SDK logic
 * - Legacy segment rendering (pointOf) has been fully replaced by SDK render()
 *
 * See:
 * - /node/proton/docs/user/point-sdk.md - SDK API specification
 * - /packages/docs/point-format.md - Point grammar (STAR notation)
 * - /packages/docs/tree-shape.md - What can exist under each point
 */

import type {
  CheckError,
  CheckOptions,
  CheckResult,
  CompleteOptions,
  Completion,
  CompletionItem,
  Profile,
  Proton,
  RuleContext,
  Segment,
} from '@wallarm-org/rules-lib';
// pointOf removed - all rendering now through SDK
import type { ErrorFix, ValidationError } from './types';

export interface ValidationResult {
  /** SDK canonical form (store this!) */
  canonical: string | null;
  /** Validation error if any */
  error: CheckError | null;
  /** Whether point is exact (one node, no wildcards/alternations) */
  exact: boolean;
  /** true = valid prefix, keep typing; false = actual error */
  incomplete: boolean;
}

/**
 * Validate point string using SDK
 *
 * @example
 * ```typescript
 * const result = checkPoint(proton, '[http:header', { context: 'http_request' });
 * if (result.incomplete) {
 *   // Show info: "Keep typing..."
 * } else if (result.error) {
 *   // Show error with fixes: result.error.fixes
 * } else {
 *   // Valid: store result.canonical
 * }
 * ```
 */
export function checkPoint(
  proton: Proton | null,
  point: string,
  options: CheckOptions,
): ValidationResult {
  if (!proton || point === '') {
    return { canonical: null, error: null, exact: false, incomplete: false };
  }

  try {
    const result = proton.point.check(point, options);

    if (result.ok) {
      return {
        canonical: result.canonical,
        error: null,
        exact: result.exact,
        incomplete: false,
      };
    }

    return {
      canonical: null,
      error: result.error,
      exact: false,
      incomplete: result.error.incomplete,
    };
  } catch (error) {
    // Network/transport failure or SDK internal error (point-sdk.md:103-104)
    // These are *core.Error, not *point.Error - throw, don't wrap in CheckError
    throw new Error(
      `SDK transport failure: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Validate custom segments using SDK
 *
 * Converts custom Segment[] → point string → SDK check → canonical form
 * Legacy compatibility - prefer checkPoint() for new code.
 *
 * @example
 * ```typescript
 * const result = validateSegments(proton, segments, 'http_request', 'tree');
 * if (result.canonical) {
 *   // Store canonical form: "[http:header]['authorization']"
 * } else if (result.incomplete) {
 *   // Show "Keep typing..."
 * } else {
 *   // Show error: result.error.message
 * }
 * ```
 */
export function validateSegments(
  proton: Proton | null,
  segments: readonly Segment[],
  context: RuleContext,
  profile: Profile = 'tree',
): ValidationResult {
  if (!proton || segments.length === 0) {
    return { canonical: null, error: null, exact: false, incomplete: false };
  }

  // Convert segments to point string using SDK render
  const point = renderSegments(proton, segments as Segment[]);

  return checkPoint(proton, point, { profile, context });
}

/**
 * Get autocomplete suggestions at cursor position
 *
 * @example
 * ```typescript
 * const completion = completePoint(proton, '[http:hea', 9, {
 *   context: 'http_request',
 *   keys: ['authorization', 'cookie'],
 * });
 *
 * if (completion.error) {
 *   // Text before cursor already fails - show error and fixes
 * }
 *
 * completion.items.forEach(item => {
 *   if (item.open) {
 *     // Template item - insert and complete again
 *   }
 *   // Show: item.label, item.detail, item.category
 * });
 * ```
 */
export function completePoint(
  proton: Proton | null,
  point: string,
  cursor: number,
  options: CompleteOptions,
): Completion | null {
  if (!proton) return null;

  const completion = proton.point.complete(point, cursor, options);

  // Per point-sdk.md:202-203, MCP alias is not offered in completion
  // Filter out 'mcp' from format items (it can only be written in canonical string input)
  if (completion && !completion.error && completion.items) {
    const hasMcp = completion.items.some(
      item => item.category === 'format' && item.key === 'mcp',
    );
    if (hasMcp) {
      return {
        ...completion,
        items: completion.items.filter(item => !(item.category === 'format' && item.key === 'mcp')),
      };
    }
  }

  return completion;
}

/**
 * Get next possible segments at position (segment-based API)
 *
 * Alternative to complete() for UI that builds points from segments.
 *
 * @example
 * ```typescript
 * const next = nextSegments(proton, segments, segments.length, {
 *   context: 'http_request',
 *   keys: provider,
 * });
 *
 * if (next?.keySlot && next.query) {
 *   // User is typing a key - filter items by next.query
 * }
 * ```
 */
export function nextSegments(
  proton: Proton | null,
  segments: Segment[],
  at: number,
  options: CompleteOptions,
): Omit<Completion, 'replace' | 'query'> | null {
  if (!proton) return null;

  // Cast to any - custom Segment has UI metadata that SDK ignores
  const result = proton.point.next(segments as any, at, options);

  // Per point-sdk.md:202-203, MCP alias is not offered in completion
  // Filter out 'mcp' from format items (it can only be written in canonical string input)
  if (result && !result.error && result.items) {
    const hasMcp = result.items.some(item => item.category === 'format' && (item as any).key === 'mcp');
    if (hasMcp) {
      return {
        ...result,
        items: result.items.filter(item => !(item.category === 'format' && (item as any).key === 'mcp')),
      };
    }
  }

  return result;
}

/**
 * Check if point is valid for the "value" profile
 *
 * Value profile requires:
 * - One node (no wildcards/alternations/ordinals except joins)
 * - A node with data (not a container)
 *
 * Used for session-definition rules and other value-reading contexts.
 */
export function isValuePoint(proton: Proton | null, point: string, context: RuleContext): boolean {
  if (!proton || point === '') return false;

  const result = proton.point.check(point, {
    profile: 'value',
    context,
  });

  return result.ok;
}

/**
 * Render segments to canonical point string using SDK
 *
 * **Requires SDK**: This function requires a valid Proton instance.
 * All segments must be in SDK-compatible format.
 *
 * **Segment compatibility:**
 * - UI Segment type extends SDK Segment with metadata fields (label, desc, etc.)
 * - SDK render() ignores unknown fields, reads only: kind, text, name, fuzzy, dup, multi, etc.
 * - Cast to `any` is safe: SDK type is strict subset of UI type
 *
 * @example
 * ```typescript
 * const point = renderSegments(proton, segments);
 * // Returns: "[http:header]['authorization'][format:jwt]['payload']['sub']"
 * ```
 */
/**
 * Normalize segment numeric fields to ensure proper i32 types for WASM
 */
export function normalizeSegment(seg: Segment): Segment {
  const normalized: any = {};

  for (const key in seg) {
    const value = (seg as any)[key];
    // Convert numeric fields to proper integers (force i32 for WASM)
    if (typeof value === 'number' && key !== 'span') {
      normalized[key] = Math.floor(value) | 0;
    } else {
      normalized[key] = value;
    }
  }

  // Special case: dup_index segments need both 'ord' and 'index' for WASM compatibility
  if (seg.kind === 'dup_index' && 'ord' in seg && !('index' in seg)) {
    normalized.index = normalized.ord;
  }

  return normalized as Segment;
}

export function renderSegments(proton: Proton | null, segments: Segment[]): string {
  if (segments.length === 0) return '';

  if (!proton) {
    throw new Error(
      'renderSegments: SDK not available - cannot render segments without Proton instance',
    );
  }

  // Normalize segments to ensure proper numeric types for WASM
  const normalizedSegments = segments.map(normalizeSegment);

  // SDK canonical rendering
  // Cast is safe: UI Segment has all fields SDK needs, plus extra metadata
  return proton.point.render(normalizedSegments as any);
}

/**
 * Alias for renderSegments - used by RuleBuilder models for converting segments to point strings.
 *
 * @param segments - Array of segments to render
 * @param proton - Proton SDK instance (optional for backwards compatibility)
 * @returns Canonical point string
 *
 * @example
 * ```typescript
 * const point = pointOf(segments, proton);
 * // Returns: "[http:header]['authorization']"
 * ```
 */
export function pointOf(segments: Segment[], proton?: Proton | null): string {
  return renderSegments(proton ?? null, segments);
}

/**
 * Convert SDK CompletionItem to legacy MenuRow format
 *
 * Backward compatibility helper for gradual migration.
 * Maps SDK completion structure to UI MenuRow for existing components.
 *
 * @param item - SDK CompletionItem from complete() or next()
 * @param index - 0-based index for numbering (1-indexed in UI)
 * @returns MenuRow compatible with StepMenu component
 */
export function completionToMenuRow(
  item: CompletionItem,
  index: number,
): {
  id: string;
  label: string;
  desc: string;
  number?: number;
  custom?: boolean;
} {
  return {
    id: item.key || `completion-${index}`,
    label: item.label,
    desc: item.detail,
    number: index < 9 ? index + 1 : undefined,
    custom: item.source === 'dictionary', // User-provided keys
  };
}

/**
 * Get next segment options using SDK next()
 *
 * Replaces legacy nextFor() with SDK next() for richer completions.
 * Uses SDK's segment-based next() API which provides:
 * - source: 'grammar' | 'tree' | 'dictionary'
 * - category: 'format' | 'encoding' | 'key' | ...
 * - open: true if template (needs user input)
 * - Tree-based suggestions (not just grammar)
 * - Dictionary completions
 *
 * This is more direct than complete() for UI that builds points from segments,
 * avoiding round-trip through point string serialization.
 *
 * @param proton - SDK instance
 * @param segments - Current segments
 * @param context - Rule context
 * @param keys - Keys provider (array or sync function)
 * @param profile - Point profile: 'tree' (default, any point) or 'value' (single node with data).
 *                  'tree' accepts wildcards/containers, 'value' requires a single readable node.
 *                  Used for session rules and value extraction contexts.
 * @returns Array of completion items or empty array if SDK unavailable
 *
 * @example
 * ```typescript
 * const items = getNextSegmentOptions(proton, segments, 'http_request', myKeys, 'tree');
 * const rows = items.map((item, i) => completionToMenuRow(item, i));
 * ```
 */
export function getNextSegmentOptions(
  proton: Proton | null,
  segments: Segment[],
  context: RuleContext,
  keys?: string[] | ((parent: string) => string[]),
  profile: Profile = 'tree',
): CompletionItem[] {
  if (!proton) {
    return [];
  }

  try {
    // Use segment-based next() API - more direct than complete()
    // Cast to any: UI Segment has metadata fields that SDK ignores
    const completion = proton.point.next(segments as any, segments.length, {
      context,
      profile,
      keys,
    });

    if (!completion) return [];
    if (completion.error) return [];

    return completion.items || [];
  } catch {
    // SDK next() failed
    return [];
  }
}

/**
 * Get human-readable error message with layer context
 *
 * Handles MCP-specific errors per point-sdk.md:184-195
 */
export function formatError(error: CheckError): string {
  // MCP alias error codes (point-sdk.md:184-195)
  const mcpCodes = [
    'mcp_repeated',
    'mcp_prefix',
    'mcp_in_alternation',
    'mcp_step',
    'mcp_request_member',
    'mcp_method_untagged',
    'mcp_method_position',
  ];

  if (mcpCodes.includes(error.code)) {
    return `MCP alias error: ${error.message}`;
  }

  const layerPrefix = {
    grammar: 'Syntax error',
    tree: 'Invalid point',
    value: 'Not a value point',
  }[error.layer];

  return `${layerPrefix}: ${error.message}`;
}

/**
 * Get error span for highlighting in UI
 *
 * Returns UTF-16 indices suitable for JS string.slice()
 */
export function getErrorSpan(error: CheckError): [number, number] {
  return error.span;
}

/**
 * Get context-aware vocabulary
 *
 * Returns available natives, formats, encodings, etc. for a context.
 *
 * @example
 * ```typescript
 * const vocab = getVocabulary(proton, 'http_request');
 * // Returns: { natives: ['method', 'proto', 'url', ...], formats: ['json', 'xml', ...], ... }
 *
 * const vocab = getVocabulary(proton, 'grpc_request');
 * // Returns: { natives: ['service', 'method', ...], formats: ['protobuf', ...], ... }
 * ```
 */
export function getVocabulary(proton: Proton | null, context: RuleContext) {
  if (!proton) {
    // Fallback: return empty vocabulary
    return {
      natives: [],
      formats: [],
      encodings: [],
      kinds: [],
      quantifiers: [],
      roles: [],
      dupWords: [],
    };
  }

  return proton.point.vocabulary(context);
}

/**
 * Split point into display steps
 *
 * Returns SDK-canonical step rendering for display in UI.
 *
 * @example
 * ```typescript
 * const steps = getSteps(proton, "[http:header]['authorization'][format:jwt]['payload']['sub']");
 * // Returns: [
 * //   { span: [0, 13], text: "http:header", closed: true },
 * //   { span: [13, 30], text: "'authorization'", closed: true },
 * //   { span: [30, 42], text: "format:jwt", closed: true },
 * //   { span: [42, 53], text: "'payload'", closed: true },
 * //   { span: [53, 58], text: "'sub'", closed: true }
 * // ]
 * ```
 */
export function getSteps(proton: Proton | null, point: string) {
  if (!proton || !point) return [];

  const result = proton.point.steps(point);

  // If there's an error, return empty array (invalid point)
  if (result.error) return [];

  return result.steps;
}

/**
 * Check if point needs re-canonicalization due to SDK version change
 *
 * SDK bumps canonical version when canonical spelling changes.
 * Points stored with old version must be re-canonicalized.
 *
 * See point-sdk.md "Version" section (lines 331-349):
 * > "Store `canonical` beside the canonical points you keep. Proton bumps it
 * > whenever the canonical spelling of any point changes. When it moves,
 * > re-canonicalize the stored points with `check`."
 *
 * @param currentVersion - Current SDK canonical version (from version().canonical)
 * @param storedVersion - Canonical version when point was stored (undefined = needs canonicalization)
 * @returns true if point needs re-canonicalization
 *
 * @example
 * ```typescript
 * const sdkVersion = parseInt(proton.version().canonical);
 * const point = loadedPoint; // from storage
 *
 * if (needsRecanonalization(sdkVersion, point.canonicalVersion)) {
 *   // Re-canonicalize with check()
 *   const result = checkPoint(proton, point.canonical, { context });
 *   if (result.canonical) {
 *     point.canonical = result.canonical;
 *     point.canonicalVersion = sdkVersion;
 *   }
 * }
 * ```
 */
export function needsRecanonalization(
  currentVersion: number | undefined,
  storedVersion: number | undefined,
): boolean {
  // No stored version = never canonicalized or pre-versioning
  if (storedVersion === undefined) return true;

  // No current version = SDK not loaded
  if (currentVersion === undefined) return false;

  // Version changed = need re-canonicalization
  return currentVersion !== storedVersion;
}

/**
 * Re-canonicalize point if version changed
 *
 * Updates canonical form and version when SDK version changes.
 * Returns updated value with new canonical form and version.
 *
 * @param proton - SDK instance
 * @param value - Point selector value with canonical form and version
 * @param context - Rule context for validation
 * @returns Updated value with new canonical form and version, or original if no change needed
 *
 * @example
 * ```typescript
 * const updated = recanonicalizeIfNeeded(proton, loadedValue, 'http_request');
 * if (updated !== loadedValue) {
 *   console.log('Point re-canonicalized:', updated.canonical);
 *   saveValue(updated); // Save updated form
 * }
 * ```
 */
export function recanonicalizeIfNeeded(
  proton: Proton | null,
  value: { canonical?: string; canonicalVersion?: number; segments: Segment[] },
  context: RuleContext,
): typeof value {
  if (!proton || !value.canonical) return value;

  const currentVersion = parseInt(proton.version().canonical);
  if (!needsRecanonalization(currentVersion, value.canonicalVersion)) {
    return value; // No change needed
  }

  // Re-canonicalize with check()
  const result = checkPoint(proton, value.canonical, { context });

  if (!result.canonical) {
    // Log warning when re-canonicalization fails
    console.warn(
      `Point re-canonicalization failed for "${value.canonical}": ${result.error?.message || 'unknown error'}. ` +
      `Keeping original form. This may indicate the point syntax is no longer valid in SDK version ${currentVersion}.`
    );
    return value;
  }

  // Update canonical form and version
  return {
    ...value,
    canonical: result.canonical,
    canonicalVersion: currentVersion,
  };
}

/**
 * Get SDK version info
 *
 * Returns version information for compatibility checking.
 *
 * @example
 * ```typescript
 * const version = getVersion(proton);
 * // Returns: {
 * //   crate: "proton-new",
 * //   ruleset_format: "0.10.3",
 * //   canonical: "0.10.3-abc123",
 * //   commit: "abc123"
 * // }
 * ```
 */
export function getVersion(proton: Proton | null) {
  if (!proton) return null;

  try {
    return proton.version();
  } catch {
    return null;
  }
}

/**
 * Validate segments directly (segment-based API)
 *
 * Alternative to checkPoint() for UI that builds points from segments.
 * This uses SDK's checkSegments() which validates segment structure directly.
 *
 * @example
 * ```typescript
 * const result = checkSegmentsDirectly(proton, segments, { context: 'http_request', profile: 'tree' });
 * if (result.ok) {
 *   // Valid: use result.canonical
 * } else if (result.error.incomplete) {
 *   // Keep typing
 * } else {
 *   // Show error: result.error.message
 * }
 * ```
 */
export function checkSegmentsDirectly(
  proton: Proton | null,
  segments: Segment[],
  options: CheckOptions,
): CheckResult {
  if (!proton || segments.length === 0) {
    return {
      ok: false,
      error: {
        message: 'SDK not loaded',
        layer: 'grammar',
        span: [0, 0],
        code: 'sdk_not_loaded',
        params: {},
        incomplete: false,
      },
    };
  }

  try {
    // Normalize segments to ensure proper numeric types for WASM
    const normalizedSegments = segments.map(normalizeSegment);
    // Cast to any - custom Segment has UI metadata that SDK ignores
    return proton.point.checkSegments(normalizedSegments as any, options);
  } catch (error) {
    // Network/transport failure or SDK internal error
    return {
      ok: false,
      error: {
        message: error instanceof Error ? error.message : 'SDK call failed',
        layer: 'grammar',
        span: [0, 0],
        code: 'TRANSPORT_ERROR',
        params: {},
        incomplete: false,
      },
    };
  }
}

/**
 * SDK Segment Constructors
 *
 * Type-safe helpers for creating SDK-canonical segment structures.
 * These match the Proton SDK's segment format exactly.
 *
 * **CRITICAL**: Always use these constructors instead of manual object construction
 * to ensure backend compatibility and type safety.
 *
 * @example
 * ```typescript
 * // ❌ Manual construction (wrong, breaks SDK compatibility)
 * const seg = { kind: 'native', value: 'body' };
 *
 * // ✅ SDK constructor (correct, guaranteed compatible)
 * const seg = sdkSeg.native('body');
 * ```
 */
export const sdkSeg = {
  /**
   * Native segment: [http:body], [http:header], [sse:data], etc.
   * SDK determines family internally from the word - do not pass family parameter.
   * @example sdkSeg.native('body') → { kind: 'native', value: 'body' }
   * @example sdkSeg.native('data') → { kind: 'native', value: 'data' }
   */
  native: (word: string): Segment => {
    return { kind: 'native', value: word };
  },

  /**
   * Key segment: ['user'], ['email'], etc.
   * @example sdkSeg.key('user') → { kind: 'key', value: 'user' }
   */
  key: (value: string): Segment => ({ kind: 'key', value }),

  /**
   * Key name segment: ['user'][role:name]
   * @example sdkSeg.name('user') → { kind: 'key', value: 'user', role: 'name' }
   */
  name: (value: string): Segment => ({ kind: 'key', value, role: 'name' }),

  /**
   * Attribute segment: [attr:'@id'], [attr:'@class'], etc.
   * @example sdkSeg.attr('@id') → { kind: 'typed', value: '@id' }
   */
  attr: (value: string): Segment => ({ kind: 'typed', value }),

  /**
   * Attribute name segment: [attr:'@id'][role:name]
   * Uses typed_name kind per SDK spec (not typed with role).
   * @example sdkSeg.attrName('@id') → { kind: 'typed_name', value: '@id' }
   */
  attrName: (value: string): Segment => ({ kind: 'typed_name', value }),

  /**
   * Format segment: [format:json], [format:xml], etc.
   * @example sdkSeg.format('json') → { kind: 'content', name: 'json' }
   */
  format: (name: string): Segment => ({ kind: 'content', name }),

  /**
   * Encoding segment: [encoding:base64], [encoding:gzip], etc.
   * @example sdkSeg.encoding('base64') → { kind: 'content', name: 'base64' }
   */
  encoding: (name: string): Segment => ({ kind: 'content', name }),

  /**
   * Array index segment: [0], [5], [42], etc.
   * @example sdkSeg.index(3) → { kind: 'index', index: 3 }
   */
  index: (index: number): Segment => ({ kind: 'index', index }),

  /**
   * Duplicate ordinal: ['key'][dup:0], ['key'][dup:-1], etc.
   * @example sdkSeg.dup(0) → { kind: 'dup_index', ord: 0 }
   */
  dup: (ord: number): Segment => ({ kind: 'dup_index', ord }),

  /**
   * Duplicate all: ['key'][dup:all]
   * @example sdkSeg.dupAll() → { kind: 'dup_all' }
   */
  dupAll: (): Segment => ({ kind: 'dup_all' }),

  /**
   * Duplicate any: ['key'][dup:any] (default, usually omitted)
   * @example sdkSeg.dupAny() → { kind: 'dup_any' }
   */
  dupAny: (): Segment => ({ kind: 'dup_any' }),

  /**
   * Joined entry: ['key'][dup,joined:', ']
   * Fields are 'value' (key) and 'separator' per SDK spec.
   * @example sdkSeg.joined('cookie', ', ') → { kind: 'combined_key', value: 'cookie', separator: ', ' }
   */
  joined: (value: string, separator: string): Segment => ({
    kind: 'combined_key',
    value,
    separator,
  }),

  /**
   * Wildcard segment: [*], [key:*], [arr|key:*], [key:*][role:value], etc.
   * Quant values per SDK spec: one (=*), zero_or_one (=?), zero_or_more (=**), one_or_more (=+)
   * Role optional: narrows to 'name' or 'value' entries (only valid with key/attr kinds)
   * @example sdkSeg.wild(['key'], 'one') → { kind: 'wildcard', kinds: ['key'], quant: 'one' }
   * @example sdkSeg.wild(['key', 'arr'], 'zero_or_more', 'value') → { kind: 'wildcard', kinds: ['key', 'arr'], quant: 'zero_or_more', role: 'value' }
   */
  wild: (
    kinds: string[],
    quant: 'one' | 'zero_or_one' | 'zero_or_more' | 'one_or_more',
    role?: 'name' | 'value',
  ): Segment => ({
    kind: 'wildcard',
    kinds,
    quant,
    ...(role && { role }),
  }),

  /**
   * Method segment (MCP alias): [method:'tools/call'] after [format:mcp]
   * @example sdkSeg.method('tools/call') → { kind: 'method', value: 'tools/call' }
   */
  method: (value: string): Segment => ({ kind: 'method', value }),

  /**
   * Method any (MCP alias): [method:*] after [format:mcp]
   * @example sdkSeg.methodAny() → { kind: 'method_any' }
   */
  methodAny: (): Segment => ({ kind: 'method_any' }),

  /**
   * Method value (MCP alias): [method] after [format:mcp]
   * @example sdkSeg.methodValue() → { kind: 'method_value' }
   */
  methodValue: (): Segment => ({ kind: 'method_value' }),
} as const;

/**
 * Create alternation segment: ['a'|'b'], [format:json|xml], [i:'header'|'authorization'], etc.
 *
 * Per SDK spec, alternation structure is:
 * { kind: 'alts', alts: [{ segment: Segment, caseless: boolean }, ...] }
 *
 * @param segments - Array of segment choices (must be non-empty)
 * @param caseless - Optional array of caseless flags per segment (for i: prefix)
 * @returns Alternation segment or single segment if length === 1
 * @throws {Error} If segments array is empty (would create empty_union error from SDK)
 *
 * @example
 * ```typescript
 * // Single format → direct segment
 * sdkAlts([sdkSeg.format('json')]) → { kind: 'content', name: 'json' }
 *
 * // Multiple formats → alternation
 * sdkAlts([sdkSeg.format('json'), sdkSeg.format('xml')])
 * → { kind: 'alts', alts: [
 *     { segment: { kind: 'content', name: 'json' }, caseless: false },
 *     { segment: { kind: 'content', name: 'xml' }, caseless: false }
 *   ]}
 *
 * // Caseless alternation: [i:'Authorization'|'Cookie']
 * sdkAlts([sdkSeg.key('Authorization'), sdkSeg.key('Cookie')], [true, true])
 * → { kind: 'alts', alts: [
 *     { segment: { kind: 'key', value: 'Authorization' }, caseless: true },
 *     { segment: { kind: 'key', value: 'Cookie' }, caseless: true }
 *   ]}
 * ```
 */
export function sdkAlts(segments: Segment[], caseless: boolean[] = []): Segment {
  // Validate non-empty array (per point-sdk.md render() refuses empty_union)
  if (segments.length === 0) {
    throw new Error('sdkAlts: segments array cannot be empty (would produce empty_union error)');
  }

  // Single segment - return direct (caseless flag goes on the segment itself, not in alts wrapper)
  if (segments.length === 1) {
    return segments[0];
  }

  // Multiple segments - build alternation structure per SDK spec
  return {
    kind: 'alts',
    alts: segments.map((seg, i) => ({
      segment: seg,
      caseless: caseless[i] ?? false,
    })),
  };
}

/**
 * Combine multiple choices into appropriate segment format
 *
 * Replaces legacy combine() function with SDK-compatible version.
 *
 * @param kind - Segment kind ('format', 'encoding', 'key', etc.)
 * @param names - Array of values to combine (must be non-empty)
 * @param caseless - Optional array of caseless flags per name (for i: prefix)
 * @returns Single segment or alternation segment
 * @throws {Error} If names array is empty (would create empty_union error from SDK)
 *
 * @example
 * ```typescript
 * // Single choice → direct segment
 * sdkCombine('format', ['json']) → { kind: 'content', name: 'json' }
 *
 * // Multiple choices → alternation with correct structure
 * sdkCombine('format', ['json', 'xml'])
 * → { kind: 'alts', alts: [{ segment: {...}, caseless: false }, ...] }
 *
 * // Caseless keys: [i:'authorization'|'cookie']
 * sdkCombine('key', ['authorization', 'cookie'], [true, true])
 * ```
 */
export function sdkCombine(kind: string, names: string[], caseless?: boolean[]): Segment {
  if (names.length === 0) {
    throw new Error('sdkCombine: names array cannot be empty (would produce empty_union error)');
  }

  if (names.length === 1) {
    const name = names[0];
    // Single choice - return direct segment
    switch (kind) {
      case 'format':
      case 'encoding':
        return sdkSeg.format(name); // Both use content kind
      case 'key':
        return sdkSeg.key(name);
      case 'attr':
        return sdkSeg.attr(name);
      default:
        return sdkSeg.key(name); // Fallback to key
    }
  }

  // Multiple choices - create alternation with caseless support
  const members = names.map(name => {
    switch (kind) {
      case 'format':
      case 'encoding':
        return sdkSeg.format(name);
      case 'key':
        return sdkSeg.key(name);
      case 'attr':
        return sdkSeg.attr(name);
      default:
        return sdkSeg.key(name);
    }
  });

  return sdkAlts(members, caseless);
}
