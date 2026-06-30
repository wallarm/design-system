import { type FC, useLayoutEffect } from 'react';
import { Slider as ArkSlider, useSliderContext } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { sliderMarkerClassNames, sliderMarkerGroupClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';
import type { SliderMark } from './types';

/** Index of the thumb whose value is closest to `target` (for tick click-to-jump). */
const nearestThumbIndex = (values: number[], target: number): number => {
  let nearest = 0;
  let smallest = Number.POSITIVE_INFINITY;
  values.forEach((v, i) => {
    const distance = Math.abs(v - target);
    if (distance < smallest) {
      smallest = distance;
      nearest = i;
    }
  });
  return nearest;
};

export interface SliderMarksProps {
  /**
   * Each entry places a tick at `value`; an optional `label` renders below it (and
   * drives `aria-valuetext` for ordinal scales). Align `step` to the marks so drag
   * and arrow-keys snap onto them.
   */
  marks: SliderMark[];
  className?: string;
}

/** Tick marks along the track + click-to-jump. Render inside `<SliderControl>`. */
export const SliderMarks: FC<SliderMarksProps> = ({ marks, className }) => {
  const { registerMarks } = useSliderRootContext();
  const api = useSliderContext();
  const testId = useTestId('marker-group');

  // Publish marks to the root so its getAriaValueText (and SliderValue / the thumb
  // tooltip) can resolve ordinal labels. A post-commit effect — never a render-time
  // ref write — and idempotent, so running each commit is harmless.
  useLayoutEffect(() => {
    registerMarks(marks);
  });

  if (marks.length === 0) return null;

  return (
    <ArkSlider.MarkerGroup
      data-slot='slider-marker-group'
      data-testid={testId}
      className={cn(sliderMarkerGroupClassNames, className)}
    >
      {marks.map(mark => (
        <ArkSlider.Marker
          key={mark.value}
          value={mark.value}
          data-slot='slider-marker'
          className={sliderMarkerClassNames}
          // Click-to-jump: move the nearest thumb onto this tick (requirements §6.3).
          // Keyboard equivalent is arrow-stepping, so ticks are not separate tab stops.
          onClick={() => api.setThumbValue(nearestThumbIndex(api.value, mark.value), mark.value)}
        >
          {mark.label}
        </ArkSlider.Marker>
      ))}
    </ArkSlider.MarkerGroup>
  );
};

SliderMarks.displayName = 'SliderMarks';
