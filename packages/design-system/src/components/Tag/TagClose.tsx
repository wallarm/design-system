import type { FC, MouseEvent } from 'react';
import { X } from '../../icons';
import { useTestId } from '../../utils/testId';

export interface TagCloseProps {
  onClick?: (event: MouseEvent<SVGSVGElement>) => void;
}

export const TagClose: FC<TagCloseProps> = ({ onClick }) => {
  const testId = useTestId('close');

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    event.stopPropagation();

    onClick?.(event);
  };

  return <X size='sm' data-slot='tag-close' data-testid={testId} onClick={handleClick} />;
};
