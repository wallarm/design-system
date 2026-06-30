import { type FC, useId } from 'react';
import { useSliderContext } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Input } from '../Input';
import { sliderInputBoxClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';

export interface SliderInputProps {
  /** Which thumb this box is bound to (0 = single/low, 1 = high). */
  index?: number;
  'aria-label'?: string;
  className?: string;
}

/**
 * Inline numbers-only `Input` two-way bound to the thumb at `index`: a plain box (no
 * stepper, fixed width — the DS `Input`, matching Figma `_text-box`). It shows the live
 * value and writes back through `setThumbValue`, which clamps to `[min, max]`, snaps to
 * `step`, and enforces the range no-cross — so the box needs no bounds of its own.
 *
 * Explicit `useId` so two range boxes never collide on the wrapping field's control id
 * (and `FieldLabel`'s `htmlFor` keeps naming the thumb, not a box).
 */
export const SliderInput: FC<SliderInputProps> = ({
  index = 0,
  'aria-label': ariaLabel,
  className,
}) => {
  const { isRange, disabled, invalid } = useSliderRootContext();
  const api = useSliderContext();
  const id = useId();
  const testId = useTestId(isRange ? `input-${index}` : 'input');

  const defaultLabel = isRange ? (index === 0 ? 'Minimum value' : 'Maximum value') : 'Value';

  return (
    <Input
      // A regular box restricted to numbers — `inputMode` for the numeric keypad; the
      // slider machine owns clamping/snapping, so we just commit any valid number typed.
      inputMode='numeric'
      id={id}
      value={String(api.value[index] ?? '')}
      disabled={disabled}
      error={invalid}
      aria-label={ariaLabel ?? defaultLabel}
      data-testid={testId}
      className={cn(sliderInputBoxClassNames, className)}
      onChange={event => {
        const next = Number(event.target.value);
        if (event.target.value !== '' && !Number.isNaN(next)) api.setThumbValue(index, next);
      }}
    />
  );
};

SliderInput.displayName = 'SliderInput';
