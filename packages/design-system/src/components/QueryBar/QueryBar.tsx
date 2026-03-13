import type { FC, HTMLAttributes } from 'react';
import { useMemo, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useQueryBarAutocomplete, useQueryBarExpression } from './hooks';
import { QueryBarProvider, useQueryBarContextValue } from './QueryBarContext';
import { parseQueryBarErrors, QueryBarErrors } from './QueryBarErrors';
import { QueryBarInput } from './QueryBarInput';
import { QueryBarMenu } from './QueryBarMenu/QueryBarMenu';
import type { ExprNode, FieldMetadata } from './types';

export interface QueryBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /**
   * Available fields from backend API config
   */
  fields?: FieldMetadata[];
  /**
   * Current filter expression value (controlled mode)
   */
  value?: ExprNode | null;
  /**
   * Callback when filter expression changes
   */
  onChange?: (expression: ExprNode | null) => void;
  /**
   * Placeholder text to display when field is empty
   * @default "Type to filter..."
   */
  placeholder?: string;
  /**
   * Whether the field has a validation error
   */
  error?: boolean;
  /**
   * Whether to show the keyboard hint (⌘K or Ctrl+K)
   */
  showKeyboardHint?: boolean;
}

/**
 * QueryBar - Self-contained filter component.
 * Handles autocomplete flow (field → operator → value), chip creation, and expression management.
 * Supports multiple conditions joined by AND/OR connectors.
 * Just pass `fields` config from backend API and it works.
 */
export const QueryBar: FC<QueryBarProps> = ({
  fields = [],
  value,
  onChange,
  placeholder = 'Type to filter...',
  error = false,
  showKeyboardHint = false,
  className,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buildingChipRef = useRef<HTMLDivElement>(null);

  const {
    conditions,
    chips,
    upsertCondition,
    removeCondition,
    removeConditionAtIndex,
    clearAll,
    setConnectorValue,
  } = useQueryBarExpression({ fields, value, onChange, error });

  const autocomplete = useQueryBarAutocomplete({
    fields,
    conditions,
    chips,
    upsertCondition,
    removeCondition,
    removeConditionAtIndex,
    clearAll,
    setConnectorValue,
    containerRef,
    buildingChipRef,
    inputRef,
  });

  // ── Context value ──────────────────────────────────────────

  const contextValue = useQueryBarContextValue({
    chips,
    autocomplete,
    buildingChipRef,
    inputRef,
    placeholder,
    error,
    showKeyboardHint,
  });

  // ── Errors ────────────────────────────────────────────────

  const errors = useMemo(() => parseQueryBarErrors(conditions, fields), [conditions, fields]);

  // ── Render ─────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn('relative flex w-full flex-col gap-4', className)}
      onFocus={autocomplete.handleFocus}
      onBlur={autocomplete.handleBlur}
    >
      <QueryBarProvider value={contextValue}>
        <QueryBarInput {...props} />
      </QueryBarProvider>

      <QueryBarMenu fields={fields} autocomplete={autocomplete} />

      <QueryBarErrors errors={errors} />
    </div>
  );
};

QueryBar.displayName = 'QueryBar';
