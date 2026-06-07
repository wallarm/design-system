import type { FC, ReactNode, Ref } from 'react';
import { useMemo } from 'react';
import { PinInput as ArkPinInput } from '@ark-ui/react/pin-input';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import {
  otpInputCellClassName,
  otpInputGroupClassName,
  otpInputSeparatorClassName,
} from './classes';

type OTPInputRootProps = Omit<ArkPinInput.RootProps, 'invalid'>;

export interface OTPInputProps extends OTPInputRootProps, TestableProps {
  /** Number of inputs per group (separator shown between groups). Set to 0 to disable grouping. */
  groupSize?: number;
  /** Separator element rendered between groups */
  separator?: ReactNode;
  /** Error state (maps to Ark UI `invalid`) */
  error?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export const OTPInput: FC<OTPInputProps> = ({
  count = 6,
  groupSize = 2,
  separator = '\u2014',
  error = false,
  placeholder = '',
  className,
  'data-testid': testId,
  ref,
  ...props
}) => {
  const groups = useMemo(() => {
    const result: ReactNode[] = [];
    const effectiveGroupSize = groupSize > 0 ? groupSize : count;

    for (let groupStart = 0; groupStart < count; groupStart += effectiveGroupSize) {
      if (groupStart > 0 && groupSize > 0) {
        result.push(
          <span key={`sep-${groupStart}`} aria-hidden='true' className={otpInputSeparatorClassName}>
            {separator}
          </span>,
        );
      }

      const groupEnd = Math.min(groupStart + effectiveGroupSize, count);
      result.push(
        <div key={`group-${groupStart}`} className={otpInputGroupClassName}>
          {Array.from({ length: groupEnd - groupStart }, (_, i) => (
            <ArkPinInput.Input
              key={groupStart + i}
              index={groupStart + i}
              className={otpInputCellClassName}
            />
          ))}
        </div>,
      );
    }

    return result;
  }, [count, groupSize, separator]);

  return (
    <ArkPinInput.Root
      {...props}
      count={count}
      invalid={error}
      placeholder={placeholder}
      ref={ref}
      data-testid={testId}
      data-slot='pin-input'
      className={cn('flex flex-col gap-4', className)}
    >
      <ArkPinInput.Control className='flex items-center gap-8'>{groups}</ArkPinInput.Control>
      <ArkPinInput.HiddenInput />
    </ArkPinInput.Root>
  );
};

OTPInput.displayName = 'OTPInput';
