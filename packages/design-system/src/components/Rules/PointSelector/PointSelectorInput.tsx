import { type FC, type HTMLAttributes, type Ref, useRef } from 'react';
import type { CheckError } from '@wallarm-org/rules-lib';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Input } from '../../Input';
import { PointSelectorError } from './PointSelectorError';

export interface PointSelectorInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Ref forwarding to root element */
  ref?: Ref<HTMLDivElement>;
  value: string;
  onChange: (value: string) => void;
  onCursorMove: (pos: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: CheckError;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Point Selector Input Component
 *
 * Text input with cursor tracking and validation error display.
 */
export const PointSelectorInput: FC<PointSelectorInputProps> = ({
  ref,
  value,
  onChange,
  onCursorMove,
  onFocus,
  onBlur,
  error,
  disabled,
  placeholder,
  className,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const testId = useTestId('input');

  const handleSelectionChange = () => {
    if (inputRef.current) {
      onCursorMove(inputRef.current.selectionStart || 0);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    handleSelectionChange();

    // Close menu on Escape
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <div {...props} ref={ref} data-slot='point-selector-input' className={className}>
      <Input
        ref={inputRef}
        data-testid={testId}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyUp={handleKeyUp}
        onClick={handleSelectionChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className='font-mono'
      />
      {error && <PointSelectorError error={error} />}
    </div>
  );
};

PointSelectorInput.displayName = 'PointSelectorInput';
