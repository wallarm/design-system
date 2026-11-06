import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Info } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export interface AttributeLabelInfoProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  ref?: Ref<HTMLSpanElement>;
  /** Tooltip content */
  children: ReactNode;
}

export const AttributeLabelInfo: FC<AttributeLabelInfoProps> = ({ ref, children, ...props }) => {
  const testId = useTestId('label-info');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          data-testid={testId}
          {...props}
          ref={ref}
          data-slot='attribute-label-info'
          className='inline-flex cursor-help'
        >
          <Info size='md' />
        </span>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
};

AttributeLabelInfo.displayName = 'AttributeLabelInfo';
