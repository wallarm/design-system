import type { FC, Ref } from 'react';
import { Slider as ArkSlider, useSliderContext } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { sliderThumbClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';

type ArkThumbPassThrough = Omit<
  ArkSlider.ThumbProps,
  'index' | 'children' | 'className' | 'asChild'
>;

export interface SliderThumbProps extends ArkThumbPassThrough {
  /** Which thumb this is (0 = single/low, 1 = high). */
  index?: number;
  /** Show an on-drag value bubble above this thumb (DS Tooltip, opened by drag). */
  tooltip?: boolean;
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
  tooltip = false,
  className,
  ref,
  'aria-label': ariaLabelProp,
  'aria-labelledby': ariaLabelledbyProp,
  'aria-describedby': ariaDescribedbyProp,
  ...rest
}) => {
  const { isRange, disabled, ariaDescribedby, fieldLabelId, marks } = useSliderRootContext();
  const api = useSliderContext();
  const testId = useTestId(isRange ? `thumb-${index}` : 'thumb');

  // Accessible name. Explicit consumer props always win. Otherwise:
  //  - single in a Field → the FieldLabel names it (aria-labelledby), no aria-label.
  //  - range → a default Minimum / Maximum per index.
  //  - single, no Field, no label → a sensible default so the handle is never unnamed.
  const hasExplicit = ariaLabelProp !== undefined || ariaLabelledbyProp !== undefined;
  let ariaLabel = ariaLabelProp;
  let ariaLabelledby = ariaLabelledbyProp;
  if (!hasExplicit) {
    if (isRange) {
      ariaLabel = index === 0 ? 'Minimum' : 'Maximum';
    } else if (fieldLabelId) {
      ariaLabelledby = fieldLabelId;
    } else {
      ariaLabel = 'Value';
    }
  }

  const thumb = (
    <ArkSlider.Thumb
      {...rest}
      ref={ref}
      index={index}
      aria-label={ariaLabel}
      // Force the attribute even when we have no id: Ark/zag injects a fallback
      // `aria-labelledby` pointing at a Label element this DS never renders (it labels
      // via Field instead) — passing '' overrides that dangling IDREF so `aria-label`
      // names the node. A real id (explicit, or the Field label) takes precedence.
      aria-labelledby={ariaLabelledby ?? ''}
      // Consumer `aria-describedby` wins; else the Field's help/error id (DS-wide gap:
      // the DS FieldError/Description don't register with Ark, so this is usually empty).
      aria-describedby={ariaDescribedbyProp ?? ariaDescribedby}
      data-slot='slider-thumb'
      data-testid={testId}
      className={cn(sliderThumbClassNames, className)}
    >
      <ArkSlider.HiddenInput />
    </ArkSlider.Thumb>
  );

  if (!tooltip) return thumb;

  // Ordinal scales show the mark label; otherwise the raw value.
  const current = api.value[index] ?? 0;
  const display = marks.find(mark => mark.value === current)?.label ?? String(current);

  return (
    <Tooltip
      // Driven by drag, NOT hover/focus: open ONLY while dragging (Ark keeps the thumb
      // focused after a drag, which would leave the bubble lingering for seconds).
      open={api.dragging}
      closeOnPointerDown={false}
      closeDelay={0}
      disabled={disabled}
      positioning={{ placement: 'top', offset: { mainAxis: 6 }, overflowPadding: 8 }}
    >
      <TooltipTrigger asChild>{thumb}</TooltipTrigger>
      {/* The DS Tooltip's built-in slide keys on data-side, but this Ark version emits
          data-placement — so add the Figma 4px slide-up here, on the live attribute. */}
      <TooltipContent className='data-[placement=top]:slide-in-from-bottom-[4px] data-[placement=bottom]:slide-in-from-top-[4px]'>
        {display}
      </TooltipContent>
    </Tooltip>
  );
};

SliderThumb.displayName = 'SliderThumb';
