import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useMemo } from 'react';
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
  /** Options; the collection is built internally (PaginationPageSize precedent). */
  items: SelectDataItem[];
  /** Full custom composition — replaces the default trigger/options entirely. */
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
  multiple = false,
  children,
  'data-testid': testIdProp,
  ...rest
}: InlineEditSelectProps) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, submit } = useInlineEdit<string[] | string>();
  useInlineEditSubmitMode('none');

  const collection = useMemo(() => createListCollection({ items }), [items]);
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
      collection={collection}
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
              {items.map(item => (
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
