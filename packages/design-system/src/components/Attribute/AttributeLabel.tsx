import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Info } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';
import { TooltipContent } from '../Tooltip/TooltipContent';
import { TooltipTrigger } from '../Tooltip/TooltipTrigger';

export interface AttributeLabelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Label text */
  children?: ReactNode;
  /** Hint text below the label */
  description?: ReactNode;
  /** Content for info tooltip with Info icon */
  info?: ReactNode;
  /** Which side to place the info icon */
  infoSide?: 'left' | 'right';
  /** Slot for Link component after label text */
  link?: ReactNode;
}

const InfoIcon: FC<{ info: ReactNode }> = ({ info }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button type='button' className='inline-flex text-text-secondary cursor-help'>
        <Info size='xs' />
      </button>
    </TooltipTrigger>
    <TooltipContent>{info}</TooltipContent>
  </Tooltip>
);

export const AttributeLabel: FC<AttributeLabelProps> = ({
  ref,
  children,
  description,
  info,
  infoSide = 'right',
  link,
  className,
  ...props
}) => {
  const testId = useTestId('label');

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-label'
      className={cn('flex flex-col', className)}
    >
      <div className='flex items-center gap-4'>
        {info && infoSide === 'left' && <InfoIcon info={info} />}
        <Text size='sm' color='secondary'>
          {children}
        </Text>
        {info && infoSide === 'right' && <InfoIcon info={info} />}
        {link}
      </div>
      {description && (
        <Text size='sm' color='secondary'>
          {description}
        </Text>
      )}
    </div>
  );
};

AttributeLabel.displayName = 'AttributeLabel';
