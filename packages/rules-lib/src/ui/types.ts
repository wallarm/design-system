/**
 * UI-specific types for Point Selector
 *
 * These are presentation types with UI metadata, separate from SDK types.
 */

import type { Segment as SDKSegment } from '../proton/types';

/** Which message a rule reads */
export type RuleContext = 'http_request' | 'http_response' | 'grpc_request' | 'grpc_response';

export type SegmentKind =
  | 'native'
  | 'format'
  | 'encoding'
  | 'key'
  | 'index'
  | 'attr'
  | 'wild'
  | 'mod';

/**
 * UI Segment with metadata for display
 *
 * Extends SDK Segment with UI-specific fields like labels and descriptions.
 * SDK operations (next, check, render) work with this because they ignore unknown fields.
 */
export interface Segment extends SDKSegment {
  /** Proton point text of this step, e.g. `[format:json]` or `['x-api-key']` */
  text: string;
  kind: SegmentKind;
  /** Plain-language label shown in chips and sentences */
  label: string;
  /** Native, content or key name. Joined with `|` for an alternation */
  name?: string;
  /** What a key is called in sentences: key, header, cookie, claim, parameter */
  noun?: string;
  /** A header name (always lowercase in proton) */
  hdr?: boolean;
  /** One of the JWT parser's own keys (`payload`, `header`, …) */
  jwt?: boolean;
  /** A parser's own vocabulary key (`bearer`, `basic`, …) */
  fixed?: boolean;
  /** JSON that holds JWT claims, so names are suggested from the claim list */
  claims?: boolean;
  /** A key family (pattern or caseless) rather than one key: no ordinals */
  fuzzy?: boolean;
  /** Uses a form proton reserves but does not support yet (`[key:/…/]`) */
  reserved?: boolean;
  /** A duplicate ordinal (`[dup:0]`) */
  dup?: boolean;
  /** The single-format steps an alternation stands for */
  multi?: Segment[];
}

/** A step that asks the user for a name (header, cookie, key, claim, position) */
export interface NameStep {
  /** What is typed, e.g. `claim name`; also selects the step's rules */
  placeholder: string;
  /** Well-known names to suggest. Never values from traffic, never numbers */
  suggest: readonly string[];
  make: (name: string) => Segment[];
  /** For number steps: what the number picks ("array item", "copy") */
  positionOf?: string;
  /** Choices shown before anything is typed */
  every?: FixedRow[];
  /** Fixed words with their own steps */
  words?: (FixedRow & { word: string })[];
  /** The name may be a path: `user.email`, `items[0]` */
  path?: { xml: boolean; under?: Segment[] };
  /** Only the fixed words can be chosen; typing filters them */
  wordsOnly?: boolean;
  /** How a typed name reads in the list */
  customLabel?: (name: string) => string;
  /** Extra readings of a typed name */
  alsoAs?: {
    label: (name: string) => string;
    desc: string;
    make: (name: string) => Segment[];
  }[];
  /** XML: a name typed as `@id` is an attribute */
  attribute?: (name: string) => Segment[];
}

/** A ready-made row of a name step */
export interface FixedRow {
  label: string;
  desc: string;
  segs: Segment[];
}

export type PickKind = 'format' | 'encoding';

/** A "Parse as…" / "Decode as…" multi-select */
export interface PickStep {
  title: string;
  kind: PickKind;
  choices: string[];
}

/** One sentence in the "what may come next" menu */
export interface NextOption {
  /** Stable identity for intersecting */
  id?: string;
  label: string;
  desc: string;
  /** Steps appended when chosen */
  segs?: Segment[];
  /** Choosing it completes the point */
  done?: boolean;
  /** Choosing it opens a name step */
  name?: NameStep;
  /** Choosing it opens a multi-select */
  pick?: PickStep;
}

/** Condition types for checks */
export type ConditionType =
  | 'equal'
  | 'nequal'
  | 'contains'
  | 'startswith'
  | 'endswith'
  | 'regexp'
  | 'nregexp'
  | 'exists'
  | 'absent';

/** Name row for name step UI */
export interface NameRow {
  id: string;
  label: string;
  desc: string;
  /** Multi-pick marker */
  multi?: boolean;
}

/** Proton check object (condition in API format) */
export interface ProtonCheck {
  type: string;
  context?: RuleContext;
  point?: string | string[];
  value?: string | string[];
  case_sensitive?: boolean;
  attack?: {
    attack_type?: string | string[];
  };
  signal?: {
    signal_type?: string;
  };
  tag?: {
    key?: string;
    value?: string;
  };
}
