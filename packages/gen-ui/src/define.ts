import type { FC, ReactNode } from 'react';
import { z } from 'zod';

/** What a component's View receives from either format's renderer. */
export interface GenUiViewProps<P> {
  /** Props with every binding already resolved to a value. */
  props: P;
  /** Fires one of the component's `events`; the format decides what reaches the agent. */
  emit: (event: string) => void;
  /** Rendered children, when the component `hasChildren`. */
  children?: ReactNode;
}

/**
 * One catalog entry, written once and rendered by both formats.
 *
 * Constraints that keep it portable:
 * - `props` is a plain zod object of strings, numbers, booleans, enums, arrays and objects:
 *   no functions, no ReactNode.
 * - No prop named `id`, `component`, `children` or `child`: A2UI puts props flat next to them.
 * - Events carry no arguments: the spec, not the component, decides what an action sends.
 */
export interface GenUiComponent<S extends z.ZodObject = z.ZodObject> {
  name: string;
  /** Read by the model: say when to use it, not how it looks. */
  description: string;
  props: S;
  events?: readonly string[];
  hasChildren?: boolean;
  View: FC<GenUiViewProps<z.infer<S>>>;
}

/** An app action a spec may bind a component event to, e.g. `block_ip`. */
export interface GenUiAction {
  name: string;
  description: string;
}

/** Where both formats deliver a fired action; `params` comes from the spec, never from the View. */
export type GenUiActionHandler = (name: string, params: Record<string, unknown>) => void;

export const defineComponent = <S extends z.ZodObject>(c: GenUiComponent<S>): GenUiComponent<S> =>
  c;

/** The string values of a DS prop type: `Values<BadgeProps['color']>`. */
export type Values<T> = Extract<NonNullable<T>, string>;

/**
 * The enum values a catalog entry offers, checked against the DS union they come from, so the two
 * can't drift: `z.enum(subsetOf<BadgeColor>()(['slate', 'red']))`. A value the DS renames or removes
 * fails typecheck. Use it where the catalog deliberately offers fewer values than the DS has.
 */
export const subsetOf =
  <T extends string>() =>
  <const A extends readonly [T, ...T[]]>(values: A): A =>
    values;

/**
 * Like `subsetOf`, for a DS union the catalog offers in full (a meaning, not a palette). It also
 * fails typecheck with `{ missing: '<value>' }` when the DS adds a value the list lacks.
 */
export const allOf =
  <T extends string>() =>
  <const A extends readonly [T, ...T[]]>(
    values: A &
      ([Exclude<T, A[number]>] extends [never] ? unknown : { missing: Exclude<T, A[number]> }),
  ): A =>
    values;

/** A series' field in each point. `x` is the axis, and `__`-prefixed keys are the Views' own. */
export const seriesKey = z
  .string()
  .refine(key => key !== 'x' && !key.startsWith('__'), 'x and __-prefixed keys are reserved');

/** For `.refine` on an array of items keyed by `field`: React keys and the DS join on it. */
export const unique =
  <K extends string>(field: K) =>
  (items: readonly Partial<Record<K, unknown>>[]) =>
    new Set(items.map(item => item[field])).size === items.length;
