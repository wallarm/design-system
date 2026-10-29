/**
 * Mock implementation of proton SDK for unit tests
 *
 * Returns canonical form without actual WASM compilation.
 * Use for fast unit tests - integration tests should use real SDK.
 *
 * @packageDocumentation
 */

import type {
  CheckOptions,
  CheckResult,
  CompleteOptions,
  Completion,
  CompletionItem,
  Proton,
  ProtonPoint,
  RuleContext,
  Segment,
  Step,
  VersionInfo,
  Vocabulary,
} from '../proton/types';

/**
 * Mock point validation - returns canonical form
 *
 * Simple canonicalization rules for common patterns:
 * - Strips whitespace
 * - Lowercases class names
 * - Adds missing brackets
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
        incomplete: true,
      },
    };
  }

  // Basic validation - must contain at least one class
  if (!trimmed.includes('[')) {
    return {
      ok: false,
      error: {
        message: 'Expected class',
        layer: 'grammar',
        span: [0, trimmed.length],
        code: 'expected_class',
        params: {},
        incomplete: false,
      },
    };
  }

  // Simple canonicalization
  const canonical = trimmed
    .replace(/\s+/g, '') // Remove whitespace
    .replace(/\[(\w+):/g, (_, name) => `[${name.toLowerCase()}:`); // Lowercase class names

  // Check for invalid class names
  const classPattern = /\[([^:\]]+):/g;
  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: regex loop pattern
  while ((match = classPattern.exec(canonical)) !== null) {
    const className = match[1];
    const validClasses = ['http', 'format', 'encoding'];
    if (className && !validClasses.includes(className)) {
      return {
        ok: false,
        error: {
          message: `Unknown class: ${className}`,
          layer: 'tree',
          span: [match.index, match.index + match[0].length],
          code: 'unknown_class',
          params: { class: className },
          incomplete: false,
        },
      };
    }
  }

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
  const afterCursor = point.slice(cursor);

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
  };
}

/**
 * Mock parse - returns simplified segment structure
 */
function mockParse(point: string): Segment[] {
  const segments: Segment[] = [];

  // Very simple parser - split by ] and parse each class
  const parts = point.split(/\]/).filter(p => p.trim());

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Parse [class:member] pattern
    const match = trimmed.match(/\[?([^:]+):(.+)/);
    if (match) {
      segments.push({
        kind: 'class',
        class: match[1],
        member: match[2],
      });
    }
  }

  return segments;
}

/**
 * Mock render - converts segments back to canonical form
 */
function mockRender(segments: Segment[]): string {
  return segments
    .map(seg => {
      if (seg.kind === 'class') {
        return `[${seg.class}:${seg.member}]`;
      }
      return '';
    })
    .join('');
}

/**
 * Mock steps - splits point into editing steps
 */
function mockSteps(point: string): { steps: Step[]; error?: any } {
  const steps: Step[] = [];
  let pos = 0;

  // Split by ] and create steps
  const parts = point.split(/(\])/);

  for (const part of parts) {
    if (!part) continue;

    const span: [number, number] = [pos, pos + part.length];
    steps.push({
      span,
      text: part,
      closed: part.includes(']'),
    });

    pos += part.length;
  }

  return { steps };
}

/**
 * Mock vocabulary - returns basic grammar terms
 */
function mockVocabulary(context?: RuleContext): Vocabulary {
  return {
    natives: ['http', 'grpc'],
    formats: ['json', 'xml', 'html', 'base64'],
    encodings: ['utf-8', 'utf-16'],
    kinds: ['array', 'object', 'string', 'number'],
    quantifiers: ['*', '+', '?'],
    roles: ['header', 'body', 'cookie'],
    dupWords: ['all', 'any'],
  };
}

const mockPoint: ProtonPoint = {
  check: mockCheck,
  complete: mockComplete,
  parse: mockParse,
  render: mockRender,
  checkSegments: (segments: Segment[], options?: CheckOptions) => {
    const canonical = mockRender(segments);
    return mockCheck(canonical, options);
  },
  next: (segments: Segment[], at: number, options?: CompleteOptions) => {
    const point = mockRender(segments);
    const completion = mockComplete(point, at, options);
    return {
      items: completion.items,
      parent: completion.parent,
      keySlot: completion.keySlot,
      truncated: completion.truncated,
      error: completion.error,
    };
  },
  steps: mockSteps,
  vocabulary: mockVocabulary,
};

const mockProton: Proton = {
  point: mockPoint,
  version: () => ({
    crate: '0.0.0-mock',
    ruleset_format: '1.0.0',
    canonical: '1.0.0',
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
