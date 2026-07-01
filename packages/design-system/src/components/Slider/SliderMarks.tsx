import { type FC, type MouseEventHandler, useCallback, useLayoutEffect } from 'react';
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
  const { registerMarks, readOnly } = useSliderRootContext();
  const api = useSliderContext();
  const testId = useTestId('marker-group');

  // Publish marks to the root so its getAriaValueText (and SliderValue / the thumb
  // tooltip) can resolve ordinal labels. A post-commit effect — never a render-time
  // ref write — and idempotent (the root's sameMarks guard), so running each commit
  // is harmless.
  useLayoutEffect(() => {
    registerMarks(marks);
  });

  // Clear root marks on unmount only, so a now-tickless slider doesn't keep announcing
  // stale ordinal labels. Separate effect (stable dep) so the cleanup fires on unmount,
  // not on every commit — which would flicker marks → [] → marks.
  useLayoutEffect(() => () => registerMarks([]), [registerMarks]);

  // Click-to-jump, delegated: one stable handler on the group resolves the clicked tick
  // via `closest` + its `data-value` and moves the nearest thumb onto it (requirements
  // §6.3). Keyboard equivalent is arrow-stepping, so ticks are not separate tab stops.
  // Guard readOnly ourselves — Ark's `setThumbValue` isn't gated by it (only drag/keyboard
  // are), so an unguarded click would mutate a read-only slider.
  const handleMarkerClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    event => {
      if (readOnly) return;
      const marker = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-slot="slider-marker"]',
      );
      if (!marker) return;
      const markValue = Number(marker.dataset.value);
      if (Number.isNaN(markValue)) return;
      api.setThumbValue(nearestThumbIndex(api.value, markValue), markValue);
    },
    [api, readOnly],
  );

  if (marks.length === 0) return null;

  return (
    <ArkSlider.MarkerGroup
      data-slot='slider-marker-group'
      data-testid={testId}
      className={cn(sliderMarkerGroupClassNames, className)}
      onClick={handleMarkerClick}
    >
      {marks.map(mark => (
        <ArkSlider.Marker
          key={mark.value}
          value={mark.value}
          data-slot='slider-marker'
          data-value={mark.value}
          className={sliderMarkerClassNames}
        >
          {mark.label}
        </ArkSlider.Marker>
      ))}
    </ArkSlider.MarkerGroup>
  );
};

SliderMarks.displayName = 'SliderMarks';
