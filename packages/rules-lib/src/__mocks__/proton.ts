/**
 * Mock implementation of proton SDK for unit tests
 *
 * Returns canonical form without actual WASM compilation.
 * Use for fast unit tests - integration tests should use real SDK.
 *
 * Segment kinds and field names match the real SDK (proton-new-js/index.d.ts).
 *
 * @packageDocumentation
 */

import type {
  CheckOptions,
  CheckResult,
  Choices,
  CompleteOptions,
  Completion,
  CompletionItem,
  Parsed,
  Proton,
  ProtonPoint,
  RuleContext,
  Segment,
  SegmentCheck,
  Step,
  VersionInfo,
  Words,
} from '../proton/types';

/**
 * Mock point validation - returns canonical form
 *
 * Accepts any well-formed bracket pattern (not just http/format/encoding).
 */
function mockCheck(point: string, options?: CheckOptions): CheckResult {
  const trimmed = point.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: {
        message: 'Empty point',
        layer: 'grammar',
        span: [0, 0],
        code: 'empty_point',
        params: {},
        fixes: [],
        incomplete: true,
      },
    };
  }

  // Detect incomplete brackets
  const openBrackets = (trimmed.match(/\[/g) || []).length;
  const closeBrackets = (trimmed.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    return {
      ok: false,
      error: {
        message: 'Unclosed bracket',
        layer: 'grammar',
        span: [trimmed.lastIndexOf('['), trimmed.length],
        code: 'unclosed_bracket',
        params: {},
        fixes: [],
        incomplete: true,
      },
    };
  }

  // Basic validation - must contain at least one bracket
  if (!trimmed.includes('[')) {
    return {
      ok: false,
      error: {
        message: 'Expected step',
        layer: 'grammar',
        span: [0, trimmed.length],
        code: 'expected_step',
        params: {},
        fixes: [],
        incomplete: false,
      },
    };
  }

  // Simple canonicalization: strip whitespace, lowercase tag names
  const canonical = trimmed
    .replace(/\s+/g, '')
    .replace(/\[(\w+):/g, (_, name) => `[${name.toLowerCase()}:`);

  return {
    ok: true,
    canonical,
    exact: !canonical.includes('*') && !canonical.includes('..'),
  };
}

/**
 * Mock autocomplete - returns basic completions
 */
function mockComplete(point: string, cursor: number, options?: CompleteOptions): Completion {
  const beforeCursor = point.slice(0, cursor);

  // If at empty position or after [, suggest classes
  if (!beforeCursor.trim() || beforeCursor.trim().endsWith('[')) {
    const items: CompletionItem[] = [
      {
        kind: 'class',
        insert: 'http:',
        label: 'http',
        detail: 'HTTP request class',
        caret: 5,
        open: true,
        category: 'http',
        source: 'grammar',
        key: null,
      },
      {
        kind: 'class',
        insert: 'format:json',
        label: 'format:json',
        detail: 'JSON format',
        caret: 12,
        open: true,
        category: 'format',
        source: 'grammar',
        key: null,
      },
    ];

    return {
      replace: [cursor, cursor],
      items,
      parent: '',
      keySlot: false,
      query: null,
      truncated: false,
      error: null,
    };
  }

  // If after colon, suggest members/keys
  if (beforeCursor.endsWith(':')) {
    const items: CompletionItem[] = [
      {
        kind: 'member',
        insert: 'header',
        label: 'header',
        detail: 'HTTP header',
        caret: 6,
        open: true,
        category: 'http',
        source: 'grammar',
        key: null,
      },
      {
        kind: 'key',
        insert: 'body',
        label: 'body',
        detail: 'Request body',
        caret: 4,
        open: false,
        category: 'http',
        source: 'grammar',
        key: 'body',
      },
    ];

    return {
      replace: [cursor, cursor],
      items,
      parent: beforeCursor,
      keySlot: true,
      query: '',
      truncated: false,
      error: null,
    };
  }

  // Default: no completions
  return {
    replace: [cursor, cursor],
    items: [],
    parent: beforeCursor,
    keySlot: false,
    query: null,
    truncated: false,
    error: null,
  };
}

/**
 * Mock parse - returns Parsed[] with real segment kinds and spans
 */
function mockParse(point: string): Parsed[] {
  const segments: Parsed[] = [];
  const stepPattern = /\[([^\]]*)\]/g;
  let match: RegExpExecArray | null;

  while ((match = stepPattern.exec(point)) !== null) {
    const inner = match[1] ?? '';
    const span: [number, number] = [match.index, match.index + match[0].length];

    // Parse [native:word] patterns
    const nativeMatch = inner.match(/^(http|sse):(\w+)$/);
    if (nativeMatch) {
      segments.push({ kind: 'native', value: (nativeMatch[2] ?? '') as any, span });
      continue;
    }

    // Parse [format:name] or [encoding:name]
    const contentMatch = inner.match(/^(format|encoding):(\w+)$/);
    if (contentMatch) {
      segments.push({ kind: 'content', name: contentMatch[2] as any, span });
      continue;
    }

    // Parse ['key'] or [key]
    const keyMatch = inner.match(/^'([^']*)'$/);
    if (keyMatch) {
      segments.push({ kind: 'key', value: keyMatch[1] ?? '', span });
      continue;
    }

    // Parse [attr:'value']
    const attrMatch = inner.match(/^attr:'([^']*)'$/);
    if (attrMatch) {
      segments.push({ kind: 'typed', value: attrMatch[1] ?? '', span });
      continue;
    }

    // Parse [role:name] or [role:value]
    const roleMatch = inner.match(/^role:(name|value)$/);
    if (roleMatch) {
      segments.push({ kind: 'name', value: roleMatch[1] ?? '', span });
      continue;
    }

    // Parse numeric index [0], [42]
    if (/^\d+$/.test(inner)) {
      segments.push({ kind: 'index', index: Number.parseInt(inner, 10), span });
      continue;
    }

    // Fallback: treat as key
    segments.push({ kind: 'key', value: inner, span });
  }

  return segments;
}

/**
 * Mock render - converts segments back to canonical form
 *
 * Handles all real SDK segment kinds: native, key, name, typed, typed_name,
 * content, combined_key, wildcard, index, dup_index, dup_all, dup_any, alts, root.
 */
function mockRender(segments: readonly Segment[]): string {
  if (segments.length === 0) return 'flow';

  return segments
    .map((seg: any) => {
      switch (seg.kind) {
        case 'native':
          return `[${seg.value}]`;
        case 'key':
          return `['${seg.value}']`;
        case 'name':
          return `['${seg.value}'][role:name]`;
        case 'typed':
          return `[attr:'${seg.value}']`;
        case 'typed_name':
          return `[attr:'${seg.value}'][role:name]`;
        case 'content':
          return `[format:${seg.name}]`;
        case 'combined_key':
          return `['${seg.value}'][dup,joined:'${seg.separator}']`;
        case 'wildcard': {
          const kinds = seg.kinds?.join('|') ?? '';
          const quant =
            { one: '*', zero_or_one: '?', zero_or_more: '**', one_or_more: '+' }[
              seg.quant as string
            ] ?? '*';
          const prefix = kinds ? `${kinds}:` : '';
          const role = seg.role ? `[role:${seg.role}]` : '';
          return `[${prefix}${quant}]${role}`;
        }
        case 'index':
          return `[${seg.index}]`;
        case 'dup_index':
          return `[dup:${seg.index}]`;
        case 'dup_all':
          return '[dup:all]';
        case 'dup_any':
          return '[dup:any]';
        case 'alts':
          return `[${(seg.alts as any[]).map((a: any) => mockRender([a.segment])).join('|')}]`;
        case 'root':
          return '';
        default:
          return '';
      }
    })
    .join('');
}

/**
 * Mock steps - splits point into editing steps
 */
function mockSteps(point: string): { steps: Step[]; error: null } {
  const steps: Step[] = [];
  const stepPattern = /\[[^\]]*\]?/g;
  let match: RegExpExecArray | null;

  while ((match = stepPattern.exec(point)) !== null) {
    const text = match[0];
    steps.push({
      span: [match.index, match.index + text.length],
      text,
      closed: text.endsWith(']'),
    });
  }

  return { steps, error: null };
}

/**
 * Real natives per context (from SDK vocabulary)
 */
const NATIVES_BY_CONTEXT: Record<string, string[]> = {
  http_request: ['method', 'proto', 'url', 'path', 'query', 'header', 'body'],
  http_response: ['method', 'proto', 'url', 'path', 'query', 'header', 'body', 'status'],
  grpc_request: [],
  grpc_response: [],
};

/**
 * Mock vocabulary - returns real SDK field names and values
 */
function mockVocabulary(context?: RuleContext): Words {
  const natives = context
    ? (NATIVES_BY_CONTEXT[context] ?? [])
    : ['method', 'proto', 'url', 'path', 'query', 'header', 'body', 'status', 'host', 'scheme'];

  return {
    natives: natives as any[],
    formats: ['json', 'xml', 'form', 'multipart', 'cookie', 'auth', 'jwt', 'protobuf'] as any[],
    encodings: ['base64', 'percent', 'gzip', 'deflate', 'brotli'] as any[],
    kinds: ['arr', 'attr', 'encoding', 'format', 'http', 'key'] as any[],
    quantifiers: ['*', '**', '?', '+'] as any[],
    roles: ['name', 'value'] as any[],
    dups: ['all', 'any'] as any[],
  };
}

/**
 * Mock checkSegments - segment-based validation (returns SegmentCheck)
 */
function mockCheckSegments(segments: readonly Segment[], options?: CheckOptions): SegmentCheck {
  const canonical = mockRender(segments);
  if (!canonical || canonical === 'flow') {
    return {
      ok: false,
      error: {
        message: 'Empty point',
        layer: 'grammar',
        segment: null,
        code: 'empty_point',
        params: {},
        fixes: [],
        incomplete: true,
      },
    };
  }
  return { ok: true, canonical, exact: !canonical.includes('*') };
}

/**
 * Mock next - segment-based completions (returns Choices)
 */
function mockNext(segments: readonly Segment[], at?: number, options?: CompleteOptions): Choices {
  return {
    items: [],
    parent: segments.length > 0 ? mockRender(segments) : null,
    keySlot: false,
    truncated: false,
    error: null,
  };
}

const mockPoint: ProtonPoint = {
  check: mockCheck,
  complete: mockComplete,
  parse: mockParse,
  render: mockRender,
  checkSegments: mockCheckSegments,
  next: mockNext,
  steps: mockSteps,
  vocabulary: mockVocabulary,
};

const mockProton: Proton = {
  point: mockPoint,
  version: (): VersionInfo => ({
    crate: '0.0.0-mock',
    ruleset_format: '0.10.3',
    canonical: 1,
    commit: 'mock-commit',
  }),
};

/**
 * Mock initialization - returns mock instance immediately
 */
export async function initProton(wasmUrl?: string): Promise<Proton> {
  // Simulate async load with minimal delay
  await new Promise(resolve => setTimeout(resolve, 1));
  return mockProton;
}

/**
 * Get mock instance synchronously for tests
 */
export function getMockProton(): Proton {
  return mockProton;
}

export default mockProton;
