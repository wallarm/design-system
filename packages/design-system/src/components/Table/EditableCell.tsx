import type { FC, KeyboardEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { ChevronDown, Pencil } from '../../icons';
import { cn } from '../../utils/cn';
import {
  createListCollection,
  Select,
  SelectContent,
  type SelectDataItem,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';

// ---------------------------------------------------------------------------
// EditableCell — inline-editable table cell (WDS-157)
// ---------------------------------------------------------------------------
// A dedicated, self-contained editable cell for the DataTable, built to sit
// directly inside a body cell (`<td className='px-16 py-8'>`). It exists
// because reusing `InlineEdit` here fights that component's Attribute-tuned,
// inset layout — the cell needs to own its geometry end-to-end.
//
// The whole point is that NOTHING shifts between states (idle → hover → editing
// / open). That is achieved by a single shell whose box is identical in every
// state:
//   • The host column zeroes the body-cell padding (`meta.cellClassName: 'p-0'`,
//     see EDITABLE_CELL_COLUMN_META) so the shell can own the whole cell with
//     `h-full w-full` and re-apply the `px-16 py-8` inset itself — no
//     negative-margin bleed fighting the cell's `overflow`/pinning.
//   • The content padding (`px-16 py-8`) matches a normal body cell, so the
//     text still lines up with the read-only columns at 16px, in every state.
//   • The border is always present as `border-transparent`, and only its color
//     changes (→ brand orange) when active — no 1px reflow on focus.
//
// Idle → hover fills the cell grey. Editing (text) / open (select) draws the
// brand-orange border. For the select the trigger *is* the read view, so there
// is no content swap at all when it opens.
//
// NOTE: use on a NON-master column (the master/first column is pinned + cut +
// truncated by the Table and is not a clean host for an editable cell).

/** Spread onto an editable column's `meta` so the shell can fill the cell. */
export const EDITABLE_CELL_COLUMN_META = { cellClassName: 'p-0' } as const;

const editableCellShell = cn(
  'group/cell flex h-full w-full items-center gap-8 px-16 py-8',
  'rounded-8 border border-transparent',
  'text-left text-sm text-text-primary',
  'cursor-pointer outline-none transition-colors',
);

// Idle/hover: the whole cell highlights. Applied when NOT active.
const editableCellHover = 'hover:bg-states-primary-hover active:bg-states-primary-pressed';

// Active (text focused / select open): brand-orange border on a solid surface.
const editableCellActive = 'border-border-strong-brand bg-bg-surface-1';

const editableValueSlot = 'min-w-0 flex-1 truncate';
const editableTrailingIcon = 'size-16 shrink-0 text-text-secondary';

export interface EditableTextCellProps {
  value: string;
  onCommit: (value: string) => void;
  'aria-label'?: string;
}

/**
 * Free-text editable cell. Click (or Enter/Space) swaps the read text for a
 * borderless input in the exact same position; Enter/blur commits, Escape
 * reverts.
 */
export const EditableTextCell: FC<EditableTextCellProps> = ({
  value,
  onCommit,
  'aria-label': ariaLabel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const start = () => {
    setDraft(value);
    setIsEditing(true);
  };
  const commit = () => {
    setIsEditing(false);
    if (draft !== value) onCommit(draft);
  };
  const cancel = () => {
    setIsEditing(false);
    setDraft(value);
  };

  if (isEditing) {
    return (
      <div data-slot='table-editable-cell' className={cn(editableCellShell, editableCellActive)}>
        <input
          autoFocus
          aria-label={ariaLabel}
          value={draft}
          onChange={event => setDraft(event.currentTarget.value)}
          onFocus={event => event.currentTarget.select()}
          onBlur={commit}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              cancel();
            }
          }}
          className={cn(
            editableValueSlot,
            'bg-transparent p-0 text-sm text-text-primary outline-none',
          )}
        />
      </div>
    );
  }

  return (
    <div
      data-slot='table-editable-cell'
      role='button'
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={start}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          start();
        }
      }}
      className={cn(editableCellShell, editableCellHover)}
    >
      <span className={editableValueSlot}>{value}</span>
      <Pencil
        className={cn(
          editableTrailingIcon,
          'opacity-0 transition-opacity group-hover/cell:opacity-100',
        )}
      />
    </div>
  );
};

EditableTextCell.displayName = 'EditableTextCell';

export interface EditableSelectCellProps {
  value: string;
  onCommit: (value: string) => void;
  items: SelectDataItem[];
  /** Read-mode rendering of the current value (e.g. a Badge). */
  children: ReactNode;
}

/**
 * Fixed-option editable cell. The cell itself is the Select trigger, so the
 * read view never gets swapped out — opening the menu only paints the
 * brand-orange border and drops the dropdown below. Zero layout shift.
 */
export const EditableSelectCell: FC<EditableSelectCellProps> = ({
  value,
  onCommit,
  items,
  children,
}) => {
  const collection = useMemo(() => createListCollection({ items }), [items]);

  return (
    <Select
      collection={collection}
      value={[value]}
      onValueChange={details => {
        const next = details.value[0];
        if (next && next !== value) onCommit(next);
      }}
    >
      <ArkUiSelect.Control>
        <ArkUiSelect.Trigger asChild>
          <div
            data-slot='table-editable-cell'
            className={cn(
              editableCellShell,
              editableCellHover,
              // Ark stamps data-state=open on the trigger while the menu is open.
              'data-[state=open]:border-border-strong-brand data-[state=open]:bg-bg-surface-1 data-[state=open]:hover:bg-bg-surface-1',
            )}
          >
            <span className={editableValueSlot}>{children}</span>
            <ChevronDown
              className={cn(
                editableTrailingIcon,
                'transition-transform group-data-[state=open]/cell:rotate-180',
              )}
            />
          </div>
        </ArkUiSelect.Trigger>
      </ArkUiSelect.Control>
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
    </Select>
  );
};

EditableSelectCell.displayName = 'EditableSelectCell';
