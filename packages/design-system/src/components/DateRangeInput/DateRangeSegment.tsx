import type { FC, ReactNode } from 'react';
import type { DateInputBaseProps } from '../DateInput';
import { InputGroup, InputGroupAddon } from '../InputGroup';
import { useDateRangeContext } from './DateRangeContext';

interface DateRangeSegmentProps extends Pick<DateInputBaseProps, 'icon'> {
  children: ReactNode;
}

export const DateRangeSegment: FC<DateRangeSegmentProps> = ({ children, icon: IconComponent }) => {
  const context = useDateRangeContext();

  return (
    <InputGroup size={context?.size}>
      {IconComponent && (
        <InputGroupAddon>
          <IconComponent />
        </InputGroupAddon>
      )}

      {children}
    </InputGroup>
  );
};
