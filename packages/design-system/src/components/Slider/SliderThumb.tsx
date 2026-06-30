import type { FC, Ref } from 'react';
import { Slider as ArkSlider } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { sliderThumbClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';

type ArkThumbPassThrough = Omit<
  ArkSlider.ThumbProps,
  'index' | 'children' | 'className' | 'asChild'
>;

export interface SliderThumbProps extends ArkThumbPassThrough {
  /** Which thumb this is (0 = single/low, 1 = high). */
  index?: number;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The draggable handle — the real interactive node (`role="slider"`, focusable).
 * Consumer `data-*` / `aria-*` / `id` / `ref` / event props forward HERE (per
 * `docs/metrics/contract.md`); each range thumb carries its own, so a range can attribute
 * the low and high thumbs independently.
 */
export const SliderThumb: FC<SliderThumbProps> = ({
  index = 0,
  className,
  ref,
  'aria-label': ariaLabelProp,
  'aria-labelledby': ariaLabelledbyProp,
  ...rest
}) => {
  const { isRange, ariaDescribedby, fieldLabelId } = useSliderRootContext();
  const testId = useTestId(isRange ? `thumb-${index}` : 'thumb');

  // Accessible name: explicit on the thumb wins; else single-in-Field → the field label;
  // else a range default (Minimum / Maximum) by index.
  const hasExplicit = ariaLabelProp !== undefined || ariaLabelledbyProp !== undefined;
  const ariaLabel =
    ariaLabelProp ?? (!hasExplicit && isRange ? (index === 0 ? 'Minimum' : 'Maximum') : undefined);
  const ariaLabelledby =
    ariaLabelledbyProp ?? (!hasExplicit && !isRange ? fieldLabelId : undefined);

  return (
    <ArkSlider.Thumb
      {...rest}
      ref={ref}
      index={index}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      data-slot='slider-thumb'
      data-testid={testId}
      className={cn(sliderThumbClassNames, className)}
    >
      <ArkSlider.HiddenInput />
    </ArkSlider.Thumb>
  );
};

SliderThumb.displayName = 'SliderThumb';
