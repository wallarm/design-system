import { Children, type FC, isValidElement, type ReactNode, type Ref } from 'react';
import { Slider as ArkSlider } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { sliderControlClassNames, sliderRangeClassNames, sliderTrackClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';
import { SliderThumb } from './SliderThumb';

export interface SliderControlProps {
  children?: ReactNode;
  className?: string;
  /** Ref to the Ark Control element (the track region). */
  ref?: Ref<HTMLDivElement>;
}

/** The interactive track region — renders the track + range, then the thumb(s) / marks. */
export const SliderControl: FC<SliderControlProps> = ({ children, className, ref }) => {
  const { thumbCount } = useSliderRootContext();
  const testId = useTestId('control');

  // Dev-only footgun guard: the consumer must render one <SliderThumb> per value entry.
  // Best-effort — counts only direct <SliderThumb> children (the documented shape); a
  // wrapped/mapped thumb simply isn't counted, so this never false-positives.
  if (process.env.NODE_ENV !== 'production') {
    const renderedThumbs = Children.toArray(children).filter(
      child => isValidElement(child) && child.type === SliderThumb,
    ).length;
    if (renderedThumbs > 0 && renderedThumbs !== thumbCount) {
      // biome-ignore lint/suspicious/noConsole: dev-only authoring guard (matches BarList/PieChart).
      console.warn(
        `[Slider] Rendered ${renderedThumbs} <SliderThumb> but the value has ${thumbCount} ` +
          `entr${thumbCount === 1 ? 'y' : 'ies'}. Render exactly one <SliderThumb index> per value entry.`,
      );
    }
  }

  return (
    <ArkSlider.Control
      ref={ref}
      data-slot='slider-control'
      data-testid={testId}
      className={cn(sliderControlClassNames, className)}
    >
      <ArkSlider.Track data-slot='slider-track' className={sliderTrackClassNames}>
        <ArkSlider.Range data-slot='slider-range' className={sliderRangeClassNames} />
      </ArkSlider.Track>
      {children}
    </ArkSlider.Control>
  );
};

SliderControl.displayName = 'SliderControl';
