import type { FC, ReactNode } from 'react';
import { Slider as ArkSlider } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { sliderControlClassNames, sliderRangeClassNames, sliderTrackClassNames } from './classes';

export interface SliderControlProps {
  children?: ReactNode;
  className?: string;
}

/** The interactive track region — renders the track + range, then the thumb(s) / marks. */
export const SliderControl: FC<SliderControlProps> = ({ children, className }) => {
  const testId = useTestId('control');
  return (
    <ArkSlider.Control
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
