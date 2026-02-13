import { forwardRef } from 'react';
import type { DateFieldState, DateSegment, TimeFieldState } from '@react-stately/datepicker';
import type { GroupDOMAttributes } from '@react-types/shared';
import { cn } from '../../utils/cn';
import { TemporalSegment } from './TemporalSegment';

export interface TemporalSegmentGroupProps extends GroupDOMAttributes {
  state: DateFieldState | TimeFieldState;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  segmentKeyPrefix?: string;
}

export const TemporalSegmentGroup = forwardRef<HTMLDivElement, TemporalSegmentGroupProps>(
  ({ state, disabled, readOnly, className, segmentKeyPrefix = '', ...props }, ref) => {
    return (
      <div {...props} ref={ref} className={cn('flex items-center gap-0.5', className)}>
        {state.segments.map((segment: DateSegment, i: number) => (
          <TemporalSegment
            key={`${segmentKeyPrefix}${segment.type}_${i}`}
            segment={segment}
            state={state}
            disabled={disabled}
            readOnly={readOnly}
          />
        ))}
      </div>
    );
  },
);

TemporalSegmentGroup.displayName = 'TemporalSegmentGroup';
