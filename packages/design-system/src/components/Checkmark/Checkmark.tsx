import type { FC, HTMLAttributes } from 'react';

import type { CheckboxCheckedState } from '@ark-ui/react/checkbox';

import { Check, Minus } from '../../icons';
import { cn } from '../../utils/cn';

type CheckmarkNativeProps = HTMLAttributes<HTMLDivElement>;

interface CheckmarkBaseProps {
  checkedState?: CheckboxCheckedState;
}

type CheckmarkProps = CheckmarkNativeProps & CheckmarkBaseProps;

export const Checkmark: FC<CheckmarkProps> = ({
  checkedState = false,
  ...props
}) => (
  <div
    className={cn(
      // Layout
      'flex items-center justify-center self-start my-2',
      // Dimensions
      'w-16 h-16',
      // Visual
      'rounded-4 shadow-xs overlay transition-all data-focus-visible:ring-3',
      // Icon
      '[&_svg]:icon-sm [&_svg]:text-icon-primary-alt [&_svg]:shrink-0 [&_svg]:pointer-events-none',
      // States ---- unchecked
      'bg-bg-surface-3 border border-border-primary',
      // States ---- unchecked hover
      '[&[data-hover]:not([data-active]):not([data-state=checked]):not([data-state=indeterminate])]:bg-states-primary-hover',
      // States ---- unchecked active
      '[&[data-active]:not([data-state=checked]):not([data-state=indeterminate])]:bg-states-primary-pressed',
      // States ---- unchecked focus
      '[&[data-focus-visible]:not([data-state=checked]):not([data-state=indeterminate])]:ring-focus-primary',
      // States ---- checked or indeterminate
      'data-[state=checked]:bg-bg-fill-brand',
      'data-[state=checked]:border-bg-fill-brand',
      'data-[state=checked]:border-none',
      'data-[state=indeterminate]:bg-bg-fill-brand',
      'data-[state=indeterminate]:border-bg-fill-brand',
      'data-[state=indeterminate]:border-none',
      // States ---- checked or indeterminate hover
      '[&[data-hover]:not([data-active]):is([data-state=checked])]:overlay-states-on-fill-hover',
      '[&[data-hover]:not([data-active]):is([data-state=indeterminate])]:overlay-states-on-fill-hover',
      // States ---- checked or indeterminate active
      '[&[data-active][data-state=checked]]:overlay-states-on-fill-pressed',
      '[&[data-active][data-state=indeterminate]]:overlay-states-on-fill-pressed',
      // States ---- checked or indeterminate focus
      '[&[data-focus-visible][data-state=checked]]:ring-focus-brand',
      '[&[data-focus-visible][data-state=indeterminate]]:ring-focus-brand',
    )}
    data-state={
      checkedState === 'indeterminate'
        ? 'indeterminate'
        : checkedState
          ? 'checked'
          : 'unchecked'
    }
    {...props}
  >
    {checkedState === 'indeterminate' ? (
      <Minus />
    ) : checkedState ? (
      <Check />
    ) : (
      false
    )}
  </div>
);
