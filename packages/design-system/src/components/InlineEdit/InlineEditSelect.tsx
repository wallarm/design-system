import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import type { ListCollection } from '@ark-ui/react/collection';
import { useTestId } from '../../utils/testId';
import { createListCollection, Select, type SelectDataItem } from '../Select';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

export interface InlineEditSelectProps {
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
  multiple?: boolean;
  /**
   * `InlineEditSelect` IS the prewired `Select` root — the draft binding,
   * `defaultOpen`, and commit-on-close all live here. `children` are
   * ordinary `Select` compound parts (`SelectButton`/`SelectInput`,
   * `SelectPositioner > SelectContent > SelectOption…`) — exactly as you'd
   * compose a standalone `Select`. `SelectButton` already cascades its own
   * testid slot from this root with zero extra wiring (`{base}--button`).
   * `SelectOption` cascades too, but nested one level further: `SelectContent`
   * re-provides the cascade scoped to its own `content` slot (a `ScrollArea`
   * implementation detail — see its own testid comment), so bare options
   * resolve under `{base}--content--option` rather than `{base}--option`.
   * That cascaded id also has no per-item disambiguation (every option in a
   * collection resolves to the same testid) — pass a per-item `data-testid`
   * override if a test needs to address one option by id rather than by text.
   * `SelectInput` (the multiple-select trigger) does not cascade on its own —
   * pass it `data-testid` explicitly if you need one.
   */
  children: ReactNode;
}

export const InlineEditSelect = ({
  items,
  collection,
  multiple = false,
  children,
}: InlineEditSelectProps) => {
  // Transparent pass-through (no slot segment): bridges the ambient
  // InlineEdit-level cascade into Select's own re-provided TestIdProvider,
  // so a consumer's bare SelectButton/SelectOption resolve automatically.
  const testId = useTestId();
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
      data-testid={testId}
      defaultOpen
      // `defaultOpen` skips the normal open interaction (click/keydown) that
      // is what seeds Zag's initial highlighted index — left unset, arrow
      // keys have nothing to move from and the list never highlights
      // anything (verified: standalone Select opened via click highlights
      // the selected item and Arrow keys move it; InlineEditSelect's
      // defaultOpen left every item's data-highlighted unset even after
      // Arrow presses). Seed it explicitly to the current selection, or the
      // collection's first item when nothing is selected yet.
      defaultHighlightedValue={selected[0] ?? resolvedCollection.firstValue}
      collection={resolvedCollection}
      multiple={multiple}
      value={selected}
      onValueChange={details => setValue(details.value)}
      onOpenChange={details => {
        if (!details.open) submit();
      }}
    >
      {children}
    </Select>
  );
};

InlineEditSelect.displayName = 'InlineEditSelect';
