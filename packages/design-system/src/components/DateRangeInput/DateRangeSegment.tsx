import type { FC, ReactNode } from 'react';
import type { DateInputBaseProps } from '../DateInput';
import { InputGroup, InputGroupAddon } from '../InputGroup';

interface DateRangeSegmentProps extends Pick<DateInputBaseProps, 'icon'> {
  children: ReactNode;
}

export const DateRangeSegment: FC<DateRangeSegmentProps> = ({ children, icon: IconComponent }) => {
  return (
    <InputGroup>
      {IconComponent && (
        <InputGroupAddon>
          <IconComponent />
        </InputGroupAddon>
      )}

      {children}
    </InputGroup>
  );
};
