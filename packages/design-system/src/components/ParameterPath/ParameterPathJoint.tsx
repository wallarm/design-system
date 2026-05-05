import type { FC, HTMLAttributes } from 'react';
import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { jointVariants } from './classes';

type ParameterPathJointProps = HTMLAttributes<HTMLSpanElement>;

export const ParameterPathJoint: FC<ParameterPathJointProps> = ({ className, ...rest }) => (
  <span
    {...rest}
    aria-hidden='true'
    data-slot='parameter-path-joint'
    className={cn(jointVariants(), className)}
  >
    <ChevronRight size='sm' />
  </span>
);

ParameterPathJoint.displayName = 'ParameterPathJoint';
