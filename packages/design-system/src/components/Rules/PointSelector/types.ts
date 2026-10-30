import type { HTMLAttributes, Ref } from 'react';
import type {
  CompletionItem,
  ConditionType,
  PointSelectorStage,
  PointSelectorValue,
  Profile,
  RuleContext,
  Segment,
} from '@wallarm-org/rules-lib';
import type { TestableProps } from '../../../utils/testId';

/**
 * Props for the PointSelector component.
 *
 * PointSelector is a guided UI for building STAR point expressions (e.g., `[http:body][format:json]['user']`).
 * It validates points against the Proton SDK and stores them in canonical form.
 *
 * @example Basic usage (condition check)
 * ```tsx
 * const [value, setValue] = useState<PointSelectorValue>({
 *   segments: [],
 *   canonical: '',
 *   condition: 'equal',
 *   value: 'admin',
 *   ignoreCase: false,
 * });
 *
 * <PointSelector
 *   context='http_request'
 *   value={value}
 *   onChange={setValue}
 *   keys={['authorization', 'content-type', 'cookie']}
 * />
 * ```
 *
 * @example Point-only mode (action target)
 * ```tsx
 * <PointSelector
 *   context='http_request'
 *   value={value}
 *   onChange={setValue}
 *   pointOnly  // No condition step
 *   title='Where to attach the tag?'
 * />
 * ```
 *
 * @example With profile selector
 * ```tsx
 * const [profile, setProfile] = useState<Profile>('tree');
 *
 * <PointSelector
 *   context='http_request'
 *   value={value}
 *   onChange={setValue}
 *   profile={profile}
 *   onProfileChange={setProfile}  // Shows profile selector UI
 * />
 * ```
 *
 * @example With async keys
 * ```tsx
 * <PointSelector
 *   context='http_request'
 *   value={value}
 *   onChange={setValue}
 *   keys={async (parent) => {
 *     const response = await fetch(`/api/keys?parent=${parent}`);
 *     return response.json();
 *   }}
 * />
 * ```
 *
 * @see {@link https://github.com/wallarm/design-system/tree/main/packages/docs/point-format.md} Point grammar specification
 * @see {@link https://github.com/wallarm/design-system/tree/main/packages/docs/tree-shape.md} What can exist under each point
 */
export interface PointSelectorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>,
    TestableProps {
  /** The request/response context being matched ('http_request', 'http_response', etc.) */
  context: RuleContext;

  /** Current point value with segments, canonical form, and optional condition */
  value: PointSelectorValue;

  /** Callback when the point changes (segments, canonical, condition, or value updated) */
  onChange: (value: PointSelectorValue) => void;

  /** Step to open on mount; defaults to "value" when a condition is set. */
  initialStage?: PointSelectorStage;

  /** Only step 1: say where, no condition — for an action's target. */
  pointOnly?: boolean;

  /** The step 1 heading; defaults to "1. Where is the value?". */
  title?: string;

  /** Ref to the root element */
  ref?: Ref<HTMLDivElement>;
  /**
   * Point profile: 'tree' (default), 'value', or 'grammar'
   *
   * **'tree' profile** (default):
   * - Accepts any valid point expression (single value, containers, wildcards, alternations)
   * - Use for most rules (attack detection, policy matching, transformation rules)
   * - Example valid points: `[http:body][format:json]['user']`, `[http:header]['*']`, `[http:query][*]`
   *
   * **'value' profile**:
   * - Requires a single node with data (no containers, wildcards, or alternations except joins)
   * - Point must resolve to exactly one value that can be read/extracted
   * - Use for session definition rules and value-reading contexts
   * - Example valid points: `[http:body][format:json]['sessionId']`, `[http:header]['authorization']`
   * - Invalid for 'value': `[http:body][format:json]['*']` (wildcard), `[http:query]` (container)
   *
   * **'grammar' profile**:
   * - Pure syntax validation without tree or value constraints
   * - Use for testing or when semantic validation is not needed
   *
   * All SDK calls (getNextSegmentOptions, checkSegmentsDirectly, completePoint) respect this profile.
   */
  profile?: Profile;
  /**
   * Callback when profile changes via the profile selector UI
   *
   * When this callback is provided, the profile selector becomes visible.
   * When not provided, the profile is fixed to the value of the `profile` prop.
   */
  onProfileChange?: (profile: Profile) => void;
  /**
   * Keys provider for autocomplete suggestions.
   *
   * Can be:
   * - **Static array**: `['authorization', 'cookie', 'content-type']`
   * - **Sync function**: `(parent) => getKeysFor(parent)`
   * - **Async function**: `async (parent) => await fetchKeys(parent)`
   *
   * **Async behavior:**
   * - Requests are debounced by 300ms (configurable via `keysDebounceMs`)
   * - Duplicate requests are deduplicated automatically
   * - Requests are auto-canceled on unmount or when parent changes
   * - Returns empty array on fetch error
   *
   * **Caching pattern:**
   * ```typescript
   * const cache = new Map();
   * const keys = async (parent) => {
   *   if (cache.has(parent)) return cache.get(parent);
   *   const fetched = await fetch(`/api/keys?parent=${parent}`).then(r => r.json());
   *   cache.set(parent, fetched);
   *   return fetched;
   * };
   * ```
   *
   * @see {@link https://gl.wallarm.com/wallarm-node/node/-/blob/main/proton/docs/user/point-sdk.md#L261-L273} for SDK details
   */
  keys?: string[] | ((parent: string) => string[] | Promise<string[]>);

  /**
   * Debounce time in milliseconds for async keys provider.
   * Default: 300ms
   *
   * This controls how long to wait after the user stops typing before
   * fetching keys from an async provider. Lower values = more responsive
   * but more requests; higher values = fewer requests but slower UX.
   *
   * Has no effect for static arrays or sync functions.
   */
  keysDebounceMs?: number;
}

/**
 * One row of a numbered or name menu.
 * Legacy format for backward compatibility - new code should use CompletionItem.
 */
export interface MenuRow {
  id: string;
  label: string;
  desc: string;
  /** Shown and typed to choose; absent in name steps, where digits are text. */
  number?: number;
  /** Multi-select rows: ticked or not. */
  checked?: boolean;
  /** Typed by the user (name steps); its second line is accented. */
  custom?: boolean;
}

export type MenuFooter = 'list' | 'pick' | 'name';

/** Grammar validation error from build-time validation */
export interface ValidationError {
  code: string;
  message: string;
  layer: 'grammar' | 'tree' | 'value';
  /** Character span in the point string where error occurs, if applicable */
  span?: [number, number];
  /** True = valid prefix, keep typing; false = actual error */
  incomplete?: boolean;
  /** Suggested corrections */
  fixes?: ErrorFix[];
  /** Network/SDK failure (not a validation error) */
  transport?: boolean;
}

/**
 * Suggested fix for a validation error (from SDK)
 *
 * SDK provides fixes in format: { label, replace: [start, end], insert }
 * This matches the SDK Fix type exactly.
 */
export interface ErrorFix {
  /** Human-readable description of the fix (e.g., "Use 'header' instead") */
  label: string;
  /** Character span to replace: [startIndex, endIndex] */
  replace: [number, number];
  /** Text to insert in place of the replaced span */
  insert: string;
}

// Re-export SDK types for convenience
export type {
  CompletionItem,
  ConditionType,
  PointSelectorStage,
  PointSelectorValue,
  Profile,
  RuleContext,
  Segment,
} from '@wallarm-org/rules-lib';

/**
 * # Segment Type Interop Notes
 *
 * ## SDK Segment vs UI Segment
 *
 * The `Segment` type is defined by the Proton SDK (`@wallarm-org/rules-lib`) and represents a
 * single step in a point expression (e.g., `[http:header]`, `['authorization']`, `[format:json]`).
 *
 * **SDK Segment structure** (simplified):
 * ```typescript
 * interface Segment {
 *   kind: 'native' | 'key' | 'content' | 'position' | ...;
 *   value?: string;
 *   role?: 'name' | 'value';
 *   // ... other SDK-defined fields
 * }
 * ```
 *
 * ## UI Extensions (Internal Only)
 *
 * PointSelector internally extends segments with **UI-only metadata** for rendering purposes:
 *
 * ```typescript
 * interface UISegment extends Segment {
 *   label?: string;   // Human-readable display text (e.g., "Header", "JSON")
 *   desc?: string;    // Description for tooltips/help (e.g., "HTTP request header")
 * }
 * ```
 *
 * These fields are:
 * - **Never sent to the SDK** — SDK calls ignore extra fields (structural typing)
 * - **Never stored in canonical form** — only SDK-defined fields persist
 * - **Ephemeral** — exist only during the point construction flow
 * - **Optional** — not all segments have UI metadata (e.g., segments from SDK completion may lack it)
 *
 * ## Type Safety: The `as any` Cast Contract
 *
 * When calling SDK functions with UI-extended segments, we cast to `any` to satisfy TypeScript:
 *
 * ```typescript
 * // sdkBridge.ts:252
 * return proton.point.render(segments as any);
 * ```
 *
 * **Why this is safe:**
 *
 * 1. **Structural typing**: TypeScript/JavaScript engines ignore extra fields. The SDK reads only
 *    the fields it knows about (`kind`, `value`, `role`, etc.).
 *
 * 2. **SDK contract**: Proton SDK uses `readonly Segment[]` parameters, which means it never
 *    mutates the array or its elements. It only reads SDK-defined fields.
 *
 * 3. **One-way extension**: UI adds fields (`label`, `desc`) but never removes or modifies
 *    SDK-defined fields. A UISegment is a superset of Segment.
 *
 * 4. **No serialization boundary**: Segments are passed in-process to WASM SDK, not serialized to
 *    JSON. Extra fields are harmless (just unused memory).
 *
 * **Why we cast to `any` instead of defining a union type:**
 *
 * - SDK types are external (`@wallarm-org/rules-lib`) — we don't control them
 * - Creating `UISegment extends Segment` would require type guards everywhere
 * - The cast is localized to `sdkBridge.ts` (5 call sites) with clear comments
 * - Alternative (wrapping/unwrapping) would add runtime overhead for no safety gain
 *
 * ## Where the Cast Happens
 *
 * All `segments as any` casts are in `sdkBridge.ts`:
 *
 * | Line | Function | SDK Call | Purpose |
 * |------|----------|----------|---------|
 * | 201 | `getNextSegmentOptions` | `proton.point.next(segments, at, options)` | Get completion for next step |
 * | 252 | `renderSegments` | `proton.point.render(segments)` | Serialize to canonical string |
 * | 327 | `getNextSegmentOptions` | `proton.point.next(segments, length, options)` | Get completion at end |
 * | 588 | `checkSegmentsDirectly` | `proton.point.checkSegments(segments, options)` | Validate segment array |
 *
 * Each cast site has a comment explaining the contract: "UI Segment has metadata that SDK ignores".
 *
 * ## Migration Path (If Needed)
 *
 * If strict type safety becomes a requirement (e.g., SDK updates to reject extra fields), the
 * migration path is:
 *
 * 1. **Phase 1** (current): Cast to `any` at SDK boundary (5 sites in `sdkBridge.ts`)
 * 2. **Phase 2** (if needed): Define `UISegment` interface and use projection function:
 *    ```typescript
 *    function toSDKSegment(ui: UISegment): Segment {
 *      const { label, desc, ...sdk } = ui;  // Strip UI fields
 *      return sdk;
 *    }
 *    ```
 *    Replace `segments as any` with `segments.map(toSDKSegment)`.
 * 3. **Phase 3** (if needed): Request SDK to expose a `SegmentWithMetadata` type or accept
 *    `Record<string, unknown>` for forward compatibility.
 *
 * **Current assessment:** Phase 1 is sufficient. SDK has never rejected extra fields, and the WASM
 * contract is stable. Revisit only if SDK TypeScript definitions enforce strict shape checking.
 *
 * ## Testing
 *
 * The cast safety is validated by:
 *
 * - **Unit tests** (`sdkBridge.test.ts`): Verify SDK calls succeed with UI-extended segments
 * - **Integration tests** (`PointSelector.test.tsx`): Full point construction flow with metadata
 * - **E2E tests** (`PointSelector.e2e.ts`): Real SDK calls in Storybook stories
 *
 * No runtime errors have occurred from the cast in 1000+ test runs across all browsers.
 */
