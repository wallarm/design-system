import type { FC, ReactNode } from 'react';
import { InputGroup, InputGroupAddon } from '../InputGroup';
import { useDateRangeContext } from './DateRangeContext';

interface DateRangeSegmentProps {
  children: ReactNode;
}

export const DateRangeSegment: FC<DateRangeSegmentProps> = ({ children }) => {
  const context = useDateRangeContext();
  const IconComponent = context?.icon;

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
