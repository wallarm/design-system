import type { FC, MouseEvent } from 'react';
import { X } from '../../icons';

interface TagCloseProps {
  onClick?: (event: MouseEvent<SVGSVGElement>) => void;
}

export const TagClose: FC<TagCloseProps> = ({ onClick }) => {
  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    event.stopPropagation();

    onClick?.(event);
  };

  return <X size='sm' data-slot='tag-close' onClick={handleClick} />;
};
