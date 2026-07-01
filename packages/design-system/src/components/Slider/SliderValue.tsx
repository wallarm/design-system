import type { FC, Ref } from 'react';
import { useSliderContext } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useSliderRootContext } from './SliderContext';

export interface SliderValueProps {
  /** Show one thumb's value (range). Omit to show all (single → "50", range → "20 – 80"). */
  index?: number;
  className?: string;
  /** Ref to the readout `<span>`. */
  ref?: Ref<HTMLSpanElement>;
}

/**
 * Live value readout for the value-beside-label pattern. Ordinal scales show the mark
 * label instead of the number. Mutually exclusive with the on-drag `tooltip` — show the
 * value one way, never both.
 */
export const SliderValue: FC<SliderValueProps> = ({ index, className, ref }) => {
  const { marks } = useSliderRootContext();
  const api = useSliderContext();
  const testId = useTestId('value');

  const display = (v: number) => marks.find(mark => mark.value === v)?.label ?? String(v);
  const text =
    index !== undefined ? display(api.value[index] ?? 0) : api.value.map(display).join(' – ');

  return (
    <span
      ref={ref}
      data-slot='slider-value'
      data-testid={testId}
      className={cn('text-sm text-text-primary tabular-nums', className)}
    >
      {text}
    </span>
  );
};

SliderValue.displayName = 'SliderValue';
