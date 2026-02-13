import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { InputGroup, InputGroupAddon } from '../InputGroup';
import { DateRangeClear } from './DateRangeClear';
import { DateRangeEndValue } from './DateRangeEndValue';
import { DateRangeGroup } from './DateRangeGroup';
import { DateRangeSeparator } from './DateRangeSeparator';
import { DateRangeStartValue } from './DateRangeStartValue';
import type { DateRangeBaseProps } from './types';

export type DateRangeInputInternalProps = Pick<DateRangeBaseProps, 'icon'>;

export const DateRangeInputInternal: FC<DateRangeInputInternalProps> = ({
  icon: IconComponent,
}) => (
  <div className={cn('**:data-[slot=input]:first:pr-0 **:data-[slot=input]:last:pl-0')}>
    <InputGroup>
      {IconComponent && (
        <InputGroupAddon>
          <IconComponent />
        </InputGroupAddon>
      )}

      <DateRangeGroup>
        <DateRangeStartValue />

        <DateRangeSeparator />

        <DateRangeEndValue />
      </DateRangeGroup>

      <InputGroupAddon align='inline-end'>
        <DateRangeClear />
      </InputGroupAddon>
    </InputGroup>
  </div>
);

DateRangeInputInternal.displayName = 'DateRangeInputInternal';
