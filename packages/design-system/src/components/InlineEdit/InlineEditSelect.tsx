import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import type { ListCollection } from '@ark-ui/react/collection';
import { useTestId } from '../../utils/testId';
import {
  createListCollection,
  Select,
  SelectButton,
  SelectContent,
  type SelectDataItem,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

interface InlineEditSelectBaseProps {
  /**
   * Options; the collection is built internally (PaginationPageSize
   * precedent). Provide exactly one of `items` / `collection`.
   */
  items?: SelectDataItem[];
  /**
   * A prebuilt collection (e.g. built once upstream, or with custom
   * filtering/sorting). Provide exactly one of `items` / `collection` — a
   * dev-only warning fires otherwise.
   */
  collection?: ListCollection<SelectDataItem>;
  /**
   * Bound-root pattern: `InlineEditSelect` IS the prewired `Select` root —
   * draft binding, `defaultOpen`, commit-on-close, and the submit-mode
   * override all stay on the root regardless of composition. `children` are
   * ordinary `Select` compound parts (`SelectButton`/`SelectInput`,
   * `SelectPositioner > SelectContent > SelectOption…`) rendered inside that
   * root, not a replacement wrapper. Composing children means consumers
   * place their own attributes (testids, analytics) on their own parts — the
   * rest-prop forwarding documented below only applies to the default
   * trigger.
   *
   * No children → the default trigger + positioner + options composition
   * renders, built from the resolved collection's items.
   */
  children?: ReactNode;
  'data-testid'?: string;
}

/**
 * Single select: rest props forward to the real `<button>` trigger.
 * `color` is omitted: it's the legacy/deprecated global HTML attribute (not
 * meaningful on a `<button>`), and it would otherwise collide with
 * `SelectButton`'s own `color` prop, which is a narrower CVA variant
 * (`'brand' | 'neutral' | 'neutral-alt'`).
 */
export interface InlineEditSelectSingleProps
  extends InlineEditSelectBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value' | 'color'> {
  multiple?: false;
}

/**
 * Multiple select: rest props forward to the trigger `<div>`.
 * `color` is omitted for symmetry with the single variant — `SelectInput`'s
 * own props already exclude it, so accepting it here would only let a stray
 * legacy attribute land on the div.
 */
export interface InlineEditSelectMultipleProps
  extends InlineEditSelectBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  multiple: true;
}

export type InlineEditSelectProps = InlineEditSelectSingleProps | InlineEditSelectMultipleProps;

export const InlineEditSelect = ({
  items,
  collection,
  multiple = false,
  children,
  'data-testid': testIdProp,
  ...rest
}: InlineEditSelectProps) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, submit } = useInlineEdit<string[] | string>();
  useInlineEditSubmitMode('none');

  // useMemo must run unconditionally (hooks rule) — memoize from `items`
  // (defaulting to `[]` when a `collection` is provided instead) and pick
  // the resolved collection afterward.
  const collectionFromItems = useMemo(() => createListCollection({ items: items ?? [] }), [items]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const hasItems = items !== undefined;
    const hasCollection = collection !== undefined;
    if (hasItems === hasCollection) {
      // biome-ignore lint/suspicious/noConsole: dev-only warning surface
      console.warn(
        `InlineEditSelect: provide exactly one of \`items\` or \`collection\` (got ${
          hasItems && hasCollection ? 'both' : 'neither'
        }).`,
      );
    }
  }, [items, collection]);

  const resolvedCollection = collection ?? collectionFromItems;
  // A plain-string committed value is a natural single-select shape —
  // normalize instead of silently blanking it.
  const selected = Array.isArray(value)
    ? value
    : typeof value === 'string' && value !== ''
      ? [value]
      : [];

  return (
    <Select
      defaultOpen
      collection={resolvedCollection}
      multiple={multiple}
      value={selected}
      onValueChange={details => setValue(details.value)}
      onOpenChange={details => {
        if (!details.open) submit();
      }}
    >
      {children ?? (
        <>
          {multiple ? (
            <SelectInput
              data-testid={testId}
              {...(rest as Omit<HTMLAttributes<HTMLDivElement>, 'color'>)}
            />
          ) : (
            <SelectButton
              data-testid={testId}
              {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>)}
            />
          )}
          <SelectPositioner>
            <SelectContent>
              {resolvedCollection.items.map(item => (
                <SelectOption key={item.value} item={item}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </>
      )}
    </Select>
  );
};

InlineEditSelect.displayName = 'InlineEditSelect';
