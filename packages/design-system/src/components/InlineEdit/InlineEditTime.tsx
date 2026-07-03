import type { FC } from 'react';
import type { TimeValue } from '@react-aria/datepicker';
import { useTestId } from '../../utils/testId';
import { TimeInput, type TimeInputProps } from '../TimeInput';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

export type InlineEditTimeProps = Omit<TimeInputProps, 'value' | 'onChange'>;

/**
 * Commits on blur — time pickers have no discrete "selection complete" event.
 * Safe because the time dropdown is rendered inline (absolute, non-portaled)
 * and its rows preventDefault() on mousedown, so focus never leaves the
 * control subtree; a future portaled TimeDropdown would need re-evaluation.
 * Clipping ancestors need `overflow-visible` (automatic inside
 * AttributeValue; standalone hosts own it).
 */
export const InlineEditTime: FC<InlineEditTimeProps> = ({
  'data-testid': testIdProp,
  granularity = 'minute',
  showTimeDropdown = true,
  showIcon = false,
  ...props
}) => {
  const testId = useTestId('input', testIdProp);
  // Pass the value straight through (TimeValue union) — no `instanceof Time`
  // narrowing; it would rely on npm dedup of @internationalized/date.
  const { value, setValue } = useInlineEdit<TimeValue | null>();
  useInlineEditSubmitMode('blur');

  return (
    <TimeInput
      {...props}
      data-testid={testId}
      granularity={granularity}
      showTimeDropdown={showTimeDropdown}
      showIcon={showIcon}
      value={value ?? null}
      onChange={v => setValue(v)}
    />
  );
};

InlineEditTime.displayName = 'InlineEditTime';
