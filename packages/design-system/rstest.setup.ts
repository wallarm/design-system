import { afterEach, expect, rs } from '@rstest/core';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import type { Proton } from '@wallarm-org/rules-lib';

// jest-dom ships a Vitest-only entry (`@testing-library/jest-dom/vitest`), so
// register its matchers on Rstest's `expect` directly. Their types come from
// `src/testUtils/rstest-env.d.ts`.
expect.extend(matchers);

// Testing Library only auto-registers cleanup when it finds a global `afterEach`
// at import time; unmount explicitly so the DOM never leaks between tests.
afterEach(() => {
  cleanup();
});

// Mock Proton SDK globally for all tests - uses mock implementation instead of WASM.
// This lightweight mock returns canonical form without actual WASM compilation.
// NOTE: Must be sync factory - rstest doesn't support async factories
rs.mock('@wallarm-org/rules-lib', () => {
  // Inline mock Proton instance - basic validation and canonicalization
  // Segment kinds and field names match real SDK (proton-new-js/index.d.ts).
  const renderSeg = (s: any): string => {
    switch (s.kind) {
      case 'native':
        return `[${s.value}]`;
      case 'key':
        return `['${s.value}']`;
      case 'name':
        return `['${s.value}'][role:name]`;
      case 'typed':
        return `[attr:'${s.value}']`;
      case 'typed_name':
        return `[attr:'${s.value}'][role:name]`;
      case 'content':
        return `[format:${s.name}]`;
      case 'combined_key':
        return `['${s.value}'][dup,joined:'${s.separator}']`;
      case 'wildcard': {
        const kinds = s.kinds?.join('|') ?? '';
        const q =
          { one: '*', zero_or_one: '?', zero_or_more: '**', one_or_more: '+' }[s.quant as string] ??
          '*';
        return `[${kinds ? `${kinds}:` : ''}${q}]${s.role ? `[role:${s.role}]` : ''}`;
      }
      case 'index':
        return `[${s.index}]`;
      case 'dup_index':
        return `[dup:${s.index}]`;
      case 'dup_all':
        return '[dup:all]';
      case 'dup_any':
        return '[dup:any]';
      case 'alts':
        return `[${(s.alts as any[]).map((a: any) => renderSeg(a.segment)).join('|')}]`;
      case 'root':
        return '';
      default:
        return '';
    }
  };

  const mockProton: Proton = {
    point: {
      check: (point: string) => {
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
        const canonical = trimmed.replace(/\s+/g, '');
        return { ok: true, canonical, exact: !canonical.includes('*') };
      },
      complete: () => ({
        replace: [0, 0],
        items: [],
        parent: '',
        keySlot: false,
        query: null,
        truncated: false,
        error: null,
      }),
      parse: () => [],
      render: (segments: any[]) => {
        if (segments.length === 0) return 'flow';
        return segments.map(renderSeg).join('');
      },
      checkSegments: (segments: any[]) => {
        const canonical = segments.map(renderSeg).join('');
        return { ok: true, canonical, exact: true };
      },
      next: () => ({ items: [], parent: null, keySlot: false, truncated: false, error: null }),
      steps: () => ({ steps: [], error: null }),
      vocabulary: () => ({
        natives: ['method', 'proto', 'url', 'path', 'query', 'header', 'body'],
        formats: ['json', 'xml', 'form', 'multipart', 'cookie', 'auth', 'jwt', 'protobuf'],
        encodings: ['base64', 'percent', 'gzip', 'deflate', 'brotli'],
        kinds: ['arr', 'attr', 'encoding', 'format', 'http', 'key'],
        quantifiers: ['*', '**', '?', '+'],
        roles: ['name', 'value'],
        dups: ['all', 'any'],
      }),
    },
    version: () => ({
      crate: '0.0.0-mock',
      ruleset_format: '0.10.3',
      canonical: 1,
      commit: 'mock',
    }),
  };

  return {
    // Proton SDK
    useProton: () => [mockProton, null, rs.fn()],
    initProton: async () => mockProton,

    // Sample message generation
    sampleMessage: () => [],

    // Point utilities
    PARSER_VOCABULARY: {},
    STATIC_KEYS: {},
    staticKeysProvider: () => [],

    // Segment helpers
    ENCODINGS: {},
    FORMATS: {},
    headerSeg: (value: string) => ({ kind: 'key', value }),
    keySeg: (value: string) => ({ kind: 'key', value }),
    nativeSeg: (value: string) => ({ kind: 'native', value }),
    seg: (text: string, kind: string, label: string, props?: any) => ({
      kind,
      text,
      label,
      ...props,
    }),

    // UI helpers
    describe: (segments: any[]) => {
      // Build human-readable sentence from segment labels with › separator
      if (!segments || segments.length === 0) return '';
      return segments
        .map(s => s.label || s.value || '')
        .filter(Boolean)
        .join(' › ');
    },
    checkOf: () => null,
    isCaseFixed: () => false,
    isKeyStep: () => false,
    isPositionStep: () => false,
    listTitle: () => '',
    nameRows: () => [],
    nounOf: () => '',
    fuzzyScore: () => 0,
    pickByNumber: () => [],
    takesValue: () => false,
    conditionLabel: () => '',
    CONDITIONS: [],
    PICK_LABELS: {},

    // Point validation
    canonicalizePoint: (point: string) => point,
    isExactPoint: () => false,
    validatePoint: () => ({ ok: true, canonical: '', exact: true }),

    // RuleBuilder models
    ACTION_KINDS: [],
    ATTACK_TYPES: [],
    SIGNAL_TYPES: [],
    DUPLICATE_CONTAINERS: [],
    EMPTY_FIELD_VALUE: '',
    LIMITS: {},
    TARGET_FOR: {},
    actionProblems: () => [],
    conditionProblems: () => [],
    fieldComplete: () => false,
    fromProtonAction: (action: any) => action,
    fromProtonCondition: (condition: any) => condition,
    labelOf: () => '',
    newAction: (kind: string) => ({ kind }),
    newField: () => ({ type: 'point' }),
    newGroup: (operator: string) => ({ type: 'group', operator, children: [] }),
    nodeId: () => 'mock-id',
    toProtonAction: (action: any) => action,
    toProtonCondition: (condition: any) => condition,

    // Check helpers
    isPairingCheck: () => false,
    isPointCheck: () => false,
    isSampleCheck: () => false,

    // Rule validation
    validateRule: () => ({ ok: true, errors: [] }),
  };
});

// Mock UI helpers from '@wallarm-org/rules-lib/ui'
rs.mock('@wallarm-org/rules-lib/ui', () => ({
  // Re-export types
  CONDITIONS: [],
  PICK_LABELS: {},

  // UI helper functions
  describe: (segments: any[]) => {
    // Build human-readable sentence from segment labels with › separator
    if (!segments || segments.length === 0) return '';
    return segments
      .map(s => s.label || s.value || '')
      .filter(Boolean)
      .join(' › ');
  },
  checkOf: () => null,
  isCaseFixed: () => false,
  isKeyStep: () => false,
  isPositionStep: () => false,
  listTitle: () => '',
  nameRows: () => [],
  nounOf: () => '',
  fuzzyScore: () => 0,
  pickByNumber: () => [],
  takesValue: () => false,
  conditionLabel: () => '',
}));

// Element is absent under `@rstest-environment node` (SSR tests).
if (typeof Element !== 'undefined') {
  // Mock scrollIntoView which is not implemented in jsdom
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  Element.prototype.scrollIntoView = () => {};

  // Mock scrollTo which jsdom omits; Zag UI's select uses it to reset the
  // content scroll position when value changes.
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  Element.prototype.scrollTo = (() => {}) as Element['scrollTo'];

  // Mock scrollBy which jsdom omits; the Table horizontal scroll controls call it.
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  Element.prototype.scrollBy = (() => {}) as Element['scrollBy'];
}

// Mock IntersectionObserver which is not implemented in jsdom
global.IntersectionObserver = class IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds: readonly number[] = [0];
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  observe() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  unobserve() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver which is not implemented in jsdom
global.ResizeObserver = class ResizeObserver {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  observe() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  unobserve() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
  disconnect() {}
};

// jsdom omits visualViewport; @zag-js/tour reads it during boundary tracking
// and crashes after unmount in unrelated tests. Stub the minimum surface.
if (typeof window !== 'undefined' && !window.visualViewport) {
  (window as { visualViewport?: unknown }).visualViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
    // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
    addEventListener() {},
    // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op mock
    removeEventListener() {},
    dispatchEvent: () => true,
  };
}

// jsdom does not implement layout on Range. CodeMirror measures text through
// Range#getClientRects / getBoundingClientRect (coordsAtPos, cursor drawing,
// tooltips) and throws "getClientRects is not a function" without them.
// Stub zero-size rects; layout-dependent behaviour is covered by Playwright E2E.
if (typeof document !== 'undefined' && typeof document.createRange === 'function') {
  const emptyRect = (): DOMRect =>
    typeof DOMRect === 'function'
      ? new DOMRect(0, 0, 0, 0)
      : ({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => ({}),
        } as DOMRect);

  const emptyRectList = (): DOMRectList =>
    ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {
        yield* [] as DOMRect[];
      },
    }) as unknown as DOMRectList;

  const rangePrototype = Object.getPrototypeOf(document.createRange()) as Range;
  if (typeof rangePrototype.getClientRects !== 'function') {
    rangePrototype.getClientRects = emptyRectList;
  }
  if (typeof rangePrototype.getBoundingClientRect !== 'function') {
    rangePrototype.getBoundingClientRect = emptyRect;
  }
}

// user-event dispatches every jsdom pointer event at (0, 0). zag-js (>= 1.43.1) highlights a menu
// item on pointermove only while its focus-visible tracker reports the "pointer" modality, and that
// tracker ignores a move that repeats the last position — so once a focus change has flipped the
// modality to "virtual", a bare `user.click(menuItem)` never highlights the item and the click
// selects nothing. A real mouse always reaches a new position before it clicks: ahead of each move
// at the origin, show the document-level trackers a move at a fresh position. It is dispatched on
// `document`, so element handlers (React's root listener included) never see it. Registered at
// setup, so this capture listener runs before zag's own.
if (typeof document !== 'undefined' && typeof PointerEvent === 'function') {
  let freshPosition = 0;
  let dispatching = false;
  document.addEventListener(
    'pointermove',
    event => {
      if (dispatching || event.clientX !== 0 || event.clientY !== 0) return;
      dispatching = true;
      freshPosition += 1;
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: freshPosition,
          clientY: freshPosition,
          pointerType: event.pointerType,
        }),
      );
      dispatching = false;
    },
    true,
  );
}
