import type { FC, ReactNode, Ref } from 'react';
import { Fragment, useMemo } from 'react';
import { PinInput as ArkPinInput } from '@ark-ui/react/pin-input';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { otpInputCellClassName, otpInputSeparatorClassName } from './classes';

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
  const cells = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => (
        <Fragment key={i}>
          {groupSize > 0 && i > 0 && i % groupSize === 0 && (
            <span aria-hidden='true' className={otpInputSeparatorClassName}>
              {separator}
            </span>
          )}
          <ArkPinInput.Input index={i} className={otpInputCellClassName} />
        </Fragment>
      )),
    [count, groupSize, separator],
  );

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
      <ArkPinInput.Control className='flex items-center gap-8'>{cells}</ArkPinInput.Control>
      <ArkPinInput.HiddenInput />
    </ArkPinInput.Root>
  );
};

OTPInput.displayName = 'OTPInput';
