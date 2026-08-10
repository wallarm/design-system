import type { FC, HTMLAttributes, KeyboardEvent, Ref } from 'react';
import { useState } from 'react';
import { Pencil } from '../../../icons';
import { cn } from '../../../utils/cn';
import { type TestableProps, useTestId } from '../../../utils/testId';
import {
  editableCellIcon,
  editableCellInput,
  editableCellValue,
  editableCellVariants,
} from './classes';

// The persistent root is a <div>, so consumer attrs (incl. data-analytics-*)
// and composed handlers are typed against it — the internal <input> is owned.
type NativeProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export interface EditableTextCellProps extends NativeProps, TestableProps {
  /** Current committed value. */
  value: string;
  /** Called with the new value on Enter / blur (only when it actually changed). */
  onCommit: (value: string) => void;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inline-editable text cell for the DataTable. Idle it reads as text (the whole
 * cell highlights on hover); click / Enter / Space swaps in a borderless input
 * in the exact same position (brand-orange border, no layout shift). Enter or
 * blur commits, Escape reverts.
 *
 * Analytics-ready: arbitrary `data-*` / `aria-*` / `id` / event props (e.g.
 * `data-analytics-id`) land on the persistent cell element, so they resolve via
 * `closest()` whether the read view or the input is the active target.
 */
export const EditableTextCell: FC<EditableTextCellProps> = ({
  value,
  onCommit,
  className,
  ref,
  'data-testid': testIdProp,
  'aria-label': ariaLabel,
  onClick,
  onKeyDown,
  ...rest
}) => {
  const testId = useTestId(undefined, testIdProp);
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

  return (
    <div
      {...rest}
      ref={ref}
      data-slot='editable-text-cell'
      data-testid={testId}
      data-editing={isEditing || undefined}
      className={cn(editableCellVariants({ state: isEditing ? 'active' : 'idle' }), className)}
      role={isEditing ? undefined : 'button'}
      tabIndex={isEditing ? undefined : 0}
      aria-label={isEditing ? undefined : ariaLabel}
      // Compose with any consumer handler rather than replacing it.
      onClick={event => {
        onClick?.(event);
        if (!isEditing) start();
      }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (!isEditing && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          start();
        }
      }}
    >
      {isEditing ? (
        <input
          autoFocus
          aria-label={ariaLabel}
          value={draft}
          data-testid={testId ? `${testId}--input` : undefined}
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
          className={editableCellInput}
        />
      ) : (
        <>
          <span className={editableCellValue}>{value}</span>
          <Pencil
            className={cn(
              editableCellIcon,
              'opacity-0 transition-opacity group-hover/cell:opacity-100',
            )}
          />
        </>
      )}
    </div>
  );
};

EditableTextCell.displayName = 'EditableTextCell';
