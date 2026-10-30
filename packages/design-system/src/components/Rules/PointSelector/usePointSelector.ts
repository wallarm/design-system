import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// SDK types and API
import type { CompletionItem, Proton } from '@wallarm-org/rules-lib';
// UI helpers (not SDK grammar)
import {
  CONDITIONS,
  type ConditionType,
  checkOf,
  describe,
  fuzzyScore,
  isCaseFixed,
  isKeyStep,
  isPositionStep,
  listTitle,
  type NameRow,
  type NameStep,
  type NextOption,
  nameRows,
  nounOf,
  PICK_LABELS,
  type PickStep,
  pickByNumber,
  type Segment,
  takesValue,
} from '@wallarm-org/rules-lib/ui';
import {
  checkSegmentsDirectly,
  completePoint,
  completionToMenuRow,
  getNextSegmentOptions,
  normalizeSegment,
  renderSegments,
  sdkCombine,
  sdkSeg,
} from './sdkBridge';
import type { MenuRow, PointSelectorProps, PointSelectorStage, ValidationError } from './types';

const ALL = '*all';
const ANY = 'any';
/** The formats "All" ticks: every listed one except "Any format". */
const listed = (p: PickStep) => p.choices.filter(c => c !== ANY);

type Item =
  | {
      kind: 'option';
      row: MenuRow;
      option: NextOption & {
        dupModifier?: number | 'all' | 'any';
        roleModifier?: 'name' | 'value';
      };
    }
  | { kind: 'name'; row: MenuRow; name: NameRow }
  | { kind: 'pick'; row: MenuRow; choice: string };

interface UiState {
  stage: PointSelectorStage;
  query: string;
  highlight: number;
  menuOpen: boolean;
  nameStep: NameStep | null;
  nameIgnoreCase: boolean;
  pickStep: PickStep | null;
  picked: string[];
  conditionQuery: string;
  conditionHighlight: number;
  /** Bumped to move keyboard focus to `focusTarget`. */
  focusTick: number;
  focusTarget: 'bar' | 'name' | 'next' | 'condition' | 'value' | 'conditionChip';
  /** SDK validation error (may be incomplete or actual error) */
  sdkError: ValidationError | null;
  /** Valid prefix state (show info, not error) */
  incomplete: boolean;
  /** Canonical form feedback: null = no feedback, object = show info */
  canonicalInfo: { built: string; canonical: string } | null;
}

const isDigit = (key: string) => /^[0-9]$/.test(key);

/**
 * All interaction state of the point selector: the "where" step (bar, menu,
 * name and multi-select steps) and the "how to match" step. The grammar comes
 * from `pointGrammar`; this hook only turns it into rows and key handling.
 *
 * SDK Integration:
 * - Validates segments via SDK on each change
 * - Stores canonical form in value.canonical
 * - Falls back to custom validation if SDK not loaded
 */
export const usePointSelector = ({
  context,
  value,
  onChange,
  initialStage,
  pointOnly,
  proton,
  profile,
  keys,
  keysDebounceMs = 300,
  onShowKeyboardHelp,
}: PointSelectorProps & { proton: Proton | null; onShowKeyboardHelp?: () => void }) => {
  const segments = value.segments;

  // Async keys infrastructure with debounce and abort support
  const keysCache = useRef<Map<string, string[]>>(new Map());
  const inFlightFetches = useRef<Map<string, { promise: Promise<string[]>; abort: () => void }>>(
    new Map(),
  );
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [recomputeTick, setRecomputeTick] = useState(0);
  const triggerRecomplete = useCallback(() => {
    setLoadingKeys(false);
    setRecomputeTick(t => t + 1);
  }, []);

  // Full cache for SDK next() results by parent point (prevents redundant SDK calls)
  // Key: rendered point string (canonical form), Value: completion items
  // This is more comprehensive than single-item cache and survives navigation
  const nextCache = useRef<Map<string, CompletionItem[]>>(new Map());

  // Temporary cache for most recent setSegments() call optimization
  // When setSegments() calls SDK to check for auto-open, we cache the result
  // so the useMemo for menu rows can reuse it instead of calling SDK again
  const nextItemsRef = useRef<{ segments: typeof segments; items: CompletionItem[] } | null>(null);

  // Wrap keys provider to handle async with debounce and abort
  const syncKeysProvider = useMemo(() => {
    // Static array - pass through
    if (Array.isArray(keys)) {
      return keys;
    }

    // No keys provider
    if (!keys) {
      return undefined;
    }

    // Function provider - wrap to handle async with debounce (300ms) and abort
    const timeoutRefs = new Map<string, NodeJS.Timeout>();

    return (parent: string): string[] => {
      const cached = keysCache.current.get(parent);
      if (cached !== undefined) {
        return cached; // Return cached results
      }

      // Call provider
      const result = keys(parent);

      // Sync result - cache and return
      if (Array.isArray(result)) {
        keysCache.current.set(parent, result);
        return result;
      }

      // Async result (Promise)
      // Check if fetch already in progress (dedupe)
      const inFlight = inFlightFetches.current.get(parent);
      if (inFlight) {
        return []; // Fetch in progress, return empty array (loading state handled by loadingKeys)
      }

      // Clear existing timeout (debounce)
      const existingTimeout = timeoutRefs.get(parent);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Debounce: wait keysDebounceMs before fetching
      const timeout = setTimeout(() => {
        timeoutRefs.delete(parent);
        setLoadingKeys(true);

        // Create AbortController
        const controller = new AbortController();

        // Store in-flight fetch
        inFlightFetches.current.set(parent, {
          promise: result,
          abort: () => controller.abort(),
        });

        // Handle result
        result.then(
          fetchedKeys => {
            if (controller.signal.aborted) return;

            keysCache.current.set(parent, fetchedKeys);
            inFlightFetches.current.delete(parent);
            triggerRecomplete();
          },
          _error => {
            if (controller.signal.aborted) return;
            keysCache.current.set(parent, []);
            inFlightFetches.current.delete(parent);
            setLoadingKeys(false);
          },
        );
      }, keysDebounceMs);

      timeoutRefs.set(parent, timeout);

      return []; // Loading - return empty array (loading state handled by loadingKeys)
    };
  }, [keys, keysDebounceMs, triggerRecomplete]);

  const [ui, setUi] = useState<UiState>(() => ({
    stage: pointOnly ? 'point' : (initialStage ?? (value.condition ? 'value' : 'point')),
    query: '',
    highlight: 0,
    menuOpen: false,
    nameStep: null,
    nameIgnoreCase: false,
    pickStep: null,
    picked: [],
    conditionQuery: '',
    conditionHighlight: 0,
    focusTick: 0,
    focusTarget: value.condition ? 'value' : 'bar',
    sdkError: null,
    incomplete: false,
    canonicalInfo: null,
  }));

  // Cleanup: abort all in-flight fetches on unmount
  useEffect(() => {
    return () => {
      // Abort all in-flight key fetches
      for (const fetch of inFlightFetches.current.values()) {
        fetch.abort();
      }
      inFlightFetches.current.clear();
    };
  }, []);

  const patch = (p: Partial<UiState>) => setUi(s => ({ ...s, ...p }));
  const focus = (target: UiState['focusTarget'], p: Partial<UiState> = {}) =>
    setUi(s => ({ ...s, ...p, focusTarget: target, focusTick: s.focusTick + 1 }));
  const setSegments = (
    next: typeof segments,
    p: Partial<UiState> = {},
    target: UiState['focusTarget'] = 'bar',
  ) => {
    // Validate with SDK directly (no round-trip through point string)
    // SDK check handles all grammar validation - no need for custom validation
    const result = checkSegmentsDirectly(proton, next as any, {
      profile: profile ?? 'tree',
      context,
    });

    // Convert SDK result to ValidationError
    let sdkError: ValidationError | null = null;
    let canonical: string | undefined;
    let incomplete = false;
    let canonicalInfo: { built: string; canonical: string } | null = null;

    if (result.ok) {
      canonical = result.canonical;

      // Check for canonical form differences (wildcard folding, sorting, etc.)
      if (canonical && proton) {
        const built = renderSegments(proton, next as any);
        if (built !== canonical) {
          // User's point differs from canonical - show info message
          canonicalInfo = { built, canonical };
        }
      }

      // Note: Value profile validation is already done by checkSegmentsDirectly() above.
      // No need for additional isValuePoint() call - SDK has already validated the profile.
      // If profile is 'value' and result.ok is true, the point is guaranteed to be a value point.
      // Header case validation is also handled by SDK via 'tree' profile (error code: header_name_case).
    } else {
      incomplete = result.error.incomplete;
      const isTransportError = result.error.code === 'TRANSPORT_ERROR';

      sdkError = {
        code: result.error.code,
        message: result.error.message,
        layer: result.error.layer,
        span: result.error.span,
        incomplete,
        // Extract SDK fixes directly - SDK provides { label, replace: [start, end], insert }
        fixes: result.error.fixes?.map(f => ({
          label: f.label,
          replace: f.replace,
          insert: f.insert,
        })),
        transport: isTransportError,
      };
    }

    // Clear grammar error on successful addition, store SDK error state and canonical info
    const errorState = {
      sdkError,
      incomplete,
      canonicalInfo,
    };

    // Get current canonical version from SDK
    const canonicalVersion = proton ? parseInt(proton.version().canonical) : null;

    onChange({
      ...value,
      segments: next,
      canonical: canonical ?? null,
      canonicalVersion,
    });

    // When the only possible next question is a name ("Which header?"), ask it right away.
    let only: NameStep | null = null;
    if (target === 'bar' && proton) {
      // SDK path: get next completion items
      // Cache the result so the menu rows useMemo can reuse it (avoids duplicate SDK call)
      const nextItems = getNextSegmentOptions(
        proton,
        next,
        context,
        syncKeysProvider,
        profile ?? 'tree',
      );

      // Store in cache for useMemo reuse - comparison by reference is safe since
      // we just created 'next' in this function and it won't be reused
      nextItemsRef.current = { segments: next, items: nextItems };

      // Auto-open name step if there's exactly one template item that needs user input
      // Skip auto-open if we just added a concrete key (to show dup/role options first)
      const lastSeg = next[next.length - 1];
      const justAddedKey =
        lastSeg &&
        (lastSeg.kind === 'key' || lastSeg.kind === 'attr') &&
        'value' in lastSeg &&
        !('role' in lastSeg);

      if (!justAddedKey && nextItems.length === 1 && nextItems[0]?.open) {
        const item = nextItems[0];

        // Determine placeholder and hints based on category
        let placeholder = `Enter ${item.label.toLowerCase()}`;
        let allowsCase = false;
        let showsStarHint = false;

        switch (item.category) {
          case 'key':
            // Keys: allow case-insensitive matching, show wildcard hints
            allowsCase = true;
            showsStarHint = true;
            break;

          case 'attr':
            // XML attributes: start with @, no case variation
            placeholder = item.label.includes('@')
              ? 'Enter attribute name (@id, @class, ...)'
              : 'Enter attribute';
            allowsCase = false;
            showsStarHint = false;
            break;

          case 'method':
            // MCP methods: method names like 'tools/call'
            placeholder = 'Enter method name (e.g., tools/call)';
            allowsCase = false;
            showsStarHint = false;
            break;

          default:
            // Other categories: use SDK label
            allowsCase = false;
            showsStarHint = false;
        }

        // Convert SDK template item to NameStep
        only = {
          label: item.label,
          placeholder,
          segs: [], // Template segments will be created when user confirms
          allowsCase,
          showsStarHint,
          sdkItem: item, // Keep reference to original SDK item
        } as any;
      }
    }

    focus(only ? 'name' : target, {
      query: '',
      highlight: 0,
      nameStep: only,
      nameIgnoreCase: false,
      pickStep: null,
      picked: [],
      ...errorState,
      ...p,
    });
  };

  // Get next options from SDK completion
  // Two-level caching strategy:
  // 1. nextItemsRef: temporary cache for setSegments() call optimization
  // 2. nextCache: full cache by parent point for navigation history
  // biome-ignore lint/correctness/useExhaustiveDependencies: recomputeTick intentionally triggers recomputation when async keys load
  const sdkCompletionItems = useMemo(() => {
    if (!proton) return [];

    // Level 1: Check temporary cache from most recent setSegments() call
    // Reference equality check is safe: setSegments() creates a new array each time
    if (nextItemsRef.current?.segments === segments) {
      // Guard: ensure cached items is an array
      const items = nextItemsRef.current.items;
      return Array.isArray(items) ? items : [];
    }

    // Level 2: Check full cache by parent point
    const parentPoint = renderSegments(proton, segments);
    const cached = nextCache.current.get(parentPoint);
    if (cached !== undefined) {
      // Guard: ensure cached value is an array
      const items = Array.isArray(cached) ? cached : [];
      // Update temporary cache for reference equality checks
      nextItemsRef.current = { segments, items };
      return items;
    }

    // Cache miss - fetch from SDK
    const items = getNextSegmentOptions(
      proton,
      segments,
      context,
      syncKeysProvider,
      profile ?? 'tree',
    );

    // Update both caches
    nextCache.current.set(parentPoint, items);
    nextItemsRef.current = { segments, items };

    return items;
  }, [segments, context, proton, syncKeysProvider, profile, recomputeTick]);

  const { query, nameStep, pickStep, picked } = ui;
  const numericQuery = !nameStep && /^\d+$/.test(query);
  const pointStage = ui.stage === 'point';

  let items: Item[] = [];
  let status = loadingKeys ? 'Loading keys...' : '';
  if (pointStage && pickStep) {
    const all: Item = {
      kind: 'pick',
      choice: ALL,
      row: {
        id: ALL,
        number: 1,
        label: 'All',
        desc: listed(pickStep)
          .map(c => PICK_LABELS[c]?.[0] ?? c)
          .join(', '),
        checked: listed(pickStep).every(c => picked.includes(c)),
      },
    };
    const choices: Item[] = pickStep.choices.map((c, i) => ({
      kind: 'pick',
      choice: c,
      row: {
        id: c,
        number: i + 2,
        label: PICK_LABELS[c]?.[0] ?? c,
        desc: PICK_LABELS[c]?.[1] ?? '',
        checked: picked.includes(c),
      },
    }));
    items = [all, ...choices];
    if (query && !numericQuery)
      items = items.filter(it => fuzzyScore(query, `${it.row.label} ${it.row.id}`) > 0);
    if (!items.length) status = `Nothing here matches "${query.trim()}".`;
  } else if (pointStage && nameStep) {
    // Check if this is an SDK template item
    if ((nameStep as any).sdkItem && proton) {
      const sdkItem = (nameStep as any).sdkItem;

      // Construct partial point with query for SDK completion
      const currentPoint = renderSegments(proton, segments);
      let partialInsert = sdkItem.insert || '';

      // Replace template placeholders or append query
      if (partialInsert.includes('<cursor>')) {
        partialInsert = partialInsert.replace('<cursor>', query);
      } else if (partialInsert.endsWith("['")) {
        partialInsert = `['${query}`;
      } else {
        partialInsert = query;
      }

      const partialPoint = currentPoint + partialInsert;

      try {
        // Get SDK completions for the partial input
        const completion = completePoint(proton, partialPoint, partialPoint.length, {
          context,
          profile: profile ?? 'tree',
          keys: syncKeysProvider,
        });

        if (completion && !completion.error) {
          // Convert SDK completion items to name items
          items = completion.items.map((item, i) => {
            const nameRow = {
              id: item.key || `sdk-name-${i}`,
              label: item.label,
              desc: item.detail,
              segs: [], // Will be constructed when chosen
              custom: item.source === 'dictionary',
            };

            return {
              kind: 'name' as const,
              name: nameRow as any,
              row: {
                id: nameRow.id,
                label: nameRow.label,
                desc: nameRow.desc,
                custom: nameRow.custom,
              },
            };
          });

          status = items.length === 0 ? `No matches for "${query.trim()}".` : '';
        } else {
          // SDK returned error or no results, fall back to legacy
          const rows = nameRows(query, nameStep, true);
          status = rows.length === 0 ? `No matches for "${query.trim()}".` : '';
          items = rows.map(n => ({
            kind: 'name',
            name: n,
            row: { id: n.id, label: n.label, desc: n.desc, custom: (n as any).custom },
          }));
        }
      } catch {
        // SDK name completion failed, fall back to legacy nameRows
        const rows = nameRows(query, nameStep, true);
        status = rows.length === 0 ? `No matches for "${query.trim()}".` : '';
        items = rows.map(n => ({
          kind: 'name',
          name: n,
          row: { id: n.id, label: n.label, desc: n.desc, custom: (n as any).custom },
        }));
      }
    } else {
      // Legacy name completion
      const rows = nameRows(query, nameStep, true);
      status = rows.length === 0 ? `No matches for "${query.trim()}".` : '';
      items = rows.map(n => ({
        kind: 'name',
        name: n,
        row: { id: n.id, label: n.label, desc: n.desc, custom: (n as any).custom },
      }));
    }
  } else if (pointStage) {
    // Build items from SDK completion
    // SDK-based items
    // Guard against undefined sdkCompletionItems (shouldn't happen, but defensive)
    if (!sdkCompletionItems) {
      console.error('sdkCompletionItems is undefined - this should not happen');
      const errorPoint = renderSegments(proton, segments);
      const errorCheck = value.condition
        ? checkOf(value.condition, value.value, value.ignoreCase, errorPoint, context)
        : null;
      return {
        ui,
        point: errorPoint,
        check: errorCheck,
        sentence: '',
        reserved: false,
        sdkError: null,
        incomplete: false,
        canonicalInfo: null,
        loadingKeys,
        pointStage: true,
        menuOpen: false,
        menuTitle: 'Error',
        menuFooter: 'list' as const,
        rows: [],
        highlightedId: null,
        status: 'An error occurred',
        pendingLabel: '',
        nameStep: null,
        nameInputPlaceholder: '',
        nameAllowsCase: false,
        nameShowsStarHint: false,
        applyLabel: null,
        conditionStage: false,
        conditionRows: [],
        conditionHighlight: 0,
        conditionQuery: '',
        valueStage: false,
        allowsCase: false,
        showsIgnoreCase: false,
        showsStarHint: false,
        showsProfilePicker: false,
      };
    }
    let baseItems = sdkCompletionItems.map((item, i) => ({
      kind: 'option' as const,
      option: {
        label: item.label,
        desc: item.detail,
        name: undefined,
        pick: undefined,
        segs: [],
        done: false,
        sdkItem: item, // Store original SDK item for later use
      },
      row: completionToMenuRow(item, i),
    }));

    // Check if we just added a concrete key that can have dup/role modifiers
    const lastSeg = segments[segments.length - 1];
    const canHaveDup =
      lastSeg &&
      (lastSeg.kind === 'key' || lastSeg.kind === 'attr' || lastSeg.kind === 'index') &&
      !('ord' in lastSeg) && // Not already a dup segment
      !('separator' in lastSeg); // Not a joined segment

    const canHaveRole =
      lastSeg && (lastSeg.kind === 'key' || lastSeg.kind === 'attr') && !('role' in lastSeg); // Not already a role segment

    // Inject dup/role options at the beginning of the menu
    const dupRoleItems: Item[] = [];
    let offset = 0;

    if (canHaveRole && proton) {
      // Add role options: value (default), name
      dupRoleItems.push({
        kind: 'option',
        option: {
          label: 'Select key name',
          desc: "Address the key's own text (e.g., 'Authorization' → the word itself)",
          name: undefined,
          pick: undefined,
          segs: [],
          done: false,
          roleModifier: 'name' as const,
        },
        row: {
          id: 'role:name',
          number: ++offset,
          label: 'Key name [role:name]',
          desc: "The key's own text as data",
        },
      });
    }

    if (canHaveDup && proton) {
      // Add duplicate ordinal options
      dupRoleItems.push(
        {
          kind: 'option',
          option: {
            label: 'First duplicate',
            desc: 'The first occurrence of this key (0-indexed)',
            name: undefined,
            pick: undefined,
            segs: [],
            done: false,
            dupModifier: 0 as const,
          },
          row: {
            id: 'dup:0',
            number: ++offset,
            label: 'First duplicate [dup:0]',
            desc: 'Select the first occurrence',
          },
        },
        {
          kind: 'option',
          option: {
            label: 'Second duplicate',
            desc: 'The second occurrence of this key (1-indexed)',
            name: undefined,
            pick: undefined,
            segs: [],
            done: false,
            dupModifier: 1 as const,
          },
          row: {
            id: 'dup:1',
            number: ++offset,
            label: 'Second duplicate [dup:1]',
            desc: 'Select the second occurrence',
          },
        },
        {
          kind: 'option',
          option: {
            label: 'Last duplicate',
            desc: 'The last occurrence of this key (negative index)',
            name: undefined,
            pick: undefined,
            segs: [],
            done: false,
            dupModifier: -1 as const,
          },
          row: {
            id: 'dup:-1',
            number: ++offset,
            label: 'Last duplicate [dup:-1]',
            desc: 'Select the last occurrence',
          },
        },
        {
          kind: 'option',
          option: {
            label: 'All duplicates',
            desc: 'Every occurrence of this key (universal quantifier)',
            name: undefined,
            pick: undefined,
            segs: [],
            done: false,
            dupModifier: 'all' as const,
          },
          row: {
            id: 'dup:all',
            number: ++offset,
            label: 'All duplicates [dup:all]',
            desc: 'All occurrences must satisfy',
          },
        },
        {
          kind: 'option',
          option: {
            label: 'Any duplicate',
            desc: 'Any occurrence of this key (default behavior)',
            name: undefined,
            pick: undefined,
            segs: [],
            done: false,
            dupModifier: 'any' as const,
          },
          row: {
            id: 'dup:any',
            number: ++offset,
            label: 'Any duplicate [dup:any]',
            desc: 'Default: match any occurrence',
          },
        },
      );
    }

    // Renumber base items after dup/role items
    baseItems = baseItems.map((it, i) => ({
      ...it,
      row: { ...it.row, number: i + offset < 9 ? i + offset + 1 : undefined },
    }));

    items = [...dupRoleItems, ...baseItems];

    // Filter by query if present
    if (query && !numericQuery) {
      items = items
        .map(it => ({ it, score: fuzzyScore(query, `${it.row.label} ${it.row.desc}`) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.it);

      // Type-ahead auto-open name step: if main menu is empty but there's a template item,
      // try filtering its name step directly
      if (!items.length && proton) {
        const templateItem = sdkCompletionItems.find(item => item.open);
        if (templateItem) {
          // Construct partial point with query for SDK completion
          const currentPoint = renderSegments(proton, segments);
          let partialInsert = templateItem.insert || '';

          // Replace template placeholders or append query
          if (partialInsert.includes('<cursor>')) {
            partialInsert = partialInsert.replace('<cursor>', query);
          } else if (partialInsert.endsWith("['")) {
            partialInsert = `['${query}`;
          } else {
            partialInsert = query;
          }

          const partialPoint = currentPoint + partialInsert;

          try {
            // Get SDK completions for the partial input
            const completion = completePoint(proton, partialPoint, partialPoint.length, {
              context,
              profile: profile ?? 'tree',
              keys: syncKeysProvider,
            });

            if (completion && !completion.error && completion.items.length > 0) {
              // Convert SDK completion items to name items with descriptive prefix
              items = completion.items
                .slice(0, 1)
                .filter(item => item.source === 'dictionary')
                .map((item, i) => {
                  const nameRow = {
                    id: item.key || `sdk-typed-${i}`,
                    label: item.label,
                    desc: `${templateItem.label}: ${item.detail}`,
                    segs: [], // Will be constructed when chosen
                    custom: true,
                  };

                  return {
                    kind: 'name' as const,
                    name: nameRow as any,
                    row: {
                      id: nameRow.id,
                      label: nameRow.label,
                      desc: nameRow.desc,
                      custom: nameRow.custom,
                    },
                  };
                });
            }
          } catch {
            // SDK completion failed - continue with empty items
          }
        }
      }

      if (!items.length) status = `Nothing here matches "${query.trim()}". Backspace to clear.`;
    }

    // Status messages
    const hasItems = sdkCompletionItems.length > 0;
    if (!hasItems && segments.length)
      status = 'Nothing more to choose here. Press Next to set the condition.';
    else if (segments.length > 0 && !query) status = 'Or press Next to set the condition.';
  }

  const highlight = numericQuery
    ? Math.min(Number.parseInt(query, 10) - 1, items.length - 1)
    : Math.min(ui.highlight, Math.max(0, items.length - 1));

  const allOn = !!pickStep && listed(pickStep).every(c => picked.includes(c));
  const toggle = (choice: string) => {
    if (!pickStep) return;
    // "Any format" stands alone; "All" ticks every listed format.
    const next =
      choice === ALL
        ? allOn
          ? []
          : listed(pickStep)
        : picked.includes(choice)
          ? picked.filter(c => c !== choice)
          : choice === ANY
            ? [ANY]
            : [...picked.filter(c => c !== ANY), choice];
    focus('bar', { picked: next, query: '' });
  };
  const applyPick = (fallback?: string) => {
    if (!pickStep) return;
    const chosen = pickStep.choices.filter(c => picked.includes(c));
    const use = chosen.length
      ? chosen
      : fallback === ALL
        ? listed(pickStep)
        : fallback
          ? [fallback]
          : [];
    if (!use.length) return;
    setSegments([...segments, sdkCombine(pickStep.kind, use)], { menuOpen: true });
  };

  const goMatch = () => {
    if (!segments.length) return;
    // An action's target has no condition: finishing step 1 just closes the menu.
    if (pointOnly) {
      patch({ menuOpen: false, nameStep: null, pickStep: null });
      return;
    }
    if (value.condition)
      focus('value', { stage: 'value', menuOpen: false, nameStep: null, pickStep: null });
    else
      focus('condition', {
        stage: 'condition',
        menuOpen: false,
        conditionQuery: '',
        conditionHighlight: 0,
      });
  };

  const choose = (item: Item | undefined) => {
    if (!item) return;
    if (item.kind === 'pick') return toggle(item.choice);

    // Handle name selection
    if (item.kind === 'name') {
      // Check if this is from an SDK template item (either in name step or auto-opened from main menu)
      const sdkItem = nameStep ? (nameStep as any).sdkItem : null;

      // Also check if this came from type-ahead auto-open (typed: prefix in id)
      const isTypedAhead =
        item.name.id.startsWith('typed:') || item.name.id.startsWith('sdk-typed-');

      if ((sdkItem || isTypedAhead) && proton) {
        // Use SDK to complete with the chosen name
        try {
          // For SDK template items, the name row's label is what user chose
          // We need to insert it and parse the result
          const currentPoint = renderSegments(proton, segments);
          const nameText = item.name.label;

          // For type-ahead auto-open, find the template item from SDK completion
          let insertTemplate = sdkItem?.insert || '';
          if (!insertTemplate && isTypedAhead) {
            const templateItem = sdkCompletionItems.find(i => i.open);
            insertTemplate = templateItem?.insert || '';
          }

          // Construct the completed segment based on category
          // Template items have insert like "['", "[attr:'", "[method:'", etc.
          const category = sdkItem?.category || (isTypedAhead ? 'key' : 'key');
          let insertText = insertTemplate;

          // Determine the correct prefix based on category
          let prefix = "['";
          if (category === 'attr') {
            prefix = "[attr:'";
          } else if (category === 'method') {
            prefix = "[method:'";
          } else if (category === 'key') {
            // Keys support case-insensitive matching
            prefix = ui.nameIgnoreCase ? "[i:'" : "['";
          }

          // Construct the full segment
          if (
            insertText.endsWith("['") ||
            insertText.endsWith("[attr:'") ||
            insertText.endsWith("[method:'")
          ) {
            insertText = `${prefix}${nameText}']`;
          } else if (insertText.includes('<cursor>')) {
            insertText = insertText.replace('<cursor>', nameText);
          } else {
            // Fallback: use the determined prefix
            insertText = `${prefix}${nameText}']`;
          }

          const pointAfterInsert = currentPoint + insertText;
          const newSegments = proton.point.parse(pointAfterInsert) as typeof segments;

          return setSegments(newSegments, { menuOpen: true });
        } catch {
          // Failed to apply SDK template name, fall back to legacy handling
        }
      }

      // Legacy name handling: use pre-built segments
      return setSegments([...segments, ...(item.name as any).segs], { menuOpen: true });
    }

    const o = item.option;

    // Handle duplicate ordinal modifiers
    if (o.dupModifier !== undefined && proton) {
      let dupSeg: Segment;

      if (o.dupModifier === 'all') {
        dupSeg = sdkSeg.dupAll();
      } else if (o.dupModifier === 'any') {
        dupSeg = sdkSeg.dupAny();
      } else {
        dupSeg = sdkSeg.dup(o.dupModifier);
      }

      // Normalize to ensure proper i32 types for WASM
      dupSeg = normalizeSegment(dupSeg);

      const newSegments = [...segments, dupSeg];
      return setSegments(newSegments, { menuOpen: true });
    }

    // Handle role modifiers
    if (o.roleModifier !== undefined && proton) {
      // Role modifiers modify the last segment, not add a new one
      const lastSeg = segments[segments.length - 1];
      if (lastSeg && (lastSeg.kind === 'key' || lastSeg.kind === 'attr')) {
        const modifiedSeg: Segment = { ...lastSeg, role: o.roleModifier };
        const newSegments = [...segments.slice(0, -1), modifiedSeg];
        return setSegments(newSegments, { menuOpen: true });
      }
      return;
    }

    // Handle SDK completion items (if sdkItem is present)
    if ((o as any).sdkItem && proton) {
      const sdkItem = (o as any).sdkItem;

      // Template item (open=true): needs user input, open name step
      if (sdkItem.open) {
        // Determine placeholder based on category
        let placeholder = `Enter ${sdkItem.label.toLowerCase()}`;
        if (sdkItem.category === 'attr') {
          placeholder = 'Enter attribute name (@id, @class, ...)';
        } else if (sdkItem.category === 'method') {
          placeholder = 'Enter method name (e.g., tools/call)';
        }

        const nameStep: NameStep = {
          label: sdkItem.label,
          placeholder,
          segs: [],
          allowsCase: sdkItem.category === 'key',
          showsStarHint: sdkItem.category === 'key',
          sdkItem, // Store reference to SDK item
        } as any;

        return focus('name', {
          nameStep,
          nameIgnoreCase: false,
          query: '',
          menuOpen: true,
        });
      }

      // Regular completion item: insert and continue
      if (sdkItem.insert) {
        try {
          // Parse the inserted text to get segments
          const pointAfterInsert = renderSegments(proton, segments) + sdkItem.insert;
          const newSegments = proton.point.parse(pointAfterInsert) as typeof segments;

          // Apply the new segments
          return setSegments(newSegments, { menuOpen: true });
        } catch {
          // Failed to parse SDK completion, fall back to menu close
          return;
        }
      }

      // SDK item without insert field - use label as complete segment
      // This handles completion items that represent complete segments (e.g., [http:method])
      try {
        const currentPoint = renderSegments(proton, segments);
        const pointWithLabel = currentPoint + sdkItem.label;
        const newSegments = proton.point.parse(pointWithLabel) as typeof segments;

        // Apply the new segments (labels will be computed on the fly in WhereBar)
        return setSegments(newSegments, { menuOpen: true });
      } catch {
        // Failed to parse SDK item label
        return;
      }
    }

    // Legacy option handling
    if (o.pick) return focus('bar', { pickStep: o.pick, picked: [], query: '', menuOpen: true });
    if (o.name)
      return focus('name', { nameStep: o.name, nameIgnoreCase: false, query: '', menuOpen: true });
    if (o.done) {
      // A final choice ("Inspect … every nested value", names only): go on to the condition.
      // CRITICAL: Must validate segments and get canonical form before storing
      const newSegments = [...segments, ...(o.segs ?? [])];

      // Validate with SDK to get canonical form
      const result = checkSegmentsDirectly(proton, newSegments as any, {
        profile: profile ?? 'tree',
        context,
      });

      const canonical = result.ok ? result.canonical : null;
      const canonicalVersion = proton ? parseInt(proton.version().canonical) : null;

      onChange({ ...value, segments: newSegments, canonical, canonicalVersion });
      return focus(value.condition ? 'value' : 'condition', {
        stage: value.condition ? 'value' : 'condition',
        menuOpen: false,
        query: '',
        nameStep: null,
        pickStep: null,
        conditionQuery: '',
        conditionHighlight: 0,
      });
    }
    return setSegments([...segments, ...(o.segs ?? [])], { menuOpen: true });
  };

  const back = () => {
    if (pickStep || nameStep)
      return focus('bar', { pickStep: null, nameStep: null, picked: [], query: '' });
    if (segments.length) setSegments(segments.slice(0, -1), { menuOpen: true });
  };

  /** A chip click keeps that step and reopens what can follow it: editing a
   *  stored point must not wipe it. Backspace removes steps. */
  const truncateTo = (index: number) =>
    setSegments(segments.slice(0, index + 1), { stage: 'point', menuOpen: true });

  const onNumber = (
    e: KeyboardEvent,
    typed: string,
    count: number,
    onWait: (q: string) => void,
    onPick: (i: number) => void,
  ) => {
    if (!isDigit(e.key) || !(typed === '' || /^\d+$/.test(typed))) return false;
    e.preventDefault();
    return pickByNumber(e.key, typed, count, onWait, onPick);
  };

  const handleBarKey = (e: KeyboardEvent<HTMLInputElement>) => {
    // Show keyboard help on '?' (works anytime, even with menu open)
    if (e.key === '?' && onShowKeyboardHelp) {
      e.preventDefault();
      onShowKeyboardHelp();
      return;
    }

    // Ctrl/Cmd+Enter or Tab: move to condition step (if segments exist)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (segments.length > 0) {
        goMatch();
      }
      // If no segments, do nothing (user must build point first)
      return;
    }

    if (e.key === 'Tab' && !e.shiftKey && !pickStep && segments.length > 0) {
      e.preventDefault();
      focus('next', { menuOpen: false });
      return;
    }
    if (pickStep) {
      if (
        onNumber(
          e,
          query,
          items.length,
          q => patch({ query: q }),
          i => items[i] && choose(items[i]),
        )
      )
        return;
      if (e.key === ' ') {
        e.preventDefault();
        const it = items[highlight];
        if (it?.kind === 'pick') toggle(it.choice);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const it = items[highlight];
        applyPick(it?.kind === 'pick' ? it.choice : undefined);
        return;
      }
    } else if (
      onNumber(
        e,
        query,
        items.length,
        q => patch({ query: q, menuOpen: true }),
        i => choose(items[i]),
      )
    ) {
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!ui.menuOpen) patch({ menuOpen: true });
      else if (items.length)
        patch({
          highlight: Math.min(highlight + 1, items.length - 1),
          query: numericQuery ? '' : query,
        });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      patch({ highlight: Math.max(highlight - 1, 0), query: numericQuery ? '' : query });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!sdkCompletionItems.length && segments.length && !pickStep) goMatch();
      else if (!pickStep) choose(items[highlight]);
    } else if ((e.key === 'Backspace' && query === '') || (e.key === 'Escape' && pickStep)) {
      e.preventDefault();
      back();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Escape stack: first closes menu, second blurs input
      if (ui.menuOpen) {
        patch({ menuOpen: false, query: '', highlight: 0 });
      } else {
        // Blur the input (second Esc)
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  const handleNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    // The input sits inside the menu: keep the menu's own typeahead out of it.
    e.stopPropagation();

    // Show keyboard help on '?' (works anytime)
    if (e.key === '?' && onShowKeyboardHelp) {
      e.preventDefault();
      onShowKeyboardHelp();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      patch({ highlight: Math.min(highlight + 1, Math.max(0, items.length - 1)) });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      patch({ highlight: Math.max(highlight - 1, 0) });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(items[highlight]);
    } else if ((e.key === 'Backspace' && query === '') || e.key === 'Escape') {
      e.preventDefault();
      back();
    } else if (
      e.altKey &&
      e.code === 'KeyC' &&
      nameStep &&
      isKeyStep(nameStep) &&
      !isCaseFixed(nameStep)
    ) {
      e.preventDefault();
      patch({ nameIgnoreCase: !ui.nameIgnoreCase });
    }
  };

  /* --- how to match --- */
  const cq = ui.conditionQuery;
  const numericCondition = /^\d+$/.test(cq);
  const conditionItems = CONDITIONS.map(([type, label], i: number) => ({
    type,
    row: { id: type, number: i + 1, label, desc: '' },
  }))
    .map(
      (c: {
        type: ConditionType;
        row: { id: string; number: number; label: string; desc: string };
        score?: number;
      }) => ({ ...c, score: fuzzyScore(cq, c.row.label) }),
    )
    .filter((c: { score: number }) => !cq || numericCondition || c.score > 0)
    .sort((a: { score: number }, b: { score: number }) =>
      cq && !numericCondition ? b.score - a.score : 0,
    );
  const conditionHighlight = numericCondition
    ? Number.parseInt(cq, 10) - 1
    : Math.min(ui.conditionHighlight, Math.max(0, conditionItems.length - 1));
  const chooseCondition = (type: ConditionType | undefined) => {
    if (!type) return;
    onChange({ ...value, condition: type });
    focus(takesValue(type) ? 'value' : 'conditionChip', {
      stage: 'value',
      conditionQuery: '',
      conditionHighlight: 0,
    });
  };
  const handleConditionKey = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    // Show keyboard help on '?' (works anytime)
    if (e.key === '?' && onShowKeyboardHelp) {
      e.preventDefault();
      onShowKeyboardHelp();
      return;
    }

    if (
      onNumber(
        e,
        cq,
        CONDITIONS.length,
        q => patch({ conditionQuery: q }),
        i => chooseCondition(CONDITIONS[i]?.[0]),
      )
    )
      return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      patch({
        conditionHighlight: Math.min(conditionHighlight + 1, conditionItems.length - 1),
        conditionQuery: numericCondition ? '' : cq,
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      patch({
        conditionHighlight: Math.max(conditionHighlight - 1, 0),
        conditionQuery: numericCondition ? '' : cq,
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      chooseCondition(conditionItems[conditionHighlight]?.type);
    } else if ((e.key === 'Backspace' && cq === '') || e.key === 'Escape') {
      e.preventDefault();
      focus('bar', { stage: 'point', menuOpen: true });
    }
  };
  const handleValueKey = (e: KeyboardEvent<HTMLInputElement>) => {
    // Show keyboard help on '?' (works anytime)
    if (e.key === '?' && onShowKeyboardHelp) {
      e.preventDefault();
      onShowKeyboardHelp();
      return;
    }

    if ((e.key === 'Backspace' && value.value === '') || e.key === 'Escape') {
      e.preventDefault();
      focus('condition', { stage: 'condition', conditionQuery: '' });
    } else if (e.altKey && e.code === 'KeyC') {
      e.preventDefault();
      onChange({ ...value, ignoreCase: !value.ignoreCase });
    }
  };

  // Use SDK renderer for canonical form (labels computed on the fly in WhereBar)
  const point = renderSegments(proton, segments);

  const check = value.condition
    ? checkOf(value.condition, value.value, value.ignoreCase, point, context)
    : null;
  const last = segments[segments.length - 1];
  const nameAllowsCase = !!nameStep && isKeyStep(nameStep) && !isCaseFixed(nameStep);

  // Compute human-readable sentence from segments
  // First try describe() (uses segment.label if available)
  // Fall back to canonical point if labels are missing
  const computeSentence = (): string => {
    if (segments.length === 0) return '';

    const described = describe(segments);
    if (described) return described;

    // Fallback: use canonical point as sentence if describe() returned empty
    // This happens when segments don't have label fields (e.g., from SDK parse)
    return value.canonical || '';
  };

  return {
    ui,
    point,
    check,
    sentence: computeSentence(),
    reserved: segments.some(s => s.reserved),
    sdkError: ui.sdkError,
    incomplete: ui.incomplete,
    canonicalInfo: ui.canonicalInfo,
    loadingKeys,
    /* where */
    pointStage,
    menuOpen: pointStage && (!!nameStep || !!pickStep || ui.menuOpen),
    menuTitle: pickStep
      ? pickStep.title
      : nameStep
        ? nameStep.wordsOnly
          ? nameStep.placeholder
          : isPositionStep(nameStep)
            ? `Which ${nounOf(nameStep)}? (0 is the first)`
            : `Which ${nounOf(nameStep)}?`
        : listTitle(segments, context),
    menuFooter: (pickStep ? 'pick' : nameStep ? 'name' : 'list') as 'pick' | 'name' | 'list',
    rows: items.map(it => it.row),
    highlightedId: items[highlight]?.row.id ?? null,
    status,
    pendingLabel: pickStep
      ? pickStep.kind === 'format'
        ? 'parse as …'
        : 'decode as …'
      : nameStep
        ? `${nounOf(nameStep)} …`
        : '',
    nameStep,
    nameInputPlaceholder: nameStep
      ? nameStep.wordsOnly
        ? 'type to filter'
        : isPositionStep(nameStep)
          ? `type a number: 0 is the first ${nounOf(nameStep)}`
          : `type ${nameStep.placeholder}`
      : '',
    nameAllowsCase,
    nameShowsStarHint: !!nameStep && isKeyStep(nameStep),
    applyLabel: allOn
      ? 'Apply: all'
      : picked.length && pickStep
        ? `Apply: ${pickStep.choices
            .filter((c: string) => picked.includes(c))
            .map((c: string) => PICK_LABELS[c]?.[0] ?? c)
            .join(' + ')}`
        : 'Tick one or more',
    barPlaceholder: !segments.length
      ? 'Header, Body, Query, Path… type to filter, or a number (Press ? for help)'
      : pickStep
        ? 'type a number or press Space to tick, Enter to apply'
        : !sdkCompletionItems.length
          ? 'press Next (Tab, or Ctrl+Enter) to set the condition'
          : 'what next? type to filter, or a number',
    canContinue: segments.length > 0,
    /* match */
    conditionTitle: !last
      ? 'How should the value match?'
      : (last.kind === 'dup_index' || last.kind === 'dup_all' || last.kind === 'dup_any') && last.dup
        ? `How should the ${last.label} match?`
        : last.kind === 'wild' || last.kind === 'dup_index' || last.kind === 'dup_all' || last.kind === 'dup_any' || last.kind === 'joined'
          ? `How should ${last.label} match?`
          : `How should the value of ${last.label} match?`,
    conditionRows: conditionItems.map((c: { row: any }) => c.row),
    conditionHighlightedId: conditionItems[conditionHighlight]?.row.id ?? null,
    conditionTakesValue: !!value.condition && takesValue(value.condition),
    readAs: 'Use * for any text: *admin* means contains admin.',
    /* actions */
    actions: {
      setQuery: (q: string) => patch({ query: q, highlight: 0, menuOpen: true }),
      openMenu: () => !ui.menuOpen && patch({ menuOpen: true }),
      closeMenu: () =>
        patch({ menuOpen: false, nameStep: null, pickStep: null, picked: [], query: '' }),
      highlight: (id: string) => {
        const i = items.findIndex(it => it.row.id === id);
        if (i >= 0) patch({ highlight: i, query: numericQuery ? '' : query });
      },
      chooseRow: (id: string) => choose(items.find(it => it.row.id === id)),
      applyPick: () => applyPick(),
      toggleNameCase: () => focus('name', { nameIgnoreCase: !ui.nameIgnoreCase }),
      truncateTo,
      goMatch,
      editPoint: () => focus('bar', { stage: 'point', menuOpen: true }),
      setConditionQuery: (q: string) => patch({ conditionQuery: q, conditionHighlight: 0 }),
      highlightCondition: (id: string) => {
        const i = conditionItems.findIndex((c: { row: { id: string } }) => c.row.id === id);
        if (i >= 0) patch({ conditionHighlight: i, conditionQuery: numericCondition ? '' : cq });
      },
      chooseCondition: (id: string) =>
        chooseCondition(conditionItems.find((c: { row: { id: string } }) => c.row.id === id)?.type),
      editCondition: () => focus('condition', { stage: 'condition', conditionQuery: '' }),
      /** Close the condition list in place: the condition button reopens it. */
      closeConditionList: () => patch({ stage: 'value', conditionQuery: '' }),
      setValue: (v: string) => onChange({ ...value, value: v }),
      setIgnoreCase: (on: boolean) => onChange({ ...value, ignoreCase: on }),
      /** Clear SDK validation error */
      clearSdkError: () => patch({ sdkError: null, incomplete: false }),
      /** Clear canonical form info */
      clearCanonicalInfo: () => patch({ canonicalInfo: null }),
      /** Apply a fix suggestion from SDK error */
      applyFix: (fix: { label: string; replace: [number, number]; insert: string }) => {
        if (!proton) {
          // SDK not loaded - just clear error
          patch({ sdkError: null, incomplete: false });
          return;
        }

        try {
          // Get current point string
          const currentPoint = renderSegments(proton, segments);

          // Apply fix: replace characters from fix.replace[0] to fix.replace[1] with fix.insert
          const fixedPoint =
            currentPoint.slice(0, fix.replace[0]) + fix.insert + currentPoint.slice(fix.replace[1]);

          // Parse the fixed point string
          const newSegments = proton.point.parse(fixedPoint) as typeof segments;

          // Validate and set new segments
          setSegments(newSegments, { sdkError: null, incomplete: false });
        } catch {
          // If parsing/applying fails, just clear the error
          patch({ sdkError: null, incomplete: false });
        }
      },
    },
    keys: { handleBarKey, handleNameKey, handleConditionKey, handleValueKey },
  };
};

export type PointSelectorModel = ReturnType<typeof usePointSelector>;
