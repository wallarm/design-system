import type { FC } from 'react';
import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { jointVariants } from './classes';

interface ParameterPathJointProps {
  className?: string;
}

export const ParameterPathJoint: FC<ParameterPathJointProps> = ({ className }) => (
  <span
    aria-hidden='true'
    data-slot='parameter-path-joint'
    className={cn(jointVariants(), className)}
  >
    <ChevronRight size='sm' />
  </span>
);

ParameterPathJoint.displayName = 'ParameterPathJoint';
